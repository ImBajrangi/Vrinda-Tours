import { useState, useMemo } from 'react';
import { 
  X, MessageCircle, Utensils, Star, Calendar, 
  Clock, Users, Sparkles, Check, CheckCircle2, 
  ArrowRight, ShieldCheck, User as UserIcon
} from 'lucide-react';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { createBookingRequest } from '../../services/bookingService';
import './BookingSheets.css';

export default function RestaurantBooking({ location, onClose, onSuggestAppInstall }) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  // Date setup
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(todayStr);
  const [isCustomDate, setIsCustomDate] = useState(false);

  // Time preset slots
  const TIME_PRESETS = [
    { label: '1:00 PM', sub: 'Lunch', value: '13:00' },
    { label: '2:00 PM', sub: 'Afternoon', value: '14:00' },
    { label: '7:30 PM', sub: 'Dinner', value: '19:30' },
    { label: '8:30 PM', sub: 'Evening', value: '20:30' },
  ];

  const [time, setTime] = useState('19:30');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [guests, setGuests] = useState(2);

  const QUICK_TAGS = ['Pure Sattvic (No Onion/Garlic)', 'Quiet Table', 'Family Seating', 'Celebration / Birthday'];
  const [selectedTag, setSelectedTag] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState(null);

  if (!location) return null;

  const handleDateSelect = (type) => {
    if (type === 'today') {
      setDate(todayStr);
      setIsCustomDate(false);
    } else if (type === 'tomorrow') {
      setDate(tomorrowStr);
      setIsCustomDate(false);
    } else {
      setIsCustomDate(true);
    }
  };

  const handleTimeSelect = (tVal) => {
    setTime(tVal);
    setIsCustomTime(false);
  };

  const activeSpecial = [selectedTag, customNote].filter(Boolean).join('. ');

  const handleSubmitBooking = async (e) => {
    if (e) e.preventDefault();
    if (!customerPhone.trim()) {
      alert('Please enter your Phone or WhatsApp number so the dining desk can confirm your table.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBookingRequest({
        type: 'restaurant',
        venueName: location.name,
        venueImage: location.image,
        customerName: customerName || 'Pilgrim Devotee',
        customerPhone,
        checkInDate: date,
        preferredTime: time,
        guests,
        roomType: 'Table Reservation',
        specialNotes: activeSpecial
      });

      if (res.success) {
        setSubmittedBooking(res);
        setTimeout(() => {
          onSuggestAppInstall?.('booking_success');
        }, 1800);
      }
    } catch (err) {
      console.error('Restaurant booking error:', err);
      alert('Failed to place table reservation. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isToday = date === todayStr && !isCustomDate;
  const isTomorrow = date === tomorrowStr && !isCustomDate;

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
              <h3>Table Request Placed!</h3>
              <p>
                Hare Krishna <strong>{customerName || 'Devotee'}</strong>! Your dining request for <strong>{location.name}</strong> has been received by Vrinda Travels.
              </p>
            </div>

            <div className="bs-success-card">
              <div className="bs-sc-row">
                <span className="bs-sc-lbl">Date & Time</span>
                <strong className="bs-sc-val">{date} at {time}</strong>
              </div>
              <div className="bs-sc-row">
                <span className="bs-sc-lbl">Table Size</span>
                <strong className="bs-sc-val">{guests} Guests</strong>
              </div>
              {activeSpecial && (
                <div className="bs-sc-row">
                  <span className="bs-sc-lbl">Preferences</span>
                  <strong className="bs-sc-val">{activeSpecial}</strong>
                </div>
              )}
              <div className="bs-sc-row highlight">
                <span className="bs-sc-lbl">Next Step</span>
                <span className="bs-sc-status">📞 Team confirming via {customerPhone}</span>
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
                <span>Message Restaurant Desk on WhatsApp</span>
              </a>

              <button className="bs-btn-done" onClick={triggerClose}>
                Done & View Map
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* FORM REQUEST STATE                                            */
          /* ------------------------------------------------------------- */
          <>
            <div className="booking-sheet-header">
              <div className="sheet-title-group">
                <div className="sheet-title-icon">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3>Reserve Sattvic Table / Dining</h3>
                  <span className="sheet-subtitle">Zero reservation fees • Fresh pure prasadam</span>
                </div>
              </div>
              <button className="booking-sheet-close" onClick={triggerClose} title="Close">
                <X size={16} />
              </button>
            </div>

            <div className="booking-sheet-body">
              {/* Venue Mini Hero */}
              <div className="booking-venue-info">
                <div 
                  className="booking-venue-img" 
                  style={{ backgroundImage: `url(${location.image})` }} 
                />
                <div className="booking-venue-details">
                  <div className="venue-title-row">
                    <h4>{location.name}</h4>
                    <span className="venue-verified-badge" title="Verified Dining Partner">Verified</span>
                  </div>
                  <div className="venue-meta">
                    <span className="rating-badge">
                      <Star size={11} fill="currentColor" /> {location.rating || '4.5'}
                    </span>
                    <span className="price-badge">{location.priceRange || '₹100 - ₹300'}</span>
                    <span className="cuisine-tag">{location.cuisine || 'Pure Sattvic'}</span>
                  </div>
                </div>
              </div>

              <form className="booking-form" onSubmit={handleSubmitBooking}>
                {/* 1. User Contact */}
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

                {/* 2. Quick Date Selector */}
                <div className="booking-section">
                  <label className="section-label">
                    <Calendar size={13} /> Select Date
                  </label>
                  <div className="chips-row">
                    <button
                      type="button"
                      className={`smart-chip ${isToday ? 'active' : ''}`}
                      onClick={() => handleDateSelect('today')}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      className={`smart-chip ${isTomorrow ? 'active' : ''}`}
                      onClick={() => handleDateSelect('tomorrow')}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className={`smart-chip ${isCustomDate ? 'active' : ''}`}
                      onClick={() => handleDateSelect('custom')}
                    >
                      {isCustomDate ? date : 'Other Date...'}
                    </button>
                  </div>
                  {isCustomDate && (
                    <div className="custom-input-wrap">
                      <input
                        type="date"
                        value={date}
                        min={todayStr}
                        onChange={(e) => setDate(e.target.value)}
                        className="smart-input"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* 3. Quick Time Slots */}
                <div className="booking-section">
                  <label className="section-label">
                    <Clock size={13} /> Preferred Time Slot
                  </label>
                  <div className="time-chips-grid">
                    {TIME_PRESETS.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        className={`time-chip ${time === slot.value && !isCustomTime ? 'active' : ''}`}
                        onClick={() => handleTimeSelect(slot.value)}
                      >
                        <span className="tc-time">{slot.label}</span>
                        <span className="tc-sub">{slot.sub}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`time-chip ${isCustomTime ? 'active' : ''}`}
                      onClick={() => setIsCustomTime(true)}
                    >
                      <span className="tc-time">{isCustomTime ? time : 'Custom'}</span>
                      <span className="tc-sub">Pick time</span>
                    </button>
                  </div>
                  {isCustomTime && (
                    <div className="custom-input-wrap">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="smart-input"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* 4. Guests Counter */}
                <div className="booking-section">
                  <label className="section-label">
                    <Users size={13} /> Table For
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
                      <span className="counter-sub">{guests === 1 ? 'Guest (Single Table)' : guests <= 4 ? 'Guests (Standard Table)' : 'Guests (Family Table)'}</span>
                    </div>
                    <button 
                      type="button" 
                      className="counter-btn"
                      onClick={() => setGuests(Math.min(20, guests + 1))}
                      aria-label="Increase guests"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 5. Quick Preference Tags */}
                <div className="booking-section">
                  <label className="section-label">
                    <Sparkles size={13} /> Dining Preferences <span className="opt-tag">(Optional)</span>
                  </label>
                  <div className="tag-chips-wrap">
                    {QUICK_TAGS.map((tag) => {
                      const isSelected = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          className={`pref-tag-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedTag(isSelected ? '' : tag)}
                        >
                          {isSelected && <Check size={11} />}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    placeholder="Special dietary requests (e.g. Jain, extra ghee rotis)..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
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
                    <span>{isSubmitting ? 'Reserving Table...' : 'Request Table Booking (Free)'}</span>
                    <ArrowRight size={16} />
                  </button>
                  <span className="booking-disclaimer-text">
                    🔒 Zero upfront charges. The bhojanalaya desk confirms your table directly.
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
