import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home'
import MainEditor from './pages/MainEditor';
import LoginPage from './pages/LoginPage'; 
import '@fontsource/roboto';
import RegisterPage from './pages/RegisterPage';


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
    path: '/signin',
    element: <RegisterPage/>
  },
/* aca apunta al otra pagina 
 { 
    path: '/profile',
    element: <ProfilePage/>
  },*/
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;