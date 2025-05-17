import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    // aca se redigira una vez registrado a profile 
    navigate("/editor"); 
  };

  return (
    <Container component="main" maxWidth="sm"> 
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      </Box>
    </Container>
  );
}