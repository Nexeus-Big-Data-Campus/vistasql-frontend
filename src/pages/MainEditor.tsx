import { useState } from "react";
import SQLEditor from "../components/editor/SQLEditor";
import QueryDisplay from "../components/display/QueryDisplay";
import Header from "../components/Header";
import Grid from "@mui/material/Grid";
import { Query } from "../interfaces/query";

const initialQueryTree: Query[] = [{
    name: 'SELECT',
    hash: '',
    children: [],
    fields: [],
    code: 'SELECT',
    joins: [],
    references: [],
    type: ""
}]

export default function MainEditor() {
    const [queryTree, setQueryTree] = useState<Query[]>(initialQueryTree);

    return (
        <main className="flex flex-col h-full">
            <Header/>
            <Grid container spacing={0} className="bg-gray-100 h-full">
                <Grid size={{xs: 12, md: 4}} className="h-1/2 md:h-full">
                    <SQLEditor queryTree={queryTree} onQueryTreeChanged={setQueryTree}/>
                </Grid>
                <Grid size={{xs: 12, md: 8}} className="p-2 h-full">
                    <QueryDisplay className="w-full" queryTree={queryTree}/>
                </Grid>
            </Grid>
        </main>
    );
}