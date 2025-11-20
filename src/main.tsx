import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { initErrorTracking } from './lib/errorTracking';
import { logHealthStatus } from './lib/healthCheck';

// Initialize error tracking for production
initErrorTracking();

// Log health status in development
if (import.meta.env.MODE === 'development') {
  logHealthStatus().catch(console.error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>
);
