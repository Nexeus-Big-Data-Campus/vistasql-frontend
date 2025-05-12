import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/editor"); // Redirige al editor tras iniciar sesión
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

