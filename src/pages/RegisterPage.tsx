import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import Header from "../components/Header";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate("/editor");
  };

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="w-full max-w-md flex flex-col items-center">
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </div>
      </div>
    </main>
  );
}