import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import LoginPage from '../pages/LoginPage';
import MainEditor from '../pages/MainEditor';
import RegisterPage from '../pages/RegisterPage';
import Header from './Header';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { navigateTo } = useNavigation();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigateTo('/login');
    }
  }, [isAuthenticated, navigateTo]);

  return isAuthenticated ? <>{children}</> : null;
};

export default function Router() {
  const { currentPath } = useNavigation();
  const { isAuthenticated } = useAuth();

  let PageComponent;
  switch (currentPath) {
    case '/':
      PageComponent = <Home />;
      break;
    case '/editor':
      PageComponent = (
        <ProtectedRoute>
          <MainEditor />
        </ProtectedRoute>
      );
      break;
    case '/login':
      PageComponent = <LoginPage />;
      break;
    case '/register':
      PageComponent = <RegisterPage />;
      break;
    default:
      PageComponent = <Home />;
      if (window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/');
      }
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      <div className="app-content">
        {PageComponent}
      </div>
    </>
  );
} 