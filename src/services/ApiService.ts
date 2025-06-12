
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
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));

      const message = errorBody.detail || "error.error_inesperado";
      const status = response.status;

      
      throw {
        status,
        message,
      };
    }

    return await response.json();

  } catch (err: any) {

   
    if (err instanceof TypeError || err.message === "Failed to fetch") {
      throw {
        status: 0,
        message: "error.no_conexion",
      };
    }

    
    throw {
      status: err.status || -1,
      message: err.message || "error.error_desconocido",
    };
  }
}
}