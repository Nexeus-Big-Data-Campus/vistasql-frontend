import { useState, useEffect } from "react";
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

        return highlightedCode
                .split("\n")
                .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
                .join("\n");
    }

    const updateQueryTree = (code: string) => {
        const parsedQuery = parseQuery(code);
        console.log('Parsed Query ', parsedQuery)
        queryTree = parsedQuery;
        onQueryTreeChanged(queryTree);
    }

    return (
        <div id="editor-container" className="w-full h-full max-h-full flex overflow-hidden">
            <div className="flex-1 overflow-auto">
                <Editor
                    id="sql-editor"
                    textareaId={TEXTAREA_ID}
                    className="inset-shadow-sm min-h-full bg-white "
                    textareaClassName="!focus:border-1 !rounded-0 min-h-full"
                    value={code}
                    onValueChange={setCode}
                    highlight={highlightQueries}
                    padding={10}
                    style={{
                        fontFamily: '"Roboto Mono Variable", "Fira Mono", monospace',
                        fontSize: 14,
                    }}
                />
            </div>
        </div>
    );
}