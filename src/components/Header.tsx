import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

export default function Header() {
    return (
        <AppBar component="nav" position="relative">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>VistaSQL</Typography>
            </Toolbar>
        </AppBar>
    );
}