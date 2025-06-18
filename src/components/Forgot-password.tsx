import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err) {
      setError("Error al enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 3, sm: 6 },
        }}
      >
        <Container component="main" maxWidth="sm">
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
            <EmailIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              Recuperar contraseña
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Introduce tu email y te enviaremos instrucciones para restablecer
              tu contraseña.
            </Typography>

            {submitted ? (
              <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
                Si el email existe, te hemos enviado instrucciones para
                recuperar tu contraseña.
              </Alert>
            ) : (
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
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
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
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Enviar"
                  )}
                </Button>
                {error && (
                  <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
