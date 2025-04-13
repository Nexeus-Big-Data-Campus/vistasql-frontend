export interface Query {
    name: string;
    hash: string;
    code: string;
    fields: string[];
    children: Query[];
}