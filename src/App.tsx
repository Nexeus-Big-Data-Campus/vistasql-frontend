import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import MainEditor from './pages/MainEditor';
import LoginPage from './pages/LoginPage';
import AppLayout from './pages/AppLayout'; // nuevo layout
import '@fontsource/roboto';

const router = createBrowserRouter([
  {
<<<<<<< HEAD
    path: '/',
    element: <AppLayout />, // Aquí envolvemos con UserProvider
    children: [
      { index: true, element: <Home /> },
      { path: 'editor', element: <MainEditor /> },
      { path: 'login', element: <LoginPage /> },
    ],
=======
    path: '/', 
    element: <Home />,
  },
  {
    path: '/editor',
    element: <MainEditor />,
  },
  {
    path: '/login',
    element: <LoginPage/>
>>>>>>> origin/develop
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;