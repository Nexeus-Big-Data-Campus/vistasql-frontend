import { useContext, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { TextField, Button, Typography, Alert, CircularProgress, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ApiService } from "../services/ApiService";
import { Link, useNavigate } from 'react-router';
import { UserContext } from "../contexts/UserContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { t } = useTranslation();
  const navigate = useNavigate(); 
  const { login } = useContext(UserContext);
  const apiService = new ApiService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const data = await apiService.signin("", email, password);
    const token = data.access_token;

    if (!token) {
      setMessage(t("Credenciales inválidas"));
    }

    login(token);
    navigate('/app/editor');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexBasis: 1 }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 3, sm: 6 } 
        }}
      >
        <Container component="main" maxWidth="sm">
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, sm: 4 }, 
              borderRadius: 3,
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
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
                autoComplete="new-password"
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
                severity="error"
                sx={{ width: "100%", mt: 2 }}
              >
                {message}
              </Alert>
            )}
            <Link to={'/app/login'}>
              <Button variant="text" color="secondary" sx={{ mt: 2, textTransform: "none" }} fullWidth>
                {t('registerForm.loginButton')}
              </Button>
            </Link>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
