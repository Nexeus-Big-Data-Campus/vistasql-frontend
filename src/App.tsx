
import React, { useState, useEffect, useCallback } from 'react'
import './App.css';
import Home from './pages/Home'
import LoginPage from './pages/LoginPage'; 
import MainEditor from './pages/MainEditor';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import '@fontsource/roboto';
import { AppThemeProvider } from './theme/ThemeContext';

function App() {
  
  const [currentPath, setCurrentPath] = useState(window.location.pathname);  
  const [isLoggedIn, setIsLoggedIn] = useState(true); //se cambia manual para simular que esta en On/Off login
 
  const navigateTo = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  }, []);
  
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    navigateTo('/editor');
  };

  const handleRegisterSuccess = () => {
    navigateTo('/login');
  };

  
  let PageComponent;
  switch (currentPath) {
    case '/':
      PageComponent = <Home navigateTo={navigateTo} />;
      break;
    case '/editor':
      if (isLoggedIn) {
        PageComponent = <MainEditor navigateTo={navigateTo} />;
      } else {
        
        PageComponent = <LoginPage onLoginSuccess={handleLoginSuccess} navigateTo={navigateTo} />;
        if (window.location.pathname !== '/login') {
          window.history.replaceState({}, '', '/login');          
        }
      }
      break;
    case '/login':
      PageComponent = <LoginPage onLoginSuccess={handleLoginSuccess} navigateTo={navigateTo} />;
      break;
    case '/register':
      PageComponent = <RegisterPage onRegisterSuccess={handleRegisterSuccess} navigateTo={navigateTo} />;
      break;
    default:
      
      PageComponent = <Home navigateTo={navigateTo} />;
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/');
      }
  }

  return (
    <AppThemeProvider>
      
      <Header isLoggedIn={isLoggedIn} navigateTo={navigateTo} />
      <div className="app-content">
        {PageComponent}
      </div>
    </AppThemeProvider>
  );
}

export default App;

