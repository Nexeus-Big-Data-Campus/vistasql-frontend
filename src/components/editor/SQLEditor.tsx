import React, { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import QueryParser from '../../services/QueryParser/QueryParser';
import "prismjs/components/prism-sql";
import { QueryNode } from "../../interfaces/query";

interface Props {
    queryTree: QueryNode;
    onQueryTreeChanged: (queryTree: QueryNode) => void;
}

export default function SQLEditor({ queryTree, onQueryTreeChanged }: Props) {
    const [code, setCode] = useState('SELECT * FROM users;');

    const SQL_PATTERNS = [
        { regex: /\b(SELECT|FROM|WHERE|ORDER BY|WITH|AS|LIKE)\b/gi, className: "text-indigo-600" },
    ];

    useEffect(() => {
        updateQueryTree(code);
    }, []);

    const highlightQueries = (code: string) => {
        let highlightedCode = highlight(code, languages.sql, 'sql');
        
        // Add a custom class to all keywords found in the code
        SQL_PATTERNS.forEach(({ regex, className }) => {
            highlightedCode = highlightedCode.replace(
                regex,
                (match: string) => `<span class="${className}">${match}</span>`
            );
        });

        return highlightedCode;
    }

    const onCodeChange = (code: string) => {
        setCode(code);
        updateQueryTree(code);
    }

    const updateQueryTree = (code: string) => {
        const parsedQuery = QueryParser.parseQuery(code);

        if (!parsedQuery) {
            console.error("Error parsing query");
            return;
        }

        queryTree = parsedQuery;
        onQueryTreeChanged(queryTree);
    }

    return (
        <Editor
            className="h-full border-1 border-gray-400"
            value={code}
            onValueChange={onCodeChange}
            highlight={highlightQueries}
            padding={10}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
            }}
        />
    );
}