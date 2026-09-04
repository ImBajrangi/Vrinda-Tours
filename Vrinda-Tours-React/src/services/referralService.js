import { supabase } from '../config/supabase';

/**
 * Service to handle pilgrim referral tracking, reward points, and Supabase database synchronization.
 */

// Generate standard format referral code from user ID or name (e.g. VRINDA-A8B9C)
export function generateReferralCode(uid, name = 'PILGRIM') {
  if (uid) {
    const cleanId = String(uid).replace(/[^a-zA-Z0-9]/g, '');
    if (cleanId.length >= 5) {
      return `VRINDA-${cleanId.slice(-5).toUpperCase()}`;
    }
  }
  const cleanName = String(name).replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'DEVOTE';
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `VRINDA-${cleanName}${rand}`;
}

/**
 * Upsert pilgrim user profile and referral links to Supabase
 */
export async function syncPilgrimToSupabase(user, enteredReferralCode = '') {
  if (!user || !user.uid) return { success: false, error: 'Invalid user payload' };

  const refCode = (user.referralCode || generateReferralCode(user.uid, user.name)).toUpperCase();
  const cleanReferredBy = (enteredReferralCode || user.referredBy || '').trim().toUpperCase();

  const profilePayload = {
    id: user.uid,
    name: user.name || 'Pilgrim Devotee',
    email: user.email || '',
    phone: user.phone || '',
    avatar_url: user.avatar || '',
    role: user.role || 'pilgrim',
    category: user.category || 'pilgrim',
    referral_code: refCode,
    referred_by: cleanReferredBy || null,
    reward_points: user.rewardPoints || (cleanReferredBy ? 500 : 0),
    auth_provider: user.authProvider || 'password',
    updated_at: new Date().toISOString()
  };

  try {
    // 1. Upsert pilgrim profile into Supabase
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.warn('[ReferralService] Profile upsert notice:', profileError.message);
    }

    // 2. If user was referred by another pilgrim, log the referral event
    if (cleanReferredBy && cleanReferredBy !== refCode) {
      const referralLogPayload = {
        referrer_code: cleanReferredBy,
        referred_user_id: user.uid,
        referred_user_name: user.name || 'Pilgrim Devotee',
        referred_user_email: user.email || '',
        points_awarded: 500,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      const { error: logError } = await supabase
        .from('referrals')
        .insert([referralLogPayload]);

      if (logError) {
        console.warn('[ReferralService] Referral log notice:', logError.message);
      }
    }

    return {
      success: true,
      referralCode: refCode,
      rewardPoints: profilePayload.reward_points
    };
  } catch (err) {
    console.error('[ReferralService] Sync error:', err);
    return {
      success: false,
      error: err.message,
      referralCode: refCode,
      rewardPoints: profilePayload.reward_points
    };
  }
}

/**
 * Update user role and category tag directly in Supabase (Auth user_metadata and profiles table)
 */
