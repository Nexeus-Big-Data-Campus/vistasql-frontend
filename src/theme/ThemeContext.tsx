import React, { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#1976d2', 
          },
          secondary: {
            main: '#dc004e', 
          },
          background: {
            default: '#f4f6f8', 
            paper: '#ffffff',   
          },
        }
      : {
          
          primary: {
            main: '#90caf9', 
          },
          secondary: {
            main: '#f48fb1', 
          },
          background: {
            default: '#121212', 
            paper: '#1e1e1e',   
          },
        }),
  },
});

interface AppThemeContextType {
  toggleTheme: () => void;
  mode: PaletteMode;
}

export const AppThemeContext = createContext<AppThemeContextType>({
  toggleTheme: () => {},
  mode: 'light',
});

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const storedPreference = localStorage.getItem('themeMode') as PaletteMode | null;
    return storedPreference || 'light'; 
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode); 
      return newMode;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <AppThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {}
        {children}
      </MuiThemeProvider>
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(AppThemeContext);