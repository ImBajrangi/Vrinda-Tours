/**
 * Vrinda Travels — Friction-Free Booking Request Service
 * Handles Hotel, Restaurant, Tour Package, Yatra, and Cab booking enquiries
 * Stores requests in Firestore and LocalStorage with zero upfront payment complexity
 */

import { collection, doc, setDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { playRideNotificationChime, sendBrowserNotification } from './rideService';

const LOCAL_BOOKINGS_KEY = 'vt_my_booking_requests';
const SUPPORT_PHONE = '919876543210'; // Vrinda Travels Booking Desk

/**
 * Get all local cached booking requests for current user
 */
export function getLocalUserBookings() {
  try {
    const raw = localStorage.getItem(LOCAL_BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save booking locally
 */
export function saveLocalUserBooking(booking) {
  try {
    const existing = getLocalUserBookings();
    const filtered = existing.filter(b => b.id !== booking.id);
    const updated = [booking, ...filtered].slice(0, 30);
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vt:bookings-updated', { detail: updated }));
    return updated;
  } catch (e) {
    console.warn('[BookingService] Failed to cache booking locally:', e);
    return [];
  }
}

/**
 * Submit an easy "Request Booking" (No upfront payment / friction)
 */
export async function createBookingRequest({
  type = 'hotel', // 'hotel' | 'restaurant' | 'tour' | 'cab' | 'guide'
  venueName,
  venueImage,
  customerName,
  customerPhone,
  customerWhatsapp,
  checkInDate,
  checkOutDate,
  preferredTime,
  guests = 2,
  rooms = 1,
  roomType = 'Standard',
  specialNotes = '',
  estimatedAmount = null
}) {
  const shortId = Math.floor(1000 + Math.random() * 9000);
  const bookingId = `VT-REQ-${shortId}`;
  const timestamp = Date.now();

  const bookingData = {
    id: bookingId,
    type,
    venueName: venueName || 'Vrinda Travels Service',
    venueImage: venueImage || '',
    customerName: customerName?.trim() || 'Pilgrim Devotee',
    customerPhone: customerPhone?.trim() || '',
    customerWhatsapp: customerWhatsapp?.trim() || customerPhone?.trim() || '',
    checkInDate: checkInDate || new Date().toISOString().split('T')[0],
    checkOutDate: checkOutDate || '',
    preferredTime: preferredTime || '',
    guests: Number(guests) || 2,
    rooms: Number(rooms) || 1,
    roomType: roomType || 'Standard',
    specialNotes: specialNotes?.trim() || '',
    estimatedAmount: estimatedAmount || null,
    status: 'pending_reachout', // 'pending_reachout' | 'confirmed' | 'cancelled'
    statusLabel: 'Request Placed • Team reaching out soon',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  // 1. Save to LocalStorage immediately for instant UX feedback
  saveLocalUserBooking(bookingData);

  // 2. Play Devotional Confirmation Sound
  playRideNotificationChime();

  // 3. Send Browser notification if enabled
  sendBrowserNotification(`Booking Request ${bookingId} Placed!`, {
    body: `Hare Krishna ${bookingData.customerName}! Our Vrinda Travels team is reviewing your reservation for ${bookingData.venueName}.`
  });

  // 4. Persist to Firebase Firestore collection 'booking_requests'
  try {
    const colRef = collection(firestore, 'booking_requests');
    await setDoc(doc(colRef, bookingId), bookingData);
  } catch (err) {
    console.warn('[BookingService] Firestore offline save fallback:', err);
  }

  // 5. Generate formatted WhatsApp link for direct instant chat
  const waMessage = encodeURIComponent(
    `🙏 *Radhe Radhe! New Booking Request #${bookingId}*\n\n` +
    `• *Service:* ${type.toUpperCase()} — ${bookingData.venueName}\n` +
    `• *Name:* ${bookingData.customerName}\n` +
    `• *Phone:* ${bookingData.customerPhone}\n` +
    `• *Date:* ${bookingData.checkInDate}${bookingData.checkOutDate ? ` to ${bookingData.checkOutDate}` : ''}\n` +
    `• *Guests:* ${bookingData.guests} | *Room/Table:* ${bookingData.roomType || 'Standard'}\n` +
    (bookingData.specialNotes ? `• *Special Note:* ${bookingData.specialNotes}\n` : '') +
    `\n_Please confirm my reservation details & payment options._`
  );

  const whatsappUrl = `https://wa.me/${SUPPORT_PHONE}?text=${waMessage}`;

  return {
    success: true,
    bookingId,
    bookingData,
    whatsappUrl
  };
}

/**
 * Cancel user booking request
 */
export async function cancelUserBooking(bookingId) {
  try {
    const existing = getLocalUserBookings();
    const updated = existing.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: 'cancelled', statusLabel: 'Cancelled' };
      }
      return b;
    });
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vt:bookings-updated', { detail: updated }));

    try {
      const docRef = doc(firestore, 'booking_requests', bookingId);
      await updateDoc(docRef, { status: 'cancelled', updatedAt: Date.now() });
    } catch {}

    return true;
  } catch (e) {
    console.error('[BookingService] Cancel error:', e);
    return false;
  }
}
