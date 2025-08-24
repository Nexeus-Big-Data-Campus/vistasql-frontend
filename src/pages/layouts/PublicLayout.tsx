import { Outlet } from "react-router";
import { UserProvider } from "../../contexts/UserContext";
import { AppThemeProvider } from "../../theme/ThemeContext";

export default function PublicLayout() {
  return (
    <AppThemeProvider>
      <UserProvider>
        <Outlet />
      </UserProvider>
    </AppThemeProvider>
  );
}