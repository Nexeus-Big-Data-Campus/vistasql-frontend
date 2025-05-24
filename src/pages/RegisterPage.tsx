import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import Header from "../components/Header";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    
    navigate("/editor");
  };
  
  const isLoggedIn = false;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header isLoggedIn={isLoggedIn} />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 3, sm: 6 } 
        }}
      >
        <Container component="main" maxWidth="sm">
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </Container>
      </Box>
    </Box>
  );
}
