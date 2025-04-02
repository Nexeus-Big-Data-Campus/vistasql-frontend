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
        // Remove naming fragment
        const name = getQueryName(code) ?? hash;
        code = cleanCode(code);
        return {name, code, hash};
    }

    const query = {hash, children: []};
    subqueriesMatches.forEach((subQuery, i) => {
        code = code.replace(subQuery, `{${i}}`);
        const subQueryCode = removeOuterParentheses(subQuery);
        query.children.push(parseQuery(subQueryCode)); 
    });

    const name = getQueryName(code) ?? hash;
    // Replace children code for hash
    query.children.forEach((child, i) => {
        code = code.replace(`{${i}}`, ` {${child.name}}`);
    });
    code = cleanCode(code);

    return {...query, code, name};
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

export default {parseQuery};

