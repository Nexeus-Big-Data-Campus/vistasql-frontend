import { createBrowserRouter } from "react-router";

//Pages
import Home from "./pages/Home";
import MainEditor from "./pages/MainEditor";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./components/Forgot-password";
import ResetPassword from "./components/Reset-password";

//LayOut
import AppLayout from "./pages/layouts/AppLayout";
import PublicLayout from "./pages/layouts/PublicLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <LoginPage /> },
      { path: "signin", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },

  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { path: "editor", element: <MainEditor /> },
      { path: "profile", element: <>TODO</> },
    ],
  },
]);

export default router;
