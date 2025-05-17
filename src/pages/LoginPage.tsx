import { useNavigate } from "react-router";
import LoginForm from "../components/LoginForm";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/editor"); 
  };

  return (
<Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </Box>
    </Container>
  );
}
      

