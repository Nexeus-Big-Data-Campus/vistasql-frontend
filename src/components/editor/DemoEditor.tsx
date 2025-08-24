import { useEffect, useRef, useState } from "react"
import SQLEditor, { EditorHandle } from "./SQLEditor";
import { Query } from "../../interfaces/query";

interface Props {
    onQueryTreeChanged: (queryTree: Query[]) => void;
    code: string,
}

export const DemoEditor = ({onQueryTreeChanged, code}: Props) => {
    const editorRef = useRef<EditorHandle>(null);

    useEffect(() => {
        updateCode(code);
    }, [code]);

    const updateCode = (code: string): void => {
        editorRef.current?.updateCode(code);
    }

    return <>
        <SQLEditor ref={editorRef} activeProject={null} queryTree={[]} onQueryTreeChanged={onQueryTreeChanged} onCodeChange={() => {}} disabled={true}></SQLEditor>
    </>
}