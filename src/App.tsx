import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home'
import MainEditor from './pages/MainEditor';
import '@fontsource/roboto';
import DashboardAdmin from './pages/DashboardAdmin';


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
    path: '/admin',
    element: <DashboardAdmin />,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;