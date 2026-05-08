import { useMemo } from 'react';
import { Car, Navigation, Share2, BedDouble, UtensilsCrossed, X, MapPin } from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import './LocationCard.css';

export default function LocationCard({ location, userPosition, onClose, onBookHotel, onBookRestaurant, onBookRide, onDirections }) {
  const stats = useMemo(() => {
    if (!location || !userPosition) return { distance: '--', eta: '--' };
    const km = calculateDistance(userPosition.lat, userPosition.lng, location.lat, location.lng);
    return { distance: formatDistance(km), eta: calculateETA(km) };
  }, [location, userPosition]);

  const cat = location?.category;
  const showHotel = cat === 'Hotel';
  const showRestaurant = cat === 'Restaurant' || cat === 'Dining';

  const handleShare = async () => {
    if (navigator.share && location) {
      try {
        await navigator.share({ 
          title: location.name, 
          text: location.description, 
          url: `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}` 
        });
      } catch {}
    }
  };

  const handleDirections = () => {
    if (!location) return;
    if (onDirections) onDirections(location);
    else window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`, '_blank');
  };

  return (
    <div className={`location-card ${location ? 'visible' : ''}`}>
      {location && (
        <>
          <div className="card-handle" />
          <button className="card-close" onClick={onClose}><X size={16} /></button>
          <div className="card-header">
            <div className="card-image" style={{ backgroundImage: `url(${location.image})` }} />
            <div className="card-info">
              <span className="card-category"><MapPin size={10} /> {cat}</span>
              <h2>{location.name}</h2>
              <p>{location.description}</p>
            </div>
          </div>
          <div className="card-stats">
            <div className="stat"><div className="stat-value">{stats.distance}</div><div className="stat-label">Distance</div></div>
            <div className="stat"><div className="stat-value">{stats.eta}</div><div className="stat-label">ETA</div></div>
            <div className="stat"><div className="stat-value">{location.rating || '4.8'}</div><div className="stat-label">Rating</div></div>
          </div>
          <div className="card-actions">
            {showHotel && (
              <button className="btn-primary btn-book-hotel" onClick={() => onBookHotel(location)}>
                <BedDouble size={18} /> Book Room
              </button>
            )}
            {showRestaurant && (
              <button className="btn-primary btn-book-restaurant" onClick={() => onBookRestaurant(location)}>
                <UtensilsCrossed size={18} /> Reserve Table
              </button>
            )}
            <button className="btn-primary btn-ride" style={{ flex: showHotel || showRestaurant ? '0.6' : '' }} onClick={() => onBookRide(location)}>
              <Car size={18} /> Book Ride
            </button>
            <button className="btn-primary btn-dir" style={{ flex: '0.8' }} onClick={handleDirections}>
              <Navigation size={18} /> Directions
            </button>
            <button className="btn-secondary" onClick={handleShare}>
              <Share2 size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
