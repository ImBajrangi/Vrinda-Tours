import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fciwjgxijlarmetgvbmk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjaXdqZ3hpamxhcm1ldGd2Ym1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODgzMzEsImV4cCI6MjEwMzE2NDMzMX0.vkUeJ1_gUM1zXxanwy76XEzxIHSLDWs_aVJ72sa-RCg';

// Dev-mode warning if env vars are missing
if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_URL) {
  console.warn('[Vrinda Vihar] VITE_SUPABASE_URL not set — using fallback. Add to .env.local for production.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
