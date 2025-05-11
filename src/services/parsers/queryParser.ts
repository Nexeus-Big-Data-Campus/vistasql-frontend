import murmur from "murmurhash-js";
import { Query } from "../../interfaces/query";
import {Language, Node, Parser} from "web-tree-sitter";
import { Join } from "../../interfaces/join";
import { Reference } from "../../interfaces/reference";
import { LexicalError } from "../../interfaces/error";
import { Field, FieldReference, InvocationField } from "../../interfaces/field";
import { getDirectChildByType, getNodeTypesInCurrentScope, findAllSubqueries } from "./utils";
import { processColumn } from "./fieldParser";

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

    const references = getTableReferences(rootNode, children);
    const joins = getJoins(rootNode);
    const fields = getSelectFields(rootNode, references, joins, children);
    const errors = getQueryErrors(rootNode);

    return {
        id: murmur.murmur3(rootNode.text + Math.random() * 1000),
        code: rootNode.text,
        name: name ?? rootNode.type,
        type: type,
        fields,
        joins,
        children,
        references,
        errors
    };
}

function getTableReferences(rootNode: Node, children: Query[]): Reference[] {
    const formClause = getNodeTypesInCurrentScope(rootNode, 'from');
    return formClause.length > 0 ? getFromReferences(formClause[0], children) : [];
}

function getFromReferences(node: Node, children: Query[]): Reference[] {
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
        const name = source[0]?.text ?? ''; 
        const id = murmur.murmur3(`${alias}-${name}` + Math.random() * 1000);

        // Add reference alias to corresponding child
        if (name && children) {
            children.forEach((element: Query) => {
                if(element.name === name) {
                    element.alias = alias;
                }    
            });
        }

        references.push({
            id,
            alias,
            name,
        });
    });

    // Filter out references that are already in the children
    return references.filter((reference) => {
        return children.reduce((acum, child) => {
            return acum && child.name !== reference.name;
        }, true);
    });
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
        const id = murmur.murmur3(`${alias}-${source}`+ Math.random() * 1000);

        joins.push({
            id,
            alias,
            type,
            predicate,
            source: source[0].text,
        });
    });

    return joins;
}

function getSelectFields(selectClause: Node | null, references: Reference[], joins: Join[], children: Query[]): Field[] {
    if (!selectClause) {
        return [];
    }

    const selectExpression = getNodeTypesInCurrentScope(selectClause, 'select_expression')[0];
    const terms = selectExpression?.namedChildren.filter((child: Node | null) => child?.type === 'term');
    let fields: Field[] = terms.filter((t: Node | null) => !!t)
                                .map((t: Node) => processColumn(t, references, joins, children))
                                .filter((f: Field | null) => !!f) as Field[];

    console.log('Fields:', fields);

    const hasAllSelector = fields.reduce((acum, field) => acum || field.isAllSelector, false);

    if (hasAllSelector) {
        // Add the fields from the children referenced in the FROM clause
        references.forEach((reference) => {
            const referenceChild = children.filter((query) => query.name === reference.name);
            referenceChild.forEach((c: Query) => {
                fields = concatChildrenFields(c, fields);
            });
        });

        // Add the fields from the subquery inside the FROM clause
        children.forEach((c: Query) => {
            if (c.type !== 'relation') {
                return;
            }

            fields = concatChildrenFields(c, fields);
        });
    }

    return fields;
}

function concatChildrenFields(node: Query, fields: Field[]): Field[] {
    return fields.concat(
        node.fields
            .filter((f) => !f.isAllSelector)
            .map((f) => {
                const reference: FieldReference = {
                    resolvedFieldIds: [f.id],
                    nodeIds: [node.id],
                };

                return {
                    ...f,
                   reference, // Accumulate origin
                };
            })
    );
}

export default { parseQuery };

