import React, { useState, useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import { Query } from "../../interfaces/query";
import parseQuery  from "../../services/parsers/queryParser";

interface Props {
    queryTree: Query[];
    onQueryTreeChanged: (queryTree: Query[]) => void;
}

export default function SQLEditor({ queryTree, onQueryTreeChanged }: Props) {
    const [code, setCode] = useState('');

    const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

    const CODE_DEBOUNCE_TIME = 350;

    const SQL_PATTERNS = [
        { regex: /\b(SELECT|FROM|WHERE|ORDER BY|WITH|AS|LIKE|LEFT|RIGHT|OUTTER|INNER|JOIN)\b/gi, className: "text-indigo-600" },
    ];

    const TEXTAREA_ID = 'sql-editor-textarea';

    const QUERY_STORAGE_KEY = 'sqlEditorQuery'; 

    useEffect(() => {
        focusTextArea();
        setCode(localStorage.getItem(QUERY_STORAGE_KEY) ?? '');
    }, []);

    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        setDebounceTimer(setTimeout(() => {
            updateQueryTree(code);
            localStorage.setItem(QUERY_STORAGE_KEY, code);
        }, CODE_DEBOUNCE_TIME))
    }, [code])

    const focusTextArea = () => {
        const textAreaElement = document.getElementById(TEXTAREA_ID);

        if(textAreaElement) {
            textAreaElement.focus();
        }
    };

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

    const updateQueryTree = (code: string) => {
        const parsedQuery = parseQuery(code);
        console.log('Parsed Query ', parsedQuery)
        queryTree = parsedQuery;
        onQueryTreeChanged(queryTree);
    }

    return (
        <div id="editor-container" className="h-full border-primary">
            <Editor
            id="sql-editor"
            textareaId={TEXTAREA_ID}
            className="inset-shadow-sm inset-shadow-gray-400 min-h-full"
            textareaClassName="!focus:border-1 !rounded-0"
            value={code}
            onValueChange={setCode}
            highlight={highlightQueries}
            padding={10}
            style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
            }}
        />
        </div>
    );
}