/**
 * Vrinda Tours — Real-Time Ride Matching & Lifecycle Service
 * Bridges Riders and Drivers across Supabase Postgres, Firebase Firestore, LocalStorage & Multi-Tab Broadcast
 */

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs,
  deleteField 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { supabase, TABLES } from '../config/supabase';
import { calculateDistance } from '../utils/distance';

const STORAGE_KEY = 'vt_active_ride_request';
const DRIVER_SKIPPED_KEY = 'vt_driver_skipped_rides';
const BROADCAST_CHANNEL_NAME = 'vt_ride_events';

// BroadcastChannel for instant cross-tab sync
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('[RideService] BroadcastChannel not supported:', e);
  }
}

/**
 * Play a sweet devotional notification chime via Web Audio API
 */
export function playRideNotificationChime() {
  if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    
    // Smooth pleasant chord (C5 - G5 - C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.65);
    });
  } catch (e) {
    // Audio autostart policy
  }
}

/**
 * Trigger browser system notification if permitted
 */
export async function sendBrowserNotification(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/official-logo.svg',
        badge: '/official-logo.svg',
        ...options
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          icon: '/official-logo.svg',
          badge: '/official-logo.svg',
          ...options
        });
      }
    }
  } catch (err) {
    console.warn('[RideService] Notification error:', err);
  }
}

/**
 * Save active ride to LocalStorage
 */
export function persistLocalRide(rideData) {
  if (typeof window === 'undefined') return;
  if (!rideData) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rideData));
  }
  
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'RIDE_UPDATED', data: rideData });
  }
  window.dispatchEvent(new CustomEvent('vt:ride-updated', { detail: rideData }));
}

/**
 * Get active ride from LocalStorage
 */
export function getPersistedLocalRide() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Create a new Pilgrim ride request across Supabase & Firestore
 */
export async function createRideRequest(requestData) {
  const rideId = `ride_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const fullRide = {
    id: rideId,
    pickupName: requestData.pickupName || 'Current GPS Location',
    pickupLat: requestData.pickupLat || 27.5804,
    pickupLng: requestData.pickupLng || 77.7011,
    destName: requestData.destName || 'Shri Bankey Bihari Mandir',
    destLat: requestData.destLat || 27.5804,
    destLng: requestData.destLng || 77.7011,
    tier: requestData.tier || 'erickshaw',
    tierName: requestData.tierName || 'Pilgrim E-Rickshaw',
    fare: requestData.fare || 50,
    paymentMethod: requestData.paymentMethod || 'cash_upi',
    safetyPin: requestData.safetyPin || Math.floor(1000 + Math.random() * 9000).toString(),
    status: 'searching', // 'searching' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
    riderName: requestData.riderName || 'Braj Pilgrim',
    riderPhone: requestData.riderPhone || '',
    landmarkNote: requestData.landmarkNote || '',
    driver: null,
    createdAt: now,
    updatedAt: now
  };

  persistLocalRide(fullRide);

  // 1. Save to Supabase 'ride_requests' table
  try {
    await supabase.from(TABLES.RIDE_REQUESTS).upsert({
      id: rideId,
      passenger_name: fullRide.riderName,
      passenger_phone: fullRide.riderPhone,
      pickup_location: fullRide.pickupName,
      drop_location: fullRide.destName,
      distance: '1.2 km',
      fare: `₹${fullRide.fare}`,
      status: 'pending',
      safety_pin: fullRide.safetyPin,
      tier: fullRide.tier,
      payment_method: fullRide.paymentMethod,
      landmark_note: fullRide.landmarkNote,
      metadata: fullRide
    });
  } catch (err) {
    console.warn('[RideService] Supabase insert warning:', err);
  }

  // 2. Save to Firestore 'ride_requests' collection
  try {
    const rideRef = doc(firestore, 'ride_requests', rideId);
    await setDoc(rideRef, fullRide);
  } catch (err) {
    console.warn('[RideService] Firestore save error, running in local-sync mode:', err);
  }

  return fullRide;
}

/**
 * Listen to status of a specific ride request (for Rider)
 */
export function subscribeToRideRequest(rideId, onUpdate) {
  if (!rideId) return () => {};

  let isUnsubscribed = false;

  // 1. Listen to LocalStorage & Window Events
  const handleLocalUpdate = (e) => {
    if (isUnsubscribed) return;
    const current = getPersistedLocalRide();
    if (current && current.id === rideId) {
      onUpdate(current);
    }
  };

  window.addEventListener('vt:ride-updated', handleLocalUpdate);

  // 2. Listen to Supabase Realtime changes
  let sbChannel = null;
  try {
    sbChannel = supabase
      .channel(`ride_req_${rideId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: TABLES.RIDE_REQUESTS,
        filter: `id=eq.${rideId}`
      }, (payload) => {
        if (isUnsubscribed) return;
        const newRecord = payload.new;
        if (newRecord && newRecord.metadata) {
          persistLocalRide(newRecord.metadata);
          onUpdate(newRecord.metadata);
        }
      })
      .subscribe();
  } catch (e) {}

  // 3. Listen to Firestore Realtime Updates
  let unsubFirestore = () => {};
  try {
    const rideRef = doc(firestore, 'ride_requests', rideId);
    unsubFirestore = onSnapshot(rideRef, (docSnap) => {
      if (isUnsubscribed) return;
      if (docSnap.exists()) {
        const data = docSnap.data();
        persistLocalRide(data);
        onUpdate(data);
      } else {
        const local = getPersistedLocalRide();
        if (local && local.id === rideId && local.status !== 'cancelled') {
          onUpdate(local);
        }
      }
    }, (err) => {
      console.warn('[RideService] Firestore ride listener notice:', err);
    });
  } catch (e) {}

  return () => {
    isUnsubscribed = true;
    window.removeEventListener('vt:ride-updated', handleLocalUpdate);
    if (sbChannel) supabase.removeChannel(sbChannel);
    unsubFirestore();
  };
}

