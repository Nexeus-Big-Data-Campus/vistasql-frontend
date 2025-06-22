import murmur from "murmurhash-js";
import {Language, Node, Parser} from "web-tree-sitter";
import { Join } from "../../interfaces/join";
import { LexicalError } from "../../interfaces/error";
import { Field, FieldOrigin, FieldReference, InvocationField } from "../../interfaces/field";
import { getDirectChildByType, getNodeTypesInCurrentScope, findAllSubqueries, generateHash, parseObjectReference } from "./utils";
import { processColumn } from "./fieldParser";
import { FromClause, Query, SelectClause, ObjectReference, ObjectReferenceType, UnionClause } from "../../interfaces/query";


let parser: Parser;

// Initialize the tree-sitter parser
Parser.init({
    locateFile(scriptName: string, scriptDirectory: string) {
        return '/' + scriptName;
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
    console.log(rootNode.toString())

    try {
        const statements = getDirectChildByType(rootNode, 'statement');
        statements.forEach((statement) => {
            if(!statement) {
                return;
            }

            nodes.push(buildQueryNodeFromTree(statement, statement.type));
        });   
    } catch (e) {
        console.error('The statement contains errors...', e);
    }

    return nodes;
}

function buildQueryNodeFromTree(rootNode: Node, type: string, name: string | null = null, cteContext: Query[] = []): Query {
    const ctes = rootNode.descendantsOfType('cte');    
    const cte = processCte(ctes, cteContext); 
    const cteLocalContext = [...cte, ...cteContext];

    const joins = getJoins(rootNode);
    const fromClause = parseFromClause(rootNode, cteLocalContext);
    const selectClause = parseSelectClause(rootNode, fromClause.references, joins);
    const unionClause = parseUnionClause(rootNode, cteLocalContext);
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
        whereClause: undefined, //TODO
        orderByClause: undefined, //TODO
        unionClause,
        errors
    };
}

function parseFromClause(rootNode: Node, ctes: Query[]): FromClause {
    const formClause = getNodeTypesInCurrentScope(rootNode, 'from');

    return {
        references: getFromReferences(formClause[0], ctes)
    };
}

function parseSelectClause(rootNode: Node, tableReferences: ObjectReference[], joins: Join[]): SelectClause {
    const selectNode = getNodeTypesInCurrentScope(rootNode, 'select');

    if(!selectNode || selectNode.length === 0) {
        throw new Error('No select node found');
    }

    const selectExpression = getDirectChildByType(selectNode[0], 'select_expression');
    if(!selectExpression || selectExpression.length === 0) {
        throw new Error('No select expression found');
    }

    const fields = getSelectFields(selectExpression[0], tableReferences, joins);
    return {
        fields,
    }
}

function getFromReferences(node: Node, ctes: Query[]): ObjectReference[] {
    if(!node || node.type !== 'from') {
        throw new Error('Node is not a from clause');
    }

    const relations = getDirectChildByType(node, 'relation');
    const references: ObjectReference[] = [];

    relations.forEach((relation) => {
        if(!relation) {
            return;
        }

        const reference = parseRelation(relation);

        if(!reference) {
            return;
        }

        ctes.forEach(cte => {
            if (reference.name === cte.name) {
                reference.ref = cte;
            }
        });

        references.push(reference);
    });

    return references;
}

function parseRelation(relation: Node): ObjectReference | null {
    const relationChild = relation.firstChild;

    if(!relationChild) {
        return null;
    }    
    
    const relationType = relationChild.type;

    switch(relationType) {
        case 'object_reference':
            return getObjectRelationReference(relation);
        case 'subquery':
            return getSubqueryRelation(relationChild);
        default:
            return null; 
    }
}

function getSubqueryRelation(relation: Node): ObjectReference {
    const query = buildQueryNodeFromTree(relation, 'subquery');

    return {
        id: generateHash(query.code),
        type: ObjectReferenceType.SUBQUERY,
        name: query.name,
        alias: query.name,
        ref: query
    }
}

function getObjectRelationReference(relation: Node): ObjectReference {
    const alias = relation.childForFieldName('alias')?.text ?? '';
    const source = getNodeTypesInCurrentScope(relation, 'object_reference');
    const quoted_ref = getDirectChildByType(source[0], 'quoted_object_reference');
    const {database, schema, name} = quoted_ref.length > 0 ? parseObjectReference(quoted_ref[0].text) : parseObjectReference(source[0].text);
    const id = generateHash(`${alias}-${name}`);

    return {
        id,
        alias,
        database,
        schema,
        type: ObjectReferenceType.TABLE,
        name: name ?? '',
    }
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

function processCte(ctes: (Node | null)[], cteContext: Query[]): Query[] {
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

        cteNodes.push(buildQueryNodeFromTree(statement[0], 'cte', name, [...cteNodes, ...cteContext]));
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
        
        const relationNodes = joinClause.descendantsOfType('relation');
        const predicate = joinClause.childForFieldName('predicate')?.text ?? '';

        if(!relationNodes || !relationNodes[0]) {
            return
        }

        const relation = relationNodes[0];
        const source = parseRelation(relation);

        if(!source || !source) {
            return;
        }

        if (source.type === ObjectReferenceType.SUBQUERY) {
            source.ref?.selectClause.fields.forEach(field => field.isReferenced = true);
        }

        const alias = relation.childForFieldName('alias')?.text ?? '';
        const type = joinClause.text.split(/JOIN/gi)[0].toLowerCase().trim();
        const id = generateHash(`${alias}-${source.name}`);

        joins.push({
            id,
            alias,
            type,
            predicate,
            source
        });
    });

    return joins;
}

