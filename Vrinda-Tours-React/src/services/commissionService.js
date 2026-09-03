/**
 * Vrinda Tours — Driver Commission & UTR Settlement Service
 * Manages Driver Cash Collections, Platform Commission (10%),
 * Online Payment UTR Submissions, and Admin Approval / Rejection Workflow.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  onSnapshot, 
  query, 
  where
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { supabase } from '../config/supabase';

export const DEFAULT_COMMISSION_PERCENT = 10; // 10% platform commission on cash rides

// Company / Admin Payment Configuration for Drivers
export const ADMIN_PAYMENT_CONFIG = {
  upiId: 'vrindatours@okhdfcbank',
  phonePeNumber: '+91 98765 43210',
  gPayNumber: '+91 98765 43210',
  paytmNumber: '+91 98765 43210',
  accountHolder: 'Vrinda Tours & Yatra Services Pvt Ltd',
  bankName: 'HDFC Bank, Raman Reti Branch, Vrindavan',
  ifscCode: 'HDFC0001008',
  supportPhone: '+91 98765 43210',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='
};

const SETTLEMENTS_STORAGE_KEY = 'vt_driver_settlements_cache';
const DRIVER_DUES_STORAGE_KEY = 'vt_driver_dues_cache';
const BROADCAST_CHANNEL_NAME = 'vt_commission_events';

// BroadcastChannel for instant cross-tab sync
let commissionBroadcast = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    commissionBroadcast = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('[CommissionService] BroadcastChannel init notice:', e);
  }
}

function broadcastEvent(type, data) {
  if (commissionBroadcast) {
    commissionBroadcast.postMessage({ type, data });
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vt:commission-updated', { detail: { type, data } }));
  }
}

function getCachedSettlements() {
  try {
    return JSON.parse(localStorage.getItem(SETTLEMENTS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCachedSettlements(list) {
  try {
    localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

function getCachedDriverDues() {
  try {
    return JSON.parse(localStorage.getItem(DRIVER_DUES_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCachedDriverDues(duesMap) {
  try {
    localStorage.setItem(DRIVER_DUES_STORAGE_KEY, JSON.stringify(duesMap));
  } catch {}
}

/**
 * Calculate platform commission for a given trip fare
 */
export function calculateRideCommission(fare, percent = DEFAULT_COMMISSION_PERCENT) {
  const numericFare = typeof fare === 'number' ? fare : parseInt(String(fare).replace(/\D/g, '')) || 0;
  return Math.max(0, Math.round((numericFare * percent) / 100));
}

/**
 * Record a completed cash ride and add commission to driver's balance
 */
export async function recordCompletedRideCommission(driverId, ride) {
  if (!driverId) return null;

  const fareNum = typeof ride.fare === 'number' ? ride.fare : parseInt(String(ride.fare || '').replace(/\D/g, '')) || 50;
  const commission = calculateRideCommission(fareNum);
  const now = Date.now();

  const rideRecord = {
    rideId: ride.id || `ride_${now}`,
    fare: fareNum,
    commission: commission,
    paymentMethod: ride.paymentMethod || 'cash_upi',
    pickupName: ride.pickupName || 'Pickup Location',
    destName: ride.destName || 'Drop Location',
    passengerName: ride.riderName || ride.passenger || 'Pilgrim Devotee',
    completedAt: now
  };

  // 1. Update local cache
  const duesMap = getCachedDriverDues();
  const current = duesMap[driverId] || {
    commissionDue: 0,
    totalCashCollected: 0,
    totalCommissionPaid: 0,
    ridesCount: 0,
    ridesHistory: []
  };

  const updatedDriverState = {
    ...current,
    commissionDue: (current.commissionDue || 0) + commission,
    totalCashCollected: (current.totalCashCollected || 0) + fareNum,
    ridesCount: (current.ridesCount || 0) + 1,
    ridesHistory: [rideRecord, ...(current.ridesHistory || [])].slice(0, 50)
  };

  duesMap[driverId] = updatedDriverState;
  saveCachedDriverDues(duesMap);
  broadcastEvent('DRIVER_DUE_UPDATED', { driverId, state: updatedDriverState });

  // 2. Update Firestore
  try {
    const driverRef = doc(firestore, 'drivers', driverId);
    const snap = await getDoc(driverRef);
    if (snap.exists()) {
      const data = snap.data();
      const existingHistory = data.commissionRideHistory || [];
      await updateDoc(driverRef, {
        commissionDue: (data.commissionDue || 0) + commission,
        totalCashCollected: (data.totalCashCollected || 0) + fareNum,
        ridesCompletedCount: (data.ridesCompletedCount || 0) + 1,
        commissionRideHistory: [rideRecord, ...existingHistory].slice(0, 50),
        lastTripAt: now
      });
    }
  } catch (err) {
    console.warn('[CommissionService] Firestore driver due update notice:', err);
  }

  // 3. Update Supabase if available
  try {
    await supabase.from('driver_rides').insert({
      driver_id: driverId,
      ride_id: ride.id,
      fare: fareNum,
      commission: commission,
      created_at: new Date().toISOString()
    });
  } catch (err) {}

  return updatedDriverState;
}

