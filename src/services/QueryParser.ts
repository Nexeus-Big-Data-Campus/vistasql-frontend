import murmur from "murmurhash-js";
import { Query } from "../interfaces/query";
import {Language, Node, Parser} from "web-tree-sitter";
import { Join } from "../interfaces/join";
import { Reference } from "../interfaces/reference";
import { LexicalError } from "../interfaces/error";
import { Field } from "../interfaces/field";

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
        // Iniciar la construcción del árbol con un contexto de CTEs vacío
        nodes.push(buildQueryNodeFromTree(statement, statement.type, null, []));
    });

    return nodes;
}

function buildQueryNodeFromTree(rootNode: Node, type: string, name: string | null = null, availableCTEs: Query[] = []): Query {
    // Encuentra CTEs definidos dentro de este nodo (para subconsultas con su propio WITH)
    const ctesInNode = rootNode.descendantsOfType('cte');
    const subqueries = findAllSubqueries(rootNode);
    
    // Procesa los CTEs locales, pasándoles el contexto de los CTEs ya disponibles
    const cteNodes = processCte(ctesInNode, availableCTEs); 
    const subqueryNodes = processSubqueries(subqueries);

    // Todas las fuentes de datos que este nodo puede referenciar
    const allAvailableSources = [...availableCTEs, ...cteNodes, ...subqueryNodes];

    // Obtiene todas las referencias de la cláusula FROM
    const fromReferences = getTableReferences(rootNode, []);
    
    // Los "hijos" de este nodo son las fuentes disponibles (CTEs) que se usan en su FROM
    const childrenOfNode = allAvailableSources.filter(source => 
        fromReferences.some(ref => ref.name === source.name)
    );

    // Actualiza el alias en el objeto hijo para que se muestre en el diagrama
    childrenOfNode.forEach(child => {
        const ref = fromReferences.find(r => r.name === child.name);
        if (ref?.alias) {
            child.alias = ref.alias;
        }
    });

    // Las "referencias" finales son aquellas que no son CTEs (tablas base)
    const references = fromReferences.filter(ref => 
        !allAvailableSources.some(source => source.name === ref.name)
    );
    
    const joins = getJoins(rootNode);
    // Pasamos todas las fuentes disponibles para que la resolución de campos funcione
    const fields = getSelectFields(rootNode, references, joins, allAvailableSources);
    const errors = getQueryErrors(rootNode);

    return {
        id: murmur.murmur3(rootNode.text + Math.random() * 1000),
        code: rootNode.text,
        name: name ?? rootNode.type,
        type: type,
        fields,
        joins,
        children: [...childrenOfNode, ...subqueryNodes],
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

function processCte(ctes: (Node | null)[], parentContext: Query[] = []): Query[] {
    const cteNodes: Query[] = [];
    const availableCTEsInScope = [...parentContext]; // Copia mutable del contexto

    ctes.forEach(cte => {
        if (!cte) { return; }
        
        const firstStatement = getDirectChildByType(cte, 'statement')[0];
        if (!firstStatement) { return; }
        
        const identifierNode = getDirectChildByType(cte, 'identifier');
        const name = identifierNode[0]?.text ?? null;
        
        // Pasa los CTEs ya disponibles al siguiente nodo que se va a construir
        const newNode = buildQueryNodeFromTree(firstStatement, 'cte', name, availableCTEsInScope);
        cteNodes.push(newNode);
        
        // Añade el nodo recién creado a la lista para que el siguiente CTE lo pueda usar
        availableCTEsInScope.push(newNode);
    });

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
    const terms = selectExpression?.namedChildren.filter((child) => child?.type === 'term');
    let fields: Field[] = terms.filter((t: Node | null) => !!t).map((t: Node) => processField(t, references, joins, children));
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

function processField(term: Node, references: Reference[], joins: Join[], queryChildren: Query[]): Field {
    const field = term?.text;
    const text = field ?? '';
    const alias = term?.childForFieldName('alias')?.text;
    const valueNode = term?.childForFieldName('value');
    const isSelectAll = valueNode?.type === 'all_fields';
    const [originAlias, fieldName] = text.split('.');
    const name = text.includes('.') && (valueNode?.type !== 'invocation' && valueNode?.type !== 'subquery') ? fieldName : text;
    let origin: string[] = [];
    let id: string | undefined = undefined;

    const findOrigin = (aliasToFind: string, nameToFind: string) => {
        let foundOrigin: string[] = [];
        let foundId: string | undefined = undefined;

        const allSources = [...queryChildren, ...references, ...joins];

        for (const source of allSources) {
            const sourceName = 'name' in source ? source.name : '';
            const sourceAlias = source.alias ?? '';
            
            if (sourceAlias === aliasToFind || sourceName === aliasToFind) {
                if ('fields' in source) { // Es una Query
                    for (const f of (source as Query).fields) {
                        if (f.name === nameToFind || f.alias === nameToFind) {
                            foundId = f.id;
                            foundOrigin.push(source.id, ...f.origin);
                            break; 
                        }
                    }
                } else { // Es una Reference o Join
                    foundOrigin.push(source.id);
                }
                if(foundId) break;
            }
        }
        return { foundId, foundOrigin };
    };

    if (valueNode?.type === 'invocation') {
        const invocationArgs = valueNode.descendantsOfType('term');
        invocationArgs.forEach(arg => {
            if (arg) {
                const argField = processField(arg, references, joins, queryChildren);
                origin.push(...argField.origin);
            }
        });

    } else if (valueNode?.type !== 'subquery') {
        if (originAlias && fieldName) {
            const { foundId, foundOrigin } = findOrigin(originAlias, fieldName);
            id = foundId;
            origin.push(...foundOrigin);
        } else {
            // Lógica mejorada para campos sin alias de tabla
            const allPossibleSources = [...queryChildren, ...references, ...joins];
            // Primero, busca en los CTEs/subconsultas
            for (const source of queryChildren) {
                const foundField = source.fields.find(f => f.name === name || f.alias === name);
                if (foundField) {
                    id = foundField.id;
                    origin.push(source.id, ...foundField.origin);
                    break;
                }
            }

            // Si no se encontró y solo hay una tabla de referencia, asume que viene de ahí
            if (origin.length === 0 && references.length === 1) {
                origin.push(references[0].id);
            }
        }
    }
    
    origin = [...new Set(origin)];

    return {
        id: id ?? murmur.murmur3(field + Math.random() * 1000),
        name,
        text,
        alias: alias ?? name,
        isAllSelector: isSelectAll,
        origin,
    };
}
function concatChildrenFields(node: Query, fields: Field[]): Field[] {
    return fields.concat(
        node.fields
            .filter((f) => !f.isAllSelector)
            .map((f) => ({
                ...f,
                origin: [...f.origin, node.id], // Accumulate origin
            }))
    );
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
        
        if(currentNode?.type !== 'subquery' && currentNode?.type !== 'cte') {
            heap.push(...currentNode?.namedChildren ?? []);
        }
    }

    return hits;
}

function findAllSubqueries(node: Node): Node[] {
    return getNodeTypesInCurrentScope(node, 'subquery');
}

export default {parseQuery};

