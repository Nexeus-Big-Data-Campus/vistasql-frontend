import { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from "@mui/material";
import { ApiService } from "../services/ApiService";
import { useNavigate } from "react-router-dom";

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false); // Renombrado de loading a isLoading
    const apiService = new ApiService();
    const navigate = useNavigate(); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(""); 
        //prueba con la api
        try {
            const response = await apiService.login(email, password);
            const data = await response.json();
            console.log(data, response);

            if (response.ok) {
                // Asumiendo que data.message existe en una respuesta exitosa
                setMessage(data.message || "Inicio de sesión exitoso.");
                onLoginSuccess(); 
            } else {
                // Asumiendo que data.detail existe en una respuesta de error
                setMessage(data.detail || "Error en el inicio de sesión.");
            }
        } catch (error) {
            setMessage("Error de conexión o credenciales incorrectas.");
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate("/editor"); 
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', 
                width: '100%',     
            }}
        >
            <Box 
                sx={{
                    width: '100%',
                    maxWidth: '400px', 
                    display: 'flex',
                    justifyContent: 'flex-start',
                    mb: 2, 
                }}
            >
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={handleGoBack}
                >
                    Atras
                </Button>
            </Box>

            <Box 
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", 
                    gap: 2, 
                    padding: { xs: 2, sm: 3 },
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: "8px",
                    boxShadow: (theme) => theme.shadows[3],
                    maxWidth: "400px", 
                    width: "100%", 
                    
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Iniciar sesión
                </Typography>
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
                
                <Box sx={{ width: '100%', mt: 1 }}>
                    <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
                    </Button>
                </Box>
                {message && (
                    <Alert
                        severity={message.toLowerCase().includes("exitoso") || message.toLowerCase().includes("successful") ? "success" : "error"}
                        sx={{ width: "100%", mt: 2 }}
                    >
                        {message}
                    </Alert>
                )}
            </Box>
        </Box>
    );
}