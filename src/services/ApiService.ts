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

  async login(email: string, password: string):  Promise<LoginResponse> {
    return await this.makeRequest("/login", "POST", { email, password });
  }

  async signin(name: string, email: string, password: string): Promise<LoginResponse> {
    return await this.makeRequest("/signin", "POST", { name, email, password });
  }

  async getUserProfile() {
    return await this.makeRequest("/profile", "GET");
  }
  
  private async makeRequest(endpoint: string, method: string, body?: any) {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method,
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    // Manejo de errores
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Request failed");
    }

    return await response.json();
  }
}

export const apiService = new ApiService();