/**
 * Listen to all available nearby ride requests (for Drivers in Driver Portal)
 */
export function subscribeToAvailableRides(driverPosition, onListUpdate) {
  let isUnsubscribed = false;

  const getSkippedRides = () => {
    try {
      return JSON.parse(sessionStorage.getItem(DRIVER_SKIPPED_KEY) || '[]');
    } catch {
      return [];
    }
  };

  const filterAndFormatRides = (ridesArray) => {
    const skipped = getSkippedRides();
    return ridesArray
      .filter(r => (r.status === 'searching' || r.status === 'requested' || r.status === 'pending') && !skipped.includes(r.id))
      .map(r => {
        let distKm = 0.8;
        if (driverPosition?.lat && driverPosition?.lng && r.pickupLat && r.pickupLng) {
          distKm = calculateDistance(driverPosition.lat, driverPosition.lng, r.pickupLat, r.pickupLng);
        }
        return {
          ...r,
          _distKm: distKm,
          _distText: `${distKm.toFixed(1)} km away`
        };
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  };

  // Initial local check
  const local = getPersistedLocalRide();
  if (local) {
    onListUpdate(filterAndFormatRides([local]));
  }

  // Realtime Supabase changes listener
  let sbChannel = null;
  try {
    sbChannel = supabase
      .channel('supabase_realtime_rides_feed')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: TABLES.RIDE_REQUESTS
      }, async () => {
        if (isUnsubscribed) return;
        try {
          const { data } = await supabase
            .from(TABLES.RIDE_REQUESTS)
            .select('*')
            .in('status', ['pending', 'searching', 'requested'])
            .order('created_at', { ascending: false });

          if (data && Array.isArray(data)) {
            const mapped = data.map(d => ({
              ...(d.metadata || {}),
              id: d.id,
              pickupName: d.pickup_location,
              destName: d.drop_location,
              fare: parseInt((d.fare || '').replace(/\D/g, '')) || 50,
              tierName: d.tier === 'erickshaw' ? 'Pilgrim E-Rickshaw' : 'Braj Auto Plus',
              status: d.status
            }));
            onListUpdate(filterAndFormatRides(mapped));
          }
        } catch (e) {}
      })
      .subscribe();
  } catch (e) {}

  // Realtime Firestore listener
  let unsubFirestore = () => {};
  try {
    const ridesCol = collection(firestore, 'ride_requests');
    const q = query(ridesCol, where('status', 'in', ['searching', 'requested']));
    
    unsubFirestore = onSnapshot(q, (snapshot) => {
      if (isUnsubscribed) return;
      const list = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });

      const currentLocal = getPersistedLocalRide();
      if (currentLocal && (currentLocal.status === 'searching' || currentLocal.status === 'requested')) {
        if (!list.find(r => r.id === currentLocal.id)) {
          list.push(currentLocal);
        }
      }

      onListUpdate(filterAndFormatRides(list));
    }, () => {
      const currentLocal = getPersistedLocalRide();
      if (currentLocal) {
        onListUpdate(filterAndFormatRides([currentLocal]));
      }
    });
  } catch (err) {
    const currentLocal = getPersistedLocalRide();
    if (currentLocal) {
      onListUpdate(filterAndFormatRides([currentLocal]));
    }
  }

  // Cross-tab broadcast listener
  const handleBroadcast = (e) => {
    if (isUnsubscribed) return;
    const currentLocal = getPersistedLocalRide();
    if (currentLocal) {
      onListUpdate(filterAndFormatRides([currentLocal]));
    }
  };
  window.addEventListener('vt:ride-updated', handleBroadcast);

  return () => {
    isUnsubscribed = true;
    window.removeEventListener('vt:ride-updated', handleBroadcast);
    if (sbChannel) supabase.removeChannel(sbChannel);
    unsubFirestore();
  };
}

/**
 * Driver accepts a ride request
 */
