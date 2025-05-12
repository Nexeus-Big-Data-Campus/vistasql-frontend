import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home'
import MainEditor from './pages/MainEditor';
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;