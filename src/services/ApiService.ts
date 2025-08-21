import { CreateFeedback } from "../components/common/FeedbackModal";
import { HttpClient } from "./HttpClient";
import { HttpOptions, ResponseError } from "../interfaces/http";
import { LoginResponse, Project, ProjectCreate, ProjectUpdate, User } from "../interfaces/user";

type LogoutFunction = () => void;

export class ApiService {
  private API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  private static instance: ApiService = new ApiService();

  private logoutHandler: LogoutFunction | undefined;

  private httpClient: HttpClient = new HttpClient();

  public static getInstance(): ApiService {
    return this.instance;
  }

  public setLogoutHandler(fn: LogoutFunction): void {
    this.logoutHandler = fn;
  }

  async login(email: string, password: string):  Promise<LoginResponse | ResponseError> {
    return await this.makeRequest<LoginResponse>("/login", "POST", {
      headers: this.getHeaders(),
      body: this.getBody({ email, password })
    });
  }

  async signin(name: string, email: string, password: string): Promise<LoginResponse | ResponseError> {
    return await this.makeRequest("/signin", "POST", {
      headers: this.getHeaders(),
      body: this.getBody({ name, email, password })
    });
  }

  async getCurrentUser(userId: string, userToken: string): Promise<User | ResponseError> {
    return await this.makeRequest<User>(`/users/${userId}`, "GET", {headers: this.getHeaders(userToken)});
  }

  async createProject(newProject: ProjectCreate, userToken: string): Promise<Project | ResponseError> {
    return await this.makeRequest<Project>(`/projects`, "POST", {
      headers: this.getHeaders(userToken), 
      body: this.getBody(newProject)
    })
  }

  async updateProject(project: ProjectUpdate, userToken: string): Promise<Project | ResponseError> {
    return await this.makeRequest<Project>('/projects', "PUT", {
      headers: this.getHeaders(userToken),
      body: this.getBody(project)
    });
  }

  async sendFeedback(input: CreateFeedback, userToken: string): Promise<void | ResponseError> {
    return await this.makeRequest<void>("/feedback", "POST", { 
      headers: this.getHeaders(userToken),
      body: this.getBody({
          user_id: input.userId,
          message_type: input.messageType, 
          message: input.message
        })
      });
  }

  private getBody(object: Object): string {
    return JSON.stringify(object);
  }

  private getHeaders(token: string | null = null): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async makeRequest<T>(endpoint: string, method: string, opts?: HttpOptions): Promise<T | ResponseError> {
    const response = await this.httpClient.makeRequest<T>(`${this.API_URL}${endpoint}`, method, opts);

    if ("error" in response) {
      if (response.status === 401 && this.logoutHandler) {
        this.logoutHandler();
      }

      return response;
    }

    return response as T;
  }
}