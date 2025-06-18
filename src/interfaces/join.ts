import { Query } from "web-tree-sitter";
import { ObjectReference } from "./query";

export interface Join {
    id: string;
    source: ObjectReference;
    alias: string;
    type: string;
    predicate: string;
}