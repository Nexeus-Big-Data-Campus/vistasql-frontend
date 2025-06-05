import murmur from "murmurhash-js";
import {Language, Node, Parser} from "web-tree-sitter";
import { Join } from "../../interfaces/join";
import { LexicalError } from "../../interfaces/error";
import { Field, FieldOrigin, FieldReference, InvocationField } from "../../interfaces/field";
import { getDirectChildByType, getNodeTypesInCurrentScope, findAllSubqueries } from "./utils";
import { processColumn } from "./fieldParser";
import { FromClause, Query, SelectClause, TableReference } from "../../interfaces/query";


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
export default function parseQuery(code: string): Query[] {
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

function buildQueryNodeFromTree(rootNode: Node, type: string, name: string | null = null): any {
    const ctes = rootNode.descendantsOfType('cte');    
    const cte = processCte(ctes); 

    const joins = getJoins(rootNode);
    const fromClause = parseFromClause(rootNode, cte);
    const selectClause = parseSelectClause(rootNode, cte, fromClause.references, joins);
    const errors = getQueryErrors(rootNode);

    return {
        id: murmur.murmur3(rootNode.text + Math.random() * 1000),
        code: rootNode.text,
        name: name ?? rootNode.type,
        type: type,
        cte,
        joins,
        fromClause: fromClause,
        selectClause: selectClause,
        whereClause: null,
        orderByClause: null,
        errors
    };
}

function parseFromClause(rootNode: Node, cte: Query[]): FromClause {
    const formClause = getNodeTypesInCurrentScope(rootNode, 'from');
    return {
        references: getFromReferences(formClause[0], cte)
    };
}

function parseSelectClause(rootNode: Node, cte: Query[], tableReferences: TableReference[], joins: Join[]): SelectClause {
    const selectNode = getNodeTypesInCurrentScope(rootNode, 'select');

    if(!selectNode || selectNode.length === 0) {
        throw new Error('No select node found');
    }

    const selectExpression = getDirectChildByType(selectNode[0], 'select_expression');
    if(!selectExpression || selectExpression.length === 0) {
        throw new Error('No select expression found');
    }

    const fields = getSelectFields(selectExpression[0], tableReferences, joins, cte);
    return {
        fields,
    }
}

function getFromReferences(node: Node, cte: Query[]): TableReference[] {
    if(node.type !== 'from') {
        throw new Error('Node is not a from clause');
    }

    const relations = getDirectChildByType(node, 'relation');
    const references: TableReference[] = [];

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
        if (name && cte) {
            cte.forEach((element: Query) => {
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

function getSelectFields(selectExpression: Node | null, references: TableReference[], joins: Join[], cte: Query[]): Field[] {
    if (!selectExpression || selectExpression.type !== 'select_expression') {
        return [];
    }

    const terms = selectExpression?.namedChildren.filter((child: Node | null) => child?.type === 'term');
    let fields: Field[] = terms.filter((t: Node | null) => !!t)
                                .map((t: Node) => processColumn(t, references, joins, cte))
                                .filter((f: Field | null) => !!f) as Field[];

    const hasAllSelector = fields.reduce((acum, field) => acum || field.isAllSelector, false);

    if (hasAllSelector) {
        // Add the fields from the children referenced in the FROM clause
        references.forEach((reference) => {
            const referenceChild = cte.filter((query) => query.name === reference.name);
            referenceChild.forEach((c: Query) => {
                fields = concatChildrenFields(c, fields);
            });
        });
    }

    return fields;
}

function concatChildrenFields(node: Query, fields: Field[]): Field[] {
    return fields.concat(
        node.selectClause.fields
            .filter((f) => !f.isAllSelector)
            .map((f) => {
                return {
                    ...f,
                   references: [{
                    fieldId: f.id,
                    nodeId: node.id,
                    origin: FieldOrigin.CTE,
                   }],
                };
            })
    );
}

