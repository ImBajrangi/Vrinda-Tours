import { useState, useMemo } from 'react';
import { X, MessageCircle, Phone, BedDouble, Star } from 'lucide-react';
import { openWhatsApp, generateHotelMessage } from '../../utils/whatsapp';
import './BookingSheets.css';

export default function HotelBooking({ location, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; }, []);

  const [checkin, setCheckin] = useState(today);
  const [checkout, setCheckout] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState((location?.roomTypes || ['Standard'])[0]);

  if (!location) return null;

  const priceMap = { Standard: '₹800', Deluxe: '₹1500', Suite: '₹3000' };
  const roomTypes = location.roomTypes || ['Standard', 'Deluxe', 'Suite'];

  const handleBook = () => {
    const msg = generateHotelMessage(location, checkin, checkout, guests, roomType);
    openWhatsApp(location.phone, msg);
    onClose();
  };

  return (
    <>
      <div className="booking-overlay visible" onClick={onClose} />
      <div className="booking-sheet visible">
        <div className="booking-sheet-handle" />
        <div className="booking-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BedDouble size={20} />
            <h3>Book a Room</h3>
          </div>
          <button className="booking-sheet-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="booking-sheet-body">
          <div className="booking-venue-info">
            <div className="booking-venue-img" style={{ backgroundImage: `url(${location.image})` }} />
            <div className="booking-venue-details">
              <h4>{location.name}</h4>
              <div className="venue-meta">
                <span className="rating-badge"><Star size={12} fill="currentColor" /> {location.rating || '4.5'}</span>
                <span className="price-badge">{location.priceRange || '₹800 - ₹3000'}</span>
              </div>
            </div>
          </div>
          <div className="booking-form">
            <div className="booking-field-row">
              <div className="booking-field">
                <label>Check-in</label>
                <input type="date" value={checkin} min={today} onChange={(e) => setCheckin(e.target.value)} />
              </div>
              <div className="booking-field">
                <label>Check-out</label>
                <input type="date" value={checkout} min={checkin || today} onChange={(e) => setCheckout(e.target.value)} />
              </div>
            </div>
            <div className="booking-field">
              <label>Guests</label>
              <div className="guest-counter">
                <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))}>−</button>
                <span className="guest-count">{guests}</span>
                <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))}>+</button>
              </div>
            </div>
            <div className="booking-field">
              <label>Room Type</label>
              <div className="room-types">
                {roomTypes.map((rt) => (
                  <div key={rt} className={`room-type-card ${roomType === rt ? 'selected' : ''}`} onClick={() => setRoomType(rt)}>
                    <div className="room-name">{rt}</div>
                    <div className="room-price">{priceMap[rt] || '₹1000'}/night</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="booking-actions">
              <button className="btn-whatsapp" onClick={handleBook}>
                <MessageCircle size={18} /> Book via WhatsApp
              </button>
              <button className="btn-call-booking" onClick={() => window.open(`tel:${location.phone}`)}>
                <Phone size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
