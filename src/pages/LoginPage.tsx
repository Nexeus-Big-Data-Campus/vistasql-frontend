import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Header from "../components/Header";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
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
        <Container component="main" maxWidth="sm"> {}
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </Container>
      </Box>
    </Box>
  );
}
