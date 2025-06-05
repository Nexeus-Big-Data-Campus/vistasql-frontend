export interface Field {
    id: string;
    text: string;
    name: string;
    alias: string;
    references: FieldReference[];
    allReferences?: FieldReference[];
    isAllSelector: boolean;
    isAmbiguous: boolean;
}

export interface InvocationField extends Field {
    invocationName: string;
    parameters: string[];
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