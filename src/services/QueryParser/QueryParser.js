import murmur from "murmurhash-js";

const SQL_SUBQUERY_REGEX = /(\s*(WITH|,)?\s+[\w]+\s+AS)?\s*\(\s*SELECT[\s\S]+?\)/gi;
const SQL_QUERY_NAMING_REGEX = /\s*(WITH|,)?\s+[\w]+\s+AS/gi

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
        code = code.replace(SQL_QUERY_NAMING_REGEX, '').trim();
        return {name, code, hash};
    }

    const query = {hash, children: []};
    subqueriesMatches.forEach((subQuery, i) => {
        code = code.replace(subQuery, `{${i}}`);
        const subQueryCode = removeOuterParentheses(subQuery);
        query.children.push(parseQuery(subQueryCode)); 
    });

    const name = getQueryName(code) ?? hash;

    // Remove naming fragment
    code = code.replace(SQL_QUERY_NAMING_REGEX, '').trim();

    // Replace children code for hash
    query.children.forEach((child, i) => {
        code = code.replace(`{${i}}`, `{${child.name}}\n`);
    });

    return {...query, code, name};
}

function removeOuterParentheses(code) {
    let firstOpen = code.indexOf('(');
    let lastClose = code.lastIndexOf(')');
    
    if (firstOpen === -1 || lastClose === -1 || firstOpen > lastClose) {
        return code;
    }

    return code.slice(0, firstOpen) + code.slice(firstOpen + 1, lastClose) + code.slice(lastClose + 1);
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

