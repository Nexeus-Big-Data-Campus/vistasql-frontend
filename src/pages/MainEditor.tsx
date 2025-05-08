import { useState } from "react";
import SQLEditor from "../components/editor/SQLEditor";
import QueryDisplay from "../components/display/QueryDisplay";
import Header from "../components/Header";
import Grid from "@mui/material/Grid";
import { Query } from "../interfaces/query";
import LoginForm from "../components/LoginForm";

const initialQueryTree: Query[] = [];

export default function MainEditor() {
    const [queryTree, setQueryTree] = useState<Query[]>(initialQueryTree);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    if (!isLoggedIn) {
        return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    return (
        <main className="flex flex-col h-screen">
            <Header/>
            <Grid container spacing={0} className="bg-gray-100 flex-grow overflow-auto">
                <Grid size={{xs: 12, md: 4}} className="h-1/2 md:h-full !overflow-auto">
                    <SQLEditor queryTree={queryTree} onQueryTreeChanged={setQueryTree}/>
                </Grid>
                <Grid size={{xs: 12, md: 8}} className="p-2">
                    <QueryDisplay queryTree={queryTree}/>
                </Grid>
            </Grid>
        </main>
    );
}