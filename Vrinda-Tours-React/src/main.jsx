import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Register Offline Map Tile Caching Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (reg) => {
        console.log('Vrinda Offline Map Cache Engine active:', reg.scope);
      },
      (err) => {
        console.warn('Service worker registration failed:', err);
      }
    );
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

