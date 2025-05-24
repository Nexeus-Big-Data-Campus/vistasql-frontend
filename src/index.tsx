import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // usa BrowserRouter en lugar de crear router dentro de App

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
     <App />
  </React.StrictMode>
);
