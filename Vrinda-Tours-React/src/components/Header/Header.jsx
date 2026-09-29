import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, XMarkIcon, ArrowLeftIcon, ArrowUpRightIcon, 
  SparklesIcon, BuildingOffice2Icon, BuildingStorefrontIcon, 
  HomeIcon, InformationCircleIcon, BriefcaseIcon, TruckIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Landmark, MapPin, Compass, User, Smartphone, Navigation, ChevronDown, Check } from 'lucide-react';
import { locations } from '../../data/locations';
import CategoryPills from '../CategoryPills/CategoryPills';
import { useFavorites } from '../../hooks/useFavorites';
import { searchAllPlacesAndAreas } from '../../services/geocodingService';
import ProfileDropdown from '../Profile/ProfileDropdown';
import { getLocalUserBookings } from '../../services/bookingService';
import './Header.css';

const SERVICE_MODES = [
  {
    id: 'darshan',
    title: 'Pilgrimage & Darshan',
    desc: 'Explore sacred temples, holy ghats & kunds',
    label: 'Vrinda'
  },
  {
    id: 'packages',
    title: 'Curated Tour Packages',
    desc: 'Book guided Brij 84 Kos & Mathura yatra',
    label: 'Packages'
  },
  {
    id: 'rides',
    title: 'Instant Cabs & E-Rickshaws',
    desc: 'Hail verified local drivers & desk',
    label: 'Rides'
  },
  {
    id: 'stays',
    title: 'Ashrams & Stay Bookings',
    desc: 'Reserve peaceful stays & dharamshalas',
    label: 'Stays'
  }
];

