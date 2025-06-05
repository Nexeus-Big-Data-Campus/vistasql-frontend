import { Routes, Route, Navigate } from 'react-router-dom'; 
import React from 'react';
import Home from '../pages/Home';
import LoginPage from '../pages/LoginPage';
import MainEditor from '../pages/MainEditor';
import RegisterPage from '../pages/RegisterPage';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; 
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Header isAuthenticated={isAuthenticated} />
      {children}
    </>
  );
};


export const AppRouter = () => { 
  return (
    <Layout>
      <Routes> 
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <MainEditor />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Home />} />

      </Routes>
    </Layout>
  );
}; 