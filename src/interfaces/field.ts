export interface Field {
    id: string;
    text: string;
    name: string;
    alias: string;
    origin: string[];
    isAllSelector: boolean;
}

export interface InvocationField extends Field {
    invocationName: string;
}