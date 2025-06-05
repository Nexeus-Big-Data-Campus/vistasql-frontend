import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider } from './context/NavigationContext';
import { AppRouter } from './router'; 
import { AppThemeProvider } from './theme/ThemeContext'; 

function App() {
  return (
    <React.StrictMode>
      <BrowserRouter> 
        <NavigationProvider> 
          <AppThemeProvider> 
            <AuthProvider> 
              <AppRouter /> 
            </AuthProvider>
          </AppThemeProvider>
        </NavigationProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default App;