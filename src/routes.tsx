import { createBrowserRouter } from 'react-router';

//Pages
import Home from './pages/public/Home';
import MainEditor from './pages/app/MainEditor';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
//LayOut
import AppLayout from './pages/layouts/AppLayout';
import PublicLayout from './pages/layouts/PublicLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signin', element: <RegisterPage /> },
    ],
  },

  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { path: 'editor', element: <MainEditor /> },
      { path: 'profile', element: <>TODO</>}
    ],
  },
]);

export default router;