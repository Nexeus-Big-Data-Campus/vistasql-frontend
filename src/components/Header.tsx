import { AccountCircle } from "@mui/icons-material"; 
import { Button, Typography, IconButton } from "@mui/material"; 
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Link } from "react-router-dom";

interface HeaderProps {
    isLoggedIn: boolean;    
}

export default function Header({ isLoggedIn }: HeaderProps) {
    return (
        <AppBar component="nav" position="relative">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>VistaSQL</Typography>
                {isLoggedIn ? (
                    // Mostrar icono de perfil si el usuario está logueado
                    <IconButton
                        color="inherit"
                        component={Link}
                        to="/profile"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                    >
                        <AccountCircle />
                    </IconButton>
                ) : (
                    // Mostrar botones de login/registro si no está logueado
                    <>
                        <Button color="inherit" component={Link} to="/login">Iniciar sesión</Button>
                        <Button color="inherit" component={Link} to="/signin">Darse de Alta</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}