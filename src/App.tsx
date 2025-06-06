import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home';
import MainEditor from './pages/MainEditor';
import LoginPage from './pages/LoginPage';
import AppLayout from './pages/layouts/AppLayout';
import '@fontsource/roboto';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'editor', element: <MainEditor /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;