export async function acceptRideByDriver(rideId, driver) {
  const now = Date.now();
  const updatedDriver = {
    id: driver.id || 'drv_accepted',
    name: driver.name || 'Shyam Sundar Sharma',
    phone: driver.phone || '+91 98765 43210',
    vehicleNo: driver.vehicleNo || 'UP-85-BV-1008',
    vehicleType: driver.vehicleType || 'Pilgrim E-Rickshaw',
    rating: driver.rating || '4.9',
    photo: driver.photo || driver.avatar || ''
  };

  const updatedRide = {
    ...(getPersistedLocalRide() || {}),
    id: rideId,
    status: 'accepted',
    driver: updatedDriver,
    acceptedAt: now,
    updatedAt: now
  };

  persistLocalRide(updatedRide);

  // 1. Update in Supabase
  try {
    await supabase.from(TABLES.RIDE_REQUESTS).update({
      status: 'accepted',
      driver_id: updatedDriver.id,
      metadata: updatedRide,
      updated_at: new Date().toISOString()
    }).eq('id', rideId);
  } catch (err) {
    console.warn('[RideService] Supabase accept update notice:', err);
  }

  // 2. Update in Firestore
  try {
    const rideRef = doc(firestore, 'ride_requests', rideId);
    await updateDoc(rideRef, {
      status: 'accepted',
      driver: updatedDriver,
      updatedAt: now
    });

    if (driver.id && driver.id !== 'demo') {
      const driverRef = doc(firestore, 'drivers', driver.id);
      await updateDoc(driverRef, {
        status: 'busy',
        currentRide: updatedRide
      });
    }
  } catch (err) {
    console.warn('[RideService] Accept ride firestore sync notice:', err);
  }

  // Notify and play chime
  playRideNotificationChime();
  sendBrowserNotification('🎉 Driver Assigned!', {
    body: `${updatedDriver.name} (${updatedDriver.vehicleNo}) is on the way for your Braj Yatra.`
  });

  return updatedRide;
}

/**
 * Driver rejects/skips a ride request
 */
export function skipRideByDriver(rideId) {
  try {
    const skipped = JSON.parse(sessionStorage.getItem(DRIVER_SKIPPED_KEY) || '[]');
    if (!skipped.includes(rideId)) {
      skipped.push(rideId);
      sessionStorage.setItem(DRIVER_SKIPPED_KEY, JSON.stringify(skipped));
    }
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('vt:ride-updated', { detail: { skippedRideId: rideId } }));
}

/**
 * Driver marks arrived at pickup point
 */
export async function markDriverArrived(rideId, driverId) {
  const current = getPersistedLocalRide() || {};
  const updated = {
    ...current,
    id: rideId,
    status: 'driver_arrived',
    updatedAt: Date.now()
  };

  persistLocalRide(updated);

  // 1. Update Supabase
  try {
    await supabase.from(TABLES.RIDE_REQUESTS).update({
      status: 'driver_arrived',
      metadata: updated,
      updated_at: new Date().toISOString()
    }).eq('id', rideId);
  } catch (err) {}

  // 2. Update Firestore
  try {
    const rideRef = doc(firestore, 'ride_requests', rideId);
    await updateDoc(rideRef, {
      status: 'driver_arrived',
      updatedAt: Date.now()
    });

    if (driverId) {
      const driverRef = doc(firestore, 'drivers', driverId);
      await updateDoc(driverRef, {
        'currentRide.status': 'driver_arrived'
      });
    }
  } catch (err) {}

  playRideNotificationChime();
  sendBrowserNotification('🛺 Driver Arrived at Pickup!', {
    body: 'Your Sarathi has reached your pickup location. Please meet your driver.'
  });

  return updated;
}

/**
 * Driver completes the ride
 */
export async function completeRide(rideId, driverId) {
  const current = getPersistedLocalRide() || {};
  const updated = {
    ...current,
    id: rideId,
    status: 'completed',
    completedAt: Date.now()
  };

  persistLocalRide(updated);

  // 1. Update Supabase
  try {
    await supabase.from(TABLES.RIDE_REQUESTS).update({
      status: 'completed',
      metadata: updated,
      updated_at: new Date().toISOString()
    }).eq('id', rideId);
  } catch (err) {}

  // 2. Update Firestore
  try {
    const rideRef = doc(firestore, 'ride_requests', rideId);
    await updateDoc(rideRef, {
      status: 'completed',
      completedAt: Date.now()
    });

    if (driverId) {
      const driverRef = doc(firestore, 'drivers', driverId);
      await updateDoc(driverRef, {
        status: 'available',
        currentRide: deleteField()
      });
    }
  } catch (err) {}

  return updated;
}

/**
 * Cancel the active ride request
 */
export async function cancelRideRequest(rideId, driverId) {
  persistLocalRide(null);

  // 1. Update Supabase
  try {
    if (rideId) {
      await supabase.from(TABLES.RIDE_REQUESTS).update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      }).eq('id', rideId);
    }
  } catch (err) {}

  // 2. Update Firestore
  try {
    if (rideId) {
      const rideRef = doc(firestore, 'ride_requests', rideId);
      await updateDoc(rideRef, {
        status: 'cancelled',
        cancelledAt: Date.now()
      });
    }

    if (driverId) {
      const driverRef = doc(firestore, 'drivers', driverId);
      await updateDoc(driverRef, {
        status: 'available',
        currentRide: deleteField()
      });
    }
  } catch (err) {}
}
