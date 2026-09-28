import { useState, useMemo } from 'react';
import { 
  X, MessageCircle, Phone, BedDouble, Star, Calendar, 
  Users, ShieldCheck, Check, Sparkles, CheckCircle2, 
  Smartphone, ArrowRight, User as UserIcon
} from 'lucide-react';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { createBookingRequest } from '../../services/bookingService';
import './BookingSheets.css';

export default function HotelBooking({ location, onClose, onSuggestAppInstall }) {
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

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [checkin, setCheckin] = useState(todayStr);
  const [checkout, setCheckout] = useState(tomorrowStr);
  const [isCustomStay, setIsCustomStay] = useState(false);
  const [stayPreset, setStayPreset] = useState('tonight'); // 'tonight' | '2nights' | 'custom'

  const [guests, setGuests] = useState(2);
  const [roomType, setRoomType] = useState((location?.roomTypes || ['Standard Room'])[0]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);

  if (!location) return null;

  const priceMap = { 
    'Standard Room': location.priceRange?.split('-')[0]?.trim() || '₹800', 
    'Deluxe AC Room': '₹1,500', 
    'Pilgrim Suite': '₹2,800',
    Standard: location.priceRange?.split('-')[0]?.trim() || '₹800',
    Deluxe: '₹1,500',
    Suite: '₹2,800'
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

  const handleSubmitBooking = async (e) => {
    if (e) e.preventDefault();
    if (!customerPhone.trim()) {
      alert('Please enter your Phone or WhatsApp number so our team can reach you.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBookingRequest({
        type: 'hotel',
        venueName: location.name,
        venueImage: location.image,
        customerName: customerName || 'Pilgrim Devotee',
        customerPhone,
        checkInDate: checkin,
        checkOutDate: checkout,
        guests,
        roomType,
        specialNotes
      });

      if (res.success) {
        setSubmittedBooking(res);
        // Suggest App install smoothly after 1.8 seconds
        setTimeout(() => {
          onSuggestAppInstall?.('booking_success');
        }, 1800);
      }
    } catch (err) {
      console.error('Hotel booking error:', err);
      alert('Failed to place booking request. Please check internet connection.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* ------------------------------------------------------------- */}
        {/* SUCCESS CONFIRMATION STATE                                    */}
        {/* ------------------------------------------------------------- */}
        {submittedBooking ? (
          <div className="booking-success-layout">
            <div className="bs-success-icon-wrap">
              <CheckCircle2 size={36} className="bs-success-icon" />
              <div className="bs-success-ring" />
            </div>

            <div className="bs-success-header">
              <span className="bs-booking-id-pill">{submittedBooking.bookingId}</span>
              <h3>Booking Request Received!</h3>
              <p>
                Hare Krishna <strong>{customerName || 'Devotee'}</strong>! Your reservation request for <strong>{location.name}</strong> has been placed with Vrinda Travels.
              </p>
            </div>

            <div className="bs-success-card">
              <div className="bs-sc-row">
                <span className="bs-sc-lbl">Check-In</span>
                <strong className="bs-sc-val">{checkin}</strong>
              </div>
              <div className="bs-sc-row">
                <span className="bs-sc-lbl">Check-Out</span>
                <strong className="bs-sc-val">{checkout}</strong>
              </div>
              <div className="bs-sc-row">
                <span className="bs-sc-lbl">Room & Guests</span>
                <strong className="bs-sc-val">{roomType} • {guests} Guests</strong>
              </div>
              <div className="bs-sc-row highlight">
                <span className="bs-sc-lbl">Next Step</span>
                <span className="bs-sc-status">📞 Team calling on {customerPhone}</span>
              </div>
            </div>

            <div className="bs-success-actions">
              <a 
                href={submittedBooking.whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bs-btn-whatsapp-direct"
              >
                <MessageCircle size={18} />
                <span>Chat with Vrinda Booking Desk</span>
              </a>

              <button className="bs-btn-done" onClick={triggerClose}>
                Done & View Map
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* FORM REQUEST STATE (ZERO BARRIER & FRICTION-FREE)             */
          /* ------------------------------------------------------------- */
          <>
            <div className="booking-sheet-header">
              <div className="sheet-title-group">
                <div className="sheet-title-icon">
                  <BedDouble size={18} />
                </div>
                <div>
                  <h3>Request Hotel / Stay Booking</h3>
                  <span className="sheet-subtitle">Zero upfront payment • Verified Vrinda Travels team assists you</span>
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
                      <Star size={11} fill="currentColor" /> {location.rating || '4.6'}
                    </span>
                    <span className="price-badge">{location.priceRange || '₹800 - ₹2,500'} / night</span>
                  </div>
                </div>
              </div>

              <form className="booking-form" onSubmit={handleSubmitBooking}>
                {/* 1. User Contact (Super Simple) */}
                <div className="booking-section">
                  <label className="section-label">
                    <UserIcon size={13} /> Your Contact Details <span className="req-star">*</span>
                  </label>
                  <div className="booking-field-row">
                    <input 
                      type="text"
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="smart-input"
                    />
                    <input 
                      type="tel"
                      placeholder="WhatsApp / Phone No. *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="smart-input"
                      required
                    />
                  </div>
                </div>

                {/* 2. Quick Stay Selector */}
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

                {/* 3. Room Type Segmented Grid */}
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

                {/* 4. Guest Counter */}
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

                {/* 5. Special Notes (Optional) */}
                <div className="booking-section">
                  <input 
                    type="text"
                    placeholder="Special requests (e.g., ground floor room, late check-in)..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="smart-input"
                  />
                </div>

                {/* Submit Action */}
                <div className="booking-actions">
                  <button 
                    type="submit" 
                    className="btn-submit-booking-request"
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? 'Placing Request...' : 'Request Booking (Free)'}</span>
                    <ArrowRight size={16} />
                  </button>
                  <span className="booking-disclaimer-text">
                    🔒 No advance payment needed now. Our team reaches out directly to confirm room & payment.
                  </span>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
