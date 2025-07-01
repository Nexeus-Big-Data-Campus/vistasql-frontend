import { useContext, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ApiService } from "../services/ApiService";
import ErrorIcon from "@mui/icons-material/Error";
import { Link, Navigate, useNavigate } from "react-router";
import { UserContext } from "../contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useContext(UserContext);
  const { t } = useTranslation();
  const apiService = new ApiService();
  const navigate = useNavigate();

  const handleError = (error: string) => {
    setMessage(t(error));
    setIsLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const response = await apiService.login(email, password);

    if (response.error) {
      handleError(response.error);
      return;
    }

    const token = response.data.access_token;

    if (!token) {
      setMessage(t("Credenciales inválidas"));
      setIsLoading(false);
      return;
    }

    login(token);
    navigate('/app/editor');
  };

  if (user) {
    return <Navigate to="/app/editor" />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 12,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          {t("loginForm.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("loginForm.subtitle")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label={t("form.emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            fullWidth
          />
          <TextField
            label={t("form.passwordLabel")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            sx={{ fontWeight: "bold" }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : t("loginForm.submitButton")}
          </Button>
        </Box>

        {message && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            icon={<ErrorIcon fontSize="inherit" />}
          >
            {message}
          </Alert>
        )}

        <Link to="/signin">
          <Button variant="text" fullWidth sx={{ mt: 2, textTransform: "none" }}>
            {t("loginForm.createAccountButton")}
          </Button>
        </Link>
      </Paper>
    </Box>
  );
}
