<<<<<<< HEAD
// src/components/LoginForm.tsx
import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { login as apiLogin } from "../services/QueryParser/ApiService";
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
      const data = await apiLogin(email, password);

      // Ajusta según la respuesta que te dé tu backend
      const token = data.token;
      const user = data.user;

      if (!token || !user) throw new Error("Respuesta inválida del servidor");

      login(token, user); // Guarda token y user en contexto y localStorage
      onLoginSuccess();   // Navega a /editor
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
=======
// src/components/LoginForm.tsx
import { useState } from "react";
import { ApiService } from "../services/ApiService";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const apiService = new ApiService();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await apiService.login(email, password);
            const data = await response.json();
            console.log(data, response);

            if (response.ok) {
                setMessage(`✅ ${data.message}`);
                onLoginSuccess(); 
            } else {
                setMessage(`❌ ${data.detail}`);
            }
        } catch (error) {
            setMessage("❌ Error de conexión");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
            <h2>Iniciar sesión</h2>
            <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Entrar</button>
            <p>{message}</p>
        </form>
    );
}
>>>>>>> origin/develop
