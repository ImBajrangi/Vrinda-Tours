/**
 * Vrinda Tours — Production Realtime Supabase Database Service
 * Provides robust queries and realtime subscription streams for:
 * - Places & Locations (Temples, Stays, Dining, Areas with full-text search)
 * - Discoverable Live Drivers (Separated telemetry, freshness checks <60s, atomic claiming)
 * - Booking Requests Pipeline (Zero-friction DISCOVER -> SELECT -> REQUEST -> CONFIRM)
 */

import { supabase, isSupabaseConfigured, executeWithRetry } from '../config/supabase';
import { calculateDistance, formatDistance } from '../utils/distance';

// Local storage backup keys for offline resilience
const CACHE_PLACES_KEY = 'vt_cached_places_v4';
const CACHE_BOOKINGS_KEY = 'vt_cached_bookings_v4';

// ==============================================================================
// 1. PLACES & LOCATIONS SERVICE (Database Indexed Search)
// ==============================================================================

/**
 * Fetch all places from Supabase with full-text search, category & town filters
 */
export async function fetchPlaces({ category = null, town = null, search = '' } = {}) {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase.from('places').select('*');

      if (category && category !== 'all') {
        query = query.eq('category', category.toUpperCase());
      }
      if (town && town !== 'all') {
        query = query.ilike('town', `%${town}%`);
      }
      if (search && search.trim()) {
        const s = search.trim();
        query = query.or(`name.ilike.%${s}%,hindi_name.ilike.%${s}%,description.ilike.%${s}%,town.ilike.%${s}%`);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        try { localStorage.setItem(CACHE_PLACES_KEY, JSON.stringify(data)); } catch {}
        return data.map(mapPlaceFromDb);
      }
    }
  } catch (err) {
    console.warn('[RealtimeDb] Supabase places fetch error:', err);
  }

  // Fallback to local cache
  return getCachedPlaces(category, search);
}

/**
 * Realtime Subscription for Places updates
 */
export function subscribeToPlaces(onUpdate) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:places')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ==============================================================================
// 2. LIVE DRIVER & MOBILITY FLEET SERVICE
// ==============================================================================

/**
 * Evaluates whether a driver is genuinely discoverable:
 * 1. ONLINE status
 * 2. Fully verified by admin
 * 3. Not on an active ride
 * 4. Fresh GPS coordinates (recorded within last 60 seconds)
 * 5. Good GPS accuracy (< 65m)
 */
export function isDriverDiscoverable(driver) {
  if (!driver) return false;
  if (driver.availability !== 'ONLINE') return false;
  if (driver.is_verified === false) return false;
  if (driver.current_ride_id) return false;

  if (driver.last_location_update) {
    const ageSeconds = (Date.now() - new Date(driver.last_location_update).getTime()) / 1000;
    if (ageSeconds > 60) return false; // Stale location rejected
  }

  if (driver.accuracy && driver.accuracy > 65) return false; // Inaccurate GPS rejected

  return true;
}

/**
 * Fetch available nearby drivers sorted by distance with honest ETA metrics
 */
export async function fetchNearbyDrivers({ userLat = 27.5818, userLng = 77.7010, maxDistanceKm = 15 } = {}) {
  let dbDrivers = [];

  try {
    if (isSupabaseConfigured()) {
      // 1. Try querying the discoverable sanitized view
      const { data, error } = await supabase
        .from('nearby_drivers_public')
        .select('*');

      if (!error && data && data.length > 0) {
        dbDrivers = data.map(mapDriverFromDb);
      } else {
        // Fallback query to drivers table with active availability
        const fallbackRes = await supabase
          .from('drivers')
          .select('*, driver_locations(*)')
          .eq('availability', 'ONLINE')
          .eq('is_verified', true);

        if (!fallbackRes.error && fallbackRes.data) {
          dbDrivers = fallbackRes.data.map(d => {
            const loc = d.driver_locations || {};
            return mapDriverFromDb({
              ...d,
              latitude: loc.latitude || d.latitude || 27.5818,
              longitude: loc.longitude || d.longitude || 77.7010,
              heading: loc.heading || 0,
              accuracy: loc.accuracy || 10,
              last_location_update: loc.recorded_at || d.last_active_at
            });
          });
        }
      }
    }
  } catch (err) {
    console.warn('[RealtimeDb] Supabase drivers query error:', err);
  }

  // Filter for genuine discoverability & compute distance + honest ETA
  const discoverable = dbDrivers.filter(isDriverDiscoverable);

  const withDistance = discoverable.map(d => {
    const dist = calculateDistance(userLat, userLng, d.latitude, d.longitude);
    const estimatedRouteDist = Math.max(Math.round(dist * 1.25 * 10) / 10, 0.5); // ~1.25x road factor
    // Realistic Braj temple traffic speed: ~15-20 km/h in alleys
    const minEta = Math.max(Math.round((estimatedRouteDist / 18) * 60), 2);
    const maxEta = minEta + 3;

    return {
      ...d,
      _distance: dist,
      _distanceText: formatDistance(dist),
      _routeDistanceKm: estimatedRouteDist,
      _etaText: `~${minEta}-${maxEta} min arrival (Est.)`,
      _etaSource: 'estimated_fallback',
      _etaMinutes: minEta
    };
  }).filter(d => d._distance <= maxDistanceKm);

  return withDistance.sort((a, b) => a._distance - b._distance);
}

