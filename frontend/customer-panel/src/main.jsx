/*
   VaaniBank AI — Customer Panel Entry Point
   Union Bank of India | Team Vectora
   */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './theme.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      gutter={8}
      containerStyle={{ top: 16 }}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--card-bg)',
          color: 'var(--text-primary)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontFamily: "'Inter', system-ui, sans-serif",
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          maxWidth: '90vw',
        },
        success: {
          iconTheme: {
            primary: '#16A34A',
            secondary: '#FFFFFF',
          },
        },
        error: {
          iconTheme: {
            primary: '#DC2626',
            secondary: '#FFFFFF',
          },
          duration: 4000,
        },
      }}
    />
  </StrictMode>
);
