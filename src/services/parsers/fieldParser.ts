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
    const id = murmur.murmur3('all_fields' + Math.random() * 1000);
    return {
        id,
        name: '*',
        text: '*',
        alias: '*',
        isAllSelector: true,
        isAmbiguous: false,
        references: getFromClauseAndJoinsReferences(id, references, joins)
    };
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

function processField(term: Node, references: TableReference[], joins: Join[], cte: Query[], alias: string | undefined): Field {
    const id = murmur.murmur3(term.text + Math.random() * 1000);
    const text = term.childForFieldName('value')?.text ?? term.text;
    const name = text.includes('.') ? text.split('.').pop()! : text;
    
    const fieldReferences = findReferencesForField(id, text, references, joins, cte, alias ?? text);

    return {
        id,
        name: name,
        text: text,
        alias: alias ?? name,
        isAllSelector: false,
        references: fieldReferences,
        isAmbiguous: fieldReferences.length > 1,
    }
}

function findReferencesForField(fieldId: string, text: string, references: TableReference[], joins: Join[], cte: Query[], alias: string | undefined): FieldReference[] {
    const fieldReferences: FieldReference[] = [];
    const [referenceAlias, fieldName] = text.split('.');

    if (referenceAlias && fieldName) {
        // Find the source by its alias in the current query's scope
        const sourceRef = references.find(r => r.alias === referenceAlias || r.name === referenceAlias);
        
        if (sourceRef) {
            // Check if the source corresponds to a known CTE
            const referencedCTE = cte.find(c => c.name === sourceRef.name);
            if (referencedCTE) {
                // It's a CTE, so we link to the field inside the Query node
                let referenceAllSelector: Field | undefined;
                referencedCTE.selectClause.fields.forEach(f => {
                    if (f.isAllSelector) referenceAllSelector = f;
                    if (f.name === fieldName || f.alias === fieldName) {
                        fieldReferences.push(createFieldReference(f.id, referencedCTE.id, FieldOrigin.CTE));
                    }
                });
                if (fieldReferences.length === 0 && referenceAllSelector) {
                    fieldReferences.push(createFieldReference(referenceAllSelector.id, referencedCTE.id, FieldOrigin.CTE));
                }
                return fieldReferences; // Important: Stop here once the CTE is processed
            }
        }

        // If it's not a CTE or not found in CTEs, treat it as a base table or join
        const joinRef = joins.find(j => j.alias === referenceAlias || j.source === referenceAlias);
        if (joinRef) {
            fieldReferences.push(createFieldReference(joinRef.id, joinRef.id, FieldOrigin.JOIN));
        } else if (sourceRef) {
            fieldReferences.push(createFieldReference(fieldId, sourceRef.id, FieldOrigin.REFERENCE));
        }

    } else {
        // Unqualified field (no table alias)
        // Check all available CTEs for a field with a matching alias
        cte.forEach((table) => {
            table.selectClause.fields.forEach((f) => {
                if (f.alias === alias) {
                    fieldReferences.push(createFieldReference(f.id, table.id, FieldOrigin.CTE));
                }
            });
        });

        // If no match in CTEs, assume it comes from all FROM/JOIN sources (ambiguous)
        if (fieldReferences.length === 0) {
            fieldReferences.push(...getFromClauseAndJoinsReferences(fieldId, references, joins));
        }
    }

    return fieldReferences;
}

function getFromClauseAndJoinsReferences(fieldId: string, references: TableReference[], joins: Join[]): FieldReference[] {
    const fieldReferences: FieldReference[] = [];

    references.forEach((ref) => {
        fieldReferences.push(createFieldReference(fieldId, ref.id, FieldOrigin.REFERENCE));
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