import { useState, useRef } from 'react';
import { Search, User, Car } from 'lucide-react';
import { locations } from '../../data/locations';
import CategoryPills from '../CategoryPills/CategoryPills';
import './Header.css';

export default function Header({ 
  onSelectLocation, 
  onOpenDriverPortal, 
  onOpenDrivers,
  activeFilter,
  onFilterChange,
  onAdminOpen
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  const handleSearch = (value) => {
    setQuery(value);
    if (value.length < 2) { setResults([]); return; }
    const q = value.toLowerCase();
    setResults(
      locations.filter(
        (l) => l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  };

  const handleSelect = (loc) => {
    setQuery(loc.name);
    setResults([]);
    onSelectLocation(loc);
  };

  return (
    <header className="header-card">
      <div className="header-top-row">
        <div className="header-brand-logo" title="Vrindopnishad">
          <img src="/official-logo.svg" alt="Vrindopnishad Logo" className="site-brand-logo" />
        </div>

        <div className="search-bar">
          <Search size={16} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search temples, holy sites, dining, pilgrim rides..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onBlur={() => setTimeout(() => setResults([]), 200)}
          />
        </div>

        <button 
          className="icon-btn" 
          id="driver-btn" 
          onClick={onOpenDriverPortal}
          title="Driver Companion Portal"
        >
          <Car size={16} />
          <span className="btn-text">Driver</span>
        </button>

        <button 
          className="icon-btn" 
          id="user-btn"
          onClick={onOpenDrivers}
          title="Fleet Partners & Admin"
        >
          <User size={16} />
          <span className="btn-text">Fleet</span>
        </button>
      </div>

      <div className="header-category-tray">
        <CategoryPills 
          activeFilter={activeFilter} 
          onFilterChange={onFilterChange} 
          onAdminOpen={onAdminOpen}
        />
      </div>

      {results.length > 0 && (
        <div className="search-results visible">
          {results.map((loc) => (
            <div key={loc.name} className="search-result-item" onMouseDown={() => handleSelect(loc)}>
              <div className="sr-icon"><Search size={15} /></div>
              <div className="sr-text">
                <h4>{loc.name}</h4>
                <span>{loc.category} • +{loc.points} points</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
