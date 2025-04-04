import React, { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import QueryParser from '../../services/QueryParser/QueryParser';
import "prismjs/components/prism-sql";

export default function SQLEditor({ queryTree, onQueryTreeChanged }) {
    const [code, setCode] = useState('SELECT * FROM users;');

    const SQL_PATTERNS = [
        { regex: /\b(SELECT|FROM|WHERE|ORDER BY|WITH|AS|LIKE)\b/gi, className: "text-indigo-600" },
    ];

    useEffect(() => {
        updateQueryTree(code);
    }, []);

    const highlightQueries = (code) => {
        let highlightedCode = highlight(code, languages.sql, 'sql');
        
        // Add a custom class to all keywords found in the code
        SQL_PATTERNS.forEach(({ regex, className }) => {
            highlightedCode = highlightedCode.replace(
                regex,
                (match) => `<span class="${className}">${match}</span>`
            );
        });

        return highlightedCode;
    }

    const onCodeChange = (code) => {
        setCode(code);
        updateQueryTree(code);
    }

    const updateQueryTree = (code) => {
        queryTree = QueryParser.parseQuery(code);
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