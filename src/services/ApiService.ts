interface Response {
  error?: string ;
  code: number;
  data?: any;
}

interface LoginResponse {
  access_token: string;
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

  async login(email: string, password: string):  Promise<Response> {
    return await this.makeRequest("/login", "POST", { email, password });
  }

  async signin(name: string, email: string, password: string): Promise<Response> {
    return await this.makeRequest("/signin", "POST", { name, email, password });
  }

  async getUserProfile() {
    return await this.makeRequest("/profile", "GET");
  }
  
  private async makeRequest(endpoint: string, method: string, body?: any): Promise<Response> {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method,
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Manejo de errores
    if (!response.ok) {
      return {
        error: data.detail,
        code: response.status
      };
    }

    return {
      code: response.status,
      data
    };
  }
}

export const apiService = new ApiService();