import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import './styles.css';

// Anonymous sign-in so every visitor has a stable UUID without a login screen.
// If a session already exists in localStorage, signInAnonymously is a no-op.
async function ensureAnonAuth() {
  if (!isSupabaseConfigured) return;
  const { data } = await supabase.auth.getSession();
  if (data.session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] anonymous sign-in failed:', error.message);
  }
}

void ensureAnonAuth();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
