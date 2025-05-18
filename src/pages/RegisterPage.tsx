import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleRegisterSuccess = () => {
    // aca se redigira una vez registrado el profile
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
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          
        </Typography>
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      </Box>
    </Container>
  );
}
