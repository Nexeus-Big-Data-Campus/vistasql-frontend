import { Outlet, Navigate } from "react-router";
import { UserProvider, useUser } from "../../contexts/UserContext";
import Header from "../../components/Header";
import { AppThemeProvider } from "../../theme/ThemeContext";

function VistaApp() {
  const { user, loading } = useUser();

  if(loading) {
    return '';
  }
  
  if(!user) {
    return  <Navigate to="/login"/>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <Outlet />
    </div>
  );
}

export default function AppLayout() {
  return (
    <AppThemeProvider>
      <UserProvider>
        <VistaApp />
      </UserProvider>
    </AppThemeProvider>
  );
} 