/**
 * Vrinda Tours & Vrinda Vihar — Enterprise Supabase Database Client & Resilience Layer
 * Production-ready client with automated token recovery, retry strategies, and real-time sync.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fciwjgxijlarmetgvbmk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjaXdqZ3hpamxhcm1ldGd2Ym1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODgzMzEsImV4cCI6MjEwMzE2NDMzMX0.vkUeJ1_gUM1zXxanwy76XEzxIHSLDWs_aVJ72sa-RCg';

/**
 * Standardized Database Table Names Enum (Prevents typos across codebase)
 */
export const TABLES = Object.freeze({
  PARTNERS: 'partners',
  RIDE_REQUESTS: 'ride_requests',
  TABLE_RESERVATIONS: 'table_reservations',
  ROOM_BOOKINGS: 'room_bookings',
  DRIVER_REGISTRATIONS: 'driver_registrations',
  HOTEL_REGISTRATIONS: 'hotel_registrations',
  RESTAURANT_REGISTRATIONS: 'restaurant_registrations',
  AGENCY_REGISTRATIONS: 'agency_registrations',
  SUPPORT_MESSAGES: 'support_messages',
  PILGRIMS: 'pilgrims',
  REFERRAL_LOGS: 'referral_logs',
  PAYMENTS: 'payments'
});

/**
 * Initialize Supabase Client with graceful auth & realtime configuration
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'vt_sb_auth_session'
  },
  realtime: {
    params: {
      eventsPerSecond: 15
    }
  },
  global: {
    headers: {
      'x-application-name': 'vrinda-vihar-brij-yatra'
    }
  }
});

/**
 * Safe Auth Session Recovery
 * Cleans corrupted / revoked refresh tokens on startup without crashing app
 */
if (typeof window !== 'undefined') {
  // Catch auth state transitions and clean stale tokens if refresh fails
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
      console.warn('[Supabase Auth] Refresh token expired or revoked. Resetting to public session.');
      try {
        localStorage.removeItem('vt_sb_auth_session');
      } catch (e) {}
    }
  });

  // Self-healing auth probe
  supabase.auth.getSession().catch((err) => {
    if (err?.message?.includes('refresh_token') || err?.message?.includes('invalid_grant')) {
      console.warn('[Supabase Auth] Auto-healing invalid stored session token.');
      try {
        localStorage.removeItem('vt_sb_auth_session');
        supabase.auth.signOut().catch(() => {});
      } catch (e) {}
    }
  });
}

/**
 * Check if valid Supabase connection keys are provided
 */
export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-project'));
}

/**
 * Resilient Database Query Helper with Exponential Backoff
 * @param {Function} queryFn - Async function executing the Supabase query
 * @param {Object} options - { retries: 3, delayMs: 400, fallbackData: null }
 */
export async function executeWithRetry(queryFn, options = {}) {
  const { retries = 2, delayMs = 400, fallbackData = null } = options;
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await queryFn();
      if (result.error) {
        throw result.error;
      }
      return { data: result.data, error: null, count: result.count };
    } catch (err) {
      lastError = err;
      // If client offline or network failed, wait and retry
      if (attempt < retries) {
        const backoff = delayMs * Math.pow(1.5, attempt);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  return { data: fallbackData, error: lastError };
}

/**
 * Safely tear down a Supabase channel without triggering premature socket disconnect errors
 */
export function safeRemoveChannel(channel) {
  if (!channel || !supabase) return;
  try {
    if (channel.state === 'joining') {
      setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }, 500);
    } else {
      supabase.removeChannel(channel);
    }
  } catch {}
}

export default supabase;