/**
 * Driver submits online payment UTR / Transaction ID for verification
 */
export async function submitDriverSettlement({
  driverId,
  driverName,
  driverPhone,
  vehicleNo,
  vehicleType,
  amount,
  utrNumber,
  paymentMethod = 'UPI',
  proofImage = '',
  notes = ''
}) {
  if (!driverId || !amount || !utrNumber) {
    throw new Error('Driver ID, Amount, and UTR Number are required.');
  }

  const cleanUtr = String(utrNumber).trim().toUpperCase();
  const numericAmount = Math.max(1, parseInt(String(amount).replace(/\D/g, '')) || 0);
  const now = Date.now();
  const settlementId = `set_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const settlement = {
    id: settlementId,
    driverId,
    driverName: driverName || 'Sarathi Driver',
    driverPhone: driverPhone || '',
    vehicleNo: vehicleNo || '',
    vehicleType: vehicleType || 'Pilgrim E-Rickshaw',
    amount: numericAmount,
    utrNumber: cleanUtr,
    paymentMethod: paymentMethod || 'UPI',
    proofImage: proofImage || '',
    notes: notes || '',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    createdAt: now,
    updatedAt: now,
    rejectionReason: null,
    reviewedAt: null,
    reviewedBy: null
  };

  // 1. Update Local Storage Cache
  const allSettlements = getCachedSettlements();
  const updatedSettlements = [settlement, ...allSettlements.filter(s => s.id !== settlementId)];
  saveCachedSettlements(updatedSettlements);
  broadcastEvent('SETTLEMENT_SUBMITTED', settlement);

  // 2. Save to Firestore
  try {
    const setRef = doc(firestore, 'driver_settlements', settlementId);
    await setDoc(setRef, settlement);
  } catch (err) {
    console.warn('[CommissionService] Firestore settlement save notice (running local mode):', err);
  }

  // 3. Save to Supabase fallback
  try {
    await supabase.from('driver_settlements').insert({
      id: settlementId,
      driver_id: driverId,
      driver_name: driverName,
      driver_phone: driverPhone,
      amount: numericAmount,
      utr_number: cleanUtr,
      status: 'pending',
      metadata: settlement
    });
  } catch (e) {}

  return settlement;
}

/**
 * Admin Approves Driver's Settlement:
 * Marks settlement 'approved' and deducts the amount from driver's 'commissionDue'
 */
export async function approveSettlement(settlementId, adminNotes = '') {
  if (!settlementId) return null;
  const now = Date.now();

  // 1. Update Local Cache
  const allSettlements = getCachedSettlements();
  let targetSettlement = allSettlements.find(s => s.id === settlementId);

  if (!targetSettlement) {
    try {
      const snap = await getDoc(doc(firestore, 'driver_settlements', settlementId));
      if (snap.exists()) {
        targetSettlement = { id: snap.id, ...snap.data() };
      }
    } catch {}
  }

  if (!targetSettlement) {
    throw new Error('Settlement record not found.');
  }

  const updatedSettlement = {
    ...targetSettlement,
    status: 'approved',
    reviewedAt: now,
    reviewedBy: 'Admin',
    adminNotes: adminNotes || 'Payment verified in bank account',
    updatedAt: now
  };

  const nextSettlements = allSettlements.map(s => s.id === settlementId ? updatedSettlement : s);
  saveCachedSettlements(nextSettlements);

  // 2. Deduct from Driver's Due Balance locally
  const driverId = targetSettlement.driverId;
  const duesMap = getCachedDriverDues();
  if (duesMap[driverId]) {
    const currentDue = duesMap[driverId].commissionDue || 0;
    const currentPaid = duesMap[driverId].totalCommissionPaid || 0;
    duesMap[driverId] = {
      ...duesMap[driverId],
      commissionDue: Math.max(0, currentDue - targetSettlement.amount),
      totalCommissionPaid: currentPaid + targetSettlement.amount,
      lastSettledAt: now
    };
    saveCachedDriverDues(duesMap);
  }

  broadcastEvent('SETTLEMENT_APPROVED', { settlement: updatedSettlement, driverId });

  // 3. Update in Firestore (Settlement + Driver Balance)
  try {
    const setRef = doc(firestore, 'driver_settlements', settlementId);
    await updateDoc(setRef, {
      status: 'approved',
      reviewedAt: now,
      reviewedBy: 'Admin',
      adminNotes: adminNotes || 'Payment verified in bank account',
      updatedAt: now
    });

    if (driverId) {
      const driverRef = doc(firestore, 'drivers', driverId);
      const dSnap = await getDoc(driverRef);
      if (dSnap.exists()) {
        const dData = dSnap.data();
        const currentDue = dData.commissionDue || 0;
        const currentPaid = dData.totalCommissionPaid || 0;
        await updateDoc(driverRef, {
          commissionDue: Math.max(0, currentDue - targetSettlement.amount),
          totalCommissionPaid: currentPaid + targetSettlement.amount,
          lastSettlementApprovedAt: now
        });
      }
    }
  } catch (err) {
    console.warn('[CommissionService] Firestore approve error:', err);
  }

  // 4. Update in Supabase
  try {
    await supabase.from('driver_settlements').update({
      status: 'approved',
      updated_at: new Date().toISOString()
    }).eq('id', settlementId);
  } catch (e) {}

  return updatedSettlement;
}

/**
 * Admin Rejects Driver's Settlement:
 * Marks settlement 'rejected' with reason (e.g. "Amount not received in bank account").
 * Driver's commissionDue is NOT deducted.
 */
export async function rejectSettlement(settlementId, rejectionReason = 'पैसे बैंक खाते में प्राप्त नहीं हुए (Payment not received in bank account)', adminNotes = '') {
  if (!settlementId) return null;
  const now = Date.now();

  // 1. Update Local Cache
  const allSettlements = getCachedSettlements();
  let targetSettlement = allSettlements.find(s => s.id === settlementId);

  if (!targetSettlement) {
    try {
      const snap = await getDoc(doc(firestore, 'driver_settlements', settlementId));
      if (snap.exists()) {
        targetSettlement = { id: snap.id, ...snap.data() };
      }
    } catch {}
  }

  if (!targetSettlement) {
    throw new Error('Settlement record not found.');
  }

  const updatedSettlement = {
    ...targetSettlement,
    status: 'rejected',
    rejectionReason: rejectionReason || 'Payment not verified',
    adminNotes: adminNotes || '',
    reviewedAt: now,
    reviewedBy: 'Admin',
    updatedAt: now
  };

  const nextSettlements = allSettlements.map(s => s.id === settlementId ? updatedSettlement : s);
  saveCachedSettlements(nextSettlements);
  broadcastEvent('SETTLEMENT_REJECTED', { settlement: updatedSettlement, driverId: targetSettlement.driverId });

  // 2. Update Firestore
  try {
    const setRef = doc(firestore, 'driver_settlements', settlementId);
    await updateDoc(setRef, {
      status: 'rejected',
      rejectionReason: rejectionReason || 'Payment not verified',
      adminNotes: adminNotes || '',
      reviewedAt: now,
      reviewedBy: 'Admin',
      updatedAt: now
    });
  } catch (err) {
    console.warn('[CommissionService] Firestore reject error:', err);
  }

  // 3. Update in Supabase
  try {
    await supabase.from('driver_settlements').update({
      status: 'rejected',
      metadata: updatedSettlement,
      updated_at: new Date().toISOString()
    }).eq('id', settlementId);
  } catch (e) {}

  return updatedSettlement;
}

/**
 * Manually adjust a driver's outstanding commission balance (Admin feature)
 */
export async function manuallyAdjustDriverDue(driverId, newDueAmount, adjustmentReason = 'Manual Admin Correction') {
  if (!driverId) return null;
  const cleanAmount = Math.max(0, parseInt(String(newDueAmount).replace(/\D/g, '')) || 0);
  const now = Date.now();

  // Local cache
  const duesMap = getCachedDriverDues();
  if (duesMap[driverId]) {
    duesMap[driverId] = {
      ...duesMap[driverId],
      commissionDue: cleanAmount,
      lastAdjustedAt: now,
      adjustmentReason
    };
    saveCachedDriverDues(duesMap);
  }

  broadcastEvent('DRIVER_DUE_UPDATED', { driverId, dueAmount: cleanAmount });

  // Firestore
  try {
    const driverRef = doc(firestore, 'drivers', driverId);
    await updateDoc(driverRef, {
      commissionDue: cleanAmount,
      lastDueAdjustment: {
        adjustedTo: cleanAmount,
        reason: adjustmentReason,
        adjustedAt: now
      }
    });
  } catch (err) {
    console.warn('[CommissionService] Firestore manual adjustment notice:', err);
  }

  return cleanAmount;
}

/**
 * Subscribe to a specific driver's settlements in real-time
 */
export function subscribeToDriverSettlements(driverId, onUpdate) {
  if (!driverId) return () => {};

  let isUnsubscribed = false;

  // 1. Initial Local Cache
  const localList = getCachedSettlements().filter(s => s.driverId === driverId);
  onUpdate(localList);

  // 2. Broadcast & Window Listener
  const handleLocal = () => {
    if (isUnsubscribed) return;
    const current = getCachedSettlements().filter(s => s.driverId === driverId);
    onUpdate(current);
  };
  window.addEventListener('vt:commission-updated', handleLocal);

  // 3. Firestore onSnapshot
  let unsubFirestore = () => {};
  try {
    const q = query(
      collection(firestore, 'driver_settlements'),
      where('driverId', '==', driverId)
    );

    unsubFirestore = onSnapshot(q, (snapshot) => {
      if (isUnsubscribed) return;
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      // Update local cache
      const cached = getCachedSettlements().filter(s => s.driverId !== driverId);
      saveCachedSettlements([...list, ...cached]);
      
      onUpdate(list);
    }, () => {
      const current = getCachedSettlements().filter(s => s.driverId === driverId);
      onUpdate(current);
    });
  } catch (e) {}

  return () => {
    isUnsubscribed = true;
    window.removeEventListener('vt:commission-updated', handleLocal);
    unsubFirestore();
  };
}

/**
 * Subscribe to all settlements for Admin Console in real-time
 */
export function subscribeToAllSettlements(onUpdate) {
  let isUnsubscribed = false;

  // 1. Initial Local Cache
  const localList = getCachedSettlements();
  onUpdate(localList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));

  // 2. Window Listener
  const handleLocal = () => {
    if (isUnsubscribed) return;
    const current = getCachedSettlements();
    onUpdate(current.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
  };
  window.addEventListener('vt:commission-updated', handleLocal);

  // 3. Firestore onSnapshot
  let unsubFirestore = () => {};
  try {
    const col = collection(firestore, 'driver_settlements');
    unsubFirestore = onSnapshot(col, (snapshot) => {
      if (isUnsubscribed) return;
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      saveCachedSettlements(list);
      onUpdate(list);
    }, () => {
      const current = getCachedSettlements();
      onUpdate(current.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });
  } catch (e) {}

  return () => {
    isUnsubscribed = true;
    window.removeEventListener('vt:commission-updated', handleLocal);
    unsubFirestore();
  };
}

/**
 * Generate a dynamic UPI payment QR Code URL
 */
export function getUpiQrCodeUrl(amount, payeeName = 'Vrinda Tours Admin') {
  const upiUrl = `upi://pay?pa=${encodeURIComponent(ADMIN_PAYMENT_CONFIG.upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount || ''}&cu=INR&tn=DriverCommissionSettlement`;
  return `${ADMIN_PAYMENT_CONFIG.qrCodeUrl}${encodeURIComponent(upiUrl)}`;
}
