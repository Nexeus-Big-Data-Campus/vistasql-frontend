import React, { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/plugins/line-numbers/prism-line-numbers.css"; 

const SQL_PATTERNS = [
    { regex: /\b(SELECT|FROM|WHERE|ORDER BY)\b/gi, className: "text-indigo-600" },
];

export default function SQLEditor() {
    const [code, setCode] = useState('SELECT * FROM users;');

    // Add a custom class to all keywords found in the code
    // TODO: Find and higlight all subqueries
    const highlightQueries = (code) => {
        let highlightedCode = highlight(code, languages.sql, "sql");

        SQL_PATTERNS.forEach(({ regex, className }) => {
            highlightedCode = highlightedCode.replace(
                regex,
                (match) => `<span class="${className}">${match}</span>`
            );
        });

        return highlightedCode;
    }

    return (
        <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={highlightQueries}
            padding={10}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
              }}
        />
    );
}