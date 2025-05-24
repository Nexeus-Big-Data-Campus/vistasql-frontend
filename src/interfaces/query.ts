import { LexicalError } from "./error";
import { Field } from "./field";
import { Join } from "./join";
import { Reference } from "./reference";

export interface Query {
    id: string;
    name: string;
    alias?: string;
    type: string;
    code: string;
    fields: Field[];
    children: Query[];
    joins: Join[];
    references: Reference[];
    errors: LexicalError[];
}