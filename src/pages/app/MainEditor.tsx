import { useState, useContext, useEffect } from "react";
import { Query } from "../../interfaces/query";
import { UserContext } from "../../contexts/UserContext";
import { ApiService } from "../../services/ApiService";
import { Box, Grid } from "@mui/material";
import SQLEditor from "../../components/editor/SQLEditor";
import QueryDisplay from "../../components/display/QueryDisplay";
import Toolbar from "../../components/display/Toolbar";
import { useTreeSitterLoader } from "../../hooks/useTreeSitterLoader";

const initialQueryTree: Query[] = [];

export default function MainEditor() {
    const [queryTree, setQueryTree] = useState<Query[]>(initialQueryTree);
    const {activeProject, jwtToken} = useContext(UserContext);
    const apiService = ApiService.getInstance();
    const isTreeSitterLoaded = useTreeSitterLoader();

    const onCodeChange = (code: string): void => {
        if (!jwtToken || !activeProject) {
            return;
        }

        apiService.updateProject({id: activeProject?.id, code: code}, jwtToken);
    }

    if (!isTreeSitterLoaded) {
        return <></>
    }

    return (
        <main className="flex flex-1 overflow-hidden">            
            <Grid container spacing={0} className="themed-editor-area flex-grow">
                <Grid size={{xs: 12, md: 4}} sx={{boxShadow: '0 2px 4px #eee'}} className="h-1/2 md:h-full overflow-auto"> 
                    {activeProject &&
                        <SQLEditor queryTree={queryTree} onQueryTreeChanged={setQueryTree} onCodeChange={onCodeChange} activeProject={activeProject}/>
                    }
                </Grid>
                <Grid size={{xs: 12, md: 8}} sx={{height: '100%'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                        <Box sx={{flex: 1, padding: '1rem'}}>
                            <QueryDisplay queryTree={queryTree} options={{hideControls: false, hideMinimap: false, minZoom: 0.1}}/>
                        </Box>
                        <Toolbar></Toolbar>
                    </Box>
                </Grid>
            </Grid>
        </main>
    );
}