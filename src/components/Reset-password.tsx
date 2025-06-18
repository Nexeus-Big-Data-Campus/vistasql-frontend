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
import LockResetIcon from "@mui/icons-material/LockReset";
import React, { useState } from "react";
import { useSearchParams } from "react-router";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setIsLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: password }),
    });
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.detail || "Error al cambiar la contraseña");
    }
    setIsLoading(false);
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
            <LockResetIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              color="primary"
              sx={{ fontWeight: "bold" }}
            >
              Restablecer contraseña
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Introduce tu nueva contraseña y confírmala.
            </Typography>

            {success ? (
              <Alert severity="success" sx={{ width: "100%", mt: 2 }}>
                Contraseña cambiada con éxito. Ahora puedes{" "}
                <a href="/login">iniciar sesión</a>.
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
                  label="Nueva contraseña"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Confirma la nueva contraseña"
                  type="password"
                  variant="outlined"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                    "Cambiar contraseña"
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
