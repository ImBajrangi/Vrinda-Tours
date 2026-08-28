import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/UI/ErrorBoundary';
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

// Gracefully handle browser-level WebChannel/Fetch CORS stream notices
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event?.reason?.message || event?.reason || '');
    if (
      msg.includes('firestore.googleapis.com') ||
      msg.includes('access control checks') ||
      msg.includes('Fetch API cannot load')
    ) {
      event.preventDefault();
      console.warn('[Vrinda Vihar] Network stream warning caught gracefully:', msg);
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

