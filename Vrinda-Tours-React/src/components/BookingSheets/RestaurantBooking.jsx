import { useState } from 'react';
import { X, MessageCircle, Phone, Utensils, Star } from 'lucide-react';
import { openWhatsApp, generateRestaurantMessage } from '../../utils/whatsapp';
import './BookingSheets.css';

export default function RestaurantBooking({ location, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('12:00');
  const [guests, setGuests] = useState(2);
  const [special, setSpecial] = useState('');

  if (!location) return null;

  const handleBook = () => {
    const msg = generateRestaurantMessage(location, date, time, guests, special);
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
            <Utensils size={20} />
            <h3>Reserve a Table</h3>
          </div>
          <button className="booking-sheet-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="booking-sheet-body">
          <div className="booking-venue-info">
            <div className="booking-venue-img" style={{ backgroundImage: `url(${location.image})` }} />
            <div className="booking-venue-details">
              <h4>{location.name}</h4>
              <div className="venue-meta">
                <span className="rating-badge"><Star size={12} fill="currentColor" /> {location.rating || '4.2'}</span>
                <span className="price-badge">{location.priceRange || '₹100 - ₹500'}</span>
                <span className="cuisine-tag">{location.cuisine || 'Vegetarian'}</span>
              </div>
            </div>
          </div>
          <div className="booking-form">
            <div className="booking-field-row">
              <div className="booking-field">
                <label>Date</label>
                <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="booking-field">
                <label>Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div className="booking-field">
              <label>Guests</label>
              <div className="guest-counter">
                <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))}>−</button>
                <span className="guest-count">{guests}</span>
                <button type="button" onClick={() => setGuests(Math.min(20, guests + 1))}>+</button>
              </div>
            </div>
            <div className="booking-field">
              <label>Special Requests <span style={{ fontWeight: 400, color: '#9e9e9e', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input type="text" value={special} onChange={(e) => setSpecial(e.target.value)} placeholder="Dietary needs, celebration, etc." />
            </div>
            <div className="booking-actions">
              <button className="btn-whatsapp" onClick={handleBook}>
                <MessageCircle size={18} /> Reserve via WhatsApp
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
