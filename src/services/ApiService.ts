type LoginResponse = {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
};
export class ApiService {
  private API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(endpoint: string, method: string, body?: any, requireAuth: boolean = false): Promise<T> {
    const headers = requireAuth ? this.getAuthHeaders() : { "Content-Type": "application/json" };

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Manejo de errores
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Request failed");
    }

    return await response.json();
  }

  async login(email: string, password: string):  Promise<LoginResponse> {
    return await this.makeRequest("/login", "POST", { email, password });
  }

  async signin(name: string, email: string, password: string) {
    return await this.makeRequest("/signin", "POST", { name, email, password });
  }

  async getUserProfile() {
    return await this.makeRequest<any>("/profile", "GET", undefined, true); // requiere auth
  }
}

export const apiService = new ApiService();