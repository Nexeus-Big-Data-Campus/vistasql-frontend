import { AccountCircle } from "@mui/icons-material"; 
import { Button, Typography, IconButton } from "@mui/material"; 
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";


interface HeaderProps {
    isLoggedIn: boolean;    
}

export default function Header({ isLoggedIn }: HeaderProps) {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
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
                        <Button color="inherit" component={Link} to="/signin">{t('header.signUp')}</Button>
                    </>
                )}                
                <Button color="inherit" onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>EN</Button>
                <Button color="inherit" onClick={() => changeLanguage('es')} disabled={i18n.language === 'es'}>ES</Button>
            </Toolbar>
        </AppBar>
    );
}