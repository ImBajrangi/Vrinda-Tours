import { useMemo, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { CATEGORIES } from '../../data/locations';
import './CategoryPills.css';

export default function CategoryPills({ activeFilter, onFilterChange, onAdminOpen, favoritesCount = 0 }) {
  const timerRef = useRef(null);

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
    <div className="category-track">
      {pills.map((cat) => {
        const Icon = LucideIcons[cat.icon] || LucideIcons.MapPin;
        const isFavPill = cat.key === 'favourites';
        return (
          <button
            key={cat.key}
            className={`pill ${activeFilter === cat.key ? 'active' : ''} ${isFavPill ? 'pill-favourites' : ''}`}
            onClick={() => onFilterChange(cat.key)}
            title={isFavPill ? "View your saved favourite sites" : undefined}
          >
            <span className={`pill-icon ${isFavPill ? 'fav-icon' : ''}`}>
              <Icon size={12} fill={isFavPill && (activeFilter === 'favourites' || favoritesCount > 0) ? '#e11d48' : 'none'} color={isFavPill ? '#e11d48' : 'currentColor'} />
            </span>
            {cat.label}
            {isFavPill && favoritesCount > 0 && (
              <span className="pill-count-badge">{favoritesCount}</span>
            )}
          </button>
        );
      })}
      <button 
        className={`pill ${activeFilter === '__drivers__' ? 'active' : ''}`} 
        id="drivers-pill" 
        onClick={() => onFilterChange('__drivers__')}
        onMouseDown={() => handleTouchStart('__drivers__')}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={() => handleTouchStart('__drivers__')}
        onTouchEnd={handleTouchEnd}
        title="View Live Drivers"
      >
        <span className="pill-icon"><LucideIcons.Car size={12} /></span>
        Drivers
      </button>
    </div>
  );
}

