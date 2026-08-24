import { useState, useMemo } from 'react';
import { X, MessageCircle, Phone, Utensils, Star, Calendar, Clock, Users, Sparkles, Check } from 'lucide-react';
import { openWhatsApp, generateRestaurantMessage } from '../../utils/whatsapp';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import './BookingSheets.css';

export default function RestaurantBooking({ location, onClose }) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  // Date setup
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

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

  // Guests
  const [guests, setGuests] = useState(2);

  // Quick special request tags
  const QUICK_TAGS = ['Pure Sattvic (No Onion/Garlic)', 'Window / Quiet Table', 'Family Seating', 'Celebration'];
  const [selectedTag, setSelectedTag] = useState('');
  const [customNote, setCustomNote] = useState('');

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

  const handleBook = () => {
    const msg = generateRestaurantMessage(location, date, time, guests, activeSpecial);
    openWhatsApp(location.phone, msg);
    triggerClose();
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

        <div className="booking-sheet-header">
          <div className="sheet-title-group">
            <div className="sheet-title-icon">
              <Utensils size={18} />
            </div>
            <div>
              <h3>Reserve a Table</h3>
              <span className="sheet-subtitle">Instant confirmation via WhatsApp</span>
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
                  <Star size={11} fill="currentColor" /> {location.rating || '4.4'}
                </span>
                <span className="price-badge">{location.priceRange || '₹200 - ₹500'}</span>
                <span className="cuisine-tag">{location.cuisine || 'Sattvic Brij Cuisine'}</span>
              </div>
            </div>
          </div>

          <div className="booking-form">
            {/* Quick Date Selector */}
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

            {/* Quick Time Slots */}
            <div className="booking-section">
              <label className="section-label">
                <Clock size={13} /> Preferred Time
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

            {/* Guests Counter */}
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
                  <span className="counter-sub">{guests === 1 ? 'Guest (Single)' : guests <= 4 ? 'Guests (Standard Table)' : 'Guests (Family Group)'}</span>
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

            {/* Quick Preference Tags (Optional) */}
            <div className="booking-section">
              <label className="section-label">
                <Sparkles size={13} /> Special Request <span className="opt-tag">(Optional)</span>
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
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Additional notes for the kitchen or staff..."
                className="smart-input mini"
              />
            </div>

            {/* High-Impact Actions */}
            <div className="booking-actions">
              <button className="btn-whatsapp-luxury" onClick={handleBook}>
                <MessageCircle size={18} />
                <span>Reserve via WhatsApp</span>
                <span className="btn-badge-free">Free</span>
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
