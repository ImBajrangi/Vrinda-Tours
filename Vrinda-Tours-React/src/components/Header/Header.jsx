import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, User, Car, X, ArrowLeft, Landmark, Sparkles, BedDouble, 
  UtensilsCrossed, Home, Info, ArrowUpRight, TrendingUp, Briefcase 
} from 'lucide-react';
import { locations } from '../../data/locations';
import CategoryPills from '../CategoryPills/CategoryPills';
import './Header.css';

export default function Header({ 
  onSelectLocation, 
  onOpenDriverPortal, 
  onOpenDrivers,
  activeFilter,
  onFilterChange,
  onAdminOpen,
  onSearchFocusChange
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (onSearchFocusChange) {
      onSearchFocusChange(isFocused);
    }
  }, [isFocused, onSearchFocusChange]);

  // Filtered search results or popular recommendations
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      // Top trending pilgrim destinations as default suggestions
      return locations.slice(0, 6);
    }
    const q = query.toLowerCase().trim();
    return locations.filter(
      (l) => l.name.toLowerCase().includes(q) || 
             l.category.toLowerCase().includes(q) ||
             (l.description && l.description.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query]);

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e) => {
    if (!isFocused) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSelect = (loc) => {
    setQuery('');
    setIsFocused(false);
    setSelectedIndex(-1);
    onSelectLocation(loc);
  };

  const clearQuery = (e) => {
    e.stopPropagation();
    setQuery('');
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    setQuery('');
    setIsFocused(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      const headerEl = document.querySelector('.header-card');
      if (headerEl && !headerEl.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const getCategoryMeta = (category) => {
    switch (category) {
      case 'Temple':
        return { Icon: Landmark, color: '#b45309', bg: '#fef3c7' };
      case 'Holy Site':
        return { Icon: Sparkles, color: '#0284c7', bg: '#e0f2fe' };
      case 'Hotel':
        return { Icon: BedDouble, color: '#15803d', bg: '#dcfce7' };
      case 'Dining':
      case 'Restaurant':
        return { Icon: UtensilsCrossed, color: '#c2410c', bg: '#ffedd5' };
      case 'Town':
        return { Icon: Home, color: '#4f46e5', bg: '#e0e7ff' };
      default:
        return { Icon: Info, color: '#3f3f46', bg: '#f4f4f5' };
    }
  };

  const isDropdownOpen = isFocused;

  return (
    <>
      {isFocused && (
        <div 
          className="search-backdrop-scrim" 
          onClick={handleCancel} 
          aria-hidden="true" 
        />
      )}

      <header className={`header-card ${isDropdownOpen ? 'search-active' : ''}`}>
        <div className="header-top-row">
          {/* Brand Logo - Visible in resting mode */}
          {!isFocused && (
            <div className="header-brand-logo" title="Vrindopnishad">
              <img src="/official-logo.svg" alt="Vrindopnishad Logo" className="site-brand-logo" />
            </div>
          )}

        {/* Search Input Bar */}
        <div 
          className={`search-bar ${isFocused ? 'focused' : ''}`}
          role="combobox"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-controls="search-dropdown-menu"
        >
          {isFocused ? (
            <button 
              type="button" 
              className="search-leading-btn"
              onClick={handleCancel}
              title="Back"
              aria-label="Exit search"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <Search size={16} className="search-icon" aria-hidden="true" />
          )}

          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Search temples, holy sites, dining, pilgrim rides"
            placeholder="Search temples, holy sites, dining, rides..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
          />

          {query.length > 0 ? (
            <button 
              type="button" 
              className="search-trailing-btn" 
              onClick={clearQuery} 
              aria-label="Clear search input"
              title="Clear"
            >
              <X size={14} />
            </button>
          ) : isFocused ? (
            <button 
              type="button" 
              className="search-trailing-btn" 
              onClick={handleCancel} 
              aria-label="Close search"
              title="Close"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {!isFocused && (
          <>
            <button 
              className="icon-btn header-action-btn" 
              id="rides-btn" 
              onClick={onOpenDrivers}
              title="Find Local Drivers & Rides"
              aria-label="Find Rides"
            >
              <Car size={16} />
              <span className="btn-text">Rides</span>
            </button>

            <button 
              className="icon-btn header-action-btn" 
              id="partner-btn" 
              onClick={onOpenDriverPortal}
              title="Brij Staff & Partner Hub (Drivers, Dining, Stays, Admin)"
              aria-label="Partner Hub"
            >
              <Briefcase size={15} />
              <span className="btn-text">Partner</span>
            </button>
          </>
        )}
      </div>

      {/* Category Tray - Visible in resting mode */}
      {!isFocused && (
        <div className="header-category-tray">
          <CategoryPills 
            activeFilter={activeFilter} 
            onFilterChange={onFilterChange} 
            onAdminOpen={onAdminOpen}
          />
        </div>
      )}

      {/* Integrated Search Suggestions Panel (Single Unified Card Surface) */}
      {isDropdownOpen && (
        <div 
          ref={dropdownRef} 
          id="search-dropdown-menu" 
          className="search-results-panel"
          role="listbox"
          aria-label="Search Suggestions"
        >
          <div className="search-results-header">
            {query.trim() ? (
              <span>Matching Destinations ({searchResults.length})</span>
            ) : (
              <div className="sr-header-trending">
                <TrendingUp size={13} color="#71717a" />
                <span>Trending Pilgrimage Sites</span>
              </div>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="search-empty-state">
              <p>No sacred sites matching &ldquo;<strong>{query}</strong>&rdquo;</p>
              <span>Try searching for Radha Rani, Lalita Sakhi, or Govardhan</span>
            </div>
          ) : (
            <div className="search-results-list">
              {searchResults.map((loc, idx) => {
                const meta = getCategoryMeta(loc.category);
                const IconComponent = meta.Icon;
                const isSelected = selectedIndex === idx;

                return (
                  <div 
                    key={loc.name} 
                    className={`search-result-item ${isSelected ? 'selected' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onMouseDown={() => handleSelect(loc)}
                  >
                    <div 
                      className="sr-icon-avatar"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <IconComponent size={16} />
                    </div>

                    <div className="sr-text">
                      <div className="sr-name-row">
                        <h4>{loc.name}</h4>
                        {loc.rating && (
                          <span className="sr-rating">★ {loc.rating}</span>
                        )}
                      </div>
                      <div className="sr-meta-row">
                        <span className="sr-category-pill">{loc.category}</span>
                        {loc.points && (
                          <span className="sr-points">+{loc.points} pts</span>
                        )}
                      </div>
                    </div>

                    <ArrowUpRight size={15} className="sr-arrow" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </header>
  </>
  );
}
