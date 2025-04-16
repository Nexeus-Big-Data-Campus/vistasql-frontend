import murmur from "murmurhash-js";
import { Query } from "../../interfaces/query";
import {Language, Node, Parser} from "web-tree-sitter";
import { Join } from "../../interfaces/join";
import { Reference } from "../../interfaces/reference";
import { LexicalError } from "../../interfaces/error";

let parser: Parser;


// Initialize the tree-sitter parser
Parser.init({
    locateFile(scriptName: string, scriptDirectory: string) {
        return scriptName;
      },
}).then(async () => {
    console.log('Tree-sitter initialized');
    parser = new Parser();
    const SQL = await Language.load('/tree-sitter-sql.wasm');
    parser.setLanguage(SQL);
});


// Returns a tree with root in the main select statement using tree-sitter
// and the SQL grammar
// See: https://github.com/DerekStride/tree-sitter-sql/tree/main/test/corpus for tree examples
function parseQuery(code: string): Query[] {
    if(!code || !parser) {
        return [];
    }

    const tree = parser.parse(code);
    
    if(!tree) {
        return [];
    }

    const nodes: Query[] = [];
    const rootNode = tree.rootNode;

    const statements = getDirectChildByType(rootNode, 'statement');
    statements.forEach((statement) => {
        if(!statement) {
            return;
        }

        nodes.push(buildQueryNodeFromTree(statement, statement.type));
    });

    return nodes;
}

function buildQueryNodeFromTree(rootNode: Node, type: string, name: string | null = null): Query {
    const ctes = rootNode.descendantsOfType('cte');
    const subqueries = findAllSubqueries(rootNode);
    
    // Uses recursion to build child nodes
    const cteNodes = processCte(ctes); 
    const subqueryNodes = processSubqueries(subqueries);
    const children = [...cteNodes, ...subqueryNodes]; 

    const references = getTableReferences(rootNode);
    const fields = getSelectFields(rootNode, references, children);
    const errors = getQueryErrors(rootNode);

    return {
        hash: murmur.murmur3(rootNode.text + Math.random() * 1000),
        code: rootNode.text,
        name: name ?? rootNode.type,
        type: type,
        fields,
        joins: getJoins(rootNode),
        children,
        references,
        errors
    };
}

function getTableReferences(rootNode: Node): Reference[] {
    const formClause = getNodeTypesInCurrentScope(rootNode, 'from');
    return formClause.length > 0 ? getFromReferences(formClause[0]) : [];
}

function getFromReferences(node: Node): Reference[] {
    if(node.type !== 'from') {
        throw new Error('Node is not a from clause');
    }

    const relations = getDirectChildByType(node, 'relation');

    if(!relations) {
        return [];
    }

    const references: Reference[] = [];
    relations.forEach((relation) => {
        if(!relation) {
            return;
        }

        const isSubquery = getDirectChildByType(relation, 'subquery').length > 0;
        if(isSubquery) {
            return;
        }

        const alias = relation.childForFieldName('alias')?.text ?? '';
        const source = getNodeTypesInCurrentScope(relation, 'object_reference');
        
        references.push({
            alias,
            name: source[0]?.text ?? '',
        });
    });

    return references;
}

function getQueryErrors(rootNode: Node): LexicalError[] {
    return rootNode
        .descendantsOfType('ERROR')
        .filter(error => error !== null)
        .map(error => ({
            startIndex: error.startIndex,
            endIndex: error.endIndex
        }));
}

function processSubqueries(subqueries: Node[]): Query[] {
    return subqueries.map((subquery) => {
        const type = subquery?.parent?.type === 'relation' ? 'relation' : 'subquery';
        return buildQueryNodeFromTree(subquery, type)}
    );
}

function processCte(ctes: (Node | null)[]): Query[] {
    const cteNodes: Query[] = [];
    ctes.forEach(cte => {
        if(!cte) {
            return null;
        }
    
        const identifierNode = getDirectChildByType(cte, 'identifier');
        const name = identifierNode ? identifierNode[0]?.text : null;
        const statement = getDirectChildByType(cte, 'statement');
        
        if(!statement || !statement[0]) {
            return null;
        }

        cteNodes.push(buildQueryNodeFromTree(statement[0], 'cte', name));
    })

    return cteNodes;
}


function getJoins(node: Node): Join[] {
    const joins: Join[] = [];
    const joinClauses = getNodeTypesInCurrentScope(node, 'join');

    joinClauses.forEach((joinClause) => {
        if(!joinClause) {
            return;
        }
        
        const relation = joinClause.descendantsOfType('relation');
        const predicate = joinClause.childForFieldName('predicate')?.text ?? '';

        if(!relation || !relation[0]) {
            return
        }

        const source = getNodeTypesInCurrentScope(relation[0], 'object_reference');

        if(!source || !source[0]) {
            return;
        }

        const alias = relation[0].childForFieldName('alias')?.text ?? '';
        const type = joinClause.text.split('JOIN')[0].toLowerCase().trim();

        joins.push({
            alias,
            type,
            predicate,
            source: source[0].text,
        });
    });

    return joins;
}

function getSelectFields(selectClause: Node | null, references: Reference[], children: Query[]): string[] {
    if(!selectClause) {
        return [];
    }

    let fields: string[] = [];
    const selectExpression = getNodeTypesInCurrentScope(selectClause, 'select_expression')[0];
    const terms = selectExpression?.namedChildren.filter((child) => child?.type === 'term');
    let isSelectAll = false;
    
    terms?.forEach((term) => {
        const field = term?.text;
        const alias = term?.childForFieldName('alias')?.text;
        const value = term?.childForFieldName('value')?.type;

        if(!field && !alias) {
            return;
        }

        if(value === 'all_fields') {
            isSelectAll = true;
        }

        fields.push((alias ?? field) ?? '');
    }); 

    if(isSelectAll) {
        // Add the fields from the children referenced in the FORM clause
        references.forEach(reference => {
            const referenceChild = children.filter(query => query.name === reference.name);
            referenceChild.forEach(c => {
                fields = fields.concat(c.fields.filter(f => f !== '*'));
            })
        });

        // Add the fields from the subquery inside the FORM clause
        children.forEach((c: Query) => {
            if(c.type !== 'relation') {
                return;
            }

            fields = fields.concat(c.fields.filter(f => f !== '*'));
        })
    }

    return fields;
}

function getDirectChildByType(node: Node, type: string): (Node | null)[] {
    return node.namedChildren.filter((child) => child?.type === type);
}

// Return all nodes of a given type without entering subqueries
function getNodeTypesInCurrentScope(node: Node, type: string): Node[] {
    const hits: Node[] = [];
    const children = node.namedChildren;
    const heap = [...children];
    while(heap.length > 0) {
        const currentNode = heap.pop();
        if(currentNode?.type === type) {
            hits.push(currentNode);
        }
        
        if(currentNode?.type !== 'subquery') {
            heap.push(...currentNode?.namedChildren ?? []);
        }
    }

    return hits;
}

function findAllSubqueries(node: Node): Node[] {
    return getNodeTypesInCurrentScope(node, 'subquery');
}

export default {parseQuery};

