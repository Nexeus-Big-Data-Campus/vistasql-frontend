// src/components/LoginForm.tsx
import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { apiService } from "../services/ApiService";
import { Button, TextField, Typography } from "@mui/material";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiService.login(email, password);
      const token = data.access_token;

      if (!token) throw new Error("Respuesta inválida del servidor");

      login(token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: 300, display: "flex", flexDirection: "column", gap: 15 }}>
      <Typography variant="h5" textAlign="center">Iniciar sesión</Typography>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />
      {error && <Typography color="error">{error}</Typography>}
      <Button type="submit" variant="contained" fullWidth>Entrar</Button>
    </form>
  );
}
