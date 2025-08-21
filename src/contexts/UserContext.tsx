import { jwtDecode } from "jwt-decode";
import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useContext } from "react";
import { ApiService } from "../services/ApiService";
import { Project, ProjectCreate, User } from "../interfaces/user";
import { JWTPayload } from "../interfaces/http";

export function useUser() {
  return useContext(UserContext);
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  jwtToken: string | null;
  activeProject: Project | null;
  login: (token: string) => void;
  logout: () => void;
  setActiveProject: (p: Project) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  jwtToken: null,
  activeProject: null,
  login: () => {},
  logout: () => {},
  setActiveProject: (p: Project) => {},
});

interface Props {
  children: ReactNode;
}

export function UserProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [loading, setIsLoading] = useState<boolean>(true);
  const [activeProject, setActiveProject] = useState<Project>();
  const apiService = ApiService.getInstance();

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const payload = jwtDecode(token) as JWTPayload;

    setJwtToken(token);
    getUser(payload, token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    apiService.setLogoutHandler(logout);

    if (!storedToken) {
      logout();
      return;
    }

    const payload = jwtDecode(storedToken) as JWTPayload;

    if (!payload.exp || (new Date()) > (new Date(payload.exp * 1000))) {
      logout();
      return;
    }

    setJwtToken(storedToken);
    getUser(payload, storedToken);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      initializeActiveProject();
    }
  }, [user]);

  const getUser = async (payload: JWTPayload, token: string) => {
    const response = await apiService.getCurrentUser(payload.id, token);
    
    if (!("error" in response)) {
      setUser(response as User);
    }
  }

  const addProject = (p: Project) => {
    if (!user) {
      return;
    }

    const projects = user.projects.concat(p);
    setUser({
      ...user,
      projects, 
    });
  }

  const initializeActiveProject = () => {
    if (!user) {
      return;
    }

    if (user.projects.length === 0) {
      createProject();
      return;
    }

    setActiveProject(user.projects[0]);
  }

  const createProject = async () => {
    if (!user || !jwtToken) {
      return;
    }

    const newProject: ProjectCreate = {user_id: user.id, code: ''};
    const response = await apiService.createProject(newProject, jwtToken);

    if ("error" in response) {
      throw new Error('Couldn\'t initialize user project');
    }

    addProject(response);
    setActiveProject(response);
  }

  const value = useMemo(() => ({
    user,
    loading,
    jwtToken,
    activeProject,
    login,
    logout,
    setActiveProject,
  }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
