import { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-sql";
import { Query } from "../../interfaces/query";
import parseQuery  from "../../services/parsers/queryParser";
import { Alert } from "@mui/material";
import { Field } from "../../interfaces/field";

interface Props {
    queryTree: Query[];
    onQueryTreeChanged: (queryTree: Query[]) => void;
}

function EmptyQueryAlert({queryLength} : {queryLength: number}) {
    if (queryLength > 0) return;

    return (
        <Alert severity='info' sx={{position: 'absolute', bottom: '15px', width: '95%', right: '2.5%', margin: '0 auto'}}>
            Type your Query in the editor to update the visualization.
        </Alert>
    );
}

export default function SQLEditor({ queryTree, onQueryTreeChanged }: Props) {
    const [code, setCode] = useState('');

    const [highlightCode, setHighlightCode] = useState('');

    const [debounceTimer, setDebounceTimer] = useState<any | null>(null);

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

        updateHighlightcode(code, []);
        setDebounceTimer(setTimeout(() => {
            updateQueryTree(code);
            localStorage.setItem(QUERY_STORAGE_KEY, code);
        }, CODE_DEBOUNCE_TIME))
    }, [code]);


    const focusTextArea = () => {
        const textAreaElement = document.getElementById(TEXTAREA_ID);

        if(textAreaElement) {
            textAreaElement.focus();
        }
    };


    const getQueryTreeFields = (queryTree: Query[]): Field[] => {
        const fields: Field[] = [];
        const queries = [...queryTree];

        while (queries.length > 0) {
            const query = queries.pop();

            queries.push(...query?.cte ?? []);
            queries.push(...query?.unionClauses ?? []);

            fields.push(...query?.selectClause.fields ?? []);
        }

        return fields;
    }

    const wrapHighlightCode = (code: string, queryTree: Query[]): string => {
        const fields = getQueryTreeFields(queryTree);
        const lines: string[] = code.split(/\r\n|\r|\n/);
        const codeMatrix = lines.map(l => l.split(""));

        fields.forEach(field => {
            const startRow = field.startPosition.row;
            const startColumn = field.startPosition.column;
            const endRow = field.endPosition.row;
            const endColumn = field.endPosition.column;

            const startChar = codeMatrix[startRow][startColumn];
            const endChar = codeMatrix[endRow][endColumn] ?? '';

            const relatedFields = [...field.references.map(r => r.fieldId), ...field.referencedBy.map(f => f.id)];
            const realatedIds = relatedFields.join('') || '0';

            codeMatrix[startRow][startColumn] = `??field id:${field.id} relatedIds:${realatedIds}??${startChar}`;
            codeMatrix[endRow][endColumn] = `${endChar}field??`;
        });

        return codeMatrix.map(l => l.join("")).join('\n');
    }

    const addLineCountToHighlight = (highlightedCode: string): string => {
        return highlightedCode = highlightedCode
                .split("\n")
                .map((line: string, i: number) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
                .join("\n");
    }

    const updateHighlightcode = (code: string, queryTree: Query[]) => {
        if (queryTree.length === 0) {
            const highlightedCode = highlight(code, languages.sql, 'sql');
            setHighlightCode(addLineCountToHighlight(highlightedCode));
        }

        const wrappedCode = wrapHighlightCode(code, queryTree);
        let highlightedCode = highlight(wrappedCode, languages.sql, 'sql');

        highlightedCode = highlightedCode
            .replace( /\?\?field id:<span class="token number">(\d+)<\/span> relatedIds:<span class="token number">(\d+)<\/span>\?\?/g, `<span class="editor-select-field" data-fieldid="$1" data-relatedids="$2">`)
            .replace(/field\?\?/g, '</span>');

        highlightedCode = addLineCountToHighlight(highlightedCode);
        setHighlightCode(highlightedCode);
    }

    const updateQueryTree = (code: string) => {
        const parsedQuery = parseQuery(code);
        console.log('Parsed Query ', parsedQuery)
        queryTree = parsedQuery;
        updateHighlightcode(code, queryTree);
        onQueryTreeChanged(queryTree);
    }

    return (
        <div id="editor-container" className="w-full h-full max-h-full flex overflow-hidden">
            <div className="flex-1 overflow-auto relative">
                <Editor
                    id="sql-editor"
                    textareaId={TEXTAREA_ID}
                    className="inset-shadow-sm min-h-full bg-white "
                    textareaClassName="!focus:border-1 !rounded-0 min-h-full"
                    value={code}
                    onValueChange={setCode}
                    highlight={(_) => highlightCode}
                    padding={10}
                    style={{
                        fontFamily: '"Roboto Mono Variable", "Fira Mono", monospace',
                        fontSize: 14,
                    }}
                />

                <EmptyQueryAlert queryLength={code.length}></EmptyQueryAlert>
            </div>
        </div>
    );
}