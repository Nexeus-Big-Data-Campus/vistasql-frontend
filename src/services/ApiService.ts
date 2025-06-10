
type LoginResponse = {
  access_token: string;
  token_type: string;
};

export class ApiService {
  private API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return await this.makeRequest("/login", "POST", { email, password });
  }

  async signin(name: string, email: string, password: string): Promise<LoginResponse> {
    return await this.makeRequest("/signin", "POST", { name, email, password });
  }

  async getUserProfile() {
    return await this.makeRequest("/profile", "GET");
  }

 private async makeRequest(endpoint: string, method: string, body?: any) {
  try {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method,
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      let errorKey = "error.error_inesperado";

      switch (response.status) {
        case 400:
          errorKey = error.detail || "error.solicitud_invalida";
          break;
        case 401:
          errorKey = "error.no_autorizado";
          break;
        case 403:
          errorKey = "error.sin_permisos";
          break;
        case 404:
          errorKey = "error.recurso_no_encontrado";
          break;
        case 409:
          errorKey = error.detail || "error.usuario_ya_existe";
          break;
        case 500:
          errorKey = "error.error_interno_servidor";
          break;
        default:
          errorKey = error.detail || "error.error_inesperado";
      }

      throw new Error(errorKey);
    }

    return await response.json();

  } catch (err: any) {
    if (err instanceof TypeError || err.message === "Failed to fetch") {
      throw new Error("error.no_conexion");
    }
    throw new Error(err.message || "error.error_desconocido");
  }
}

}