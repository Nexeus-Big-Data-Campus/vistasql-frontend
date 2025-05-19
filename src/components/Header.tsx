import { Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();          // Limpia datos de usuario y token
        navigate("/login"); // Redirige al login
    };

    return (
        <AppBar component="nav" position="relative">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>VistaSQL</Typography>
                {user ? (
                    <>
                        <Typography variant="subtitle1" sx={{ marginRight: 2 }}>
                            Hola, {user.username}
                        </Typography>
                        <Button color="inherit" onClick={handleLogout}>
                            Cerrar sesión
                        </Button>
                    </>
                ) : (
                    <Typography variant="subtitle1">No logueado</Typography>
                )}
            </Toolbar>
        </AppBar>
    );
}
