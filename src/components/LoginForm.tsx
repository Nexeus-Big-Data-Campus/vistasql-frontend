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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const apiService = new ApiService();
    const navigate = useNavigate(); 
    const { t } = useTranslation();
    const [loginStatus, setLoginStatus] = useState<"success" | "error" | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(""); 
        setLoginStatus(null);

        try {
            const response = await apiService.login(email, password);
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || t('loginForm.successMessage'));
                setLoginStatus("success");
                onLoginSuccess(); 
            } else {
                setMessage(data.detail || t('loginForm.errorMessage'));
                setLoginStatus("error");
            }
        } catch (error: any) {
            setMessage(t('loginForm.connectionErrorMessage'));
            setLoginStatus("error");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoRegister = () => {
        navigate("/register");
    };

    return (
        <Paper
            elevation={6}
            sx={{
                p: { xs: 2, sm: 4 }, 
                borderRadius: 3, 
                maxWidth: 400, 
                width: "100%", 
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 8px 32px rgba(25, 118, 210, 0.15)", 
            }}
        >
            <Typography variant="h4" component="h1" gutterBottom color="primary">
                {t('loginForm.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t('loginForm.subtitle')}
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
                    label={t('form.emailLabel')}
                    type="email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    fullWidth
                />
                <TextField
                    label={t('form.passwordLabel')}
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : t('loginForm.submitButton')}
                </Button>
            </Box>
            {message && loginStatus && (
                <Alert
                    severity={loginStatus}
                    sx={{ width: "100%", mt: 2, display: "flex", alignItems: "center" }}
                    icon={
                        loginStatus === "success" ? (
                            <CheckCircleIcon fontSize="inherit" />
                        ) : (
                            <ErrorIcon fontSize="inherit" />
                        )
                    }
                >
                    {message}
                </Alert>
            )}
            <Button
                variant="text"
                color="secondary"
                onClick={handleGoRegister}
                sx={{ mt: 2, textTransform: "none" }}
                fullWidth
            >
               {t('loginForm.createAccountButton')}
            </Button>
        </Paper>
    );
}