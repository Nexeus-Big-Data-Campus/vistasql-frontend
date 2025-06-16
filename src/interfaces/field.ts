export interface Field {
    id: string;
    text: string;
    name: string;
    alias: string;
    references: FieldReference[];
    isAllSelector: boolean;
    isAmbiguous: boolean;
    isReferenced: boolean;
    type: FieldType;
}

export interface InvocationField extends Field {
    invocationName: string;
    parameters: string[];
}

export interface CastField extends Field {
    
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
}

export enum FieldType {
    FIELD = 'field',
    LITERAL = 'literal',
    CAST = 'cast',
    INVOCATION = 'invocation',
    ALL_SELECTOR = 'all_selector',
}