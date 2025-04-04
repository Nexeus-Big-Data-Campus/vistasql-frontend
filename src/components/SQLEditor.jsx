import React, { Children, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import QueryParser from '../services/QueryParser/QueryParser';

export default function SQLEditor({ queryTree, onQueryTreeChanged }) {
    const [code, setCode] = useState('SELECT * FROM users;');

    const SQL_PATTERNS = [
        { regex: /\b(SELECT|FROM|WHERE|ORDER BY|WITH|AS|LIKE)\b/gi, className: "text-indigo-600" },
    ];

    // Add a custom class to all keywords found in the code
    const highlightQueries = (code) => {
        let highlightedCode = highlight(code, languages.sql, 'sql');
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
        queryTree = QueryParser.parseQuery(code);
        onQueryTreeChanged(queryTree);
        console.log(queryTree);
    }

    return (
        <Editor
            className="rounded"
            value={code}
            onValueChange={onCodeChange}
            highlight={highlightQueries}
            padding={10}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                border: '1px solid',
            }}
        />
    );
}