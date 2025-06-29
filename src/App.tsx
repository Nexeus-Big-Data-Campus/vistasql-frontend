import './App.css';
import { RouterProvider } from 'react-router';

import router from './routes';

import '@fontsource/roboto';

import React from 'react';


function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;