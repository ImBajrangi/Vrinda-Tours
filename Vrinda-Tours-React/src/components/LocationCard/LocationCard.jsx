import { useMemo, useState } from 'react';
import {
  Car, Navigation, Share2, BedDouble, UtensilsCrossed,
  X, MapPin, Star, Clock, Landmark, Sparkles, Home, Info
} from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import './LocationCard.css';

export default function LocationCard({
  location,
  userPosition,
  onClose,
  onBookHotel,
  onBookRestaurant,
  onBookRide,
  onDirections
}) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);
  const [imgError, setImgError] = useState(false);

  const stats = useMemo(() => {
    if (!location || !userPosition) return { distance: '--', eta: '--' };
    const km = calculateDistance(userPosition.lat, userPosition.lng, location.lat, location.lng);
    return { distance: formatDistance(km), eta: calculateETA(km) };
  }, [location, userPosition]);

  const cat = location?.category || 'Holy Site';
  const showHotel = cat === 'Hotel';
  const showRestaurant = cat === 'Restaurant' || cat === 'Dining';

  // Category Icon & Color Theme for avatar fallback
  const getCatMeta = () => {
    switch (cat) {
      case 'Temple':
        return { Icon: Landmark, color: '#b45309', bg: '#fef3c7' };
      case 'Holy Site':
        return { Icon: Sparkles, color: '#0284c7', bg: '#e0f2fe' };
      case 'Hotel':
        return { Icon: BedDouble, color: '#15803d', bg: '#dcfce7' };
      case 'Restaurant':
      case 'Dining':
        return { Icon: UtensilsCrossed, color: '#c2410c', bg: '#ffedd5' };
      case 'Town':
        return { Icon: Home, color: '#4f46e5', bg: '#e0e7ff' };
      default:
        return { Icon: Info, color: '#3f3f46', bg: '#f4f4f5' };
    }
  };

  const catMeta = getCatMeta();
  const CatIcon = catMeta.Icon;

  const handleShare = async () => {
    if (navigator.share && location) {
      try {
        await navigator.share({
          title: location.name,
          text: location.description,
          url: `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`
        });
      } catch { }
    }
  };

  const handleDirections = () => {
    if (!location) return;
    if (onDirections) onDirections(location);
    else window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
  };

  return (
    <div
      className={`location-card ${location ? 'visible' : ''} ${isDragging ? 'dragging' : ''}`}
      style={location ? sheetStyle : undefined}
    >
      {location && (
        <div className="card-inner-container">
          {/* Drag Handle */}
          <div
            className="card-handle-wrapper"
            {...handleProps}
            title="Drag down to dismiss"
          >
            <div className="card-handle" />
          </div>

          {/* Close Button Top-Right */}
          <button className="card-close-btn" onClick={triggerClose} title="Close card">
            <X size={15} />
          </button>

          {/* Body Row: Media Thumbnail + Typography */}
          <div className="card-body-row">
            <div className="card-media-box">
              {location.image && !imgError ? (
                <img
                  src={location.image}
                  alt={location.name}
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
              <h2 className="card-title" title={location.name}>
                {location.name}
              </h2>
              <p className="card-desc">
                {location.description}
              </p>
            </div>
          </div>

          {/* Clean Metric Chips Bar (Zero Overflow) */}
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
              <span className="metric-value">{location.rating || '4.8'}</span>
            </div>
          </div>

          {/* Impactful Actions Row: 1 Primary CTA + Matching Secondary Icon Actions */}
          <div className="card-actions-grid">
            {showRestaurant ? (
              <button className="btn-action-primary" onClick={() => onBookRestaurant(location)}>
                <UtensilsCrossed size={16} />
                <span>Reserve a Table</span>
              </button>
            ) : showHotel ? (
              <button className="btn-action-primary" onClick={() => onBookHotel(location)}>
                <BedDouble size={16} />
                <span>Book Stay</span>
              </button>
            ) : (
              <button className="btn-action-primary" onClick={() => onBookRide(location)}>
                <Car size={16} />
                <span>Book Pilgrim Ride</span>
              </button>
            )}

            {(showHotel || showRestaurant) && (
              <button
                className="btn-action-icon"
                onClick={() => onBookRide(location)}
                title="Book Ride to Venue"
              >
                <Car size={16} />
              </button>
            )}

            <button
              className="btn-action-icon"
              onClick={handleDirections}
              title="Get Directions in Google Maps"
            >
              <Navigation size={16} />
            </button>

            <button
              className="btn-action-icon"
              onClick={handleShare}
              title="Share Location"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
