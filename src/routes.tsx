import { createBrowserRouter } from 'react-router';

//Pages
import Home from './pages/Home';
import MainEditor from './pages/MainEditor';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
//LayOut
import AppLayout from './pages/layouts/AppLayout';
import PublicLayout from './pages/layouts/PublicLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
    ],
  },

  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { path: 'editor', element: <MainEditor /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signin', element: <RegisterPage /> },
      { path: 'profile', element: <>TODO</>}
    ],
  },
]);

export default router;