import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SupabaseAuthProvider } from './hooks/useSupabaseAuth.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SupabaseAuthProvider>
      <App />
    </SupabaseAuthProvider>
  </StrictMode>
);
