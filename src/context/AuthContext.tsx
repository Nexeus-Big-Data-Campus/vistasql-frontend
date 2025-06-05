import React, { createContext, useContext, useState } from 'react';
import { useNavigation } from './NavigationContext';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { navigateTo } = useNavigation();

  const login = () => {
    setIsAuthenticated(true);
    navigateTo('/editor');
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigateTo('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 