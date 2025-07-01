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
import { Link, Navigate, useNavigate } from "react-router";
import { UserContext } from "../contexts/UserContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, user } = useContext(UserContext);
  const apiService = new ApiService();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password: string) => password.length >= 8;

  const handleError = (error: string) => {
    setMessage(t(error));
    setIsLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    const response = await apiService.signin("", email, password);

    if(response.error) {
      handleError(response.error);
      return;
    }

    const token = response.data.access_token;
    login(token);
    navigate("/app/editor");
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
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          {t("registerForm.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("registerForm.subtitle")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label={t("form.emailLabel")}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (!emailTouched) setEmailTouched(true);
            }}
            onBlur={() => setEmailTouched(true)}
            error={emailTouched && !!email && !isValidEmail(email)}
            helperText={
              emailTouched && !!email && !isValidEmail(email)
                ? t("form.emailInvalid")
                : ""
            }
            autoComplete="email"
            required
            fullWidth
          />
          <TextField
            label={t("form.passwordLabel")}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (!passwordTouched) setPasswordTouched(true);
            }}
            onBlur={() => setPasswordTouched(true)}
            error={passwordTouched && !!password && !isValidPassword(password)}
            helperText={
              passwordTouched && !!password && !isValidPassword(password)
                ? t("form.passwordInvalid")
                : ""
            }
            autoComplete="new-password"
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading || !isValidEmail(email) || !isValidPassword(password)}
            sx={{ fontWeight: "bold" }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : t("registerForm.submitButton")}
          </Button>
        </Box>

        {message && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}

        <Link to="/login">
          <Button variant="text" fullWidth sx={{ mt: 2, textTransform: "none" }}>
            {t("registerForm.loginButton")}
          </Button>
        </Link>
      </Paper>
    </Box>
  );
}
