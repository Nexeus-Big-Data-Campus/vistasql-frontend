import { Node } from 'web-tree-sitter';
import { getDirectChildByType } from './utils';
import { Field, FieldOrigin, FieldReference, InvocationField } from '../../interfaces/field';
import murmur from "murmurhash-js";
import { Join } from '../../interfaces/join';
import { Query, TableReference } from '../../interfaces/query';

export function processColumn(term: Node, references: TableReference[], joins: Join[], cte: Query[]): Field | null {
    const alias = term?.childForFieldName('alias')?.text;
    const value = term?.childForFieldName('value')?.type;

    switch (value) {
        case 'all_fields':
            return processAllFieldsSelector(references, joins);
        case 'field':
            return processField(term, references, joins, cte, alias);
        case 'invocation':
            return processInvocationField(term, references, joins, cte, alias);
        default: 
            return null;
    }
}

function processAllFieldsSelector(references: TableReference[], joins: Join[]): Field {
    const refs = getFromClauseAndJoinsReferences(references, joins);
    return {
        id: murmur.murmur3('all_fields' + Math.random() * 1000),
        name: '*',
        text: '*',
        alias: '*',
        isAllSelector: true,
        isAmbiguous: false,
        references: refs,
        allReferences: refs
    };
}

function getAllReferencesRecursively(field: Field, cte: Query[]): FieldReference[] {
    if (!field.references || field.references.length === 0) {
        return [];
    }
    let result: FieldReference[] = [];
    for (const ref of field.references) {
        result.push(ref);
        if (ref.origin === FieldOrigin.CTE) {
            // Busca el campo referenciado en el CTE
            const cteField = cte
                .flatMap(table => table.selectClause.fields)
                .find(f => f.id === ref.fieldId);
            if (cteField) {
                result = result.concat(getAllReferencesRecursively(cteField, cte));
            }
        }
    }
    return result;
}

function processInvocationField(term: Node, references: TableReference[], joins: Join[], cte: Query[], alias: string | undefined): InvocationField {
    const invocation = getDirectChildByType(term, 'invocation')[0];
    const invocationName = getDirectChildByType(invocation, 'object_reference')[0]?.text;
    const parameters = getDirectChildByType(invocation, 'term');
    const fieldParameters = parameters.filter(p => p.childForFieldName('value')?.type === 'field');
    const fields = fieldParameters.map((p) => processField(p, references, joins, cte, alias));
    const fieldReferences = fields.map((f) => f.references).flat();

    return {
        id: murmur.murmur3(term.text + Math.random() * 1000),
        name: term.text,
        text: term.text,
        alias: alias ?? term.text,
        isAllSelector: false,
        invocationName,
        references: fieldReferences,
        parameters: parameters.map((p) => p.text),
        isAmbiguous: false,
    };
}

function processField(
    term: Node,
    references: TableReference[],
    joins: Join[],
    cte: Query[],
    alias: string | undefined
): Field {
    const [_originAlias, fieldName] = term.text.split('.');
    const fieldReferences = findReferencesForField(term, references, joins, cte, alias ?? term.text);
    let propagatedReferences = fieldReferences;
    let allReferences = fieldReferences;

    if (
        fieldReferences.length === 1 &&
        fieldReferences[0].origin === FieldOrigin.CTE &&
        cte.length > 0
    ) {
        const cteField = cte
            .flatMap(table => table.selectClause.fields)
            .find(f => f.id === fieldReferences[0].fieldId);
        if (cteField && cteField.references && cteField.references.length > 0) {
            propagatedReferences = [
                createFieldReference(cteField.id, fieldReferences[0].nodeId, FieldOrigin.CTE)
            ];
            allReferences = [
                ...propagatedReferences,
                ...getAllReferencesRecursively(cteField, cte)
            ];
        }
    }

    const id =
        propagatedReferences.length === 1 && propagatedReferences[0].origin === FieldOrigin.CTE
            ? propagatedReferences[0].fieldId
            : murmur.murmur3(term.text + Math.random() * 1000);

    return {
        id,
        name: fieldName,
        text: term.text,
        alias: alias ?? term.text,
        isAllSelector: false,
        references: propagatedReferences, 
        allReferences, 
        isAmbiguous: propagatedReferences.length > 1,
    };
}

function findReferencesForField(term: Node, references: TableReference[], joins: Join[], cte: Query[], alias: string | undefined): FieldReference[] {
    let fieldReferences: FieldReference[] = [];
    const [referenceAlias, fieldName] = term.text.split('.');

    if (referenceAlias && fieldName) {
        const referencedTable = cte.filter(qc => qc.name === referenceAlias || qc.alias === referenceAlias);
        
        // Grab origin field from subquery
        let referenceAllSelector: Field | undefined;
        referencedTable.forEach(table => {
            table.selectClause.fields.forEach(f => {
                if (f.isAllSelector) {
                    referenceAllSelector = f;
                }

                if(f.name === fieldName || f.alias === fieldName) {
                    fieldReferences.push(createFieldReference(f.id, table.id, FieldOrigin.CTE));
                    return;
                }
            });
        });

        if(fieldReferences.length === 0 && referenceAllSelector) {
            fieldReferences.push(createFieldReference(referenceAllSelector.id, referencedTable[0].id, FieldOrigin.CTE));
        }

        if (fieldReferences.length > 0) {
            return fieldReferences;
        }

        references.forEach(ref => {
            if(ref.alias === referenceAlias || ref.name === referenceAlias) {
                fieldReferences.push(createFieldReference(ref.id, ref.id, FieldOrigin.REFERENCE));
            }
        });

        joins.forEach(join => {
            if(join.alias === referenceAlias || join.source === referenceAlias) {
                fieldReferences.push(createFieldReference(join.id, join.id, FieldOrigin.JOIN));
            }
        });
    } else {
        // Search for fields without table alias
        cte.forEach((table) => {
            table.selectClause.fields.forEach((f) => {
                if (f.alias === alias) {
                    // Siempre referencia directa al campo del CTE
                    fieldReferences.push(createFieldReference(f.id, table.id, FieldOrigin.CTE));
                }
            });
        });

        fieldReferences = fieldReferences.concat(getFromClauseAndJoinsReferences(references, joins));
    }

    return fieldReferences;
}

function getFromClauseAndJoinsReferences(references: TableReference[], joins: Join[]): FieldReference[] {
    const fieldReferences: FieldReference[] = [];

    references.forEach((ref) => {
        fieldReferences.push(createFieldReference(ref.id, ref.id, FieldOrigin.REFERENCE));
    });

    joins.forEach((join) => {
        fieldReferences.push(createFieldReference(join.id, join.id, FieldOrigin.JOIN));
    });

    return fieldReferences;
}

function createFieldReference(fieldId: string, nodeId: string, origin: FieldOrigin): FieldReference {
    return {
        fieldId,
        nodeId,
        origin,
    };
}