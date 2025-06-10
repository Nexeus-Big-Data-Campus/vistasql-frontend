import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';

//Pages
import Home from './pages/Home';
import MainEditor from './pages/MainEditor';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
//LayOut
import AppLayout from './pages/layouts/AppLayout';
import PublicLayout from './pages/layouts/PublicLayout';
//Routes
import { ROUTES } from './pages/Routes';

import '@fontsource/roboto';
import React from 'react';


const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },

  {
    path: ROUTES.app,
    element: <AppLayout />,
    children: [
      { path: 'editor', element: <MainEditor /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signin', element: <RegisterPage /> },
      { path: 'profile', element: <>TODO</>}
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