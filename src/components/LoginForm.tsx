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