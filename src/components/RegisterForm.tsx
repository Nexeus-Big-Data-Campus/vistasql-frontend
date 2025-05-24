import { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Paper,
} from "@mui/material";
import { ApiService } from "../services/ApiService";
import { useTranslation } from "react-i18next";

interface Props {
  onRegisterSuccess: () => void;
  navigateTo: (path: string) => void;
}

export default function RegisterForm({ onRegisterSuccess, navigateTo }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const apiService = new ApiService();
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        try {            
            const response = await apiService.signin(name, email, password);
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message || t('registerForm.successMessage'));                
            } else {
                setMessage(data.detail || t('registerForm.errorMessage'));
            }
        } catch (error: any) { 
            setMessage(error?.detail || t('registerForm.connectionErrorMessage'));
            console.error("Register error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoBack = () => {
        navigateTo("/login"); 
    };

    return (
        <Paper
            elevation={6}
            sx={{
                p: { xs: 2, sm: 4 }, 
                borderRadius: 3, 
                maxWidth: 400, 
                width: "100%", 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: "0 8px 32px rgba(25, 118, 210, 0.15)", 
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom color="primary">
                {t('registerForm.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('registerForm.subtitle')}
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: "100%", 
                    display: "flex",
                    flexDirection: "column",
                    gap: 2, 
                }}
            >
                <TextField
                    label={t('registerForm.nameLabel')}
                    type="text"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label={t('form.emailLabel')}
                    type="email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label={t('form.passwordLabel')}
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={isLoading}
                    sx={{ mt: 1, fontWeight: "bold", letterSpacing: 1 }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : t('registerForm.submitButton')}
                </Button>
            </Box>
            {message && (
                <Alert
                    severity={message.toLowerCase().includes(t('registerForm.successKeyword', 'successful').toLowerCase()) ? "success" : "error"}
                    sx={{ width: "100%", mt: 2 }}
                >
                    {message}
                </Alert>
            )}
            <Button
                variant="text"
                color="secondary"
                onClick={handleGoBack}
                sx={{ mt: 2, textTransform: "none" }}
                fullWidth
            >
                {t('registerForm.alreadyHaveAccountButton')}
            </Button>
        </Paper>
    );
}