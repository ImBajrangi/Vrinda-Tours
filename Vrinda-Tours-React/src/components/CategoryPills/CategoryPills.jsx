import { useMemo, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { CATEGORIES } from '../../data/locations';
import './CategoryPills.css';

export default function CategoryPills({ activeFilter, onFilterChange, onAdminOpen }) {
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
    <div className="category-pills">
      {pills.map((cat) => {
        const Icon = LucideIcons[cat.icon] || LucideIcons.MapPin;
        return (
          <button
            key={cat.key}
            className={`pill ${activeFilter === cat.key ? 'active' : ''}`}
            onClick={() => onFilterChange(cat.key)}
          >
            <span className="pill-icon"><Icon size={12} /></span>
            {cat.label}
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
      >
        <span className="pill-icon"><LucideIcons.Car size={12} /></span>
        Drivers
      </button>
    </div>
  );
}
