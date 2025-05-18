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

interface Props {
  onLoginSuccess: () => void;
}

export default function RegisterForm({ onLoginSuccess }: Props) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const apiService = new ApiService();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        try {
            // Aquí deberías llamar a apiService.register si es un registro
            const response = await apiService.signin(name, email, password);
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message || "Registro exitoso.");
                onLoginSuccess();
            } else {
                setMessage(data.detail || "Error en el registro.");
            }
        } catch (error) {
            setMessage("Error de conexión o credenciales incorrectas.");
            console.error("Register error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate("/login");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            }}
        >
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
                    Crear cuenta
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Regístrate para acceder a la plataforma
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
                        label="Nombre de usuario"
                        type="text"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        fullWidth
                    />
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
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Registrarse"}
                    </Button>
                </Box>
                {message && (
                    <Alert
                        severity={message.toLowerCase().includes("exitoso") ? "success" : "error"}
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
                    ¿Ya tienes cuenta? Inicia sesión
                </Button>
            </Paper>
        </Box>
    );
}