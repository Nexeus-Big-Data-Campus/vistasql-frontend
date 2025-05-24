import LoginForm from "../components/LoginForm";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

interface LoginPageProps {
  onLoginSuccess: () => void; 
  navigateTo: (path: string) => void; 
}

export default function LoginPage({ onLoginSuccess, navigateTo }: LoginPageProps) {
  
  const isLoggedIn = false;

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
      ><Container component="main" maxWidth="sm"> {}        
          <LoginForm onLoginSuccess={onLoginSuccess} navigateTo={navigateTo} />
        </Container>
      </Box>
    </Box>
  );
}
