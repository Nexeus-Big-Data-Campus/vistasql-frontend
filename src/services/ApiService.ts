

export class ApiService {
  API_URL = import.meta.env.API_URL || "http://localhost:8000";

  async login(email: string, password: string) {
    return await this.makeRequest("/login", "POST", { email, password });
  }

  async signin(name: string, email: string, password: string) {
    return await this.makeRequest("/signin", "POST", { email, password });
  }
  
  private async makeRequest(endpoint: string, method: string, body?: any) {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return response;
  }
}

