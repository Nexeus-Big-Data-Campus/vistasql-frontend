import murmur from "murmurhash-js";
import { Query } from "../../interfaces/query";
import {Language, Node, Parser} from "web-tree-sitter";
import { Join } from "../../interfaces/join";
import { Reference } from "../../interfaces/reference";

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
function parseQuery(code: string): Query[] | null {
    if(!code || !parser) {
        return null;
    }

    const tree = parser.parse(code);
    
    if(!tree) {
        return null;
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

function buildQueryNodeFromTree(rootNode: Node, type: string): Query {
    const cte = rootNode.descendantsOfType('cte');
    const subqueries = findAllSubqueries(rootNode);

    const cteNodes = cte
        .map((subquery) => processCte(subquery, 'cte'))
        .filter((cte) => cte !== null);
    const subqueryNodes = subqueries
        .map((subquery) => buildQueryNodeFromTree(subquery, 'subquery'));

    const formClause = getNodeTypesInCurrentScope(rootNode, 'from');
    const references: Reference[] = formClause.length > 0 ? getFromReferences(formClause[0]) : [];

    return {
        hash: murmur.murmur3(rootNode.text + Math.random() * 1000),
        code: rootNode.text,
        name: rootNode.type,
        type: type,
        fields: getSelectFields(rootNode),
        joins: getJoins(rootNode),
        children: [...cteNodes, ...subqueryNodes],
        references 
    };
}

function processCte(cte: Node | null, type: string): Query | null {
    if(!cte) {
        return null;
    }

    const statement = getDirectChildByType(cte, 'statement');
    
    if(!statement || !statement[0]) {
        return null;
    }

    return buildQueryNodeFromTree(statement[0], type);
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

        const alias = relation.childForFieldName('alias')?.text ?? '';
        const source = getNodeTypesInCurrentScope(relation, 'object_reference');
        
        references.push({
            alias,
            name: source[0]?.text ?? '',
        });
    });

    return references;
}

function getSelectFields(selectClause: Node | null): string[] {
    if(!selectClause) {
        return [];
    }

    const fields: string[] = [];
    const selectExpression = selectClause.descendantsOfType('select_expression')[0];
    const terms = selectExpression?.namedChildren.filter((child) => child?.type === 'term');
    
    terms?.forEach((term) => {
        const field = term?.text;
        const alias = term?.childForFieldName('alias')?.text;

        if(!field && !alias) {
            return;
        }

        fields.push((alias ?? field) ?? '');
    }); 

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

