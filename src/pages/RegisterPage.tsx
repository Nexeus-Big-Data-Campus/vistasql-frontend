import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Header from "../components/Header";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    // aca se redigira una vez registrado a profile 
    navigate("/editor"); 
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
      }}
    >
      <Header />
      <Container component="main" maxWidth="sm" sx={{
        minHeight: "calc(100vh - 64px)", // Ajusta si tu Header tiene otra altura
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </Box>
      </Container>
    </Box>
  );
}