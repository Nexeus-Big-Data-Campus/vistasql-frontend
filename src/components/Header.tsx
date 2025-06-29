import { useContext, useState } from "react";
import { AccountCircle, Translate as TranslateIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from "@mui/icons-material";
import { Button, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router"; 
import { UserContext } from "../contexts/UserContext";

export default function Header() {
    const { t, i18n } = useTranslation();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const navigate = useNavigate(); 
    const { user, logout } = useContext(UserContext);

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorElUser(null);
    };

    /* const handleProfile = () => {
        handleUserMenuClose();
        navigate('/app/profile');
    }; */

    const handleLogout = () => {
        handleUserMenuClose();
        if (logout) logout();
        navigate('/login');
    };


    return (
        <AppBar component="nav" sx={{minHeight: 40, position: 'relative'}}>
            <Toolbar sx={{justifyContent: 'space-between', background: 'white'}} className="text-primary">
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ cursor: 'pointer', fontFamily: 'Roboto Mono Variable', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.8px' }} 
                    onClick={() => navigate('/')} 
                >
                    {t('header.appName')}
                </Typography>                

                <span>
                    {user ? (                    
                        <>
                            <IconButton
                                color="inherit"
                                onClick={handleUserMenuOpen}
                                aria-label="account of current user"
                                aria-controls="menu-user"
                                aria-haspopup="true"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-user"
                                anchorEl={anchorElUser}
                                open={Boolean(anchorElUser)}
                                onClose={handleUserMenuClose}
                            >
                                {/* <MenuItem onClick={handleProfile}>{t('header.myProfile') ?? "Mi perfil"}</MenuItem> */}
                                <MenuItem onClick={handleLogout}>{t('header.logout') ?? "Cerrar sesión"}</MenuItem>
                            </Menu>
                        </>
                    ) : (                    
                        <span className="flex gap-2">
                            <Button variant="outlined" onClick={() => navigate('/signin')}>{t('header.signUp')}</Button>
                            <Button variant="contained" onClick={() => navigate('/login')}>{t('header.login')}</Button>
                        </span>
                    )}
                </span>
            </Toolbar>
        </AppBar>
    );
}