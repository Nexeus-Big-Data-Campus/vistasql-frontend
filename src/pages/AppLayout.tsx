import { Outlet } from "react-router";
import { UserProvider } from "../contexts/UserContext";

export default function AppLayout() {
  return (

    <UserProvider>

      <Outlet />

    </UserProvider>
    
  );
}
