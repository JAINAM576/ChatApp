import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from "react-router-dom";
import { Toaster } from 'react-hot-toast'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937', 
            color: '#fff',
            fontWeight: '500',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
);
