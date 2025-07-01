import { ObjectReference } from "./query";

export interface Field {
    id: string;
    text: string;
    name: string;
    alias: string;
    references: FieldReference[];
    referencedBy: Field[];
    isAmbiguous: boolean;
    isReferenced: boolean;
    type: FieldType;
}

export interface InvocationField extends Field {
    invocationName: string;
    parameters: string[];
}

export interface AllSelectorField extends Field {
    exceptFields: Field[],
    selectFrom: ObjectReference | null
}

export enum FieldOrigin {
    CTE = 'cte',
    JOIN = 'join',
    REFERENCE = 'reference',
}

export interface FieldReference {
  fieldId: string;
  nodeId: string;
  origin: FieldOrigin;
  parents: FieldReference[];
}

export enum FieldType {
    FIELD = 'field',
    LITERAL = 'literal',
    CAST = 'cast',
    INVOCATION = 'invocation',
    ALL_SELECTOR = 'all_selector',
}