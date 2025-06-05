import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom'; 


interface NavigationContextType {

  navigateTo: (path: string) => void; 
}


const NavigationContext = createContext<NavigationContextType | undefined>(undefined);


export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate(); 

  const navigateTo = (path: string) => {
    navigate(path); 
  };

  const value = { navigateTo };
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};


export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};