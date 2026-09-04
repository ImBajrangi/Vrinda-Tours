import { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  Car, Navigation, Share2, BedDouble, UtensilsCrossed, 
  X, ArrowLeft, Star, Clock, Landmark, Sparkles, Home, Info,
  Phone, ArrowRight, Calendar, Users, MessageCircle, Check, Heart, HeartOff
} from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import { openWhatsApp, generateHotelMessage, generateRestaurantMessage } from '../../utils/whatsapp';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { useFavorites } from '../../hooks/useFavorites';
import { shareWebPPicture } from '../../utils/imageOptimizer';
import './LocationCard.css';

export default function LocationCard({ 
  location, 
  userPosition, 
  drivers = [],
  onRequestRide,
  onBookRide,
  onClose, 
  onDirections,
  onToast
}) {
  const [displayLocation, setDisplayLocation] = useState(location);
  const [mode, setMode] = useState('preview'); // 'preview' | 'ride' | 'hotel' | 'restaurant'
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);
  const [imgError, setImgError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Smoothly keep previous location alive during CSS exit transition
  useEffect(() => {
    if (location) {
      setDisplayLocation(location);
      setMode('preview');
      setImgError(false);
    } else {
      const timer = setTimeout(() => {
        setDisplayLocation(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const activeLoc = location || displayLocation;

  const stats = useMemo(() => {
    if (!activeLoc || !userPosition) return { distance: '--', eta: '--' };
    const km = calculateDistance(userPosition.lat, userPosition.lng, activeLoc.lat, activeLoc.lng);
    return { distance: formatDistance(km), eta: calculateETA(km) };
  }, [activeLoc, userPosition]);

  const cat = activeLoc?.category || 'Holy Site';
  const showHotel = cat === 'Hotel';
  const showRestaurant = cat === 'Restaurant' || cat === 'Dining';

  // --- RIDE DRIVER FLEET LOGIC ---
  const refLat = userPosition?.lat || activeLoc?.lat || 27.64;
  const refLng = userPosition?.lng || activeLoc?.lng || 77.38;

  const availableDrivers = useMemo(() => {
    return drivers
      .filter(d => (d.status === 'available' || !d.status) && d.location?.lat)
      .map(d => {
        const dist = calculateDistance(refLat, refLng, d.location.lat, d.location.lng);
        return {
          ...d,
          _distance: dist,
          _distanceText: formatDistance(dist),
          _eta: calculateETA(dist)
        };
      })
      .sort((a, b) => a._distance - b._distance);
  }, [drivers, refLat, refLng]);

  const [selectedDriverId, setSelectedDriverId] = useState(null);

  useEffect(() => {
    if (availableDrivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(availableDrivers[0].id);
    }
  }, [availableDrivers, selectedDriverId]);

  const selectedDriver = useMemo(() => {
    return availableDrivers.find(d => d.id === selectedDriverId) || availableDrivers[0];
  }, [availableDrivers, selectedDriverId]);

  const getVehicleEmoji = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'e-rickshaw': return '🛺';
      case 'auto': return '🛺';
      case 'taxi': return '🚗';
      case 'bike': return '🛵';
      case 'bus': return '🚌';
      default: return '🛺';
    }
  };

  // --- HOTEL BOOKING STATE ---
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);
  const [hotelCheckin, setHotelCheckin] = useState(todayStr);
  const [hotelCheckout, setHotelCheckout] = useState(tomorrowStr);
  const [hotelGuests, setHotelGuests] = useState(2);
  const [hotelRoomType, setHotelRoomType] = useState('Standard');

  // --- RESTAURANT BOOKING STATE ---
  const [diningDate, setDiningDate] = useState(todayStr);
  const [diningTime, setDiningTime] = useState('7:30 PM');
  const [diningGuests, setDiningGuests] = useState(2);
  const [diningTag, setDiningTag] = useState('Pure Sattvic');

  // Handlers
  const handleShare = async () => {
    if (!activeLoc) return;
    await shareWebPPicture({
      imageUrl: activeLoc.image || '/handdrawn_vrinda_hero.webp',
      title: `${activeLoc.name} — Vrinda Vihar`,
      text: `${activeLoc.name} (${activeLoc.category}) • ${activeLoc.description || 'Sacred Brij Dham Darshan'}`,
      url: `https://to.vrindopnishad.in/?loc=${encodeURIComponent(activeLoc.name)}`,
      filename: `${(activeLoc.name || 'darshan').toLowerCase().replace(/[^a-z0-9]/g, '-')}.webp`,
      onSuccess: () => {
        if (onToast) onToast({ message: '✨ Darshan shared in compressed WebP format', type: 'success' });
      }
    });
  };

  const handleDirections = () => {
    if (!activeLoc) return;
    if (onDirections) onDirections(activeLoc);
    else window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeLoc.lat},${activeLoc.lng}`, '_blank');
  };

  const handleConfirmRide = () => {
    if (!selectedDriver) return;
    if (onRequestRide) {
      onRequestRide(selectedDriver);
    }
    triggerClose();
  };

  const handleConfirmHotel = () => {
    if (!activeLoc) return;
    const msg = generateHotelMessage(activeLoc, hotelCheckin, hotelCheckout, hotelGuests, hotelRoomType);
    openWhatsApp(activeLoc.phone, msg);
    triggerClose();
  };

  const handleConfirmRestaurant = () => {
    if (!activeLoc) return;
    const msg = generateRestaurantMessage(activeLoc, diningDate, diningTime, diningGuests, diningTag);
    openWhatsApp(activeLoc.phone, msg);
    triggerClose();
  };

  const isFav = isFavorite(activeLoc);

  const handleToggleFav = (e) => {
    e?.stopPropagation();
    if (!activeLoc) return;
    const { isFav: newFav } = toggleFavorite(activeLoc);
    if (onToast) {
      onToast({
        message: newFav ? 'Added to Favourites' : 'Removed from Favourites',
        type: newFav ? 'success' : 'info',
        icon: newFav 
          ? <Heart size={16} strokeWidth={2.5} color="#fb7185" fill="#f43f5e" /> 
          : <HeartOff size={16} strokeWidth={2.5} color="#fca5a5" />
      });
    }
  };

  // Category Theme
  const getCatMeta = () => {
    switch (cat) {
      case 'Temple': return { Icon: Landmark, color: '#b45309', bg: '#fef3c7' };
      case 'Holy Site': return { Icon: Sparkles, color: '#0284c7', bg: '#e0f2fe' };
      case 'Hotel': return { Icon: BedDouble, color: '#15803d', bg: '#dcfce7' };
      case 'Restaurant':
      case 'Dining': return { Icon: UtensilsCrossed, color: '#c2410c', bg: '#ffedd5' };
      case 'Town': return { Icon: Home, color: '#4f46e5', bg: '#e0e7ff' };
      default: return { Icon: Info, color: '#3f3f46', bg: '#f4f4f5' };
    }
  };

  const catMeta = getCatMeta();
  const CatIcon = catMeta.Icon;

  if (!activeLoc) return null;

  return (
    <div 
      className={`location-card ${location ? 'visible' : ''} ${mode !== 'preview' ? 'booking-mode' : ''} ${isDragging ? 'dragging' : ''}`}
      style={sheetStyle}
    >
      {activeLoc && (
        <div className="card-inner-container">
          {/* Drag Handle */}
          <div 
            className="card-handle-wrapper"
            {...handleProps}
            title="Drag down to dismiss"
          >
            <div className="card-handle" />
          </div>

          {/* Universal Header Row: Symmetrical and stationary across all views */}
          <div className="card-top-bar">
            {mode !== 'preview' ? (
              <>
                <button 
                  className="card-header-back-btn" 
                  onClick={() => setMode('preview')} 
                  title="Back to details"
                  aria-label="Back"
                >
                  <ArrowLeft size={16} />
                </button>

                <h3 className="card-header-title" title={activeLoc.name}>
                  {mode === 'ride' ? `To ${activeLoc.name}` : mode === 'hotel' ? `Stay at ${activeLoc.name}` : `Dine at ${activeLoc.name}`}
                </h3>
              </>
            ) : (
              <div className="card-top-spacer" />
            )}

            <div className="card-top-actions-right">
              {mode === 'preview' && (
                <button 
                  className={`card-top-fav-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={handleToggleFav}
                  title={isFav ? "Remove from Favourites" : "Save to Favourites"}
                  aria-label="Toggle Favourite"
                >
                  <Heart size={16} fill={isFav ? "#e11d48" : "none"} color={isFav ? "#e11d48" : "currentColor"} />
                </button>
              )}

              <button 
                className="card-universal-close-btn" 
                onClick={triggerClose} 
                title="Close card"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* =========================================================
              VIEW 1: PREVIEW MODE (Resting Location Card)
             ========================================================= */}
          {mode === 'preview' && (
            <div className="preview-morph-view">
              {/* Body Row: Media Thumbnail + Typography */}
              <div className="card-body-row">
                <div className="card-media-box">
                  {activeLoc.image && !imgError ? (
                    <img 
                      src={activeLoc.image} 
                      alt={activeLoc.name} 
                      className="card-img" 
                      onError={() => setImgError(true)}
                      loading="lazy"
                    />
                  ) : (
                    <div 
                      className="card-fallback-avatar"
                      style={{ background: catMeta.bg, color: catMeta.color }}
                    >
                      <CatIcon size={24} />
                    </div>
                  )}
                </div>

                <div className="card-info-content">
                  <h2 className="card-title" title={activeLoc.name}>
                    {activeLoc.name}
                  </h2>
                  <p className="card-desc">
                    {activeLoc.description}
                  </p>
                </div>
              </div>

              {/* Metric Chips Bar */}
              <div className="card-metrics-row">
                <div className="metric-pill">
                  <Navigation size={12} className="metric-icon" />
                  <span className="metric-value">{stats.distance}</span>
                </div>

                <div className="metric-pill">
                  <Clock size={12} className="metric-icon" />
                  <span className="metric-value">{stats.eta}</span>
                </div>

                <div className="metric-pill rating">
                  <Star size={12} fill="#d97706" color="#d97706" />
                  <span className="metric-value">{activeLoc.rating || '4.8'}</span>
                </div>
              </div>

              {/* Morph Action Row */}
              <div className="card-actions-grid">
                {showRestaurant ? (
                  <button className="btn-action-primary" onClick={() => setMode('restaurant')}>
                    <UtensilsCrossed size={17} strokeWidth={2.2} className="btn-primary-icon" />
                    <span>Reserve Table</span>
                  </button>
                ) : showHotel ? (
                  <button className="btn-action-primary" onClick={() => setMode('hotel')}>
                    <BedDouble size={17} strokeWidth={2.2} className="btn-primary-icon" />
                    <span>Book Stay</span>
                  </button>
                ) : (
                  <button className="btn-action-primary" onClick={() => onBookRide ? onBookRide(activeLoc) : setMode('ride')}>
                    <Car size={17} strokeWidth={2.2} className="btn-primary-icon" />
                    <span>Book Instant Ride</span>
                  </button>
                )}

                {(showHotel || showRestaurant) && (
                  <button 
                    className="btn-action-icon" 
                    onClick={() => onBookRide ? onBookRide(activeLoc) : setMode('ride')} 
                    title="Book Instant Ride to Venue"
                  >
                    <Car size={17} />
                  </button>
                )}

                <button 
                  className={`btn-action-icon btn-fav-action ${isFav ? 'is-fav' : ''}`}
                  onClick={handleToggleFav} 
                  title={isFav ? "Remove from Favourites" : "Save to Favourites"}
                  aria-label="Toggle Favourite"
                >
                  <Heart size={17} fill={isFav ? "#e11d48" : "none"} color={isFav ? "#e11d48" : "currentColor"} />
                </button>

                <button 
                  className="btn-action-icon" 
                  onClick={handleDirections} 
                  title="Get Directions in Google Maps"
                >
                  <Navigation size={17} />
                </button>

                <button 
                  className="btn-action-icon" 
                  onClick={handleShare} 
                  title="Share Location"
                >
                  <Share2 size={17} />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 2: RIDE BOOKING MORPH VIEW (Clean, Spacious, Uber Quality)
             ========================================================= */}
          {mode === 'ride' && (
            <div className="booking-morph-view">
              {/* Driver Fleet Row */}
              {availableDrivers.length === 0 ? (
                <div className="bm-empty-fleet">
                  <div className="bm-empty-icon-circle">
                    <Car size={24} className="bm-empty-icon" />
                  </div>
                  <h4 className="bm-empty-title">No Drivers Nearby</h4>
                  <p className="bm-empty-desc">
                    Pilgrim e-rickshaws are currently busy or out of range.
                  </p>
                  <div className="bm-empty-actions">
                    <button 
                      type="button" 
                      className="bm-empty-btn-nav" 
                      onClick={handleDirections}
                    >
                      <Navigation size={15} />
                      <span>Directions</span>
                    </button>
                    <button 
                      type="button" 
                      className="bm-empty-btn-back" 
                      onClick={() => setMode('preview')}
                    >
                      <span>Back</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bm-fleet-list">
                  {availableDrivers.map(d => {
                    const isSelected = d.id === selectedDriverId;
                    const emoji = getVehicleEmoji(d.vehicleType);

                    return (
                      <div 
                        key={d.id} 
                        className={`bm-driver-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDriverId(d.id)}
                      >
                        <div className="bm-driver-avatar-box">
                          <img 
                            src={d.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.name}&backgroundColor=f1f5f9`} 
                            alt={d.name} 
                            className="bm-driver-avatar"
                          />
                          <span className="bm-driver-vehicle-badge">{emoji}</span>
                        </div>

                        <div className="bm-driver-info">
                          <div className="bm-driver-name-row">
                            <span className="bm-driver-name">{d.name}</span>
                            <span className="bm-verified-badge">✓ Verified</span>
                          </div>
                          <span className="bm-driver-specs-line">{d.vehicleType || 'E-Rickshaw'} • ★ {d.rating || '4.9'}</span>
                        </div>

                        <div className="bm-driver-right">
                          <span className="bm-driver-eta">{d._eta}</span>
                          <span className="bm-driver-dist">{d._distanceText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Action Dock */}
              {selectedDriver && (
                <div className="bm-dock-footer">
                  {selectedDriver.phone && (
                    <a 
                      href={`tel:${selectedDriver.phone}`}
                      className="bm-dock-phone-btn" 
                      title={`Call ${selectedDriver.name}`}
                    >
                      <Phone size={17} />
                    </a>
                  )}

                  <button className="bm-dock-confirm-btn" onClick={handleConfirmRide}>
                    <span>Request Ride • {selectedDriver._eta} away</span>
                    <ArrowRight size={16} className="bm-confirm-arrow" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              VIEW 3: HOTEL BOOKING MORPH VIEW
             ========================================================= */}
          {mode === 'hotel' && (
            <div className="booking-morph-view">
              <div className="bm-content-scroll">
                {/* Stay Duration */}
                <div className="bm-section">
                  <label className="bm-label">Stay Duration</label>
                  <div className="bm-dates-grid">
                    <div className="bm-date-field">
                      <span className="bm-field-label">Check-In</span>
                      <input 
                        type="date" 
                        value={hotelCheckin} 
                        onChange={(e) => setHotelCheckin(e.target.value)} 
                        className="bm-date-input" 
                      />
                    </div>
                    <div className="bm-date-field">
                      <span className="bm-field-label">Check-Out</span>
                      <input 
                        type="date" 
                        value={hotelCheckout} 
                        onChange={(e) => setHotelCheckout(e.target.value)} 
                        className="bm-date-input" 
                      />
                    </div>
                  </div>
                </div>

                {/* Guests (Inline Stepper Row) */}
                <div className="bm-stepper-row">
                  <div className="bm-stepper-label-block">
                    <span className="bm-label-title">Pilgrim Guests</span>
                    <span className="bm-label-desc">Adults & children</span>
                  </div>
                  <div className="bm-stepper-control">
                    <button 
                      type="button" 
                      className="bm-stepper-btn"
                      onClick={() => setHotelGuests(Math.max(1, hotelGuests - 1))}
                    >
                      −
                    </button>
                    <span className="bm-stepper-count">{hotelGuests}</span>
                    <button 
                      type="button" 
                      className="bm-stepper-btn"
                      onClick={() => setHotelGuests(hotelGuests + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Room Type (3-Column Grid) */}
                <div className="bm-section">
                  <label className="bm-label">Room Type</label>
                  <div className="bm-grid-3">
                    {['Standard', 'Deluxe AC', 'Suite'].map((rt) => (
                      <button
                        key={rt}
                        type="button"
                        className={`bm-pill-opt ${hotelRoomType === rt ? 'active' : ''}`}
                        onClick={() => setHotelRoomType(rt)}
                      >
                        {rt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bm-dock-footer">
                {activeLoc.phone && (
                  <a href={`tel:${activeLoc.phone}`} className="bm-dock-phone-btn" title="Call Guesthouse">
                    <Phone size={17} />
                  </a>
                )}
                <button className="bm-dock-confirm-btn" onClick={handleConfirmHotel}>
                  <MessageCircle size={17} className="btn-primary-icon" />
                  <span>Book on WhatsApp</span>
                  <ArrowRight size={16} className="bm-confirm-arrow" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 4: RESTAURANT BOOKING MORPH VIEW
             ========================================================= */}
          {mode === 'restaurant' && (
            <div className="booking-morph-view">
              <div className="bm-content-scroll">
                {/* Dining Time Slots (4-Column Grid) */}
                <div className="bm-section">
                  <label className="bm-label">Select Time</label>
                  <div className="bm-grid-4">
                    {['1:00 PM', '2:00 PM', '7:30 PM', '8:30 PM'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`bm-pill-opt ${diningTime === slot ? 'active' : ''}`}
                        onClick={() => setDiningTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests (Inline Stepper Row) */}
                <div className="bm-stepper-row">
                  <div className="bm-stepper-label-block">
                    <span className="bm-label-title">Guests</span>
                    <span className="bm-label-desc">Reserved party seating</span>
                  </div>
                  <div className="bm-stepper-control">
                    <button 
                      type="button" 
                      className="bm-stepper-btn"
                      onClick={() => setDiningGuests(Math.max(1, diningGuests - 1))}
                    >
                      −
                    </button>
                    <span className="bm-stepper-count">{diningGuests}</span>
                    <button 
                      type="button" 
                      className="bm-stepper-btn"
                      onClick={() => setDiningGuests(diningGuests + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Dietary Preference (3-Column Grid) */}
                <div className="bm-section">
                  <label className="bm-label">Dining Preference</label>
                  <div className="bm-grid-3">
                    {['Pure Sattvic', 'Family Table', 'Window View'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`bm-pill-opt ${diningTag === tag ? 'active' : ''}`}
                        onClick={() => setDiningTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bm-dock-footer">
                {activeLoc.phone && (
                  <a href={`tel:${activeLoc.phone}`} className="bm-dock-phone-btn" title="Call Restaurant">
                    <Phone size={17} />
                  </a>
                )}
                <button className="bm-dock-confirm-btn" onClick={handleConfirmRestaurant}>
                  <MessageCircle size={17} className="btn-primary-icon" />
                  <span>Reserve on WhatsApp</span>
                  <ArrowRight size={16} className="bm-confirm-arrow" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
