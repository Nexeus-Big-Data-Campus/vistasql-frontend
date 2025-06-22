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
    whereClause?: WhereClause;
    orderByClause?: OrderByClause;
    unionClause?: UnionClause;
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
    references: ObjectReference[];
}

export interface ObjectReference {
    id: string;
    database?: string;
    schema?: string;
    name: string;
    alias: string;
    type: ObjectReferenceType;
    ref?: Query;
}

export interface OrderByClause {
    fields: Field[];
}

export interface UnionClause {
    type: 'UNION' | 'UNION ALL';
    query: Query;
}

export enum ObjectReferenceType {
    TABLE,
    SUBQUERY,
}