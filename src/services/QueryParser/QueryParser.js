import murmur from "murmurhash-js";

const SQL_SUBQUERY_REGEX = /(\s*[\w]+\s+AS)?\s*\(\s*SELECT[\s\S]+?\)/gi;
const SQL_QUERY_NAMING_REGEX = /\s*[\w]+\s+AS/gi

// Return a tree with structure:
// {name: "query", code: "SELECT...", hash: 1234, children: []}
function parseQuery(code) {
    if(!code) {
        return [];
    }

    const hash = murmur.murmur3(code);
    const subqueriesMatches = code.match(SQL_SUBQUERY_REGEX);

    if (!subqueriesMatches) {
        return buildQueryNode({children: []}, code, hash);
    }

    const query = {hash, children: []};
    subqueriesMatches.forEach((subQuery, i) => {
        code = code.replace(subQuery, `{${i}}`);
        query.children.push(parseQuery(subQuery.replace('(', ''))); 
    });

    // Replace children code for hash
    query.children.forEach((child, i) => {
        code = code.replace(`{${i}}`, ` {${child.name}}`);
    });

    return buildQueryNode(query, code, hash);
}

function buildQueryNode(query, code, hash) {
    return {
        ...query,
        hash,
        code: cleanCode(code),
        name: getQueryName(code) ?? hash,
        fields: getFields(code),
    };
}

function cleanCode(code) {
    return code
        .replace(SQL_QUERY_NAMING_REGEX, '')
        .replace(')', '')
        .trim();
}

// Extract name from named subqueries
function getQueryName(code) {
    const namingPatternMatches = code.match(SQL_QUERY_NAMING_REGEX);
    if (!namingPatternMatches) {
        return null;
    }

    return namingPatternMatches[0]
        .replace(/\s*(WITH|,)\n*\s*/gi, '')
        .replace(/\s+AS/gi, '')
        .trim();
}

// Extract fields from select
function getFields(code) {
    const fieldSection = code.match(/SELECT\s+(.*?)\s+FROM/gi);
    if (!fieldSection) {
        return [];
    }

    const fields = fieldSection[0].replace(/SELECT\s+/i, '').replace('FROM', '');
    
    return fields
        .split(',')
        .map(field => field.replace(/\s*\w+\s+AS\s+/gi, ''))
        .map(field => field.trim())
        .filter(field => field.length > 0);
}

export default {parseQuery};