export async function updateUserRoleInSupabase(user, newRoleKey) {
  if (!user || !newRoleKey) return { success: false, error: 'User or role missing' };

  try {
    // 1. Update Supabase Auth user_metadata if user is authenticated via Supabase
    if (!user.isAnonymous && user.uid) {
      try {
        await supabase.auth.updateUser({
          data: {
            role: newRoleKey,
            category: newRoleKey
          }
        });
      } catch (authErr) {
        console.warn('[ReferralService] Supabase auth updateUser notice:', authErr?.message);
      }

      // 2. Update profiles table in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: newRoleKey,
          category: newRoleKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.uid);

      if (profileError) {
        console.warn('[ReferralService] Supabase profile role update notice:', profileError.message);
      }
    }

    return { success: true, role: newRoleKey };
  } catch (err) {
    console.warn('[ReferralService] Update role error in Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch live referral stats and history for a given user from Supabase
 */
export async function getPilgrimReferralStats(user) {
  if (!user) return { totalReferrals: 0, totalPoints: 0, referralsList: [] };

  const refCode = (user.referralCode || generateReferralCode(user.uid, user.name)).toUpperCase();

  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_code', refCode)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const referralsList = data || [];
    const totalReferrals = referralsList.length;
    const totalPoints = referralsList.reduce((acc, curr) => acc + (curr.points_awarded || 500), 0) + (user.referredBy ? 500 : 0);

    return {
      totalReferrals,
      totalPoints: Math.max(totalPoints, user.rewardPoints || 0),
      referralsList
    };
  } catch (err) {
    // Graceful offline fallback
    return {
      totalReferrals: user.referralCount || 0,
      totalPoints: user.rewardPoints || (user.referredBy ? 500 : 0),
      referralsList: []
    };
  }
}

/**
 * Category-specific Direct Shareable URLs & Content Definitions
 */
export const REFERRAL_CATEGORIES = [
  {
    id: 'pilgrim',
    label: 'Pilgrim App',
    icon: '🙏',
    badge: '500 Points',
    title: 'Pilgrim Navigation & Temple Darshan',
    desc: 'Share with family & friends for live temple navigation, darshan timings & 500 Brij Points.',
    path: '/?app=user',
    getLink: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `${origin}/?app=user${code ? `&ref=${encodeURIComponent(code)}` : ''}`,
    whatsappMsg: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `Radhe Radhe! 🙏 Join Vrinda Vihar to explore divine temples, get 500 Brij Reward Points & 15% OFF on verified stays & e-rickshaw rides in Vrindavan:\n\n${origin}/?app=user${code ? `&ref=${encodeURIComponent(code)}` : ''}`
  },
  {
    id: 'driver',
    label: 'Driver Partner',
    icon: '🛺',
    badge: '0% Comm',
    title: 'E-Rickshaw, Auto & Cab Partner',
    desc: 'Invite local drivers to earn up to ₹1,90,000/mo with 0% commission & direct pilgrim bookings.',
    path: '/?join=driver&mode=register',
    getLink: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `${origin}/?join=driver&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`,
    whatsappMsg: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `Radhe Radhe! 🛺 Register as a Verified Driver Partner on Vrinda Vihar. 0% Commission Forever & earn up to ₹1,90,000/mo across Vrindavan & Mathura. Register directly here:\n\n${origin}/?join=driver&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`
  },
  {
    id: 'hotel',
    label: 'Hotel & Ashram',
    icon: '🏨',
    badge: '0% Comm',
    title: 'Hotel, Ashram & Stay Desk',
    desc: 'Invite hotel & ashram owners to list rooms with 0% commission and instant payouts.',
    path: '/?join=hotel&mode=register',
    getLink: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `${origin}/?join=hotel&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`,
    whatsappMsg: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `Radhe Radhe! 🏨 List your Hotel, Ashram or Dharamshala on Vrinda Vihar Stay Desk with 0% listing fee & direct pilgrim bookings in Vrindavan. Join here:\n\n${origin}/?join=hotel&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`
  },
  {
    id: 'dining',
    label: 'Dining & Sweets',
    icon: '🍽️',
    badge: 'Sattvic',
    title: 'Bhojnalaya & Sattvic Dining',
    desc: 'Invite restaurant & sweet shop owners to list pure sattvic food for pilgrims.',
    path: '/?join=dining&mode=register',
    getLink: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `${origin}/?join=dining&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`,
    whatsappMsg: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `Radhe Radhe! 🍽️ Partner your Bhojnalaya, Restaurant or Sweets shop on Vrinda Vihar for 100% pure sattvic food lovers across Braj Dham. Register here:\n\n${origin}/?join=dining&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`
  },
  {
    id: 'agency',
    label: 'Yatra Agency',
    icon: '🚩',
    badge: '84 Kos',
    title: 'Yatra & Parikrama Operator',
    desc: 'Invite travel agencies & tour guides for 84 Kos Parikrama and group packages.',
    path: '/?join=agency&mode=register',
    getLink: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `${origin}/?join=agency&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`,
    whatsappMsg: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `Radhe Radhe! 🚩 Register your Yatra Agency or 84 Kos Parikrama Tour Operator on Vrinda Vihar for verified devotee groups. Register here:\n\n${origin}/?join=agency&mode=register${code ? `&ref=${encodeURIComponent(code)}` : ''}`
  },
  {
    id: 'hub',
    label: 'Partner Hub',
    icon: '🏢',
    badge: 'Portal',
    title: 'Partner Operations Dashboard',
    desc: 'Direct link to the unified B2B partner management and operations portal.',
    path: '/?portal=partner',
    getLink: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `${origin}/?portal=partner${code ? `&ref=${encodeURIComponent(code)}` : ''}`,
    whatsappMsg: (code, origin = (typeof window !== 'undefined' ? window.location.origin : '')) =>
      `Radhe Radhe! 🏢 Access the Vrinda Vihar Unified Partner Portal for bookings, operations and fleet tracking:\n\n${origin}/?portal=partner${code ? `&ref=${encodeURIComponent(code)}` : ''}`
  }
];

/**
 * Universal Native Web Share / Clipboard Copy with fallback
 */
export async function shareLinkWithFallback({ title, text, url }) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(url || text);
    return { success: true, method: 'clipboard' };
  }
  return { success: false, method: 'none' };
}
