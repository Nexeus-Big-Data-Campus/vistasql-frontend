import { Outlet, Navigate, useLocation } from "react-router";
import { UserProvider, useUser } from "../../contexts/UserContext";
import Header from "../../components/Header";
import { AppThemeProvider } from "../../theme/ThemeContext";

function ProtectedApp() {
  const { user } = useUser();
  const location = useLocation();

  const publicPaths = [('/app/login'), ('/app/signin')];
  const isPublicPath = publicPaths.includes(location.pathname);

  //if (!user && !isPublicPath) {
    //return <Navigate to="/app/login" replace state={{ from: location }} />;
  //}

  //if (user && isPublicPath) {
    //return <Navigate to="/app/editor" replace state={{ from: location }} />;
  //}

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
        <ProtectedApp />
      </UserProvider>
    </AppThemeProvider>
  );
} 