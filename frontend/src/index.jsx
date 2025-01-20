import React from 'react';
import { createRoot } from 'react-dom/client'; 
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/global.css';
import { GameProvider } from './providers/GameProvider';
import AuthProvider from './providers/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { FavoritesProvider } from './providers/FavoritesProvider';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <GameProvider>
        <FavoritesProvider>
        <App />
        </FavoritesProvider>
      </GameProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