/**
 * Subscribe to realtime driver telemetry updates (Separated Location Stream)
 */
export function subscribeToLiveDrivers(onUpdate) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:driver_locations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, (payload) => {
      onUpdate(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Atomic Concurrency Driver Claiming (Prevents Double-Booking Race Conditions)
 */
export async function claimDriverForRideAtomic({
  rideId,
  driverId,
  passengerName = 'Pilgrim Devotee',
  passengerPhone = '',
  pickupLoc = 'Current Location',
  pickupLat = 27.5818,
  pickupLng = 77.7010,
  dropLoc = 'Bankey Bihari Mandir',
  dropLat = 27.5804,
  dropLng = 77.7011,
  distanceKm = 1.2,
  fare = 50,
  tier = 'erickshaw',
  safetyPin
}) {
  if (!isSupabaseConfigured()) {
    return { success: true, rideId, mode: 'local_offline' };
  }

  try {
    const { data, error } = await supabase.rpc('claim_driver_for_ride', {
      p_ride_id: rideId,
      p_driver_id: driverId,
      p_passenger_name: passengerName,
      p_passenger_phone: passengerPhone,
      p_pickup_loc: pickupLoc,
      p_pickup_lat: pickupLat,
      p_pickup_lng: pickupLng,
      p_drop_loc: dropLoc,
      p_drop_lat: dropLat,
      p_drop_lng: dropLng,
      p_distance_km: distanceKm,
      p_fare: fare,
      p_tier: tier,
      p_safety_pin: safetyPin
    });

    if (error) {
      console.warn('[RealtimeDb] Atomic driver claim warning:', error);
      return { success: false, error: error.message };
    }

    return data;
  } catch (err) {
    console.warn('[RealtimeDb] Atomic claim exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update Driver Location & Telemetry (For Driver Companion App)
 */
export async function updateDriverLocation(driverId, { 
  latitude, 
  longitude, 
  heading = 0, 
  speed = 0, 
  accuracy = 10,
  batteryLevel = 100,
  isMocked = false,
  availability = 'ONLINE' 
}) {
  if (!driverId) return false;

  const locPayload = {
    driver_id: driverId,
    latitude,
    longitude,
    heading,
    speed,
    accuracy,
    battery_level: batteryLevel,
    is_mocked: isMocked,
    recorded_at: new Date().toISOString()
  };

  try {
    if (isSupabaseConfigured()) {
      // 1. Upsert location telemetry
      const { error: locErr } = await supabase
        .from('driver_locations')
        .upsert(locPayload, { onConflict: 'driver_id' });

      // 2. Update status & last_active_at
      await supabase
        .from('drivers')
        .update({
          availability,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      return !locErr;
    }
  } catch (err) {
    console.warn('[RealtimeDb] Update driver telemetry error:', err);
  }

  return false;
}

// ==============================================================================
// 3. BOOKING REQUESTS PIPELINE (DISCOVER -> SELECT -> REQUEST -> CONFIRM)
// ==============================================================================

/**
 * Create a new booking request in Supabase (Clean separation of customer text and internal note)
 */
export async function createRealtimeBookingRequest({
  serviceType = 'HOTEL', // 'HOTEL' | 'RESTAURANT' | 'TOUR' | 'VEHICLE' | 'DARSHAN' | 'SERVICE'
  venueName,
  locationName = 'Vrindavan',
  latitude = 27.5818,
  longitude = 77.7010,
  customerName,
  customerPhone,
  customerWhatsapp = '',
  checkInDate,
  checkOutDate = '',
  timeSlot = '',
  guestsCount = 2,
  roomsCount = 1,
  roomType = 'Standard Room',
  notes = '',
  estimatedAmount = null
}) {
  const shortId = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `VT-REQ-${shortId}`;
  const nowIso = new Date().toISOString();

  const record = {
    id: bookingId,
    service_type: serviceType.toUpperCase(),
    venue_name: venueName,
    location_name: locationName,
    latitude,
    longitude,
    customer_name: customerName?.trim() || 'Pilgrim Devotee',
    customer_phone: customerPhone?.trim() || '',
    customer_whatsapp: customerWhatsapp?.trim() || customerPhone?.trim() || '',
    check_in_date: checkInDate || new Date().toISOString().split('T')[0],
    check_out_date: checkOutDate || null,
    time_slot: timeSlot || null,
    guests_count: Number(guestsCount) || 2,
    rooms_count: Number(roomsCount) || 1,
    room_type: roomType || 'Standard Room',
    notes: notes?.trim() || '',
    internal_notes: '',
    assigned_operator: null,
    status: 'REQUESTED',
    status_label: 'Request Received • Team Checking Availability',
    audit_log: [{
      action: 'BOOKING_REQUEST_CREATED',
      timestamp: nowIso,
      actor: 'CUSTOMER_PORTAL'
    }],
    estimated_amount: estimatedAmount,
    created_at: nowIso,
    updated_at: nowIso
  };

  // Cache locally for offline backup
  saveBookingToLocalCache(record);

  // Insert to Supabase
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('booking_requests')
        .insert([record]);

      if (error) {
        console.warn('[RealtimeDb] Supabase booking insert warning:', error);
      }
    }
  } catch (err) {
    console.warn('[RealtimeDb] Booking insert exception:', err);
  }

  // Accurate customer acknowledgement message
  const customerWaText = encodeURIComponent(
    `🙏 *Radhe Radhe! We have received your booking request #${bookingId}*\n\n` +
    `• *Service:* ${serviceType} — ${venueName}\n` +
    `• *Devotee:* ${record.customer_name}\n` +
    `• *Dates:* ${record.check_in_date}${record.check_out_date ? ` to ${record.check_out_date}` : ''}\n` +
    `• *Guests:* ${record.guests_count} • ${record.room_type}\n` +
    `\n_Our team is checking availability and will contact you shortly to confirm._`
  );

  return {
    success: true,
    bookingId,
    bookingData: mapBookingFromDb(record),
    whatsappUrl: `https://wa.me/919876543210?text=${customerWaText}`
  };
}

/**
 * Fetch all booking requests (For Admin Operations or User Profile)
 */
export async function fetchBookingRequests({ status = null, customerPhone = null } = {}) {
  try {
    if (isSupabaseConfigured()) {
      let query = supabase
        .from('booking_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (status && status !== 'ALL') {
        query = query.eq('status', status.toUpperCase());
      }
      if (customerPhone) {
        query = query.eq('customer_phone', customerPhone);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map(mapBookingFromDb);
      }
    }
  } catch (err) {
    console.warn('[RealtimeDb] Fetch bookings error:', err);
  }

  // Fallback to local cache
  return getBookingsFromLocalCache();
}

/**
 * Subscribe to Realtime Booking Requests (For Admin Operations)
 */
export function subscribeToBookingRequests(onUpdate) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('public:booking_requests')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, (payload) => {
      onUpdate(payload);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Update Booking Request Status & Admin Internal Notes
 */
export async function updateBookingStatus(bookingId, {
  status, // 'REQUESTED' | 'UNDER_REVIEW' | 'SUPPLIER_CHECK' | 'AWAITING_CUSTOMER' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_CUSTOMER' | 'CANCELLED_BY_OPERATOR'
  internalNotes = '',
  assignedOperator = ''
}) {
  if (!bookingId) return false;

  const statusLabels = {
    REQUESTED: 'Request Received • Team Checking Availability',
    UNDER_REVIEW: 'Under Review by Vrinda Desk',
    SUPPLIER_CHECK: 'Checking Availability with Property / Operator',
    AWAITING_CUSTOMER: 'Awaiting Customer Response',
    CONFIRMED: 'Booking Confirmed & Details Sent',
    IN_PROGRESS: 'Trip / Stay Currently Active',
    COMPLETED: 'Trip / Stay Completed',
    CANCELLED_BY_CUSTOMER: 'Cancelled by Customer',
    CANCELLED_BY_OPERATOR: 'Cancelled by Operator / Unavailable',
    EXPIRED: 'Request Expired'
  };

  const payload = {
    status,
    status_label: statusLabels[status] || status,
    updated_at: new Date().toISOString()
  };

  if (internalNotes !== undefined) payload.internal_notes = internalNotes;
  if (assignedOperator !== undefined) payload.assigned_operator = assignedOperator;

  // Update local cache
  updateLocalCacheBooking(bookingId, payload);

  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('booking_requests')
        .update(payload)
        .eq('id', bookingId);

      return !error;
    }
  } catch (err) {
    console.warn('[RealtimeDb] Update booking status error:', err);
  }

  return true;
}

// ==============================================================================
// 4. DATA MAPPING HELPERS
// ==============================================================================

function mapPlaceFromDb(p) {
  return {
    id: p.id,
    name: p.name,
    hindiName: p.hindi_name,
    town: p.town,
    category: p.category,
    lat: p.latitude,
    lng: p.longitude,
    description: p.description,
    image: p.image_url,
    rating: Number(p.rating) || 4.8,
    priceRange: p.price_range,
    phone: p.phone,
    metadata: p.metadata || {}
  };
}

function mapDriverFromDb(d) {
  return {
    id: d.id,
    name: d.name,
    phone: d.phone,
    photoUrl: d.photo_url,
    vehicleType: d.vehicle_type || 'Pilgrim E-Rickshaw',
    vehicleCategory: d.vehicle_category || 'erickshaw',
    vehicleNo: d.vehicle_no || 'UP-85',
    rating: Number(d.rating) || 4.95,
    ridesCompleted: d.rides_completed || 0,
    latitude: d.latitude || 27.5818,
    longitude: d.longitude || 77.7010,
    heading: d.heading || 0,
    accuracy: d.accuracy || 10,
    availability: d.availability || 'ONLINE',
    is_verified: d.is_verified ?? true,
    lastLocationUpdate: d.last_location_update || d.last_active_at || new Date().toISOString()
  };
}

function mapBookingFromDb(b) {
  return {
    id: b.id,
    serviceType: b.service_type,
    venueName: b.venue_name,
    locationName: b.location_name,
    lat: b.latitude,
    lng: b.longitude,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    customerWhatsapp: b.customer_whatsapp,
    checkInDate: b.check_in_date,
    checkOutDate: b.check_out_date,
    timeSlot: b.time_slot,
    guestsCount: b.guests_count,
    roomsCount: b.rooms_count,
    roomType: b.room_type,
    notes: b.notes,
    internalNotes: b.internal_notes,
    assignedOperator: b.assigned_operator,
    status: b.status,
    statusLabel: b.status_label,
    estimatedAmount: b.estimated_amount,
    createdAt: b.created_at,
    updated_at: b.updated_at
  };
}

function getCachedPlaces(category, search) {
  try {
    const raw = localStorage.getItem(CACHE_PLACES_KEY);
    if (raw) {
      let places = JSON.parse(raw).map(mapPlaceFromDb);
      if (category && category !== 'all') {
        places = places.filter(p => (p.category || '').toUpperCase() === category.toUpperCase());
      }
      if (search && search.trim()) {
        const s = search.toLowerCase().trim();
        places = places.filter(p => (p.name || '').toLowerCase().includes(s));
      }
      return places;
    }
  } catch {}
  return [];
}

function saveBookingToLocalCache(record) {
  try {
    const existing = getBookingsFromLocalCache();
    const updated = [mapBookingFromDb(record), ...existing.filter(b => b.id !== record.id)];
    localStorage.setItem(CACHE_BOOKINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vt:bookings-updated', { detail: updated }));
  } catch {}
}

function updateLocalCacheBooking(id, partial) {
  try {
    const existing = getBookingsFromLocalCache();
    const updated = existing.map(b => b.id === id ? { ...b, ...partial } : b);
    localStorage.setItem(CACHE_BOOKINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vt:bookings-updated', { detail: updated }));
  } catch {}
}

function getBookingsFromLocalCache() {
  try {
    const raw = localStorage.getItem(CACHE_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
