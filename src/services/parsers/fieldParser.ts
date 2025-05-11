import { Node } from 'web-tree-sitter';
import { getDirectChildByType } from './utils';
import { Field, FieldReference, InvocationField } from '../../interfaces/field';
import murmur from "murmurhash-js";
import { Reference } from '../../interfaces/reference';
import { Join } from '../../interfaces/join';
import { Query } from '../../interfaces/query';

export function processColumn(term: Node, references: Reference[], joins: Join[], queryChildren: Query[]): Field | null {
    const alias = term?.childForFieldName('alias')?.text;
    const value = term?.childForFieldName('value')?.type;

    switch (value) {
        case 'all_fields':
            return processAllFieldsSelector();
        case 'field':
            return processField(term, references, joins, queryChildren, alias);
        case 'invocation':
            return processInvocationField(term, references, joins, queryChildren, alias);
        default: 
            return null;
    }
}

function processAllFieldsSelector(): Field {
    return {
        id: murmur.murmur3('all_fields' + Math.random() * 1000),
        name: '*',
        text: '*',
        alias: '*',
        isAllSelector: true,
        isAmbiguous: false,
    };
}   

function processInvocationField(term: Node, references: Reference[], joins: Join[], queryChildren: Query[], alias: string | undefined): InvocationField {
    const invocation = getDirectChildByType(term, 'invocation')[0];
    const invocationName = getDirectChildByType(invocation, 'object_reference')[0]?.text;
    const parameters = getDirectChildByType(invocation, 'term');
    const fieldParameters = parameters.filter(p => p.childForFieldName('value')?.type === 'field');
    const fields = fieldParameters.map((p) => processField(p, references, joins, queryChildren, alias));
    const fieldReferences = fields.reduce((acum, field) => {
        const refs = field?.references?.resolvedFieldIds ?? [];
        return {
            resolvedFieldIds: [...acum.resolvedFieldIds, ...refs],
            nodeIds: [...acum.nodeIds, ...field?.references?.nodeIds ?? []],
        };
    }, {
        resolvedFieldIds: [] as string[],
        nodeIds: [] as string[],
    });

    return {
        id: murmur.murmur3(term.text + Math.random() * 1000),
        name: term.text,
        text: term.text,
        alias: alias ?? term.text,
        isAllSelector: false,
        invocationName,
        references: fieldReferences,
        parameters: parameters.map((p) => p.text),
        isAmbiguous: fieldReferences.nodeIds?.length > 1,
    };
}

function processField(term: Node, references: Reference[], joins: Join[], queryChildren: Query[], alias: string | undefined): Field {
    const [_originAlias, fieldName] = term.text.split('.');
    const fieldReferences = findReferencesForField(term, references, joins, queryChildren, alias ?? term.text);

    return {
        id: murmur.murmur3(term.text + Math.random() * 1000),
        name: fieldName,
        text: term.text,
        alias: alias ?? term.text,
        isAllSelector: false,
        references: fieldReferences,
        isAmbiguous: fieldReferences.nodeIds?.length > 1,
    }
}

function findReferencesForField(term: Node, references: Reference[], joins: Join[], queryChildren: Query[], alias: string | undefined): FieldReference {
    let referenceIds: string[] = [];
    let nodeIds: string[] = [];
    const [referenceAlias, fieldName] = term.text.split('.');

    // If there are no joins and no subqueries and one reference, we can return the reference directly
    if (joins.length === 0 && queryChildren.length === 0 && references.length === 1) {
        return {
            resolvedFieldIds: [references[0].id],
            nodeIds: [references[0].id],
        }
    }

    if (referenceAlias && fieldName) {
        const referencedTable = queryChildren.filter(qc => qc.name === referenceAlias || qc.alias === referenceAlias);
        
        // Grab origin field from subquery
        referencedTable.forEach(table => {
            table.fields.forEach(f => {
                if(f.name === fieldName || f.alias === fieldName) {
                    referenceIds.push(f.id);
                    nodeIds.push(table.id);
                }
            });
        });

        references.forEach(ref => {
            if(ref.alias === referenceAlias || ref.name === referenceAlias) {
                referenceIds.push(ref.id);
                nodeIds.push(ref.id);
            }
        });

        joins.forEach(join => {
            if(join.alias === referenceAlias || join.source === referenceAlias) {
                referenceIds.push(join.id);
                nodeIds.push(join.id);
            }
        });
    } else {
        // Search for fields without table alias
        queryChildren.forEach((table) => {
            table.fields.forEach((f) => {
                console.log('Field:', f, alias);
                if (f.alias === alias) {
                    referenceIds.push(f.id);
                    nodeIds.push(table.id);
                }
            });
        });
    }

    console.log('Field references:', referenceIds, nodeIds);

    return {
        resolvedFieldIds: referenceIds,
        nodeIds: nodeIds,
    };
}