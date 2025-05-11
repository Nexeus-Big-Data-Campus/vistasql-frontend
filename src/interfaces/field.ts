export interface Field {
    id: string;
    text: string;
    name: string;
    alias: string;
    references?: FieldReference;
    isAllSelector: boolean;
    isAmbiguous: boolean;
}

export interface InvocationField extends Field {
    invocationName: string;
    parameters: string[];
}

export interface FieldReference {
  resolvedFieldIds: string[];
  nodeIds: string[];
}