function cleanPhone(phone) {
  let p = (phone || '').replace(/[^0-9]/g, '');
  if (p.startsWith('0')) p = '91' + p.slice(1);
  if (!p.startsWith('91') && p.length === 10) p = '91' + p;
  return p;
}

export function openWhatsApp(phone, message) {
  const url = `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function generateHotelMessage(loc, checkin, checkout, guests, roomType) {
  return `🙏 *Vrinda Tours — Room Booking Request*\n\n🏨 *Hotel*: ${loc.name}\n📅 *Check-in*: ${checkin}\n📅 *Check-out*: ${checkout}\n👥 *Guests*: ${guests}\n🛏️ *Room Type*: ${roomType}\n\nPlease confirm availability and rate. 🙏`;
}

export function generateRestaurantMessage(loc, date, time, guests, special) {
  let msg = `🙏 *Vrinda Tours — Table Reservation*\n\n🍽️ *Restaurant*: ${loc.name}\n📅 *Date*: ${date}\n🕐 *Time*: ${time}\n👥 *Guests*: ${guests}`;
  if (special) msg += `\n📝 *Special Request*: ${special}`;
  msg += `\n\nPlease confirm the reservation. 🙏`;
  return msg;
}

export function generateRideMessage(userLocation, dest) {
  let msg = `🙏 *Vrinda Tours Ride Request*\n\n`;
  msg += `📍 *Pickup*: ${userLocation ? `Maps: https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}` : 'Barsana Center'}\n`;
  if (dest) msg += `🏁 *Destination*: ${dest.name}\n`;
  msg += `\nPlease confirm if you can pick me up. 🙏`;
  return msg;
}
