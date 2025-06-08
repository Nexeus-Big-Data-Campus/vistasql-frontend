import murmur from "murmurhash-js";
import { Language, Node, Parser } from "web-tree-sitter";
import { Join } from "../../interfaces/join";
import { LexicalError } from "../../interfaces/error";
import { Field, FieldOrigin } from "../../interfaces/field";
import { getDirectChildByType, getNodeTypesInCurrentScope } from "./utils";
import { processColumn } from "./fieldParser";
import { FromClause, Query, SelectClause, TableReference, WhereClause } from "../../interfaces/query";

let parser: Parser;

Parser.init({
    locateFile(scriptName: string, scriptDirectory: string) {
        return scriptName;
    },
}).then(async () => {
    parser = new Parser();
    const SQL = await Language.load('/tree-sitter-sql.wasm');
    parser.setLanguage(SQL);
});

export default function parseQuery(code: string): Query[] {
    if (!code || !parser) return [];
    const tree = parser.parse(code);
    if (!tree) return [];

    const nodes: Query[] = [];
    const statements = getDirectChildByType(tree.rootNode, 'statement');
    statements.forEach((statement) => {
        if (statement) {
            nodes.push(buildQueryNodeFromTree(statement, statement.type, null, []));
        }
    });
    return nodes;
}

function buildQueryNodeFromTree(rootNode: Node, type: string, name: string | null = null, parentCtes: Query[] = []): any {
    const queryId = name ? `query-${name}` : `query-${murmur.murmur3(rootNode.text)}`;
    const localCteAstNodes = rootNode.descendantsOfType('cte');
    const processedLocalCtes = processCte(localCteAstNodes, parentCtes);
    const fullCteContext = [...parentCtes, ...processedLocalCtes];
    const joins = getJoins(rootNode, queryId);
    const fromClause = parseFromClause(rootNode, fullCteContext, queryId);
    const selectClause = parseSelectClause(rootNode, fullCteContext, fromClause.references, joins, queryId);
    const whereClause = parseWhereClause(rootNode);
    const errors = getQueryErrors(rootNode);

    return {
        id: queryId,
        code: rootNode.text,
        name: name ?? rootNode.type,
        type: type,
        cte: processedLocalCtes,
        joins,
        fromClause,
        selectClause,
        whereClause,
        orderByClause: null,
        errors
    };
}

function parseFromClause(rootNode: Node, cte: Query[], queryId: string): FromClause {
    const formClause = getNodeTypesInCurrentScope(rootNode, 'from');
    if (!formClause || formClause.length === 0) return { references: [] };
    return { references: getFromReferences(formClause[0], cte, queryId) };
}

function parseWhereClause(rootNode: Node): WhereClause | null {
    const whereNode = getNodeTypesInCurrentScope(rootNode, 'where_clause');
    if (!whereNode || whereNode.length === 0) return null;
    const rawText = whereNode[0].text;
    const conditionText = rawText.replace(/^WHERE\s+/i, '');
    return { code: conditionText };
}

function parseSelectClause(rootNode: Node, cte: Query[], tableReferences: TableReference[], joins: Join[], queryId: string): SelectClause {
    const selectNode = getNodeTypesInCurrentScope(rootNode, 'select');
    if (!selectNode || selectNode.length === 0) throw new Error('No select node found');
    const selectExpression = getDirectChildByType(selectNode[0], 'select_expression');
    if (!selectExpression || selectExpression.length === 0) throw new Error('No select expression found');
    const fields = getSelectFields(selectExpression[0], tableReferences, joins, cte, queryId);
    return { fields };
}

function getFromReferences(node: Node, cte: Query[], queryId: string): TableReference[] {
    if (!node || node.type !== 'from') return [];
    const relations = getDirectChildByType(node, 'relation');
    const references: TableReference[] = [];
    relations.forEach((relation) => {
        if (!relation || getDirectChildByType(relation, 'subquery').length > 0) return;
        const alias = relation.childForFieldName('alias')?.text ?? '';
        const source = getNodeTypesInCurrentScope(relation, 'object_reference');
        const name = source[0]?.text ?? '';
        const id = `ref-${queryId}-${name}-${alias}`;
        if (name && cte) {
            cte.forEach((element: Query) => {
                if (element.name === name) element.alias = alias;
            });
        }
        references.push({ id, alias, name });
    });
    return references;
}

function getQueryErrors(rootNode: Node): LexicalError[] {
    return rootNode.descendantsOfType('ERROR').filter(e => e !== null).map(e => ({ startIndex: e.startIndex, endIndex: e.endIndex }));
}

function processCte(cteAstNodes: (Node | null)[], parentCtes: Query[] = []): Query[] {
    const newlyProcessedCtes: Query[] = [];
    cteAstNodes.forEach(cteAstNode => {
        if (!cteAstNode) return;
        const identifierNode = getDirectChildByType(cteAstNode, 'identifier');
        const name = identifierNode ? identifierNode[0]?.text : null;
        const statement = getDirectChildByType(cteAstNode, 'statement');
        if (!statement || !statement[0]) return;
        const contextForCurrentCte = [...parentCtes, ...newlyProcessedCtes];
        const newCteQuery = buildQueryNodeFromTree(statement[0], 'cte', name, contextForCurrentCte);
        newlyProcessedCtes.push(newCteQuery);
    });
    return newlyProcessedCtes;
}

function getJoins(node: Node, queryId: string): Join[] {
    const joins: Join[] = [];
    const joinClauses = getNodeTypesInCurrentScope(node, 'join');
    joinClauses.forEach((joinClause) => {
        if (!joinClause) return;
        const relation = joinClause.descendantsOfType('relation');
        if (!relation || !relation[0]) return;
        const sourceNode = getNodeTypesInCurrentScope(relation[0], 'object_reference');
        if (!sourceNode || !sourceNode[0]) return;
        const predicate = joinClause.childForFieldName('predicate')?.text ?? '';
        const source = sourceNode[0].text;
        const alias = relation[0].childForFieldName('alias')?.text ?? '';
        const type = joinClause.text.split('JOIN')[0].toLowerCase().trim();
        const id = `join-${queryId}-${source}-${alias}`;
        joins.push({ id, alias, type, predicate, source });
    });
    return joins;
}

function getSelectFields(selectExpression: Node | null, references: TableReference[], joins: Join[], cte: Query[], queryId: string): Field[] {
    if (!selectExpression || selectExpression.type !== 'select_expression') return [];
    const terms = selectExpression.namedChildren.filter((child) => child?.type === 'term');
    let fields: Field[] = terms.filter((t): t is Node => !!t).map((t) => processColumn(t, references, joins, cte, queryId)).filter((f): f is Field => !!f);
    if (fields.some(field => field.isAllSelector)) {
        references.forEach((reference) => {
            cte.filter((query) => query.name === reference.name).forEach((c: Query) => {
                fields = concatChildrenFields(c, fields);
            });
        });
    }
    return fields;
}

function concatChildrenFields(node: Query, fields: Field[]): Field[] {
    return fields.concat(
        node.selectClause.fields.filter((f) => !f.isAllSelector).map((f) => ({
            ...f,
            references: [{ fieldId: f.id, nodeId: node.id, origin: FieldOrigin.CTE }],
        }))
    );
}