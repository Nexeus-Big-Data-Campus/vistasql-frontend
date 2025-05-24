const API_URL = "http://127.0.0.1:8000";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

interface LoginResponse {
  message: string;
  [key: string]: any;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Error al iniciar sesión");
  }

  return await response.json();
}

export async function getUserProfile(): Promise<any> {
  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("No autorizado o error al obtener el perfil");
  }

  return await response.json();
}
