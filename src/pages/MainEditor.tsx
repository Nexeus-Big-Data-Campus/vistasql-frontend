import { useState } from "react";
import SQLEditor from "../components/editor/SQLEditor";
import QueryDisplay from "../components/display/QueryDisplay";
import Header from "../components/Header";
import Grid from "@mui/material/Grid";
import { Query } from "../interfaces/query";

const initialQueryTree: Query = {
    name: 'SELECT',
    hash: '',
    children: [],
    fields: [],
    code: 'SELECT'
}

export default function MainEditor() {
    const [queryTree, setQueryTree] = useState<Query>(initialQueryTree);

    return (
        <main className="flex flex-col h-full">
            <Header/>
            <Grid container spacing={0} className="bg-gray-100 h-full">
                <Grid size={4} className="h-full">
                    <SQLEditor queryTree={queryTree} onQueryTreeChanged={setQueryTree}/>
                </Grid>
                <Grid size={8} className="p-2">
                    <QueryDisplay queryTree={queryTree}/>
                </Grid>
            </Grid>
        </main>
    );
}