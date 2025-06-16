import { jwtDecode } from "jwt-decode";
import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";

interface User {
  id: number;
  username: string;
  email: string;
}

import { useContext } from "react";

export function useUser() {
  return useContext(UserContext);
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

interface Props {
  children: ReactNode;
}

export function UserProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState<boolean>(true);

  const login = (token: string) => {
    const user = jwtDecode(token) as User;
    setUser(user);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const u = jwtDecode(storedToken) as User;
      setUser(u);
    }

    setIsLoading(false);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout
  }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
