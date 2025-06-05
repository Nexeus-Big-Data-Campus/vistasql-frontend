import { useState } from "react";
import SQLEditor from "../components/editor/SQLEditor";
import QueryDisplay from "../components/display/QueryDisplay";
import Grid from "@mui/material/Grid";
import { Query } from "../interfaces/query";
import { Button } from "@mui/material";
import { useNavigation } from "../context/NavigationContext";

const initialQueryTree: Query[] = [];

export default function MainEditor() {
    const { navigateTo } = useNavigation();
    const [queryTree, setQueryTree] = useState<Query[]>(initialQueryTree);

    return (
        <div data-testid="editor-page">
            <h1>Editor Page</h1>
            <Button onClick={() => navigateTo('/')}>Volver al inicio</Button>
        <main className="flex flex-col h-screen">            
            <Grid container spacing={0} className="themed-editor-area flex-grow overflow-auto">
                <Grid size={{xs: 12, md: 4}} className="h-1/2 md:h-full !overflow-auto"> 
                    <SQLEditor queryTree={queryTree} onQueryTreeChanged={setQueryTree}/>
                </Grid>
                <Grid size={{xs: 12, md: 8}} className="p-2">
                    <QueryDisplay queryTree={queryTree}/>
                </Grid>
            </Grid>
        </main>
        </div>
    );
}