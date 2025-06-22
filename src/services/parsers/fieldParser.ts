import { Node } from 'web-tree-sitter';
import { generateHash, getDirectChildByType, parseObjectReference } from './utils';
import { AllSelectorField, Field, FieldOrigin, FieldReference, FieldType, InvocationField } from '../../interfaces/field';
import { Join } from '../../interfaces/join';
import { ObjectReference, ObjectReferenceType } from '../../interfaces/query';

export function processColumn(term: Node, references: ObjectReference[], joins: Join[]): Field | null {
    const alias = term?.childForFieldName('alias')?.text;
    const value = term?.childForFieldName('value')?.type;

    switch (value) {
        case 'all_fields':
            return processAllFieldsSelector(term, references, joins);
        case 'field':
            return processField(term, references, joins, alias);
        case 'invocation':
            return processInvocationField(term, references, joins, alias);
        case 'cast':
            return processCastField(term, references, joins, alias);
        case 'literal':
            return processLiteralField(term, alias);
        case 'date_operation':
            return processDateOperationField(term, references, joins, alias);
        default: 
            return null;
    }
}

function processDateOperationField(term: Node, references: ObjectReference[], joins: Join[], alias: string | undefined): InvocationField | null {
    const dateOperationNode = getDirectChildByType(term, 'date_operation')[0];
    const parameterNode = dateOperationNode?.childForFieldName('parameter');

    if (!parameterNode) {
        return null;
    }

    const parameter = parseInvocationParameter(parameterNode, alias, references, joins, FieldType.INVOCATION);
    const parameterId = parameter?.id ?? '';
    const invocationName = dateOperationNode.namedChildren[0]?.text ?? '';

    return {
        id: generateHash(term.text),
        name: invocationName,
        invocationName: invocationName,
        alias: alias ?? invocationName,
        isAmbiguous: false,
        isReferenced: false,
        parameters: [parameterId],
        references: parameter?.references ?? [],
        text: term.text,
        type: FieldType.INVOCATION
    };
}

function processLiteralField(term: Node, alias: string | undefined): Field {
    return {
        id: generateHash(term.text),
        name: '',
        text: term.text,
        alias: alias ?? term.text,
        isAmbiguous: false,
        isReferenced: false,
        references: [],
        type: FieldType.LITERAL,
    }
}

function processCastField(term: Node, references: ObjectReference[], joins: Join[], alias: string | undefined): Field | null {
    const cast = term.childForFieldName('value')?.descendantsOfType('cast')[0];
    const parameter = cast?.childForFieldName('parameter');

    if(!parameter) {
        return null;
    }

    return parseInvocationParameter(parameter, alias, references, joins, FieldType.CAST);
}

function parseInvocationParameter(parameter: Node, alias: string | undefined, references: ObjectReference[], joins: Join[], fieldType: FieldType): Field | null {
    const fieldNode = parameter?.descendantsOfType('field');
    const field = fieldNode && fieldNode?.length > 0 && fieldNode[0] ? processField(fieldNode[0], references, joins, alias) : null;

    if (!field) {
        return null;
    }

    return {
        id: generateHash(parameter.text),
        name: field.name,
        text: parameter.text,
        alias: alias ?? field.name,
        isAmbiguous: field.isAmbiguous,
        isReferenced: false,
        references: field.references,
        type: fieldType,
    };
}

function processAllFieldsSelector(term: Node, references: ObjectReference[], joins: Join[]): AllSelectorField {
    const id = generateHash('all_fields');
    const allFieldsNode = term.childForFieldName('value');
    const objectReferenceNode =  getDirectChildByType(allFieldsNode, 'object_reference');
    const exceptNode = getDirectChildByType(allFieldsNode, 'except_statement');
    let selectFrom: ObjectReference | null = null;
    let exceptFields: Field[] = [];

    if(objectReferenceNode.length > 0 && objectReferenceNode[0]) {
        const {database, schema, name} = parseObjectReference(objectReferenceNode[0].text);
        selectFrom = {
            id: generateHash(objectReferenceNode[0].text),
            database,
            schema,
            name: name ?? '',
            alias: name ?? '',
            type: ObjectReferenceType.TABLE
        };
    }

    if (exceptNode && exceptNode[0]) {
        const terms = getDirectChildByType(exceptNode[0], 'term');
        exceptFields = terms.map(t => processColumn(t, references, joins)).filter(f => !!f);
    }

    const name = !selectFrom ? '*' : `${selectFrom.name}.*`; 

    return {
        id,
        name,
        text: term.text,
        alias: name,
        isAmbiguous: false,
        isReferenced: false,
        references: getFromClauseAndJoinsReferences(id, references, joins),
        type: FieldType.ALL_SELECTOR,
        selectFrom,
        exceptFields
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

    const objectReference = termValue?.descendantsOfType('object_reference') ?? [];
    const { name } = parseObjectReference(objectReference[0]?.text ?? ''); 
    const fieldName = getDirectChildByType(termValue, 'identifier')[0]?.text;
    const fieldReferences = findReferencesForField(id, name, fieldName, references, joins, alias ?? term.text);

    return {
        id,
        name: fieldName ?? term.text,
        text: term.text,
        alias: alias ?? term.text,
        references: fieldReferences,
        isAmbiguous: fieldReferences.length > 1,
        isReferenced: false,
        type: FieldType.FIELD,
    }
}

function findReferencesForField(fieldId: string, objectReferenceName: string, fieldName: string, objectReferences: ObjectReference[], joins: Join[], alias: string | undefined): FieldReference[] {
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

    if (fieldReferences.length > 0) {
        return fieldReferences;
    }

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