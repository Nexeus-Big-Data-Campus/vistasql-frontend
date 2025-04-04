import React, { useState } from "react";
import SQLEditor from "../components/SQLEditor";
import QueryDisplay from "../components/QueryDisplay";

export default function MainEditor() {
    const [queryTree, setQueryTree] = useState({});

    return (
        <div className="p-2">
            <SQLEditor queryTree={queryTree} onQueryTreeChanged={setQueryTree}/>
            <QueryDisplay queryTree={queryTree}/>
        </div>
    );
}