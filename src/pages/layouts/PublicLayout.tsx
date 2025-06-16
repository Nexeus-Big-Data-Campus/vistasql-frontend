import { Outlet } from "react-router";
import { UserProvider } from "../../contexts/UserContext";
import Header from "../../components/Header";
import { AppThemeProvider } from "../../theme/ThemeContext";

export default function PublicLayout() {
  return (
    <AppThemeProvider>
      <UserProvider>
        <Header></Header>
        <Outlet />
      </UserProvider>
    </AppThemeProvider>
  );
}