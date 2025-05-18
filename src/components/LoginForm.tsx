import { useState } from "react";
import { ApiService } from "../services/ApiService";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Añade este import

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const apiService = new ApiService();
  const navigate = useNavigate(); // Hook para navegación

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await apiService.login(email, password);
      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        onLoginSuccess();
      } else {
        setMessage(`❌ ${data.detail}`);
      }
    } catch (error) {
      setMessage("❌ Error de conexión");
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
        minWidth: 340,
        maxWidth: 400,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 8px 32px rgba(25, 118, 210, 0.15)",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom color="primary">
        Iniciar sesión
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Accede a tu cuenta para continuar
      </Typography>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <TextField
          label="Correo electrónico"
          type="email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Contraseña"
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
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
      {message && (
        <Alert
          severity={message.startsWith("✅") ? "success" : "error"}
          sx={{ width: "100%", mt: 2 }}
        >
          {message.replace(/^✅ |^❌ /, "")}
        </Alert>
      )}
      <Button
        variant="text"
        color="secondary"
        onClick={handleGoRegister}
        sx={{ mt: 2, textTransform: "none" }}
        fullWidth
      >
        ¿No estás registrado? Crea una cuenta
      </Button>
    </Paper>
  );
}