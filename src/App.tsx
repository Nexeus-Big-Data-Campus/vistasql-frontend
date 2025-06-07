import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home'
import MainEditor from './pages/MainEditor';
import Admin from './pages/Admin';
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
    path: '/admin',
    element: <Admin />,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;