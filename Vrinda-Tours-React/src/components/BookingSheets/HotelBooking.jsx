import { useState, useMemo } from 'react';
import { X, MessageCircle, Phone, BedDouble, Star, Calendar, Users, ShieldCheck, Check } from 'lucide-react';
import { openWhatsApp, generateHotelMessage } from '../../utils/whatsapp';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import './BookingSheets.css';

export default function HotelBooking({ location, onClose }) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const dayAfterStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkin, setCheckin] = useState(todayStr);
  const [checkout, setCheckout] = useState(tomorrowStr);
  const [isCustomStay, setIsCustomStay] = useState(false);
  const [stayPreset, setStayPreset] = useState('tonight'); // 'tonight' | '2nights' | 'custom'

  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState((location?.roomTypes || ['Standard'])[0]);

  if (!location) return null;

  const priceMap = { 
    Standard: location.priceRange?.split('-')[0]?.trim() || '₹800', 
    Deluxe: '₹1,500', 
    Suite: '₹2,800',
    'Executive Room': '₹2,200',
    'Family Suite': '₹3,500'
  };
  
  const roomTypes = location.roomTypes || ['Standard Room', 'Deluxe AC Room', 'Pilgrim Suite'];

  const handleStayPreset = (type) => {
    setStayPreset(type);
    if (type === 'tonight') {
      setCheckin(todayStr);
      setCheckout(tomorrowStr);
      setIsCustomStay(false);
    } else if (type === '2nights') {
      setCheckin(todayStr);
      setCheckout(dayAfterStr);
      setIsCustomStay(false);
    } else {
      setIsCustomStay(true);
    }
  };

  const handleBook = () => {
    const msg = generateHotelMessage(location, checkin, checkout, guests, roomType);
    openWhatsApp(location.phone, msg);
    triggerClose();
  };

  return (
    <>
      <div className="booking-overlay visible" onClick={triggerClose} />
      <div 
        className={`booking-sheet visible ${isDragging ? 'dragging' : ''}`}
        style={sheetStyle}
      >
        <div className="booking-sheet-handle-wrapper" {...handleProps} title="Drag down to dismiss">
          <div className="booking-sheet-handle" />
        </div>

        <div className="booking-sheet-header">
          <div className="sheet-title-group">
            <div className="sheet-title-icon">
              <BedDouble size={18} />
            </div>
            <div>
              <h3>Book a Stay</h3>
              <span className="sheet-subtitle">Direct hotel booking with zero platform fee</span>
            </div>
          </div>
          <button className="booking-sheet-close" onClick={triggerClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="booking-sheet-body">
          {/* Venue Overview */}
          <div className="booking-venue-info">
            <div 
              className="booking-venue-img" 
              style={{ backgroundImage: `url(${location.image})` }} 
            />
            <div className="booking-venue-details">
              <div className="venue-title-row">
                <h4>{location.name}</h4>
                <span className="venue-verified-badge"><ShieldCheck size={11} /> Verified</span>
              </div>
              <div className="venue-meta">
                <span className="rating-badge">
                  <Star size={11} fill="currentColor" /> {location.rating || '4.5'}
                </span>
                <span className="price-badge">{location.priceRange || '₹800 - ₹3,000'} / night</span>
              </div>
            </div>
          </div>

          <div className="booking-form">
            {/* Quick Stay Selector */}
            <div className="booking-section">
              <label className="section-label">
                <Calendar size={13} /> Stay Duration
              </label>
              <div className="chips-row">
                <button
                  type="button"
                  className={`smart-chip ${stayPreset === 'tonight' ? 'active' : ''}`}
                  onClick={() => handleStayPreset('tonight')}
                >
                  Tonight (1 Night)
                </button>
                <button
                  type="button"
                  className={`smart-chip ${stayPreset === '2nights' ? 'active' : ''}`}
                  onClick={() => handleStayPreset('2nights')}
                >
                  2 Nights
                </button>
                <button
                  type="button"
                  className={`smart-chip ${stayPreset === 'custom' ? 'active' : ''}`}
                  onClick={() => handleStayPreset('custom')}
                >
                  Custom Dates...
                </button>
              </div>
              {isCustomStay && (
                <div className="booking-field-row custom-stay-dates">
                  <div className="booking-field">
                    <span className="sub-field-lbl">Check-In</span>
                    <input 
                      type="date" 
                      value={checkin} 
                      min={todayStr} 
                      onChange={(e) => setCheckin(e.target.value)} 
                      className="smart-input"
                    />
                  </div>
                  <div className="booking-field">
                    <span className="sub-field-lbl">Check-Out</span>
                    <input 
                      type="date" 
                      value={checkout} 
                      min={checkin || todayStr} 
                      onChange={(e) => setCheckout(e.target.value)} 
                      className="smart-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Room Type Segmented Grid */}
            <div className="booking-section">
              <label className="section-label">
                <BedDouble size={13} /> Select Room Tier
              </label>
              <div className="room-types-grid">
                {roomTypes.map((rt) => {
                  const isSelected = roomType === rt;
                  const price = priceMap[rt] || '₹1,200';
                  return (
                    <div 
                      key={rt} 
                      className={`room-type-pill ${isSelected ? 'selected' : ''}`} 
                      onClick={() => setRoomType(rt)}
                    >
                      <div className="rt-info">
                        <span className="rt-name">{rt}</span>
                        <span className="rt-price">{price} <small>/ night</small></span>
                      </div>
                      <div className={`rt-check ${isSelected ? 'active' : ''}`}>
                        {isSelected && <Check size={13} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guest Counter */}
            <div className="booking-section">
              <label className="section-label">
                <Users size={13} /> Total Guests
              </label>
              <div className="guest-counter-capsule">
                <button 
                  type="button" 
                  className="counter-btn"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  aria-label="Decrease guests"
                >
                  −
                </button>
                <div className="counter-display">
                  <span className="counter-val">{guests}</span>
                  <span className="counter-sub">{guests === 1 ? 'Single Occupancy' : guests === 2 ? 'Double Occupancy (1 Room)' : `${guests} Guests (Family Stay)`}</span>
                </div>
                <button 
                  type="button" 
                  className="counter-btn"
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                  aria-label="Increase guests"
                >
                  +
                </button>
              </div>
            </div>

            {/* High-Impact Actions */}
            <div className="booking-actions">
              <button className="btn-whatsapp-luxury" onClick={handleBook}>
                <MessageCircle size={18} />
                <span>Book Stay via WhatsApp</span>
                <span className="btn-badge-free">Direct Rate</span>
              </button>
              <button 
                className="btn-call-luxury" 
                onClick={() => window.open(`tel:${location.phone}`)}
                title="Direct Phone Call"
              >
                <Phone size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