function getSelectFields(selectExpression: Node | null, references: ObjectReference[], joins: Join[]): Field[] {
    if (!selectExpression || selectExpression.type !== 'select_expression') {
        return [];
    }

    const terms = selectExpression?.namedChildren.filter((child: Node | null) => child?.type === 'term');
    let fields: Field[] = terms.filter((t: Node | null) => !!t)
                                .map((t: Node) => processColumn(t, references, joins))
                                .filter((f: Field | null) => !!f) as Field[];

    const hasAllSelector = fields.reduce((acum, field) => acum || field.isAllSelector, false);

    if (hasAllSelector) {
        // Add the fields from the children referenced in the FROM clause
        references.forEach((reference) => {
            if (reference.ref) {
                fields = fields.concat(getChildrenFields(reference.ref));
            }
        });
    }
    
    return fields;
}

function getChildrenFields(node: Query): Field[] {
    return node.selectClause.fields
        .filter((f) => !f.isAllSelector)
        .map((f) => {
            f.isReferenced = true;
            return {
                ...f,
                id: generateHash(f.text),
                isReferenced: false,
                references: [{
                    fieldId: f.id,
                    nodeId: node.id,
                    origin: FieldOrigin.CTE,
                }],
            };
        });
}

function parseUnionClause(rootNode: Node, cteContext: Query[]): UnionClause | undefined {
    const unionNodes = rootNode.descendantsOfType('union');
    
    if (!unionNodes || unionNodes.length === 0) {
        return undefined;
    }

    const unionNode = unionNodes[0];
    
    const unionText = unionNode.text.toUpperCase();
    const unionType = unionText.includes('UNION ALL') ? 'UNION ALL' : 'UNION';
    
    const unionStatement = unionNode.descendantsOfType('statement');
    
    if (!unionStatement || unionStatement.length === 0) {
        return undefined;
    }
    
    const unionQuery = buildQueryNodeFromTree(unionStatement[0], 'union_query', null, cteContext);
    
    return {
        type: unionType as 'UNION' | 'UNION ALL',
        query: unionQuery
    };
}

