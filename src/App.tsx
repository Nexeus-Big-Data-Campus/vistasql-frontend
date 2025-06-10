import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home';
import MainEditor from './pages/MainEditor';
import LoginPage from './pages/LoginPage';
import AppLayout from './pages/layouts/AppLayout';
import '@fontsource/roboto';
import React from 'react';
import RegisterPage from './pages/RegisterPage';
import ErrorTester from "./pages/ErrorTester";





const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'editor', element: <MainEditor /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signin', element: <RegisterPage /> },
      { path: 'profile', element: <>TODO</>},
      { path: 'test-errors', element: <ErrorTester /> },
    ],
  },
]);

function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;