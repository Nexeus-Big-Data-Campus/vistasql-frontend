import { useEffect, useRef } from "react"
import SQLEditor, { EditorHandle } from "./SQLEditor";
import { Query } from "../../interfaces/query";
import { useTreeSitterLoader } from "../../hooks/useTreeSitterLoader";

interface Props {
    onQueryTreeChanged: (queryTree: Query[]) => void;
    code: string,
}

export const DemoEditor = ({onQueryTreeChanged, code}: Props) => {
    const editorRef = useRef<EditorHandle>(null);
    const isTreeSitterLoaded = useTreeSitterLoader();

    useEffect(() => {
        updateCode(code);
    }, [code]);

    const updateCode = (code: string): void => {
        editorRef.current?.updateCode(code);
    }

    if (!isTreeSitterLoaded) {
        return <></>
    }

    updateCode(code);

    return <>
        <SQLEditor ref={editorRef} activeProject={null} queryTree={[]} onQueryTreeChanged={onQueryTreeChanged}  onCodeChange={() => {}} disabled={true}></SQLEditor>
    </>
}