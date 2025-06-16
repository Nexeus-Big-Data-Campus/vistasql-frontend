import { Node } from 'web-tree-sitter';
import { generateHash, getDirectChildByType } from './utils';
import { CastField, Field, FieldOrigin, FieldReference, FieldType, InvocationField } from '../../interfaces/field';
import { Join } from '../../interfaces/join';
import { ObjectReference } from '../../interfaces/query';

export function processColumn(term: Node, references: ObjectReference[], joins: Join[]): Field | null {
    const alias = term?.childForFieldName('alias')?.text;
    const value = term?.childForFieldName('value')?.type;

    switch (value) {
        case 'all_fields':
            return processAllFieldsSelector(references, joins);
        case 'field':
            return processField(term, references, joins, alias);
        case 'invocation':
            return processInvocationField(term, references, joins, alias);
        case 'cast':
            return processCastField(term, references, joins, alias);
        case 'literal':
            return processLiteralField(term, alias);
        default: 
            return null;
    }
}

function processLiteralField(term: Node, alias: string | undefined): Field {
    return {
        id: generateHash(term.text),
        name: '',
        text: term.text,
        alias: alias ?? term.text,
        isAllSelector: false,
        isAmbiguous: false,
        isReferenced: false,
        references: [],
        type: FieldType.LITERAL,
    }
}

function processCastField(term: Node, references: ObjectReference[], joins: Join[], alias: string | undefined): CastField | null {
    const cast = term.childForFieldName('value')?.descendantsOfType('cast')[0];
    const parameter = cast?.childForFieldName('parameter');

    const fieldNode = parameter?.descendantsOfType('field');
    const field = fieldNode && fieldNode?.length > 0 && fieldNode[0] ? processField(fieldNode[0], references, joins, alias) : null;

    if (!field) {
        return null;
    }

    return {
        id: generateHash(term.text),
        name: field.name,
        text: term.text,
        alias: alias ?? field.name,
        isAllSelector: false,
        isAmbiguous: field.isAmbiguous,
        isReferenced: false,
        references: field.references,
        type: FieldType.CAST,
    };
}

function processAllFieldsSelector(references: ObjectReference[], joins: Join[]): Field {
    const id = generateHash('all_fields');
    return {
        id,
        name: '*',
        text: '*',
        alias: '*',
        isAllSelector: true,
        isAmbiguous: false,
        isReferenced: false,
        references: getFromClauseAndJoinsReferences(id, references, joins),
        type: FieldType.ALL_SELECTOR,
    };
}   

function processInvocationField(term: Node, references: ObjectReference[], joins: Join[], alias: string | undefined): InvocationField {
    const invocation = getDirectChildByType(term, 'invocation')[0];
    const invocationName = getDirectChildByType(invocation, 'object_reference')[0]?.text;
    const parameters = getDirectChildByType(invocation, 'term');
    const fieldParameters = parameters.filter(p => p.childForFieldName('value')?.type === 'field');
    const fields = fieldParameters.map((p) => processField(p, references, joins, alias));
    const fieldReferences = fields.map((f) => f.references).flat();

    return {
        id: generateHash(term.text),
        name: term.text,
        text: term.text,
        alias: alias ?? term.text,
        isAllSelector: false,
        invocationName,
        references: fieldReferences,
        parameters: parameters.map((p) => p.text),
        isAmbiguous: false,
        isReferenced: false,
        type: FieldType.INVOCATION,
    };
}

function processField(term: Node, references: ObjectReference[], joins: Join[], alias: string | undefined): Field {
    const id = generateHash(term.text);
    const termValue = term.childForFieldName('value');

    const objectReference = termValue?.descendantsOfType('object_reference');
    const objectReferenceName = objectReference && objectReference.length > 0 ? objectReference[0]?.childForFieldName('name')?.text: undefined;

    const fieldName = getDirectChildByType(termValue, 'identifier')[0]?.text;
    const fieldReferences = findReferencesForField(id, objectReferenceName, fieldName, references, joins, alias ?? term.text);

    return {
        id,
        name: fieldName ?? term.text,
        text: term.text,
        alias: alias ?? term.text,
        isAllSelector: false,
        references: fieldReferences,
        isAmbiguous: fieldReferences.length > 1,
        isReferenced: false,
        type: FieldType.FIELD,
    }
}

function findReferencesForField(fieldId: string, objectReferenceName: string | undefined, fieldName: string, objectReferences: ObjectReference[], joins: Join[], alias: string | undefined): FieldReference[] {
    let fieldReferences: FieldReference[] = [];

    objectReferences.forEach(reference => {
        if (reference.ref && (objectReferenceName && objectReferenceName === reference.alias) || !objectReferenceName) {
            reference.ref?.selectClause.fields.forEach(f => {
                if (f.name === fieldName || f.alias === fieldName) {
                    fieldReferences.push(createFieldReference(f.id, reference.ref?.id || '', FieldOrigin.CTE));
                    f.isReferenced = true;
                }
            });
        } else if (objectReferenceName === reference.name || objectReferenceName === reference.alias)  {
            fieldReferences.push(createFieldReference(fieldId, reference.id, FieldOrigin.REFERENCE));
        }
    });

    joins.forEach(join => {
        if (objectReferenceName && (join.alias === objectReferenceName || join.source.name === objectReferenceName)) {
            fieldReferences.push(createFieldReference(fieldId, join.id, FieldOrigin.JOIN))
        }
    });

    if (fieldReferences.length > 0) {
        return fieldReferences;
    }

    fieldReferences = fieldReferences.concat(getFromClauseAndJoinsReferences(fieldId, objectReferences, joins));

    return fieldReferences;
}

function getFromClauseAndJoinsReferences(fieldId: string, references: ObjectReference[], joins: Join[]): FieldReference[] {
    const fieldReferences: FieldReference[] = [];

    references.forEach((ref) => {
        fieldReferences.push(createFieldReference(fieldId, ref.id, FieldOrigin.REFERENCE));
    });

    joins.forEach((join) => {
        fieldReferences.push(createFieldReference(fieldId, join.id, FieldOrigin.JOIN));
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