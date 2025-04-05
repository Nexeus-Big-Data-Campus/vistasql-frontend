export interface QueryNode {
    name: string;
    hash: string;
    code: string;
    fields: string[];
    children: QueryNode[];
}