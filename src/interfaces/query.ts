import { Join } from "./join";
import { Reference } from "./reference";

export interface Query {
    name: string;
    type: string;
    hash: string;
    code: string;
    fields: string[];
    children: Query[];
    joins: Join[];
    references: Reference[];
}