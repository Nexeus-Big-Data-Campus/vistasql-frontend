export interface Field {
    id: string;
    text: string;
    name: string;
    alias: string;
    references: FieldReference | null;
    isAllSelector: boolean;
    isAmbiguous: boolean;
}

export interface InvocationField extends Field {
    invocationName: string;
    parameters: string[];
}

export interface FieldReference {
  fieldId: string;
  parentId: string | null;
  parentNodeId: string | null;
}