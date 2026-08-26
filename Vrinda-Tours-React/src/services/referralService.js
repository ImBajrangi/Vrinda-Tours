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
