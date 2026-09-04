import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, XMarkIcon, ArrowLeftIcon, ArrowUpRightIcon, 
  SparklesIcon, BuildingOffice2Icon, BuildingStorefrontIcon, 
  HomeIcon, InformationCircleIcon, BriefcaseIcon, TruckIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { Landmark } from 'lucide-react';
import { locations } from '../../data/locations';
import CategoryPills from '../CategoryPills/CategoryPills';
import { useFavorites } from '../../hooks/useFavorites';
import './Header.css';

export default function Header({ 
  onSelectLocation, 
  onOpenDriverPortal, 
  onOpenDrivers,
  activeFilter,
  onFilterChange,
  onAdminOpen,
  onSearchFocusChange,
  isNavigating = false,
  partnerId = null,
  partnerRole = null,
  isAdmin = false
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const { favorites, isFavorite, favoritesCount } = useFavorites();

  // Check if current user is an authenticated partner or admin (hide partner button for normal pilgrims)
  const isPartnerUser = useMemo(() => {
    try {
      if (isAdmin) return true;
      const pid = partnerId || sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_driver_id') || localStorage.getItem('vt_partner_id') || localStorage.getItem('vt_driver_id');
      const isRealPartnerId = Boolean(
        pid && 
        pid !== 'admin_preview_driver' && 
        pid !== 'admin_preview_hotel' && 
        pid !== 'admin_preview_restaurant' && 
        pid !== 'admin_preview_agency' && 
        pid !== 'driver_preview' && 
        pid !== 'hotel_preview' && 
        pid !== 'restaurant_preview' && 
        pid !== 'agency_preview' && 
        pid !== 'undefined' && 
        pid !== 'null'
      );
      if (isRealPartnerId) return true;
      
      const adminSession = sessionStorage.getItem('vt_is_admin') === 'true' || localStorage.getItem('vt_admin_session') === 'true' || localStorage.getItem('vt_user_role') === 'admin';
      if (adminSession) return true;
      return false;
    } catch {
      return false;
    }
  }, [isAdmin, partnerId]);

  // Determine partner desk title and label
  const partnerButtonConfig = useMemo(() => {
    try {
      const effectiveRole = (isAdmin || sessionStorage.getItem('vt_is_admin') === 'true' || localStorage.getItem('vt_admin_session') === 'true')
        ? 'admin' 
        : (partnerRole || sessionStorage.getItem('vt_partner_role') || localStorage.getItem('vt_user_role') || 'driver');
      
      switch (effectiveRole) {
        case 'admin':
          return { label: 'Admin', title: 'Super Admin Operations Console' };
        case 'driver':
          return { label: 'Sarathi', title: 'Sarathi Driver Workspace' };
        case 'hotel':
        case 'hotel_staff':
          return { label: 'Stay Desk', title: 'Ashram & Hotel Stay Workspace' };
        case 'restaurant':
        case 'restaurant_staff':
          return { label: 'Dining', title: 'Dining & Kitchen Workspace' };
        case 'agency':
          return { label: 'Yatra Desk', title: 'Tour Agency Workspace' };
        default:
          return { label: 'Partner', title: 'Partner Workspace' };
      }
    } catch {
      return { label: 'Partner', title: 'Partner Workspace' };
    }
  }, [isAdmin, partnerRole]);

  useEffect(() => {
    if (onSearchFocusChange) {
      onSearchFocusChange(isFocused);
    }
  }, [isFocused, onSearchFocusChange]);

  // Filtered search results or popular recommendations with favourites prioritized
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      // If user has favorites, put favorite items at the top of recommendations
      if (favorites.length > 0) {
        const favLocs = locations.filter((l) => favorites.includes(l.name));
        const otherLocs = locations.filter((l) => !favorites.includes(l.name));
        return [...favLocs, ...otherLocs].slice(0, 6);
      }
      // Top trending pilgrim destinations as default suggestions
      return locations.slice(0, 6);
    }
    const q = query.toLowerCase().trim();
    return locations.filter(
      (l) => l.name.toLowerCase().includes(q) || 
             l.category.toLowerCase().includes(q) ||
             (l.description && l.description.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [query, favorites]);

  const itemRefs = useRef([]);

  // Auto-scroll selected keyboard item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

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
        return { Icon: SparklesIcon, color: '#0284c7', bg: '#e0f2fe' };
      case 'Hotel':
        return { Icon: BuildingOffice2Icon, color: '#15803d', bg: '#dcfce7' };
      case 'Dining':
      case 'Restaurant':
        return { Icon: BuildingStorefrontIcon, color: '#c2410c', bg: '#ffedd5' };
      case 'Town':
        return { Icon: HomeIcon, color: '#4f46e5', bg: '#e0e7ff' };
      default:
        return { Icon: InformationCircleIcon, color: '#3f3f46', bg: '#f4f4f5' };
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
            <div className="header-brand-logo" title="Vrinda Vihar — Sacred Brij 84 Kos Pilgrimage">
              <img 
                src="/official-logo.svg" 
                alt="Vrinda Vihar Official Logo" 
                className="site-brand-logo"
                width="34"
                height="34"
                loading="eager"
              />
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
              <ArrowLeftIcon style={{ width: 18, height: 18 }} />
            </button>
          ) : (
            <MagnifyingGlassIcon style={{ width: 16, height: 16 }} className="search-icon" aria-hidden="true" />
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
              <XMarkIcon style={{ width: 14, height: 14 }} />
            </button>
          ) : isFocused ? (
            <button 
              type="button" 
              className="search-trailing-btn" 
              onClick={handleCancel} 
              aria-label="Close search"
              title="Close"
            >
              <XMarkIcon style={{ width: 14, height: 14 }} />
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
              <TruckIcon style={{ width: 16, height: 16 }} />
              <span className="btn-text">Rides</span>
            </button>

            {isPartnerUser && (
              <button 
                className="icon-btn header-action-btn partner-active-chip" 
                id="partner-btn" 
                onClick={onOpenDriverPortal}
                title={partnerButtonConfig.title}
                aria-label="Partner Workspace"
              >
                <BriefcaseIcon style={{ width: 15, height: 15 }} />
                <span className="btn-text">{partnerButtonConfig.label}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Category Tray - Visible in resting mode (hidden during active turn-by-turn navigation) */}
      {!isFocused && !isNavigating && (
        <div className="header-category-tray">
          <CategoryPills 
            activeFilter={activeFilter} 
            onFilterChange={onFilterChange} 
            onAdminOpen={onAdminOpen}
            favoritesCount={favoritesCount}
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
            ) : favorites.length > 0 ? (
              <div className="sr-header-trending">
                <HeartSolid style={{ width: 13, height: 13, color: '#e11d48' }} />
                <span>Your Favourites & Trending Places</span>
              </div>
            ) : (
              <div className="sr-header-trending">
                <ArrowTrendingUpIcon style={{ width: 13, height: 13, color: '#71717a' }} />
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
                const isItemFav = isFavorite(loc.name);

                return (
                  <div 
                    key={loc.name} 
                    ref={(el) => (itemRefs.current[idx] = el)}
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
                      <IconComponent style={{ width: 16, height: 16 }} size={16} />
                    </div>

                    <div className="sr-text">
                      <div className="sr-name-row">
                        <h4>{loc.name}</h4>
                        <div className="sr-badges-row">
                          {isItemFav && (
                            <span className="sr-fav-badge" title="In your favourites">
                              <HeartSolid style={{ width: 10, height: 10, color: '#e11d48' }} />
                            </span>
                          )}
                          {loc.rating && (
                            <span className="sr-rating">★ {loc.rating}</span>
                          )}
                        </div>
                      </div>
                      <div className="sr-meta-row">
                        <span className="sr-category-pill">{loc.category}</span>
                        {loc.points && (
                          <span className="sr-points">+{loc.points} pts</span>
                        )}
                      </div>
                    </div>

                    <ArrowUpRightIcon style={{ width: 15, height: 15 }} className="sr-arrow" />
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
