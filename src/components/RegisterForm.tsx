import { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress,
    
} from "@mui/material";
import { useNavigate } from "react-router-dom"; 
import { ApiService } from "../services/ApiService";

interface Props {
  onRegisterSuccess: () => void;
}

export default function RegisterForm({ onRegisterSuccess }: Props) {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
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
            // Llamada real a la API       

      
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (email === "test@example.com") {
                throw { detail: "El correo electrónico ya está registrado." };
            }
            const data = { message: "Registro exitoso. Ahora puedes iniciar sesión." };
            const response = { ok: true };
           

            if (response.ok) {
                setMessage(data.message || "Registro exitoso.");
                onRegisterSuccess();
            } else {
                setMessage(data.detail || "Error en el registro.");
            }
        } catch (error: any) {
            setMessage(error.detail || "Error en el registro. Inténtalo de nuevo.");
            console.error("Register error:", error);
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
            <Box // 
                sx={{
                    width: '100%',
                    maxWidth: '450px', 
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
                    maxWidth: "450px",
                    width: "100%",
                    
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Crear cuenta
                </Typography>
                <TextField
                    label="Nombre"
                    type="text"
                    variant="outlined"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    label="Apellido"
                    type="text"
                    variant="outlined"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
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

               
                <Box sx={{ width: '100%', mt: 1 }}>
                    <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
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
            </Box>
        </Box>
    );
}