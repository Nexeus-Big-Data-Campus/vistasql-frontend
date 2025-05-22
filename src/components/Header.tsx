import { useState } from "react";
import { AccountCircle, Translate as TranslateIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from "@mui/icons-material";
import { Button, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../theme/ThemeContext";

interface HeaderProps {    
    isLoggedIn?: boolean; 
}

export default function Header({ isLoggedIn }: HeaderProps) {
    const { t, i18n } = useTranslation();
    const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
    const { mode, toggleTheme } = useAppTheme();

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

    return (
        <AppBar component="nav" position="relative">
            <Toolbar>
                
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>{t('header.appName')}</Typography>
                {isLoggedIn ? (                    
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
                    <>
                        <Button color="inherit" component={Link} to="/login">{t('header.login')}</Button>
                        <Button color="inherit" component={Link} to="/register">{t('header.signUp')}</Button>
                    </>
                )}
                <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <IconButton
                    size="large"
                    aria-label="change language"
                    aria-controls="menu-language"
                    aria-haspopup="true"
                    onClick={handleLanguageMenuOpen}
                    color="inherit"
                >
                    <TranslateIcon />
                </IconButton>
                <Menu
                    id="menu-language"
                    anchorEl={anchorElLang}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorElLang)}
                    onClose={() => handleLanguageMenuClose()}
                >
                    <MenuItem onClick={() => handleLanguageMenuClose('en')} disabled={i18n.language === 'en'}>EN</MenuItem>
                    <MenuItem onClick={() => handleLanguageMenuClose('es')} disabled={i18n.language === 'es'}>ES</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}