import murmur from "murmurhash-js";
import { Query } from "../../interfaces/query";

const SQL_SUBQUERY_REGEX = /(\s*[\w]+\s+AS)?\s*\(\s*SELECT[\s\S]+?\)/gi;
const SQL_QUERY_NAMING_REGEX = /\s*[\w]+\s+AS/gi
const SQL_QUERY_FIELDS_REGEX = /\s*SELECT\s+([\s\S]+?)\s+FROM/gi;

// Return a tree with structure:
// {name: "query", code: "SELECT...", hash: 1234, children: []}
function parseQuery(code: string): Query | null {
    if(!code) {
        return null;
    }

    const hash = murmur.murmur3(code);
    const subqueriesMatches = code.match(SQL_SUBQUERY_REGEX);

    if (!subqueriesMatches) {
        return buildQuery(code, hash, []);
    }

    const children: Query[] = [];
    subqueriesMatches.forEach((subQuery, i) => {
        code = code.replace(subQuery, `{${i}}`);
        const child = parseQuery(subQuery.replace('(', ''));
        if (child) {
            children.push(child); 
        }
    });

    // Replace children code for hash
    children.forEach((child, i) => {
        code = code.replace(`{${i}}`, ` {${child.name}}`);
    });

    return buildQuery(code, hash, children);
}

function buildQuery(code: string, hash: string, children: Query[]): Query {
    return {
        hash,
        code: cleanCode(code),
        name: getQueryName(code) ?? 'SELECT',
        fields: getFields(code),
        children
    };
}

function cleanCode(code: string) {
    return code
        .replace(SQL_QUERY_NAMING_REGEX, '')
        .replace(')', '')
        .trim();
}

// Extract name from named subqueries
function getQueryName(code: string) {
    const namingPatternMatches = code
        .replace(SQL_QUERY_FIELDS_REGEX, '')
        .match(SQL_QUERY_NAMING_REGEX);
    if (!namingPatternMatches) {
        return null;
    }

    return namingPatternMatches[0]
        .replace(/\s*(WITH|,)\n*\s*/gi, '')
        .replace(/\s+AS/gi, '')
        .trim();
}

// Extract fields from select
function getFields(code: string) {
    const fieldSection = code.match(SQL_QUERY_FIELDS_REGEX);
    if (!fieldSection) {
        return [];
    }

    const fieldsContent = fieldSection[0].replace('SELECT', '').replace('FROM', '');
    return splitFields(fieldsContent).map(getFieldName);
}

function getFieldName(field: string) {
    const fieldAliasSplit = field.split(/\s+AS\s+/i);
    if (fieldAliasSplit.length > 1) {
        const fieldAlias = fieldAliasSplit[fieldAliasSplit.length - 1].trim();
        return fieldAlias
            .replaceAll(/['"\[\]]/g, '');
    }

    return field.trim();
}


// Split fields by comma, respecting parentheses and quotes
function splitFields(selectClause: string): string[] {
    const fieldsRaw: string[] = [];
    let currentField = '';
    let parenDepth = 0;
    let quoteChar: "'" | '"' | null = null;

    for (let i = 0; i < selectClause.length; i++) {
        const char = selectClause[i];

        if (quoteChar) { // If inside quotes
            if (char === quoteChar) {
                quoteChar = null; // End quote
            }
            currentField += char;
            continue;
        }

        // Handle starting quotes
        if (char === "'" || char === '"') {
            quoteChar = char;
            currentField += char;
            continue;
        }

        // Handle parentheses
        if (char === '(') {
            parenDepth++;
        } else if (char === ')') {
            parenDepth = Math.max(0, parenDepth - 1); // Prevent negative depth
        }

        // Split only if comma is encountered outside parentheses and quotes
        if (char === ',' && parenDepth === 0) {
            fieldsRaw.push(currentField.trim());
            currentField = ''; // Reset for the next field
        } else {
            currentField += char;
        }
    }

    // Add the last field after the loop finishes
    if (currentField.trim()) {
         fieldsRaw.push(currentField.trim());
    }

    return fieldsRaw;
}

export default {parseQuery};

