import { useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Compass, Heart, Landmark, Sparkles, Building2, 
  UtensilsCrossed, Info, BedDouble, ChefHat, Car, MapPin 
} from 'lucide-react';
import { CATEGORIES } from '../../data/locations';
import './CategoryPills.css';

const ICON_MAP = {
  Compass,
  Heart,
  Landmark,
  Sparkles,
  Building2,
  Home: Building2,
  UtensilsCrossed,
  Info,
  BedDouble,
  ChefHat,
  Car,
  MapPin
};

export default function CategoryPills({ activeFilter, onFilterChange, onAdminOpen, favoritesCount = 0 }) {
  const timerRef = useRef(null);
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Mouse wheel horizontal scroll conversion — allows native trackpad swipe while converting mouse wheel roll
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleWheel = (e) => {
      // If user is already scrolling horizontally via trackpad or Shift key, preserve native smooth momentum
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        return;
      }
      // Only convert pure vertical mouse wheel rolls on standard mice
      if (Math.abs(e.deltaY) > 2) {
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    };

    track.addEventListener('wheel', handleWheel, { passive: false });
    return () => track.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e) => {
    if (!trackRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftRef.current = trackRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDraggingRef.current || !trackRef.current) return;
      const x = e.pageX - trackRef.current.offsetLeft;
      const walk = (x - startXRef.current) * 1.3;
      if (Math.abs(walk) > 4) {
        hasMovedRef.current = true;
      }
      trackRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handlePillClick = (key) => {
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }
    onFilterChange(key);
  };

  const handleTouchStart = (key) => {
    if (key === '__drivers__') {
      timerRef.current = setTimeout(() => {
        onAdminOpen?.();
      }, 1200);
    }
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const pills = useMemo(() => CATEGORIES, []);

  return (
    <div 
      className="category-track"
      ref={trackRef}
      onMouseDown={handleMouseDown}
    >
      {pills.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || MapPin;
        const isFavPill = cat.key === 'favourites';
        const isFavFilled = isFavPill && (activeFilter === 'favourites' || favoritesCount > 0);

        return (
          <button
            key={cat.key}
            type="button"
            className={`pill ${activeFilter === cat.key ? 'active' : ''} ${isFavPill ? 'pill-favourites' : ''}`}
            onClick={() => handlePillClick(cat.key)}
            title={isFavPill ? "View your saved favourite sites" : undefined}
          >
            <span className={`pill-icon ${isFavPill ? 'fav-icon' : ''}`}>
              <IconComponent 
                size={15} 
                strokeWidth={2.2}
                fill={isFavFilled ? '#e11d48' : 'none'} 
                color={isFavPill ? '#e11d48' : 'currentColor'} 
              />
            </span>
            <span className="pill-text">{cat.label}</span>
            {isFavPill && favoritesCount > 0 && (
              <span className="pill-count-badge">{favoritesCount}</span>
            )}
          </button>
        );
      })}

      <button 
        type="button"
        className={`pill ${activeFilter === '__drivers__' ? 'active' : ''}`} 
        id="drivers-pill" 
        onClick={() => handlePillClick('__drivers__')}
        onMouseDown={(e) => { handleMouseDown(e); handleTouchStart('__drivers__'); }}
        onMouseUp={(e) => { handleMouseUp(); handleTouchEnd(); }}
        onMouseLeave={handleTouchEnd}
        onTouchStart={() => handleTouchStart('__drivers__')}
        onTouchEnd={handleTouchEnd}
        title="View Live Drivers"
      >
        <span className="pill-icon"><Car size={15} strokeWidth={2.2} /></span>
        <span className="pill-text">Drivers</span>
      </button>
    </div>
  );
}
