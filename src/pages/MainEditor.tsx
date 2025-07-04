import { useState } from "react";
import SQLEditor from "../components/editor/SQLEditor";
import QueryDisplay from "../components/display/QueryDisplay";
import Grid from "@mui/material/Grid";
import { Query } from "../interfaces/query";

const initialQueryTree: Query[] = [];

export default function MainEditor() {
    const [queryTree, setQueryTree] = useState<Query[]>(initialQueryTree);

    return (
        <main className="flex flex-1 overflow-hidden">            
            <Grid container spacing={0} className="themed-editor-area flex-grow">
                <Grid size={{xs: 12, md: 4}} className="h-1/2 md:h-full overflow-auto"> 
                    <SQLEditor queryTree={queryTree} onQueryTreeChanged={setQueryTree}/>
                </Grid>
                <Grid size={{xs: 12, md: 8}} className="p-2">
                    <QueryDisplay queryTree={queryTree}/>
                </Grid>
            </Grid>
        </main>
    );
}