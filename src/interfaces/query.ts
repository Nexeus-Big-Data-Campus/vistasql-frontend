import { LexicalError } from "./error";
import { Field } from "./field";
import { Join } from "./join";

export interface Query {
    id: string;
    name: string;
    alias?: string;
    type: string;
    code: string;
    cte: Query[];
    fromClause: FromClause;
    selectClause: SelectClause;
    whereClause: WhereClause;
    orderByClause: OrderByClause;
    joins: Join[];
    errors: LexicalError[];
}

export interface SelectClause {
    fields: Field[];
}

export interface WhereClause {
    code: string;
}

export interface FromClause {
    references: TableReference[];
}

export interface TableReference {
    id: string;
    name: string;
    alias: string;
}

export interface OrderByClause {
    fields: Field[];
}