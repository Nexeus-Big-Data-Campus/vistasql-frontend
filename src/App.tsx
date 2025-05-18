import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home'
import MainEditor from './pages/MainEditor';
import LoginPage from './pages/LoginPage'; 
import RegisterPage from './pages/RegisterPage';
import '@fontsource/roboto';


const router = createBrowserRouter([
  {
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
  },
  {
    path: '/register',
    element: <RegisterPage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;