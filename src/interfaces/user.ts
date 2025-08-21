export interface User {
  id: string;
  username: string;
  email: string;
  projects: Project[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Project {
  id: string;
  code: string;
  userId: string;
}

export interface ProjectCreate {
  code: string;
  user_id: string;
}

export interface ProjectUpdate {
  id: string;
  code: string;
}