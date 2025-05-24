import RegisterForm from "../components/RegisterForm";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

interface RegisterPageProps {
  onRegisterSuccess: () => void; 
  navigateTo: (path: string) => void;
}
 export default function RegisterPage({ onRegisterSuccess, navigateTo }: RegisterPageProps) {  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
     
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
          {}
          <RegisterForm onRegisterSuccess={onRegisterSuccess} navigateTo={navigateTo} />
        </Container>
      </Box>
    </Box>
  );
}
