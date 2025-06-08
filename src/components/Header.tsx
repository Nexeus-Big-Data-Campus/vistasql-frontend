import { useContext, useState } from "react";
import { AccountCircle, Translate as TranslateIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from "@mui/icons-material";
import { Button, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme/ThemeContext";
import { useNavigate } from "react-router"; 
import { UserContext } from "../contexts/UserContext";

export default function Header() {
    const { t, i18n } = useTranslation();
    const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const { mode, toggleTheme } = useAppTheme();
    const navigate = useNavigate(); 
    const { user, logout } = useContext(UserContext);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElLang(event.currentTarget);
    };

    const handleLanguageMenuClose = (lng?: string) => {
        setAnchorElLang(null);
        if (lng) {
            changeLanguage(lng);
        }
    };

    // NUEVO: handlers para el menú de usuario
    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorElUser(null);
    };

    const handleProfile = () => {
        handleUserMenuClose();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleUserMenuClose();
        if (logout) logout();
        navigate('/login');
    };

    return (
        <AppBar component="nav" position="relative">
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ flexGrow: 1, cursor: 'pointer' }} 
                    onClick={() => navigate('/')} 
                >
                    {t('header.appName')}
                </Typography>                
                <IconButton
                    color="inherit"
                    onClick={handleLanguageMenuOpen}
                    aria-label="change language"
                >
                    <TranslateIcon />
                </IconButton>
                <Menu
                    id="language-menu"
                    anchorEl={anchorElLang}
                    open={Boolean(anchorElLang)}
                    onClose={() => handleLanguageMenuClose()}
                >
                    <MenuItem onClick={() => handleLanguageMenuClose('es')}>Español</MenuItem>
                    <MenuItem onClick={() => handleLanguageMenuClose('en')}>English</MenuItem>
                </Menu>
                <IconButton 
                    color="inherit" 
                    onClick={toggleTheme} 
                    aria-label="toggle theme"
                >
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
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
                            <MenuItem onClick={handleProfile}>{t('header.myProfile') ?? "Mi perfil"}</MenuItem>
                            <MenuItem onClick={handleLogout}>{t('header.logout') ?? "Cerrar sesión"}</MenuItem>
                        </Menu>
                    </>
                ) : (                    
                    <>
                        <Button color="inherit" onClick={() => navigate('/login')}>{t('header.login')}</Button>
                        <Button color="inherit" onClick={() => navigate('/signin')}>{t('header.signUp')}</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}