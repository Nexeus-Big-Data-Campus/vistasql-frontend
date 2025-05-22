import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import Header from "../components/Header";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/editor"); // Redirige al editor tras iniciar sesión
  };

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="w-full max-w-md flex flex-col items-center">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    </main>
  );
}