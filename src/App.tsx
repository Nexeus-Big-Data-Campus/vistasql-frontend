import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import MainEditor from "./pages/MainEditor";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import "@fontsource/roboto";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/editor",
    element: <MainEditor />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <AdminDashboard />,
  },
]);

function App() {
  const isAdmin = true; // Simulación temporal

  return <RouterProvider router={router} />;
}

export default App;
