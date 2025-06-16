import { ObjectReference } from "./query";

export interface Join {
    id: string;
    source: ObjectReference;
    alias: string;
    type: string;
    predicate: string;
}