export default function Header({ 
  onSelectLocation, 
  onOpenDriverPortal, 
  onOpenDrivers,
  onOpenFullProfile,
  onOpenInstallApp,
  activeFilter,
  onFilterChange,
  onAdminOpen,
  onSearchFocusChange,
  isNavigating = false,
  partnerId = null,
  partnerRole = null,
  isAdmin = false,
  userPosition = null,
  themePreference = 'system',
  onThemeChange = null
}) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState('darshan');
  const [bookingsCount, setBookingsCount] = useState(() => getLocalUserBookings().length);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const modeDropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { favorites, isFavorite, favoritesCount } = useFavorites();

  // Listen to bookings update
  useEffect(() => {
    const handleUpdate = () => {
      setBookingsCount(getLocalUserBookings().length);
    };
    window.addEventListener('vt:bookings-updated', handleUpdate);
    return () => window.removeEventListener('vt:bookings-updated', handleUpdate);
  }, []);

  // Listen to mode dropdown close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target)) {
        setIsModeDropdownOpen(false);
      }
    };
    if (isModeDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isModeDropdownOpen]);

  const activeUserRole = useMemo(() => {
    if (isAdmin) return 'admin';
    return partnerRole || sessionStorage.getItem('vt_active_user_role') || sessionStorage.getItem('vt_partner_role') || 'user';
  }, [isAdmin, partnerRole]);

  // High-speed Area & Place Search with Debounce
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!query.trim()) {
      // Default trending & favorite destinations
      if (favorites.length > 0) {
        const favLocs = locations.filter((l) => favorites.includes(l.name)).map(l => ({
          ...l,
          town: l.town || (l.name.includes('Barsana') ? 'Barsana' : l.name.includes('Govardhan') ? 'Govardhan' : 'Vrindavan'),
          source: 'fav'
        }));
        const otherLocs = locations.filter((l) => !favorites.includes(l.name)).map(l => ({
          ...l,
          town: l.town || (l.name.includes('Barsana') ? 'Barsana' : l.name.includes('Govardhan') ? 'Govardhan' : 'Vrindavan'),
          source: 'curated'
        }));
        setSearchResults([...favLocs, ...otherLocs].slice(0, 8));
      } else {
        setSearchResults(locations.slice(0, 8).map(l => ({
          ...l,
          town: l.town || (l.name.includes('Barsana') ? 'Barsana' : l.name.includes('Govardhan') ? 'Govardhan' : 'Vrindavan'),
          source: 'curated'
        })));
      }
      setIsSearchingOnline(false);
      return;
    }

    setIsSearchingOnline(true);
    debounceTimerRef.current = setTimeout(async () => {
      const results = await searchAllPlacesAndAreas(query, userPosition);
      setSearchResults(results);
      setIsSearchingOnline(false);
    }, 200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, favorites, userPosition]);

  useEffect(() => {
    if (onSearchFocusChange) {
      onSearchFocusChange(isFocused);
    }
  }, [isFocused, onSearchFocusChange]);

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

  const handleSelectMode = (modeId) => {
    setCurrentMode(modeId);
    setIsModeDropdownOpen(false);
    if (modeId === 'darshan') {
      onFilterChange?.('all');
      onSelectLocation?.(null);
    } else if (modeId === 'packages') {
      window.dispatchEvent(new CustomEvent('vt:open-packages-modal'));
    } else if (modeId === 'rides') {
      onOpenDrivers?.();
    } else if (modeId === 'stays') {
      onFilterChange?.('Hotel');
    }
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
      case 'Ghat':
        return { Icon: Compass, color: '#0284c7', bg: '#e0f2fe' };
      case 'Area':
      case 'Highway / Entry':
      case 'Market / Old Town':
      case 'Transit':
        return { Icon: MapPin, color: '#059669', bg: '#d1fae5' };
      default:
        return { Icon: InformationCircleIcon, color: '#3f3f46', bg: '#f4f4f5' };
    }
  };

  const isDropdownOpen = isFocused;
  const currentModeObj = SERVICE_MODES.find((m) => m.id === currentMode) || SERVICE_MODES[0];

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
          {/* Brand & Mode Dropdown Selector (ChatGPT / Codex Reference) */}
          {!isFocused && (
            <div className="header-mode-selector-wrap" ref={modeDropdownRef}>
              <button 
                type="button" 
                className={`header-mode-trigger-btn ${isModeDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                title="Switch Portal Mode"
                aria-expanded={isModeDropdownOpen}
                aria-haspopup="listbox"
              >
                <span className="header-mode-icon-wrap">
                  <img 
                    src="/official-logo.svg" 
                    alt="Vrinda" 
                    className="site-brand-logo"
                    width="17"
                    height="17"
                    loading="eager"
                  />
                </span>
                <span className="header-mode-trigger-text">{currentModeObj.label}</span>
                <ChevronDown size={13} strokeWidth={2.2} className={`header-mode-chevron ${isModeDropdownOpen ? 'open' : ''}`} />
              </button>

              {isModeDropdownOpen && (
                <div className="header-mode-dropdown-menu" role="listbox">
                  {SERVICE_MODES.map((mode) => {
                    const isSelected = currentMode === mode.id;
                    return (
                      <div
                        key={mode.id}
                        className={`header-mode-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectMode(mode.id)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="header-mode-item-content">
                          <span className="header-mode-item-title">{mode.title}</span>
                          <span className="header-mode-item-desc">{mode.desc}</span>
                        </div>
                        {isSelected && <Check size={16} className="header-mode-check" />}
                      </div>
                    );
                  })}
                </div>
              )}
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
              aria-label="Search areas, temples, stays, routes..."
              placeholder="Search areas, temples, stays, routes..."
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
            <div className="header-actions-cluster">
              {/* Quick Rides Button */}
              <button 
                className="icon-btn header-action-btn rides-pill" 
                id="rides-btn" 
                onClick={onOpenDrivers}
                title="Find Nearest Drivers & E-Rickshaws"
                aria-label="Find Rides"
              >
                <TruckIcon style={{ width: 15, height: 15 }} />
                <span className="btn-text">Rides</span>
              </button>

              {/* Profile Avatar & Unified Dropdown */}
              <div className="header-profile-wrap">
                <button 
                  className="icon-btn header-profile-btn"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  title="User Profile & Roles"
                  aria-label="User Profile"
                >
                  <User size={15} />
                </button>

                <ProfileDropdown
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                  activeRole={activeUserRole}
                  savedCount={favoritesCount}
                  bookingsCount={bookingsCount}
                  themePreference={themePreference}
                  onThemeChange={onThemeChange}
                  onOpenFullProfile={(tab) => onOpenFullProfile?.(tab)}
                  onOpenInstallApp={() => onOpenInstallApp?.()}
                  onOpenDriverPortal={() => onOpenDriverPortal?.()}
                  onOpenAdmin={() => onAdminOpen?.()}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
          )}
        </div>

        {/* Category Tray */}
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

        {/* Search Suggestions Panel */}
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
                <span>
                  {isSearchingOnline ? 'Searching areas & places...' : `Matching Areas & Places (${searchResults.length})`}
                </span>
              ) : favorites.length > 0 ? (
                <div className="sr-header-trending">
                  <HeartSolid style={{ width: 13, height: 13, color: '#e11d48' }} />
                  <span>Your Saved Favourites & Trending Places</span>
                </div>
              ) : (
                <div className="sr-header-trending">
                  <ArrowTrendingUpIcon style={{ width: 13, height: 13, color: '#71717a' }} />
                  <span>Trending Pilgrimage Areas & Sites</span>
                </div>
              )}
            </div>

            {searchResults.length === 0 && !isSearchingOnline ? (
              <div className="search-empty-state">
                <p>No results found for &ldquo;<strong>{query}</strong>&rdquo;</p>
                <span>Try searching for Raman Reti, Chhatikara, Keshi Ghat, or Barsana</span>
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
                      key={loc.id || loc.name} 
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
                            {loc.distanceText && (
                              <span className="sr-dist-badge">
                                <Navigation size={9} style={{ display: 'inline', marginRight: 2 }} />
                                {loc.distanceText}
                              </span>
                            )}
                            {loc.rating && (
                              <span className="sr-rating">★ {loc.rating}</span>
                            )}
                          </div>
                        </div>
                        <div className="sr-meta-row">
                          <span className="sr-category-pill">{loc.category || 'Place'}</span>
                          <span className="sr-dot-sep">•</span>
                          <span className="sr-town-text">{loc.town || (loc.subtitle && !loc.subtitle.includes(loc.category) ? loc.subtitle : 'Brij Dham')}</span>
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
