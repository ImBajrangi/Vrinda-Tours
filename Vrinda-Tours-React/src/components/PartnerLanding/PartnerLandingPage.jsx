import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import AnimatedIcon from '../UI/AnimatedIcon';
import MorphingIcon from '../UI/MorphingIcon';
import { triggerCelebration } from '../UI/Confetti';
import {
  Compass, Calendar, Clock, Users, MapPin, Search, Star,
  ArrowRight, ArrowLeft, ArrowUpRight, CheckCircle2, Play, SlidersHorizontal,
  X, Menu, Plane, Building2, Bus, Car, Navigation, Mail, Send, ChevronRight, ChevronDown,
  Sparkles, ShieldCheck, Heart, HeartOff, Share2, Phone, Twitter, Facebook, Instagram, Youtube, Globe,
  CreditCard, LayoutGrid, Ticket, Leaf, Sprout, Waves, Linkedin,
  LogIn, LogOut, User, Lock, UserCheck, Eye, EyeOff,
  Maximize2, ZoomIn, Image as ImageIcon, ExternalLink, Tag, Gift,
  Check, Copy, UtensilsCrossed, Headphones, MessageSquare, AlertCircle, Minus,
  Crown, BedDouble, HelpCircle, Settings, ChefHat
} from 'lucide-react';

const PinterestIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);
import {
  heroSteps,
  awesomePlaceAvatars,
  partnerBrands,
  journeySteps,
  popularPlaces,
  tripPackages,
  missionData,
  initiativesData,
  footerNavigation,
  exploreDestinations,
  topDestinationTabs,
  topDestinationsByTab,
  bookingTabs,
  vrindaViharGalleryCategories,
  vrindaViharGalleryData,
  ROLE_CONFIGS,
  resolveUserRole,
  getCachedData,
  setCachedData
} from '../../data/landingData';
import { supabase } from '../../config/supabase';
import { syncPilgrimToSupabase, updateUserRoleInSupabase, getPilgrimReferralStats, REFERRAL_CATEGORIES, shareLinkWithFallback } from '../../services/referralService';
import { getOrCreateThreadId, sendSupportMessage } from '../../services/messagingService';
import { useFirebaseDrivers } from '../../hooks/useFirebaseDrivers';
import { useGeolocation } from '../../hooks/useGeolocation';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { getPersistedLocalRide, subscribeToRideRequest } from '../../services/rideService';
import { validatePhoneNumber } from '../../utils/phoneValidator';
import InstantRideModal from '../Ride/InstantRideModal';
import StripePaymentModal from '../Payment/StripePaymentModal';
import PackageDetailPage from '../PackageDetail/PackageDetailPage';
import { getPackageDeepDetails } from '../../data/packageDeepData';
import CookieConsentBar from '../UI/CookieConsentBar';
import PackageReservationModal from '../PackageBooking/PackageReservationModal';
import TransactionRecallBanner from '../UI/TransactionRecallBanner';
import './PartnerLandingPage.css';

// Interactive Trip Packages Selector Modal
function TripPackagesModal({ isOpen, onClose, onSelectPackage, onOpenDetail }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Packages', count: (tripPackages || []).length },
    { id: '1-day', label: '1-Day Express', count: (tripPackages || []).filter((p) => p.category === '1-day').length },
    { id: 'parikrama', label: 'Parikrama', count: (tripPackages || []).filter((p) => p.category === 'parikrama').length },
    { id: 'multi-day', label: 'Multi-Day Mahayatra', count: (tripPackages || []).filter((p) => p.category === 'multi-day').length }
  ];

  const filteredPackages = (tripPackages || []).filter((pkg) => {
    const matchesCat = activeCategory === 'all' || pkg.category === activeCategory;
    if (!matchesCat) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      pkg.title.toLowerCase().includes(q) ||
      pkg.location.toLowerCase().includes(q) ||
      (pkg.tagline && pkg.tagline.toLowerCase().includes(q)) ||
      pkg.description.toLowerCase().includes(q) ||
      (pkg.highlights && pkg.highlights.some((h) => h.toLowerCase().includes(q)))
    );
  });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="tp-modal-overlay tp-tpkg-overlay" onClick={onClose}>
      <div className="tp-tpkg-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="tp-tpkg-header">
          <div className="tp-tpkg-header-info">
            <div className="tp-tpkg-badge">
              <Sparkles size={13} />
              <span>Sacred Brij Yatra Packages</span>
            </div>
            <h2 className="tp-tpkg-title">Choose Your Brij Yatra Package</h2>
            <p className="tp-tpkg-subtitle">
              Explore curated all-inclusive pilgrimage itineraries tailored for your convenience, darshan passes, and budget.
            </p>
          </div>
          <button className="tp-modal-close-icon tp-tpkg-close" onClick={onClose} aria-label="Close packages modal">
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="tp-tpkg-controls">
          <div className="tp-tpkg-search-wrap">
            <Search size={16} className="tp-tpkg-search-icon" />
            <input
              type="text"
              className="tp-tpkg-search-input"
              placeholder="Search by Dham, temple, or feature (e.g. Bankey Bihari, Govardhan, VIP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="tp-tpkg-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="tp-tpkg-category-pills">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`tp-tpkg-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <span className="tp-tpkg-cat-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        <div className="tp-tpkg-grid">
          {filteredPackages.length === 0 ? (
            <div className="tp-tpkg-empty">
              <Compass size={36} className="tp-tpkg-empty-icon" />
              <h3>No yatra packages match your search</h3>
              <p>Try searching for "Vrindavan", "Barsana", "Govardhan" or switch category.</p>
              <button
                type="button"
                className="tp-tpkg-reset-btn"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                View All Packages
              </button>
            </div>
          ) : (
            filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="tp-tpkg-card"
                onClick={() => {
                  if (onOpenDetail) onOpenDetail(pkg);
                  else onSelectPackage(pkg);
                }}
              >
                {/* Card Image Banner */}
                <div className="tp-tpkg-card-cover">
                  <img src={pkg.image} alt={pkg.title} className="tp-tpkg-img" loading="lazy" />
                  <div className="tp-tpkg-cover-gradient" />
                  {pkg.badge && <span className="tp-tpkg-badge-top">{pkg.badge}</span>}
                  <span className="tp-tpkg-location-badge">
                    <MapPin size={11} />
                    <span>{pkg.location}</span>
                  </span>
                </div>

                {/* Card Content */}
                <div className="tp-tpkg-card-body">
                  {/* Row 1: Duration & Star Rating */}
                  <div className="tp-tpkg-meta-row">
                    <span className="tp-tpkg-duration-chip">
                      <Clock size={11} />
                      <span>{pkg.duration}</span>
                    </span>
                    <span className="tp-tpkg-rating-pill">
                      <Star size={11} fill="#f59e0b" color="#f59e0b" />
                      <strong>{pkg.rating}</strong>
                      <small>({pkg.reviewsCount || 380})</small>
                    </span>
                  </div>

                  {/* Row 2: Title & Tagline */}
                  <div className="tp-tpkg-title-group">
                    <h3 className="tp-tpkg-card-title">{pkg.title}</h3>
                    {pkg.tagline && <p className="tp-tpkg-card-tagline">{pkg.tagline}</p>}
                  </div>

                  {/* Row 3: Included Feature Badges */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="tp-tpkg-features-row">
                      {pkg.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="tp-tpkg-feature-tag">{f}</span>
                      ))}
                    </div>
                  )}

                  {/* Row 4: Key Highlights List */}
                  <div className="tp-tpkg-highlights">
                    <ul className="tp-tpkg-hl-list">
                      {(pkg.highlights || []).slice(0, 2).map((hl, idx) => (
                        <li key={idx} className="tp-tpkg-hl-item">
                          <CheckCircle2 size={13} className="tp-tpkg-check" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Row 5: Pricing & Booking CTA Footer */}
                  <div className="tp-tpkg-footer">
                    <div className="tp-tpkg-pricing">
                      <div className="tp-tpkg-orig-price">
                        <span className="tp-tpkg-strike">{pkg.originalPrice}</span>
                        <span className="tp-tpkg-save-badge">Save 25%</span>
                      </div>
                      <div className="tp-tpkg-final-price">
                        <strong>{pkg.price}</strong>
                        <small>{pkg.priceUnit || '/person'}</small>
                      </div>
                    </div>

                    <div className="tp-tpkg-card-btn-suite">
                      {onOpenDetail && (
                        <button
                          type="button"
                          className="tp-tpkg-detail-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetail(pkg);
                          }}
                          aria-label={`View full details for ${pkg.title}`}
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="tp-tpkg-select-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPackage(pkg);
                        }}
                        aria-label={`Book ${pkg.title}`}
                      >
                        <span>Book Now</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feasibility Guarantee Footer Bar */}
        <div className="tp-tpkg-guarantee-bar">
          <div className="tp-tpkg-guarantee-item">
            <ShieldCheck size={16} className="tp-tpkg-g-icon" />
            <span>100% Verified Brajwasi Guides</span>
          </div>
          <div className="tp-tpkg-guarantee-item">
            <CheckCircle2 size={16} className="tp-tpkg-g-icon" />
            <span>Free Date Rescheduling</span>
          </div>
          <div className="tp-tpkg-guarantee-item">
            <Gift size={16} className="tp-tpkg-g-icon" />
            <span>Earn Brij Devotee Points</span>
          </div>
          <div className="tp-tpkg-guarantee-item">
            <Phone size={16} className="tp-tpkg-g-icon" />
            <span>24/7 Pilgrimage Support</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Role SVG Icon Provider
const renderRoleIcon = (roleId, size = 15) => {
  switch (roleId) {
    case 'admin':
      return <Crown size={size} />;
    case 'driver':
      return <Car size={size} />;
    case 'restaurant':
      return <UtensilsCrossed size={size} />;
    case 'restaurant_staff':
      return <ChefHat size={size} />;
    case 'hotel':
      return <BedDouble size={size} />;
    case 'hotel_staff':
      return <Building2 size={size} />;
    case 'agency':
      return <Compass size={size} />;
    case 'pilgrim':
    default:
      return <Sparkles size={size} />;
  }
};

// Interactive Role & Authority Configuration Modal (Minimalist & High Impact)
function RoleAuthorityModal({ isOpen, onClose, activeRole, onSelectRole }) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="tp-modal-overlay" onClick={onClose}>
      <div className="tp-modal-card tp-role-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="tp-role-modal-header">
          <div className="tp-role-modal-header-text">
            <div className="tp-role-modal-eyebrow">
              <ShieldCheck size={13} /> WORKSPACE AUTHORITY
            </div>
            <h3>Switch Account Role</h3>
            <p>Select your active workspace profile.</p>
          </div>
          <button type="button" className="tp-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="tp-role-modal-body">
          <div className="tp-role-grid">
            {Object.values(ROLE_CONFIGS).map((cfg) => {
              const isSelected = activeRole === cfg.id;
              return (
                <div
                  key={cfg.id}
                  className={`tp-role-card ${isSelected ? 'is-active' : ''} ${cfg.badgeClass}`}
                  onClick={() => {
                    onSelectRole(cfg.id);
                    onClose();
                  }}
                >
                  <div className="tp-role-card-top">
                    <div className="tp-role-card-badge" style={{ color: cfg.color, background: cfg.accentBg, borderColor: cfg.borderColor }}>
                      <span className="tp-role-icon">{renderRoleIcon(cfg.id, 14)}</span>
                      <span className="tp-role-tag-title">{cfg.tag}</span>
                    </div>
                    {isSelected && (
                      <span className="tp-role-active-indicator">
                        <CheckCircle2 size={13} /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="tp-role-card-name">{cfg.shortLabel}</h4>
                  <p className="tp-role-card-desc">{cfg.description}</p>
                  <button
                    type="button"
                    className={`tp-btn-select-role ${isSelected ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRole(cfg.id);
                      onClose();
                    }}
                  >
                    {isSelected ? 'Active Mode' : 'Switch Mode'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tp-role-modal-footer">
          <div className="tp-role-footer-info">
            <span>Instant workspace adaptation</span>
          </div>
          <button type="button" className="tp-btn-role-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Index of all searchable app services & tools
const softwareServices = [
  {
    id: 'srv_live_map',
    title: 'Live Pilgrim GPS Map & Navigation',
    subtitle: 'Real-time interactive Brij map with 1300+ holy places & live GPS guide',
    category: 'service',
    badge: 'Live Tool',
    icon: 'map',
    actionType: 'live_map'
  },
  {
    id: 'srv_yatra_packages',
    title: 'Curated Brij Yatra & Trip Packages',
    subtitle: '1-Day, 2-Day, Parikrama & 84 Kos all-inclusive pilgrimage itineraries',
    category: 'service',
    badge: 'Booking',
    icon: 'compass',
    actionType: 'packages_modal'
  },
  {
    id: 'srv_vip_darshan',
    title: 'Darshan Passes & Guide Service',
    subtitle: 'Priority entry passes & dedicated local Brajwasi guide assistance',
    category: 'service',
    badge: 'Pass',
    icon: 'ticket',
    actionType: 'packages_modal'
  },
  {
    id: 'srv_referrals',
    title: 'Pilgrim Referral & Rewards Engine',
    subtitle: 'Share your referral code with devotees & earn 500 Brij Points per trip',
    category: 'service',
    badge: '+500 Points',
    icon: 'gift',
    actionType: 'referral'
  },
  {
    id: 'srv_partner_hub',
    title: 'Driver, Hotel & Agency Partner Hub',
    subtitle: 'Register as E-Rickshaw driver, tour guide, ashram, or travel agency',
    category: 'service',
    badge: 'Partners',
    icon: 'building',
    actionType: 'partner_hub'
  },
  {
    id: 'srv_gallery',
    title: '4K Ultra-HD Divine Darshan Gallery',
    subtitle: 'Explore high-resolution sacred darshans, abhishek, and shringar of Brij deities',
    category: 'service',
    badge: '30+ Darshans',
    icon: 'image',
    actionType: 'scroll_gallery'
  },
  {
    id: 'srv_auth',
    title: 'Devotee Registration & Member Sign In',
    subtitle: 'One-click sign in for booking autofill, live GPS syncing & member discounts',
    category: 'service',
    badge: 'Member Pass',
    icon: 'user',
    actionType: 'auth'
  },
  {
    id: 'srv_admin_console',
    title: 'Admin Operations & Fleet Management Console',
    subtitle: 'Manage drivers, locations, bookings, partner verifications & platform announcements',
    category: 'service',
    badge: 'Admin Console',
    icon: 'shield',
    actionType: 'admin'
  }
];

// Universal Spotlight Search & Discovery Modal (Apple Spotlight / Raycast Style)
function OmniSearchModal({
  isOpen,
  onClose,
  onSelectTrip,
  onSelectPlace,
  onSelectService,
  onSelectGalleryItem
}) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Flattened and searchable index of all sacred places
  const allDestinations = [
    ...popularPlaces,
    ...(exploreDestinations || []),
    ...Object.values(topDestinationsByTab || {}).flat()
  ];
  const uniqueDestinations = Array.from(new Map(allDestinations.map(item => [item.title, item])).values());

  const searchResults = (() => {
    const q = query.trim().toLowerCase();

    // 1. Packages
    const packages = (tripPackages || []).filter(p =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      (p.tagline && p.tagline.toLowerCase().includes(q)) ||
      p.description.toLowerCase().includes(q) ||
      (p.highlights && p.highlights.some(h => h.toLowerCase().includes(q)))
    ).map(p => ({ ...p, resultType: 'package' }));

    // 2. Places / Dhams
    const places = uniqueDestinations.filter(d =>
      !q ||
      d.title.toLowerCase().includes(q) ||
      (d.location && d.location.toLowerCase().includes(q)) ||
      (d.region && d.region.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q))
    ).map(d => ({ ...d, resultType: 'place' }));

    // 3. Software Services & Features
    const services = softwareServices.filter(s =>
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      s.badge.toLowerCase().includes(q)
    ).map(s => ({ ...s, resultType: 'service' }));

    // 4. Gallery Items
    const darshans = (vrindaViharGalleryData || []).filter(g =>
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.location.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))
    ).map(g => ({ ...g, resultType: 'darshan' }));

    let combined = [];
    if (activeFilter === 'all') {
      combined = [...packages, ...places, ...services, ...darshans];
    } else if (activeFilter === 'package') {
      combined = packages;
    } else if (activeFilter === 'place') {
      combined = places;
    } else if (activeFilter === 'service') {
      combined = services;
    } else if (activeFilter === 'darshan') {
      combined = darshans;
    }

    return combined;
  })();

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (searchResults.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % (searchResults.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectResult(searchResults[selectedIndex]);
      }
    }
  };

  const handleSelectResult = (item) => {
    onClose();
    if (item.resultType === 'package') {
      onSelectTrip(item);
    } else if (item.resultType === 'place') {
      onSelectPlace(item);
    } else if (item.resultType === 'service') {
      onSelectService(item);
    } else if (item.resultType === 'darshan') {
      onSelectGalleryItem(item);
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="tp-modal-overlay tp-search-overlay" onClick={onClose}>
      <div
        className="tp-modal-card tp-omni-search-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="tp-search-modal-header">
          <Search size={20} className="tp-search-modal-icon" />
          <input
            ref={inputRef}
            type="text"
            className="tp-search-modal-input"
            placeholder="Search trips, sacred dhams, services, passes, darshans..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button type="button" className="tp-search-clear-btn" onClick={() => setQuery('')} aria-label="Clear input">
              <X size={14} />
            </button>
          )}
          <button type="button" className="tp-search-close-btn" onClick={onClose} aria-label="Close search" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="tp-search-filter-row">
          <button
            type="button"
            className={`tp-search-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('all'); setSelectedIndex(0); }}
          >
            All ({searchResults.length})
          </button>
          <button
            type="button"
            className={`tp-search-pill ${activeFilter === 'package' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('package'); setSelectedIndex(0); }}
          >
            Yatra Packages
          </button>
          <button
            type="button"
            className={`tp-search-pill ${activeFilter === 'place' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('place'); setSelectedIndex(0); }}
          >
            Sacred Dhams
          </button>
          <button
            type="button"
            className={`tp-search-pill ${activeFilter === 'service' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('service'); setSelectedIndex(0); }}
          >
            Services & Tools
          </button>
          <button
            type="button"
            className={`tp-search-pill ${activeFilter === 'darshan' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('darshan'); setSelectedIndex(0); }}
          >
            Live Darshans
          </button>
        </div>

        {/* Quick Suggestion Tags (Only shown when query is empty) */}
        {!query && (
          <div className="tp-search-trending-bar">
            <span className="tp-search-trending-label">SUGGESTIONS</span>
            <div className="tp-search-trending-tags">
              {['Bankey Bihari VIP', 'Govardhan Parikrama', 'Live GPS Map', 'Barsana Yatra', 'Radha Raman', 'Referral Rewards'].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="tp-trending-tag-pill"
                  onClick={() => {
                    setQuery(tag);
                    setSelectedIndex(0);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="tp-search-results-list">
          {searchResults.length === 0 ? (
            <div className="tp-search-empty-state">
              <Compass size={28} />
              <h4>No matches found for "{query}"</h4>
              <p>Try searching for "Vrindavan", "Pass", "Parikrama", or "GPS Map".</p>
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              // Standardized price formatter
              const priceData = (() => {
                if (!item.price && !item.numericPrice) return null;
                let p = item.price || '';
                let u = item.priceUnit || '';
                if (item.numericPrice) {
                  p = `₹${item.numericPrice.toLocaleString('en-IN')}`;
                } else if (typeof p === 'string') {
                  if (p.toLowerCase().includes('2.5k')) p = '₹2,500';
                  else if (p.toLowerCase().includes('3.5k')) p = '₹3,500';
                  else if (p.toLowerCase().includes('7.9k') || p.includes('7,999')) p = '₹7,999';
                  else if (p.includes('2,499') || p.includes('2499')) p = '₹2,499';
                  else if (p.includes('1,899') || p.includes('1899')) p = '₹1,899';
                  else if (p.includes('2,199') || p.includes('2199')) p = '₹2,199';
                  else if (!p.startsWith('₹') && !isNaN(Number(p.replace(/[^0-9]/g, '')))) {
                    const num = Number(p.replace(/[^0-9]/g, ''));
                    if (num > 0) p = `₹${num.toLocaleString('en-IN')}`;
                  }
                }
                if (u) {
                  u = u.replace(/^[\/\-\s]+/, '').trim();
                  if (u.toLowerCase() === 'pax') u = 'person';
                  if (u.toLowerCase() === 'day') u = 'day';
                  u = `/${u}`;
                } else if (p && !p.includes('/')) {
                  u = '/person';
                }
                return { price: p, unit: u };
              })();

              return (
                <div
                  key={`${item.resultType}-${item.id || idx}`}
                  className={`tp-search-result-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  {/* Thumbnail / Icon Pod */}
                  <div className="tp-search-item-thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="tp-search-thumb-img" loading="lazy" />
                    ) : (
                      <div className="tp-search-service-icon">
                        {item.icon === 'map' && <MapPin size={18} />}
                        {item.icon === 'compass' && <Compass size={18} />}
                        {item.icon === 'ticket' && <Ticket size={18} />}
                        {item.icon === 'gift' && <Gift size={18} />}
                        {item.icon === 'building' && <Building2 size={18} />}
                        {item.icon === 'image' && <ImageIcon size={18} />}
                        {item.icon === 'user' && <User size={18} />}
                        {item.icon === 'shield' && <ShieldCheck size={18} />}
                        {item.icon === 'lock' && <Lock size={18} />}
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="tp-search-item-info">
                    <div className="tp-search-item-header">
                      <span className="tp-search-item-title">{item.title}</span>
                      <span className={`tp-search-type-badge tp-badge-${item.resultType}`}>
                        {item.resultType === 'package' && 'Package'}
                        {item.resultType === 'place' && 'Dham'}
                        {item.resultType === 'service' && (item.badge || 'Tool')}
                        {item.resultType === 'darshan' && 'Darshan'}
                      </span>
                    </div>

                    <div className="tp-search-item-meta">
                      {item.duration && (
                        <span className="tp-search-meta-chip">
                          <Clock size={11} />
                          <span>{item.duration}</span>
                        </span>
                      )}
                      {item.rating && (
                        <span className="tp-search-meta-chip tp-search-rating-chip">
                          <Star size={10} fill="#f59e0b" color="#f59e0b" />
                          <span>{item.rating}</span>
                        </span>
                      )}
                      <p className="tp-search-item-sub">
                        {item.subtitle || item.tagline || item.location || item.description || ''}
                      </p>
                    </div>
                  </div>

                  {/* Price or Action Arrow */}
                  <div className="tp-search-item-action">
                    {priceData && (
                      <span className="tp-search-item-price">
                        <strong>{priceData.price}</strong>
                        <small>{priceData.unit}</small>
                      </span>
                    )}
                    <div className="tp-search-arrow-wrap">
                      <ArrowRight size={13} className="tp-search-arrow" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Search Modal Footer */}
        <div className="tp-search-modal-footer">
          <div className="tp-search-footer-hint">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>
          <span className="tp-search-footer-brand">Vrinda Search</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Real-time zero-latency Journey Accordion Component
function PartnerJourneySection({ onSelectItem }) {
  const [activeStep, setActiveStep] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef(null);

  // Auto-advance loop every 5s (pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 35) {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    } else if (diff < -35) {
      setActiveStep((prev) => (prev === 1 ? 3 : prev - 1));
    }
    touchStartXRef.current = null;
  };

  return (
    <section className="tp-journey-section" id="journey">
      <div className="tp-container">
        <div className="tp-journey-header">
          <h2 className="tp-journey-title">Journey To The Skies Made Simple</h2>
          <p className="tp-journey-sub">Find your destination, book premium tickets, and fly with ease.</p>
        </div>

        {/* Real-time zero delay Accordion Stage */}
        <div
          className="tp-journey-stage"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ touchAction: 'pan-y manipulation' }}
        >
          {journeySteps.map((step) => {
            const isActive = activeStep === step.stepNumber;
            return (
              <div
                key={step.id}
                className={`tp-journey-card ${isActive ? 'tp-j-active' : 'tp-j-inactive'}`}
                onPointerDown={() => setActiveStep(step.stepNumber)}
                onClick={() => setActiveStep(step.stepNumber)}
                style={{ touchAction: 'manipulation', cursor: 'pointer' }}
              >
                {/* Inactive Capsule Tab Layer */}
                <div className="tp-j-inactive-view">
                  <div className="tp-j-inactive-icon-wrap">
                    {step.iconType === 'pin' && <MapPin size={22} className="tp-j-inactive-icon" />}
                    {step.iconType === 'card' && <CreditCard size={22} className="tp-j-inactive-icon" />}
                    {step.iconType === 'grid' && <Ticket size={22} className="tp-j-inactive-icon" />}
                  </div>
                  <h4 className="tp-j-inactive-title">
                    {step.title.split('\n').map((line, idx) => (
                      <span key={idx} className="tp-j-inactive-line">{line}</span>
                    ))}
                  </h4>
                </div>

                {/* Active Expanded Card Layer */}
                <div className="tp-j-active-view">
                  {/* Top Header Row with Curved Organic Photo Window */}
                  <div className="tp-j-top-row">
                    <div className="tp-j-photo-window">
                      <img
                        src={step.photo}
                        alt={step.shortTitle}
                        className="tp-j-cutout-img"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="tp-j-body">
                    <h3 className="tp-j-active-title">
                      {step.title.split('\n').map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < step.title.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </h3>
                    <p className="tp-j-active-desc">{step.desc}</p>
                    <button
                      type="button"
                      className="tp-j-learn-more-btn"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectItem) {
                          onSelectItem(popularPlaces[step.stepNumber - 1] || popularPlaces[0]);
                        }
                      }}
                    >
                      <span>{step.linkText}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Dots Indicator */}
        <div className="tp-journey-dots-row">
          {journeySteps.map((s) => (
            <span
              key={s.id}
              className={`tp-j-dot ${activeStep === s.stepNumber ? 'active' : ''}`}
              onPointerDown={() => setActiveStep(s.stepNumber)}
              onClick={() => setActiveStep(s.stepNumber)}
              title={s.shortTitle}
              style={{ cursor: 'pointer', touchAction: 'manipulation' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PartnerLandingPage({
  onClose,
  onOpenPartnerHub,
  onOpenDriverPortal,
  onOpenDriverPage,
  onOpenHotelPage,
  onOpenRestaurantPage,
  onOpenAgencyPage,
  onOpenAdmin,
  onOpenHelpCenter,
  onOpenInfoModal
}) {
  // Hero Step Slider State
  const [activeStep, setActiveStep] = useState(1);
  const currentHero = heroSteps.find(h => h.step === activeStep) || heroSteps[0];

  // Continuous auto-loop Hero Slider every 5.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % heroSteps.length) + 1);
    }, 5500);

    return () => clearInterval(interval);
  }, [activeStep]);

  // Preload all Hero background pictures in memory for zero-latency, instant transitions
  useEffect(() => {
    heroSteps.forEach(step => {
      if (step.bgImage) {
        const img = new Image();
        img.src = step.bgImage;
      }
    });
  }, []);

  // Booking Tab & State

  const [activeTab, setActiveTab] = useState(() => getCachedData('search_tab', 'hostelry'));
  const [destination, setDestination] = useState(() => getCachedData('search_dest', 'Bali, Indonesia'));
  const [checkInDate, setCheckInDate] = useState(() => getCachedData('search_checkin', '2026-09-15'));
  const [checkOutDate, setCheckOutDate] = useState(() => getCachedData('search_checkout', '2026-09-22'));
  const [roomsGuests, setRoomsGuests] = useState(() => getCachedData('search_guests', '1 Room, 2 Guest'));

  // Top Destination Bento Tab State
  const [activeTopTab, setActiveTopTab] = useState(topDestinationTabs[0]);

  // Adventure Category Filter
  const [activeCategory, setActiveCategory] = useState('Popular Destination');
  const [showAllDestinations, setShowAllDestinations] = useState(false);

  // Vrinda Vihar — Master Partner & Pilgrim Landing Page Component
  // High Performance, Responsive, Native Mobile Bottom Sheet Docking Enabled
  const [galleryCategory, setGalleryCategory] = useState(() => getCachedData('gallery_cat', 'All Darshans'));
  const [gallerySearch, setGallerySearch] = useState('');
  const [lightboxItem, setLightboxItem] = useState(null);
  const [stripeModalItem, setStripeModalItem] = useState(null);

  // Uber-Grade Instant Rider State
  const [isInstantRideModalOpen, setIsInstantRideModalOpen] = useState(false);
  const [rideDestination, setRideDestination] = useState({ name: 'Shri Bankey Bihari Mandir', lat: 27.580456, lng: 77.701103 });
  const [activeRide, setActiveRide] = useState(null);
  const [persistedRide, setPersistedRide] = useState(() => getPersistedLocalRide());
  const { drivers } = useFirebaseDrivers();
  const { position } = useGeolocation();

  // Listen to background ride events & storage changes
  useEffect(() => {
    const handleStorageUpdate = () => {
      const current = getPersistedLocalRide();
      setPersistedRide(current);
    };

    window.addEventListener('vt:ride-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('vt:ride-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Real-time listener for current persisted ride document
  useEffect(() => {
    if (!persistedRide?.id) return;

    const unsub = subscribeToRideRequest(persistedRide.id, (updated) => {
      if (!updated) {
        setPersistedRide(null);
        return;
      }
      setPersistedRide(updated);
    });

    return () => unsub();
  }, [persistedRide?.id]);

  // Progressive Reveal / "Show More" Pagination Controls
  const INITIAL_GALLERY_LIMIT = 8;
  const GALLERY_BATCH_SIZE = 8;
  const [galleryVisibleCount, setGalleryVisibleCount] = useState(INITIAL_GALLERY_LIMIT);

  // Responsive balanced column layout for the gallery (prevents WebKit column fragmentation & empty gaps)
  const [galleryColsCount, setGalleryColsCount] = useState(4);

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setGalleryColsCount(2);
      } else if (w < 1024) {
        setGalleryColsCount(3);
      } else {
        setGalleryColsCount(4);
      }
    };
    updateCols();
    window.addEventListener('resize', updateCols, { passive: true });
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Filtered gallery items based on category and search query
  const filteredGalleryItems = useMemo(() => {
    return vrindaViharGalleryData.filter((item) => {
      const matchCategory = galleryCategory === 'All Darshans' || item.category === galleryCategory;
      if (!matchCategory) return false;

      if (!gallerySearch.trim()) return true;
      const q = gallerySearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [galleryCategory, gallerySearch]);

  // Displayed subset of items for progressive reveal
  const displayedGalleryItems = useMemo(() => {
    return filteredGalleryItems.slice(0, galleryVisibleCount);
  }, [filteredGalleryItems, galleryVisibleCount]);

  const hasMoreGalleryItems = galleryVisibleCount < filteredGalleryItems.length;

  // Distribute displayed items using height-weighted shortest-column packing (auto-fills blanks, level bottoms)
  const galleryColumns = useMemo(() => {
    const cols = Array.from({ length: galleryColsCount }, () => ({
      items: [],
      heightWeight: 0
    }));

    displayedGalleryItems.forEach((item) => {
      let weight = 1.25; // default 4/5
      if (item.aspectRatio === '9/16') weight = 1.77;
      else if (item.aspectRatio === '3/4') weight = 1.33;
      else if (item.aspectRatio === '4/5') weight = 1.25;
      else if (item.aspectRatio === '1/1') weight = 1.0;
      else if (item.aspectRatio === '16/9') weight = 0.62;
      else if (item.aspectRatio === '2.2/1') weight = 0.62;

      // Find the column with the minimum cumulative height
      let minCol = cols[0];
      for (let i = 1; i < cols.length; i++) {
        if (cols[i].heightWeight < minCol.heightWeight) {
          minCol = cols[i];
        }
      }

      minCol.items.push(item);
      minCol.heightWeight += weight;
    });

    return cols.map((c) => c.items);
  }, [displayedGalleryItems, galleryColsCount]);

  // Category counts map for interactive pill badges
  const categoryCounts = useMemo(() => {
    const counts = { 'All Darshans': vrindaViharGalleryData.length };
    vrindaViharGalleryCategories.forEach((cat) => {
      if (cat !== 'All Darshans') {
        counts[cat] = vrindaViharGalleryData.filter((i) => i.category === cat).length;
      }
    });
    return counts;
  }, []);

  // Persist gallery category & reset visible count
  const handleGalleryCategoryChange = (cat) => {
    setGalleryCategory(cat);
    setCachedData('gallery_cat', cat);
    setGalleryVisibleCount(INITIAL_GALLERY_LIMIT);
  };

  // Keyboard navigation for Lightbox (Esc to close, Left/Right arrow to navigate)
  useEffect(() => {
    if (!lightboxItem) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = filteredGalleryItems.findIndex((i) => i.id === lightboxItem.id);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + filteredGalleryItems.length) % filteredGalleryItems.length;
          setLightboxItem(filteredGalleryItems[prevIndex]);
        }
      } else if (e.key === 'ArrowRight') {
        const currentIndex = filteredGalleryItems.findIndex((i) => i.id === lightboxItem.id);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % filteredGalleryItems.length;
          setLightboxItem(filteredGalleryItems[nextIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem, filteredGalleryItems]);

  // Modals & Interactive States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isTripPackagesModalOpen, setIsTripPackagesModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState(false);
  const [activePopularCardId, setActivePopularCardId] = useState(null);
  const [activeGalleryCardId, setActiveGalleryCardId] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K) to open Spotlight Search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOmniSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleSelectTripPackage = (pkg) => {
    setIsTripPackagesModalOpen(false);
    setSelectedItem(pkg);
  };

  // Collapse active mobile card when tapping outside
  useEffect(() => {
    const handleOutsideTap = (e) => {
      if (!e.target.closest('.tp-popular-card') && !e.target.closest('.tp-gallery-card')) {
        setActivePopularCardId(null);
        setActiveGalleryCardId(null);
      }
    };
    document.addEventListener('click', handleOutsideTap);
    document.addEventListener('touchstart', handleOutsideTap, { passive: true });
    return () => {
      document.removeEventListener('click', handleOutsideTap);
      document.removeEventListener('touchstart', handleOutsideTap);
    };
  }, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState(15000);
  const [minRatingFilter, setMinRatingFilter] = useState(4.5);

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Real-time Authentication & Firebase State Synchronization
  const [currentUser, setCurrentUser] = useState(() => {
    const cached = getCachedData('traveler_user', null);
    // Purge mock dummy accounts from previous versions
    if (cached && (cached.email === 'traveler@gmail.com' || cached.name === 'Google Traveler' || cached.tier === 'Google Member')) {
      setCachedData('traveler_user', null);
      return null;
    }
    return cached;
  });

  // Active Category Tag & Dynamic Role State
  const activeUserRole = useMemo(() => {
    return resolveUserRole(currentUser);
  }, [currentUser]);
  const activeRoleConfig = ROLE_CONFIGS[activeUserRole] || ROLE_CONFIGS.pilgrim;

  const getToastRoleSVG = (roleKey, size = 18) => {
    switch (roleKey) {
      case 'admin':
        return <Crown size={size} color="#f59e0b" />;
      case 'driver':
        return <Car size={size} color="#10b981" />;
      case 'restaurant':
      case 'restaurant_staff':
        return <UtensilsCrossed size={size} color="#f97316" />;
      case 'hotel':
        return <BedDouble size={size} color="#a855f7" />;
      case 'agency':
        return <Compass size={size} color="#38bdf8" />;
      case 'pilgrim':
      default:
        return <Sparkles size={size} color="#34d399" />;
    }
  };

  const handleSwitchRole = async (newRoleKey) => {
    if (!ROLE_CONFIGS[newRoleKey]) return;
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsRoleModalOpen(false);
    try {
      localStorage.setItem('vt_user_role', newRoleKey);
    } catch { }
    if (currentUser) {
      const updated = { ...currentUser, role: newRoleKey, category: newRoleKey };
      setCurrentUser(updated);
      setCachedData('traveler_user', updated);

      // Persist & synchronize role directly to Supabase Auth & profiles table
      try {
        await updateUserRoleInSupabase(updated, newRoleKey);
      } catch (err) {
        console.warn('Failed to update role in Supabase:', err);
      }
    }
    const cfg = ROLE_CONFIGS[newRoleKey] || ROLE_CONFIGS.pilgrim;
    setFloatingToast({
      id: `role_switch_${newRoleKey}_${Date.now()}`,
      icon: getToastRoleSVG(newRoleKey, 17),
      roleKey: newRoleKey,
      highlight: true,
      title: `${cfg.shortLabel || cfg.label} Active`,
      desc: null
    });
  };

  const [signupStep, setSignupStep] = useState(1); // 1: Email & Pass, 2: Name, 3: Phone
  const [authNameInput, setAuthNameInput] = useState('');
  const [authEmailInput, setAuthEmailInput] = useState('');
  const [authPhoneInput, setAuthPhoneInput] = useState('');
  const [authPasswordInput, setAuthPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authRememberMe, setAuthRememberMe] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [floatingToast, setFloatingToastState] = useState(null);
  const [toastStage, setToastStage] = useState('visible'); // 'visible' | 'exiting'
  const toastTimerRef = useRef(null);
  const toastTouchStartY = useRef(null);

  const dismissFloatingToast = useCallback(() => {
    setToastStage('exiting');
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setTimeout(() => {
      setFloatingToastState(null);
      setToastStage('visible');
    }, 280);
  }, []);

  const setFloatingToast = useCallback((toastData) => {
    if (!toastData) {
      dismissFloatingToast();
      return;
    }
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastStage('visible');
    setFloatingToastState(toastData);

    const duration = toastData.duration || 5200;
    toastTimerRef.current = setTimeout(() => {
      dismissFloatingToast();
    }, duration);
  }, [dismissFloatingToast]);

  const handleToastMouseEnter = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const handleToastMouseLeave = useCallback(() => {
    if (toastStage === 'visible' && floatingToast) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        dismissFloatingToast();
      }, 3200);
    }
  }, [toastStage, floatingToast, dismissFloatingToast]);

  const handleToastTouchStart = useCallback((e) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (e.touches && e.touches[0]) {
      toastTouchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleToastTouchEnd = useCallback((e) => {
    if (toastTouchStartY.current !== null && e.changedTouches && e.changedTouches[0]) {
      const deltaY = e.changedTouches[0].clientY - toastTouchStartY.current;
      if (deltaY < -15) { // Swiped up towards notch
        dismissFloatingToast();
        return;
      }
    }
    if (toastStage === 'visible' && floatingToast) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        dismissFloatingToast();
      }, 3200);
    }
  }, [toastStage, floatingToast, dismissFloatingToast]);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedRefCategory, setSelectedRefCategory] = useState('pilgrim');
  const [copiedRefTarget, setCopiedRefTarget] = useState('');
  const [showAllRefLinks, setShowAllRefLinks] = useState(false);
  const [authReferralInput, setAuthReferralInput] = useState(() => {
    try {
      return localStorage.getItem('vrinda_referrer_code') || '';
    } catch {
      return '';
    }
  });
  const [showReferralField, setShowReferralField] = useState(() => {
    try {
      return !!localStorage.getItem('vrinda_referrer_code');
    } catch {
      return false;
    }
  });
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, totalPoints: 0, referralsList: [] });
  const profileMenuRef = useRef(null);
  const [isLiveRideCapsuleMinimized, setIsLiveRideCapsuleMinimized] = useState(false);

  // Active modal/overlay detection to prevent floating capsules from overlapping bottom sheets
  const isAnyModalActive = Boolean(
    selectedItem ||
    isTripPackagesModalOpen ||
    isRoleModalOpen ||
    isVideoModalOpen ||
    isFilterModalOpen ||
    isAuthModalOpen ||
    isReferralModalOpen ||
    stripeModalItem ||
    lightboxItem ||
    isMobileMenuOpen ||
    isProfileMenuOpen
  );
  const isCapsuleDocked = isAnyModalActive || isLiveRideCapsuleMinimized;

  // Fetch live referral stats from Supabase when user opens the referral modal
  useEffect(() => {
    if (isReferralModalOpen && currentUser) {
      getPilgrimReferralStats(currentUser).then((stats) => {
        if (stats) setReferralStats(stats);
      });
    }
  }, [isReferralModalOpen, currentUser]);

  // Professional Referral Program Guard - prompts unauthenticated users to register first
  const handleOpenReferralProgram = () => {
    if (!currentUser) {
      setFloatingToast({
        id: `ref_register_prompt_${Date.now()}`,
        icon: <Gift size={18} color="#ec4899" />,
        highlight: true,
        title: 'Member Referral Rewards',
        desc: 'Sign in to unlock your invite link and earn 500 Brij Points.',
        ctaText: 'Sign In',
        onCta: () => {
          setIsAuthModalOpen(true);
          setAuthMode('signup');
          setSignupStep(1);
          setFloatingToast(null);
        }
      });
      setIsAuthModalOpen(true);
      setAuthMode('signup');
      setSignupStep(1);
      return;
    }
    setIsReferralModalOpen(true);
  };

  // Smart display name helper that handles titles like 'Dr.', 'Mr.', 'Prof.'
  const getDisplayName = (name) => {
    if (!name) return 'Traveler';
    const parts = name.trim().split(/\s+/);
    const titles = ['dr', 'dr.', 'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'prof', 'prof.', 'shri', 'smt', 'pandit'];
    if (parts.length > 1 && titles.includes(parts[0].toLowerCase())) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  };

  // Close profile menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Capture & store referral code from URL if present (e.g. ?ref=VRINDA-12345)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        const cleanRef = refCode.trim().toUpperCase();
        localStorage.setItem('vrinda_referrer_code', cleanRef);
        setAuthReferralInput(cleanRef);
        setShowReferralField(true);
        setFloatingToast({
          id: `ref_welcome_${Date.now()}`,
          icon: <Gift size={18} color="#ec4899" />,
          highlight: true,
          title: 'Invitation Applied',
          desc: `Code ${cleanRef} applied. 500 Brij Points ready on registration.`,
          ctaText: 'Claim Reward',
          onCta: () => {
            setIsAuthModalOpen(true);
            setAuthMode('signup');
            setSignupStep(1);
            setFloatingToast(null);
          }
        });
      }

      // Handle Stripe Hosted Checkout Return (?payment=success&session_id=...)
      const paymentStatus = params.get('payment');
      const sessionId = params.get('session_id');
      const title = params.get('title') || 'Pilgrimage Package';

      if (paymentStatus === 'success') {
        const txnId = `txn_stripe_${sessionId ? sessionId.slice(-10) : Date.now()}`;
        const paymentRecord = {
          id: txnId,
          transaction_id: txnId,
          session_id: sessionId || txnId,
          amount: 2499,
          currency: 'INR',
          status: 'succeeded',
          item_title: decodeURIComponent(title),
          customer_name: currentUser?.name || 'Devotee Pilgrim',
          customer_email: currentUser?.email || '',
          customer_phone: currentUser?.phone || '',
          payment_method: 'stripe_hosted',
          created_at: new Date().toISOString()
        };

        savePaymentRecord(paymentRecord).catch(() => { });

        // Post confirmation into devotee live chat thread
        const tId = getOrCreateThreadId({
          name: currentUser?.name || 'Devotee Pilgrim',
          phone: currentUser?.phone || '',
          email: currentUser?.email || ''
        });

        sendSupportMessage({
          threadId: tId,
          sender: 'concierge_bot',
          text: `💳 *Payment Verified via Stripe*\n• Package: ${decodeURIComponent(title)}\n• Transaction ID: ${txnId}\n• Status: Confirmed & Paid\n• Travel Dates: Instant Confirmation\n• Party: 2 Guests`,
          senderName: currentUser?.name || 'Devotee Pilgrim',
          senderEmail: currentUser?.email || '',
          senderPhone: currentUser?.phone || '',
          category: 'payment'
        }).catch(() => { });

        if (onOpenHelpCenter) {
          onOpenHelpCenter();
        }

        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch { }
  }, []);

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Saved / Favorited Yatras & Sacred Darshans
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const cached = getCachedData('traveler_favorites', []);
    return Array.isArray(cached) ? cached : [];
  });

  const safeFavoriteIds = Array.isArray(favoriteIds) ? favoriteIds : [];

  const toggleFavorite = (itemId, itemTitle) => {
    if (!itemId) return;
    setFavoriteIds((prevRaw) => {
      const prev = Array.isArray(prevRaw) ? prevRaw : [];
      const isFav = prev.includes(itemId);
      const updated = isFav ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      setCachedData('traveler_favorites', updated);

      setFloatingToast({
        id: `fav_${itemId}_${Date.now()}`,
        icon: isFav ? (
          <HeartOff size={18} strokeWidth={2.5} color="#fca5a5" />
        ) : (
          <Heart size={18} strokeWidth={2.5} fill="#f43f5e" color="#fb7185" />
        ),
        highlight: !isFav,
        title: isFav ? 'Removed from Saved' : 'Saved to Favourites',
        desc: null
      });

      return updated;
    });
  };

  // Build a user object from a Supabase session
  const buildUserFromSession = (session) => {
    if (!session?.user) return null;
    const u = session.user;
    const meta = u.user_metadata || {};
    const name = meta.full_name || meta.name || u.email?.split('@')[0] || 'Traveler';
    const email = u.email || '';
    const avatar = meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'TR';
    const cached = getCachedData('traveler_user', null);
    const existingPhone = (cached && (cached.uid === u.id || cached.email === email) && cached.phone) ? cached.phone : (meta.phone || '');

    // Resolve Category/Role Tag
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || 'sakhi@vrindatours.com,admin@vrindatours.com')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const isAdmin = email && (adminEmails.includes(email.toLowerCase()) || email.toLowerCase().endsWith('@vrindatours.com'));
    let assignedRole = meta.role || meta.category || (cached && cached.role) || (isAdmin ? 'admin' : 'pilgrim');
    try {
      const storedRole = localStorage.getItem('vt_user_role');
      if (storedRole && ROLE_CONFIGS[storedRole]) assignedRole = storedRole;
    } catch { }

    return {
      uid: u.id,
      name,
      email,
      phone: existingPhone,
      avatar,
      initials,
      role: assignedRole,
      category: assignedRole,
      authProvider: u.app_metadata?.provider || 'password',
      memberId: `VRD-${u.id.slice(0, 5).toUpperCase()}`,
      isAnonymous: false
    };
  };

  // Sync Supabase Auth state changes in real-time
  useEffect(() => {
    // Restore pending booking item if returning from Google OAuth redirect
    try {
      const pendingBooking = sessionStorage.getItem('vt_pending_booking_item');
      if (pendingBooking) {
        const parsed = JSON.parse(pendingBooking);
        if (parsed) {
          setSelectedItem(parsed);
          sessionStorage.removeItem('vt_pending_booking_item');
        }
      }
    } catch (e) {
      console.error('Failed to restore pending booking item:', e);
    }

    // Load existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userObj = buildUserFromSession(session);
        if (userObj) {
          setCurrentUser(userObj);
          setCachedData('traveler_user', userObj);
          if (userObj.name) setBookingName(userObj.name);
          if (userObj.email) setBookingEmail(userObj.email);
          if (userObj.phone) setBookingPhone(userObj.phone);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const userObj = buildUserFromSession(session);
        if (userObj) {
          setCurrentUser(userObj);
          setCachedData('traveler_user', userObj);
          if (userObj.name) setBookingName(userObj.name);
          if (userObj.email) setBookingEmail(userObj.email);
          if (userObj.phone) setBookingPhone(userObj.phone);
        }
      } else {
        // Signed out — clear only real (non-guest) users
        const cached = getCachedData('traveler_user', null);
        if (cached && !cached.isAnonymous) {
          setCachedData('traveler_user', null);
          setCurrentUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-fill traveler data from User Profile cache whenever item selected or user changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && currentUser.name !== 'Guest Traveler') setBookingName(currentUser.name);
      if (currentUser.email) setBookingEmail(currentUser.email);
      if (currentUser.phone) setBookingPhone(currentUser.phone);
    }
  }, [currentUser, selectedItem]);

  // Step 1: Validate Email & Password, proceed to Step 2
  const handleStep1Next = (e) => {
    e.preventDefault();
    setAuthError('');
    const email = authEmailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (!authPasswordInput || authPasswordInput.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    setSignupStep(2);
  };

  // Step 2: Validate Full Legal Name, proceed to Step 3
  const handleStep2Next = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authNameInput.trim() || authNameInput.trim().length < 2) {
      setAuthError('Please enter your full legal name.');
      return;
    }
    setSignupStep(3);
  };

  // Step 3: Complete registration via Supabase Auth
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    const email = authEmailInput.trim().toLowerCase();
    const name = authNameInput.trim();

    const phoneValidation = validatePhoneNumber(authPhoneInput);
    if (!phoneValidation.isValid) {
      setAuthError(phoneValidation.message);
      return;
    }
    const phone = phoneValidation.formatted;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: authPasswordInput,
        options: {
          data: { full_name: name, phone }
        }
      });

      if (error) throw error;

      const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'TR';
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
      const uid = data.user?.id || `usr_${Date.now()}`;
      const refCodeEntered = (authReferralInput.trim() || localStorage.getItem('vrinda_referrer_code') || '').toUpperCase();
      const uniqueRefCode = `VRINDA-${(uid.replace(/[^a-zA-Z0-9]/g, '').slice(-5) || 'PILGRIM').toUpperCase()}`;

      const newUser = {
        uid,
        name,
        email,
        phone,
        avatar,
        initials,
        authProvider: 'password',
        memberId: `VRD-${uid.slice(0, 5).toUpperCase()}`,
        referralCode: uniqueRefCode,
        referredBy: refCodeEntered || null,
        rewardPoints: refCodeEntered ? 500 : 0,
        createdAt: new Date().toISOString()
      };

      setCurrentUser(newUser);
      setCachedData('traveler_user', newUser);
      setBookingName(newUser.name);
      setBookingEmail(newUser.email);
      if (phone) setBookingPhone(phone);

      // Async Supabase Sync
      syncPilgrimToSupabase(newUser, refCodeEntered).catch(console.error);

      setAuthSuccessMsg(refCodeEntered ? 'Registration complete! +500 Brij Reward Points added.' : 'Account created & signed in successfully!');
      triggerCelebration({ mode: 'cannon', count: 56 });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthSuccessMsg('');
        setSignupStep(1);
        setIsReferralModalOpen(true);
      }, 600);
    } catch (err) {
      console.error('Supabase Signup Error:', err);
      let errorMsg = err.message || 'Signup failed. Please try again.';
      if (errorMsg.includes('already registered') || errorMsg.includes('already in use') || errorMsg.includes('User already registered')) {
        errorMsg = 'An account with this email already exists. Please log in.';
      } else if (errorMsg.includes('Password')) {
        errorMsg = 'Password should be at least 6 characters.';
      }
      setAuthError(errorMsg);
    }
  };

  // Supabase Email/Password Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    const email = authEmailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (!authPasswordInput || authPasswordInput.length < 6) {
      setAuthError('Please enter a password of at least 6 characters.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: authPasswordInput });
      if (error) throw error;

      const u = data.user;
      const meta = u.user_metadata || {};
      const name = meta.full_name || meta.name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const avatar = meta.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
      const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'TR';
      const cached = getCachedData('traveler_user', null);
      const existingPhone = (cached && cached.uid === u.id && cached.phone) ? cached.phone : (meta.phone || '');
      const refCodeEntered = (authReferralInput.trim() || localStorage.getItem('vrinda_referrer_code') || '').toUpperCase();
      const uniqueRefCode = `VRINDA-${(u.id.replace(/[^a-zA-Z0-9]/g, '').slice(-5) || 'PILGRIM').toUpperCase()}`;
      const prevPoints = cached?.rewardPoints || 0;
      const bonus = (refCodeEntered && !cached?.referredBy) ? 500 : 0;

      const loggedUser = {
        uid: u.id,
        name,
        email,
        phone: existingPhone,
        avatar,
        initials,
        authProvider: 'password',
        memberId: `VRD-${u.id.slice(0, 5).toUpperCase()}`,
        referralCode: cached?.referralCode || uniqueRefCode,
        referredBy: cached?.referredBy || (refCodeEntered || null),
        rewardPoints: prevPoints + bonus,
        createdAt: cached?.createdAt || new Date().toISOString()
      };

      setCurrentUser(loggedUser);
      setCachedData('traveler_user', loggedUser);
      setBookingName(name);
      setBookingEmail(email);

      // Async Supabase Sync
      syncPilgrimToSupabase(loggedUser, refCodeEntered).catch(console.error);

      setAuthSuccessMsg(bonus > 0 ? `Welcome back, ${name}! +500 Referral Points added.` : `Welcome back, ${name}!`);
      setFloatingToast({
        id: `login_success_${Date.now()}`,
        icon: <AnimatedIcon name="checkmark" size={17} strokeColor="#10b981" speed={1.2} />,
        highlight: true,
        title: `Welcome, ${name}!`,
        desc: bonus > 0 ? '+500 Points Added' : null
      });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthSuccessMsg('');
      }, 500);
    } catch (err) {
      console.error('Supabase Login Error:', err);
      let errorMsg = err.message || 'Login failed.';
      if (errorMsg.includes('Invalid login credentials') || errorMsg.includes('invalid_credentials')) {
        errorMsg = 'Invalid email or password. Please verify and try again.';
      }
      setAuthError(errorMsg);
    }
  };

  // Supabase Google OAuth (redirect flow)
  const handleGoogleAuth = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;
      // Supabase redirects the browser — onAuthStateChange will fire on return
    } catch (err) {
      console.error('Google OAuth error:', err);
      const msg = err.message || '';
      if (msg.includes('missing OAuth secret') || msg.includes('validation_failed') || err.status === 400) {
        setAuthError('Google Sign-In is not yet configured. Please use email & password login.');
      } else {
        setAuthError(msg || 'Failed to sign in with Google.');
      }
    }
  };

  // Direct Google 1-Click Login for Booking Modal (Preserves trip item & skips manual registration)
  const handleDirectGoogleLogin = async () => {
    setIsGoogleSigningIn(true);
    setAuthError('');
    try {
      if (selectedItem) {
        sessionStorage.setItem('vt_pending_booking_item', JSON.stringify(selectedItem));
      }
      await handleGoogleAuth();
    } catch (err) {
      console.error('Direct Google login error:', err);
      setIsGoogleSigningIn(false);
    }
  };

  // Handler for Phone Prompt Confirmation in Sign-in Process
  const handlePhonePromptSubmit = (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const phoneValidation = validatePhoneNumber(authPhoneInput);
    if (!phoneValidation.isValid) {
      setAuthError(phoneValidation.message);
      return;
    }
    const sanitizedPhone = phoneValidation.formatted;
    const targetUser = pendingGoogleUser || currentUser;
    const completedUser = {
      ...targetUser,
      phone: sanitizedPhone
    };
    setCurrentUser(completedUser);
    setCachedData('traveler_user', completedUser);
    setBookingPhone(sanitizedPhone);
    setAuthSuccessMsg(`Welcome, ${completedUser.name}!`);
    setFloatingToast({
      id: `phone_verified_${Date.now()}`,
      icon: <CheckCircle2 size={16} color="#10b981" />,
      highlight: true,
      title: 'Phone Verified',
      desc: 'Live GPS Alerts Active'
    });
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setAuthSuccessMsg('');
      setPendingGoogleUser(null);
      setAuthMode('login');
    }, 400);
  };

  // Handler to skip phone number entry
  const handlePhonePromptSkip = () => {
    const targetUser = pendingGoogleUser || currentUser;
    if (targetUser) {
      setCurrentUser(targetUser);
      setCachedData('traveler_user', targetUser);
    }
    setAuthSuccessMsg('Welcome!');
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setAuthSuccessMsg('');
      setPendingGoogleUser(null);
      setAuthMode('login');
    }, 400);
  };

  // Supabase Apple OAuth (redirect flow)
  const handleAppleAuth = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
      // Supabase redirects the browser — onAuthStateChange will fire on return
    } catch (err) {
      console.error('Apple OAuth error:', err);
      const msg = err.message || '';
      if (msg.includes('missing OAuth secret') || msg.includes('validation_failed') || err.status === 400) {
        setAuthError('Apple Sign-In is not yet configured. Please use email & password login.');
      } else {
        setAuthError('Apple Sign-In is Coming Soon...');
      }
    }
  };

  // Guest mode — local-only state (Supabase free tier does not support anonymous auth)
  const handleGuestAuth = () => {
    const guestId = `guest_${Date.now()}`;
    const guestRole = localStorage.getItem('vt_user_role') || 'pilgrim';
    const guestUser = {
      uid: guestId,
      name: 'Guest Traveler',
      email: '',
      phone: '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0b0f19&textColor=ffffff`,
      initials: 'GT',
      role: guestRole,
      category: guestRole,
      authProvider: 'anonymous',
      memberId: `VRD-${guestId.slice(-5).toUpperCase()}`,
      isAnonymous: true,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    setCachedData('traveler_user', guestUser);
    setAuthSuccessMsg('Continuing as Guest Traveler!');
    setTimeout(() => {
      setIsAuthModalOpen(false);
      setAuthSuccessMsg('');
    }, 450);
  };

  const handleBookingNameChange = (val) => {
    setBookingName(val);
    if (currentUser) {
      const updated = { ...currentUser, name: val };
      setCurrentUser(updated);
      setCachedData('traveler_user', updated);
    }
  };

  const handleBookingEmailChange = (val) => {
    setBookingEmail(val);
    if (currentUser) {
      const updated = { ...currentUser, email: val };
      setCurrentUser(updated);
      setCachedData('traveler_user', updated);
    }
  };

  const handleBookingPhoneChange = (val) => {
    setBookingPhone(val);
    if (bookingError) setBookingError('');
    if (currentUser) {
      const updated = { ...currentUser, phone: val };
      setCurrentUser(updated);
      setCachedData('traveler_user', updated);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentUser(null);
    setCachedData('traveler_user', null);
    setBookingName('');
    setBookingEmail('');
    setBookingPhone('');
    setFloatingToast({
      id: `logout_${Date.now()}`,
      icon: <LogOut size={16} color="#e11d48" />,
      highlight: false,
      title: 'Signed Out Successfully',
      desc: null
    });
  };

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isNlActive, setIsNlActive] = useState(false);

  // Initiatives Carousel Scroll Ref & Handlers
  const initiativesGridRef = useRef(null);

  const handleInitPrev = () => {
    if (initiativesGridRef.current) {
      initiativesGridRef.current.scrollBy({ left: -310, behavior: 'smooth' });
    }
  };

  const handleInitNext = () => {
    if (initiativesGridRef.current) {
      initiativesGridRef.current.scrollBy({ left: 310, behavior: 'smooth' });
    }
  };

  // Save Search preferences to cache
  useEffect(() => {
    setCachedData('search_tab', activeTab);
    setCachedData('search_dest', destination);
    setCachedData('search_checkin', checkInDate);
    setCachedData('search_checkout', checkOutDate);
    setCachedData('search_guests', roomsGuests);
  }, [activeTab, destination, checkInDate, checkOutDate, roomsGuests]);

  // Filtered Destinations
  const filteredDestinations = exploreDestinations.filter(item => {
    const matchesCategory = activeCategory === 'Popular Destination' ? true : item.category === activeCategory;
    const matchesPrice = item.numericPrice <= priceFilter;
    const matchesRating = item.rating >= minRatingFilter;
    return matchesCategory && matchesPrice && matchesRating;
  });

  const displayedDestinations = showAllDestinations
    ? filteredDestinations
    : filteredDestinations.slice(0, 6);

  const formatTripDates = (start, end) => {
    if (!start) return 'Flexible Dates';
    try {
      const s = new Date(start);
      const e = end ? new Date(end) : null;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const sm = months[s.getMonth()] || 'Sep';
      const sd = s.getDate() || 15;
      if (e) {
        const em = months[e.getMonth()] || sm;
        const ed = e.getDate() || 22;
        return sm === em ? `${sm} ${sd}–${ed}` : `${sm} ${sd} – ${em} ${ed}`;
      }
      return `${sm} ${sd}`;
    } catch {
      return 'Sep 15–22';
    }
  };

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();
    setBookingError('');
    const finalName = bookingName || currentUser?.name || 'Guest Devotee';
    const finalEmail = bookingEmail || currentUser?.email || 'Not provided';
    const finalPhone = bookingPhone || currentUser?.phone || '';

    if (!finalPhone || !finalPhone.trim()) {
      setBookingError('Please enter your 10-digit mobile number.');
      return;
    }

    const validation = validatePhoneNumber(finalPhone);
    if (!validation.isValid) {
      setBookingError(validation.message);
      return;
    }

    setBookingSuccess(true);
    const destinationTitle = selectedItem?.title || destination || 'Brij Yatra';
    const datesStr = formatTripDates(checkInDate, checkOutDate);
    const inquiryText = `Radhe Radhe! I would like to reserve *${destinationTitle}*.\n• Dates: ${datesStr}\n• Devotee: ${finalName}\n• Mobile: ${validation.formatted || finalPhone}\n• Email: ${finalEmail}\n• Party: ${roomsGuests || '2 Guests'}`;

    try {
      const tId = getOrCreateThreadId({ name: finalName, phone: finalPhone, email: finalEmail });
      await sendSupportMessage({
        threadId: tId,
        sender: 'user',
        text: inquiryText,
        senderName: finalName,
        senderEmail: finalEmail,
        senderPhone: finalPhone,
        category: 'booking'
      });
    } catch (err) {
      console.warn('Booking inquiry save error:', err);
    }

    setFloatingToast({
      id: `booking_${Date.now()}`,
      icon: <AnimatedIcon name="checkmark" size={17} strokeColor="#10b981" speed={1.2} />,
      highlight: true,
      title: 'Reservation Dispatched',
      desc: destinationTitle
    });

    setTimeout(() => {
      setSelectedItem(null);
      setBookingSuccess(false);

      if (onOpenHelpCenter) {
        onOpenHelpCenter();
      }

      if (!currentUser) {
        setBookingName('');
        setBookingEmail('');
        setBookingPhone('');
      }
    }, 450);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setCachedData('newsletter_email', newsletterEmail);
    setFloatingToast({
      id: `newsletter_${Date.now()}`,
      icon: <AnimatedIcon name="checkmark" size={17} strokeColor="#10b981" speed={1.2} />,
      highlight: true,
      title: 'Subscribed to Sacred Yatra Updates',
      desc: null
    });
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2500);
  };

  // Dedicated Dynamic Package Detail Page State
  const [activePackageDetail, setActivePackageDetail] = useState(null);

  // Sync activePackageDetail with URL query param (?package=<id>) & popstate
  useEffect(() => {
    const handleUrlPackageSync = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const pkgParam = params.get('package');
      if (pkgParam) {
        const found =
          (tripPackages || []).find((p) => p.id === pkgParam) ||
          (popularPlaces || []).find((p) => p.id === pkgParam) ||
          pkgParam;
        const resolved = getPackageDeepDetails(found);
        if (resolved) {
          setActivePackageDetail(resolved);
        }
      } else {
        setActivePackageDetail(null);
      }
    };

    handleUrlPackageSync();
    window.addEventListener('popstate', handleUrlPackageSync);
    return () => window.removeEventListener('popstate', handleUrlPackageSync);
  }, []);

  const handleOpenPackageDetail = useCallback((itemOrId) => {
    const detailed = getPackageDeepDetails(itemOrId);
    if (!detailed) return;
    setActivePackageDetail(detailed);
    setSelectedItem(null);
    setIsTripPackagesModalOpen(false);

    if (typeof window !== 'undefined' && window.history) {
      const newUrl = `${window.location.pathname}?package=${encodeURIComponent(detailed.id)}`;
      window.history.pushState({ packageId: detailed.id }, '', newUrl);
    }
  }, []);

  const handleClosePackageDetail = useCallback(() => {
    setActivePackageDetail(null);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', window.location.pathname);
    }
  }, []);

  const handleInitiateStripeFromDetail = useCallback((detailObj) => {
    setStripeModalItem(detailObj);
  }, []);

  const handleInitiateInquiryFromDetail = useCallback((detailObj) => {
    if (onOpenHelpCenter) {
      onOpenHelpCenter();
    }
  }, [onOpenHelpCenter]);

  return (
    <div className="tp-page-wrapper">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="tp-navbar">
        <div className="tp-nav-container">
          {/* Logo */}
          <div
            className="tp-brand"
            onClick={() => {
              if (activePackageDetail) handleClosePackageDetail();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="tp-logo-mark-modern">
              <div className="tp-logo-outer-ring">
                <div className="tp-logo-inner-dot" />
              </div>
            </div>
            <span className="tp-logo-text-black">Vrinda.</span>
          </div>

          {/* Navigation Links */}
          <nav className="tp-nav-menu">
            <a href="#about" className="tp-nav-item" onClick={() => activePackageDetail && handleClosePackageDetail()}>About</a>
            <a href="#popular" className="tp-nav-item" onClick={() => activePackageDetail && handleClosePackageDetail()}>Tours</a>
            <a href="#explore" className="tp-nav-item" onClick={() => activePackageDetail && handleClosePackageDetail()}>Packages</a>
            <a href="#gallery" className="tp-nav-item" onClick={() => activePackageDetail && handleClosePackageDetail()}>Divine Darshan</a>
            <a href="#initiatives" className="tp-nav-item" onClick={() => activePackageDetail && handleClosePackageDetail()}>Journal</a>
            <a href="#contact" className="tp-nav-item" onClick={() => activePackageDetail && handleClosePackageDetail()}>Contact</a>
          </nav>

          {/* Action CTAs */}
          <div className="tp-nav-actions">
            {/* Quick Spotlight Search Trigger (Desktop) */}
            <button
              type="button"
              className="tp-btn-nav-search tp-desktop-auth"
              onClick={() => setIsOmniSearchOpen(true)}
              title="Search Dhams, Trips & Services"
            >
              <Search size={14} className="tp-nav-search-icon" />
              <span className="tp-nav-search-text">Search Brij...</span>
            </button>

            {/* User Profile / Auth Action (Desktop) */}
            {currentUser ? (
              <div className="tp-nav-user-wrapper tp-desktop-auth" ref={profileMenuRef}>
                <button
                  type="button"
                  className={`tp-nav-user-pill ${isProfileMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  title={`Account: ${currentUser.name} (${activeRoleConfig.tag})`}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="tp-nav-user-avatar"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0b0f19&color=ffffff&bold=true`;
                    }}
                  />
                  <span className="tp-nav-user-name">{getDisplayName(currentUser.name)}</span>
                  <span
                    className={`tp-nav-role-mini-tag ${activeRoleConfig.badgeClass}`}
                    style={{ color: activeRoleConfig.color, background: activeRoleConfig.accentBg }}
                  >
                    {renderRoleIcon(activeUserRole, 11)}
                    <span>{activeRoleConfig.navLabel || activeRoleConfig.shortLabel}</span>
                  </span>
                  <ChevronDown size={13} className={`tp-nav-user-chevron ${isProfileMenuOpen ? 'open' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="tp-profile-dropdown" role="dialog" aria-label="User Account Menu">
                    {/* 1. Header Identity Card */}
                    <div className="tp-profile-dropdown-header">
                      <div className="tp-profile-avatar-wrap">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="tp-profile-dropdown-avatar"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0f172a&color=ffffff&bold=true`;
                          }}
                        />
                      </div>
                      <div className="tp-profile-dropdown-user-info">
                        <div className="tp-profile-name-row">
                          <h4 className="tp-profile-dropdown-name">{currentUser.name}</h4>
                        </div>
                        <p className="tp-profile-dropdown-email">{currentUser.email || 'Guest Pilgrim'}</p>

                        {/* Role & Auth Badges */}
                        <div className="tp-profile-tag-cluster">
                          <span
                            className={`tp-role-tag ${activeRoleConfig.badgeClass}`}
                            style={{ color: activeRoleConfig.color, background: activeRoleConfig.accentBg, borderColor: activeRoleConfig.borderColor }}
                          >
                            {renderRoleIcon(activeUserRole, 11)}
                            <span>{activeRoleConfig.tag}</span>
                          </span>
                          <span className="tp-profile-dropdown-badge">
                            <Sparkles size={10} /> {currentUser.authProvider === 'google' ? 'Google' : currentUser.isAnonymous ? 'Guest' : 'Verified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Authority & Workspace Role Switcher */}
                    <div className="tp-role-quick-strip">
                      <div className="tp-role-strip-header">
                        <div className="tp-role-strip-title">
                          <span
                            className="tp-role-shield-badge"
                            style={{
                              color: activeRoleConfig.color,
                              background: activeRoleConfig.accentBg,
                              borderColor: activeRoleConfig.borderColor,
                            }}
                          >
                            <ShieldCheck size={12} />
                          </span>
                          <span className="tp-role-title-text">
                            <span className="tp-role-title-muted">Authority:</span>
                            <strong className="tp-role-title-highlight" style={{ color: activeRoleConfig.color }}>
                              {activeRoleConfig.shortLabel}
                            </strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          className="tp-btn-switch-role-link"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsRoleModalOpen(true);
                          }}
                        >
                          <span>All Tags ({Object.keys(ROLE_CONFIGS).length})</span>
                          <ChevronRight size={11} className="tp-btn-chevron-arrow" />
                        </button>
                      </div>

                      <div className="tp-role-quick-pills">
                        {['pilgrim', 'driver', 'restaurant', 'hotel', 'agency', 'admin'].map((rk) => {
                          const cfg = ROLE_CONFIGS[rk];
                          const isCurrent = activeUserRole === rk;
                          return (
                            <button
                              key={rk}
                              type="button"
                              className={`tp-role-quick-pill tp-role-pill-${rk} ${isCurrent ? 'active' : ''}`}
                              onClick={() => handleSwitchRole(rk)}
                              title={cfg.label}
                            >
                              <span className="tp-role-pill-icon-wrap">
                                {renderRoleIcon(rk, 13)}
                              </span>
                              <span className="tp-role-pill-label">{cfg.navLabel || cfg.shortLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Account Progress or Verified Status */}
                    {!currentUser.phone ? (
                      <div className="tp-profile-incomplete-card">
                        <div className="tp-profile-incomplete-header">
                          <span className="tp-incomplete-badge">Action Required</span>
                          <span className="tp-incomplete-pct">60%</span>
                        </div>
                        <div className="tp-profile-progress-bar">
                          <div className="tp-profile-progress-fill" style={{ width: '60%' }} />
                        </div>
                        <p className="tp-profile-incomplete-desc">
                          Add mobile number for live GPS & booking vouchers.
                        </p>
                        <button
                          type="button"
                          className="tp-btn-complete-profile"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setPendingGoogleUser(currentUser);
                            setAuthPhoneInput(currentUser.phone || '');
                            setAuthMode('phone_prompt');
                            setIsAuthModalOpen(true);
                          }}
                        >
                          <Phone size={12} />
                          <span>Add Phone for Live GPS</span>
                        </button>
                      </div>
                    ) : currentUser.isAnonymous ? (
                      <div className="tp-profile-incomplete-card">
                        <div className="tp-profile-incomplete-header">
                          <span className="tp-incomplete-badge">Guest Mode</span>
                          <span className="tp-incomplete-pct">30%</span>
                        </div>
                        <div className="tp-profile-progress-bar">
                          <div className="tp-profile-progress-fill" style={{ width: '30%' }} />
                        </div>
                        <p className="tp-profile-incomplete-desc">
                          Register to sync bookings & unlock 15% discount.
                        </p>
                        <button
                          type="button"
                          className="tp-btn-complete-profile"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setAuthMode('signup');
                            setSignupStep(1);
                            setIsAuthModalOpen(true);
                          }}
                        >
                          <UserCheck size={12} />
                          <span>Complete Registration</span>
                        </button>
                      </div>
                    ) : (
                      <div className="tp-profile-verified-card">
                        <div className="tp-profile-verified-banner">
                          <div className="tp-profile-verified-left">
                            <CheckCircle2 size={13} className="tp-verified-icon" />
                            <span>Verified {activeRoleConfig.shortLabel || 'Member'}</span>
                          </div>
                          <span className="tp-profile-verified-badge">100%</span>
                        </div>
                      </div>
                    )}

                    <div className="tp-profile-dropdown-divider" />

                    {/* 4. Navigation & Workspace Actions */}
                    <div className="tp-profile-dropdown-menu">
                      {/* ADMIN ACTIONS */}
                      {activeUserRole === 'admin' && (
                        <>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item tp-profile-highlight-item admin"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenAdmin) onOpenAdmin();
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap admin">
                                <Lock size={14} color="#d97706" />
                              </span>
                              <span>Platform Admin Console</span>
                            </div>
                            <span className="tp-profile-role-badge admin">Super</span>
                          </button>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenPartnerHub) onOpenPartnerHub('admin');
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap">
                                <Building2 size={14} />
                              </span>
                              <span>Partner Verification Center</span>
                            </div>
                            <ChevronRight size={13} className="tp-profile-item-arrow" />
                          </button>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onClose) onClose();
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap">
                                <MapPin size={14} />
                              </span>
                              <span>Sacred Map & POI Overseer</span>
                            </div>
                            <ChevronRight size={13} className="tp-profile-item-arrow" />
                          </button>
                        </>
                      )}

                      {/* DRIVER ACTIONS */}
                      {activeUserRole === 'driver' && (
                        <>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item tp-profile-highlight-item driver"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenDriverPortal) onOpenDriverPortal();
                              else if (onOpenPartnerHub) onOpenPartnerHub('driver');
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap driver">
                                <Car size={14} color="#0f172a" />
                              </span>
                              <span>Sarathi Driver Portal</span>
                            </div>
                            <span className="tp-profile-role-badge driver">Active</span>
                          </button>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenDriverPage) onOpenDriverPage();
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap">
                                <Compass size={14} />
                              </span>
                              <span>Fleet & Companion Desk</span>
                            </div>
                            <ChevronRight size={13} className="tp-profile-item-arrow" />
                          </button>
                        </>
                      )}

                      {/* RESTAURANT ACTIONS */}
                      {(activeUserRole === 'restaurant' || activeUserRole === 'restaurant_staff') && (
                        <>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item tp-profile-highlight-item restaurant"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenPartnerHub) onOpenPartnerHub('restaurant');
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap restaurant">
                                <UtensilsCrossed size={14} color="#ea580c" />
                              </span>
                              <span>Restaurant Partner Desk</span>
                            </div>
                            <span className="tp-profile-role-badge restaurant">Desk</span>
                          </button>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenRestaurantPage) onOpenRestaurantPage();
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap">
                                <Compass size={14} />
                              </span>
                              <span>Brij Dining & Food Directory</span>
                            </div>
                            <ChevronRight size={13} className="tp-profile-item-arrow" />
                          </button>
                        </>
                      )}

                      {/* HOTEL ACTIONS */}
                      {(activeUserRole === 'hotel' || activeUserRole === 'hotel_staff') && (
                        <>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item tp-profile-highlight-item hotel"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenPartnerHub) onOpenPartnerHub('hotel');
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap hotel">
                                <Building2 size={14} color="#2563eb" />
                              </span>
                              <span>Hotel & Ashram Stay Desk</span>
                            </div>
                            <span className="tp-profile-role-badge hotel">Desk</span>
                          </button>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenHotelPage) onOpenHotelPage();
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap">
                                <Compass size={14} />
                              </span>
                              <span>Ashram & Stay Directory</span>
                            </div>
                            <ChevronRight size={13} className="tp-profile-item-arrow" />
                          </button>
                        </>
                      )}

                      {/* TOUR AGENCY ACTIONS */}
                      {activeUserRole === 'agency' && (
                        <>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item tp-profile-highlight-item agency"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenPartnerHub) onOpenPartnerHub('agency');
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap agency">
                                <Compass size={14} color="#7c3aed" />
                              </span>
                              <span>Tour Agency & Guide Desk</span>
                            </div>
                            <span className="tp-profile-role-badge agency">Desk</span>
                          </button>
                          <button
                            type="button"
                            className="tp-profile-dropdown-item"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              if (onOpenAgencyPage) onOpenAgencyPage();
                            }}
                          >
                            <div className="tp-profile-item-left">
                              <span className="tp-profile-item-icon-wrap">
                                <Calendar size={14} />
                              </span>
                              <span>Brij Yatra Packages</span>
                            </div>
                            <ChevronRight size={13} className="tp-profile-item-arrow" />
                          </button>
                        </>
                      )}

                      {/* UNIVERSAL DEVOTEE PILGRIM SERVICES */}
                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          const el = document.getElementById('gallery') || document.getElementById('popular');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="tp-profile-item-left">
                          <span className="tp-profile-item-icon-wrap fav">
                            <Heart size={14} fill={safeFavoriteIds.length > 0 ? '#ef4444' : 'none'} color={safeFavoriteIds.length > 0 ? '#ef4444' : '#64748b'} />
                          </span>
                          <span>Saved Favourites</span>
                        </div>
                        <span className={`tp-profile-item-count ${safeFavoriteIds.length > 0 ? 'has-items' : ''}`}>
                          {safeFavoriteIds.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsTripPackagesModalOpen(true);
                        }}
                      >
                        <div className="tp-profile-item-left">
                          <span className="tp-profile-item-icon-wrap">
                            <Compass size={14} />
                          </span>
                          <span>Book A Tour / Yatra</span>
                        </div>
                        <ChevronRight size={13} className="tp-profile-item-arrow" />
                      </button>

                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleOpenReferralProgram();
                        }}
                      >
                        <div className="tp-profile-item-left">
                          <span className="tp-profile-item-icon-wrap gift">
                            <Gift size={14} color="#ec4899" />
                          </span>
                          <span>Refer & Earn</span>
                        </div>
                        <span className="tp-profile-item-pts-badge">
                          +500 Pts
                        </span>
                      </button>

                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onOpenHelpCenter) onOpenHelpCenter();
                        }}
                      >
                        <div className="tp-profile-item-left">
                          <span className="tp-profile-item-icon-wrap">
                            <HelpCircle size={14} />
                          </span>
                          <span>Help & Support Desk</span>
                        </div>
                        <ChevronRight size={13} className="tp-profile-item-arrow" />
                      </button>

                      {activeUserRole === 'pilgrim' && (
                        <button
                          type="button"
                          className="tp-profile-dropdown-item"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            if (onOpenPartnerHub) onOpenPartnerHub(activeUserRole === 'admin' ? 'admin' : undefined);
                          }}
                        >
                          <div className="tp-profile-item-left">
                            <span className="tp-profile-item-icon-wrap">
                              <Building2 size={14} />
                            </span>
                            <span>Partner Hub & Register</span>
                          </div>
                          <ChevronRight size={13} className="tp-profile-item-arrow" />
                        </button>
                      )}

                      <div className="tp-profile-dropdown-divider" />

                      <div className="tp-profile-plan-row">
                        <div className="tp-profile-item-left">
                          <span className="tp-profile-item-icon-wrap plan">
                            <Sparkles size={14} color="#10b981" />
                          </span>
                          <span className="tp-profile-plan-label">Devotee Tier</span>
                        </div>
                        <span className="tp-profile-plan-badge">Free / Active</span>
                      </div>
                    </div>

                    <div className="tp-profile-dropdown-divider" />

                    {/* 5. Footer Sign Out */}
                    <div className="tp-profile-dropdown-footer">
                      <button
                        type="button"
                        className="tp-profile-dropdown-logout-btn"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <span className="tp-profile-logout-icon-wrap">
                          <LogOut size={14} />
                        </span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="tp-btn-nav-signin tp-desktop-auth"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                title="Register Profile"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* Instant Ride Button (Uber-Grade Pilgrim E-Rickshaw & Cab) */}
            <button
              type="button"
              className="tp-btn-instant-ride"
              onClick={() => setIsInstantRideModalOpen(true)}
              title="Book Instant Pilgrim E-Rickshaw, Auto or Cab"
            >
              <Car size={15} />
              <span className="tp-btn-text-full">Instant Ride</span>
              <span className="tp-btn-text-short">Ride</span>
            </button>

            {/* Book Trip Button */}
            <button
              className="tp-btn-dark-pill"
              onClick={() => {
                setIsTripPackagesModalOpen(true);
              }}
            >
              <span className="tp-btn-text-full">Book Trip</span>
              <span className="tp-btn-text-short">Book</span>
            </button>

            {/* Quick Live Pilgrim Map Switcher (Desktop) */}
            <button
              className="tp-btn-map-toggle tp-desktop-map-btn"
              onClick={onClose}
              title="Switch to Live Vrinda Pilgrim Map & GPS Booking"
            >
              <MapPin size={15} />
              <span>Live Map</span>
            </button>

            {/* Mobile Search Quick Trigger */}
            <button
              type="button"
              className="tp-btn-mobile-search-icon"
              onClick={() => setIsOmniSearchOpen(true)}
              aria-label="Search Dhams & Packages"
            >
              <Search size={18} />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              className={`tp-hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
            >
              <MorphingIcon icon={isMobileMenuOpen ? "x" : "menu"} size={20} color="currentColor" spring="bouncy" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN NAVIGATION DRAWER (Vrindopnishad Design) */}
      {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="tp-mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="tp-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Top Header inside Mobile Drawer */}
            <div className="tp-mobile-drawer-header">
              <div
                className="tp-brand"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="tp-logo-mark-modern">
                  <div className="tp-logo-outer-ring">
                    <div className="tp-logo-inner-dot" />
                  </div>
                </div>
                <span className="tp-logo-text-black">Vrinda.</span>
              </div>

              <button
                type="button"
                className="tp-mobile-drawer-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="tp-mobile-drawer-body">
              {/* 1. Integrated User Profile Card / Auth Section */}
              {currentUser ? (
                <div className="tp-mobile-profile-card">
                  <div className="tp-mobile-profile-header">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="tp-mobile-profile-avatar"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0f172a&color=ffffff&bold=true`;
                      }}
                    />
                    <div className="tp-mobile-profile-info">
                      <h4 className="tp-mobile-profile-name">{currentUser.name}</h4>
                      <p className="tp-mobile-profile-email">{currentUser.email || 'Guest Pilgrim'}</p>

                      {/* Prominent Category Tag Badge on Mobile */}
                      <div className="tp-mobile-tag-row">
                        <span
                          className={`tp-role-tag ${activeRoleConfig.badgeClass}`}
                          style={{ color: activeRoleConfig.color, background: activeRoleConfig.accentBg, borderColor: activeRoleConfig.borderColor }}
                        >
                          {activeRoleConfig.tag}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="tp-mobile-profile-logout-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      title="Sign Out"
                      aria-label="Sign Out"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>

                  {/* Role & Authority Switcher Strip on Mobile */}
                  <div className="tp-mobile-role-strip">
                    <div className="tp-mobile-role-header">
                      <div className="tp-mobile-role-left">
                        <span
                          className="tp-role-shield-badge"
                          style={{
                            color: activeRoleConfig.color,
                            background: activeRoleConfig.accentBg,
                            borderColor: activeRoleConfig.borderColor,
                          }}
                        >
                          <ShieldCheck size={13} />
                        </span>
                        <span className="tp-role-title-text">
                          <span className="tp-role-title-muted">Authority:</span>
                          <strong className="tp-role-title-highlight" style={{ color: activeRoleConfig.color }}>
                            {activeRoleConfig.shortLabel}
                          </strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="tp-btn-mobile-all-roles"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsRoleModalOpen(true);
                        }}
                      >
                        <span>All Tags ({Object.keys(ROLE_CONFIGS).length})</span>
                        <ChevronRight size={11} className="tp-btn-chevron-arrow" />
                      </button>
                    </div>
                    <div className="tp-mobile-role-pills">
                      {['pilgrim', 'driver', 'restaurant', 'hotel', 'agency', 'admin'].map((rk) => {
                        const cfg = ROLE_CONFIGS[rk];
                        const isCurrent = activeUserRole === rk;
                        return (
                          <button
                            key={rk}
                            type="button"
                            className={`tp-mobile-role-pill tp-role-pill-${rk} ${isCurrent ? 'active' : ''}`}
                            onClick={() => handleSwitchRole(rk)}
                            title={cfg.label}
                          >
                            <span className="tp-role-pill-icon-wrap">
                              {renderRoleIcon(rk, 13)}
                            </span>
                            <span className="tp-role-pill-label">{cfg.navLabel || cfg.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!currentUser.phone ? (
                    <button
                      type="button"
                      className="tp-mobile-action-strip"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setPendingGoogleUser(currentUser);
                        setAuthPhoneInput(currentUser.phone || '');
                        setAuthMode('phone_prompt');
                        setIsAuthModalOpen(true);
                      }}
                    >
                      <Phone size={13} />
                      <span>Add Phone for Live GPS</span>
                      <ArrowRight size={13} className="tp-strip-arrow" />
                    </button>
                  ) : (
                    <div className="tp-mobile-verified-strip">
                      <CheckCircle2 size={13} color="#059669" />
                      <span>100% Profile Complete • Verified</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="tp-mobile-guest-card">
                  <div className="tp-mobile-guest-left">
                    <User size={16} />
                    <span>Browsing as Guest Pilgrim</span>
                  </div>
                  <button
                    type="button"
                    className="tp-btn-mobile-signin"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                  >
                    <span>Sign In</span>
                  </button>
                </div>
              )}

              {/* 2. Main Navigation Links (Dynamically Adapts to Active Category & Authority) */}
              <div className="tp-mobile-nav-block">
                <div className="tp-mobile-section-label">
                  {activeUserRole === 'admin'
                    ? 'ADMIN OPERATIONS & DIRECTORY'
                    : activeUserRole === 'driver'
                      ? 'SARATHI FLEET & DISPATCH'
                      : activeUserRole === 'restaurant' || activeUserRole === 'restaurant_staff'
                        ? 'DINING & PRASADAM DESK'
                        : activeUserRole === 'hotel' || activeUserRole === 'hotel_staff'
                          ? 'ASHRAM & HOTEL STAY DESK'
                          : activeUserRole === 'agency'
                            ? 'TOUR GUIDE & YATRA DESK'
                            : 'PILGRIMAGE SERVICES'}
                </div>

                <div className="tp-mobile-nav-list">
                  {/* ROLE SPECIFIC PRIORITY ACTIONS */}
                  {activeUserRole === 'admin' && (
                    <button
                      type="button"
                      className="tp-mobile-nav-item tp-mobile-nav-item-btn tp-mobile-highlight-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenAdmin) onOpenAdmin();
                      }}
                    >
                      <div className="tp-nav-item-content">
                        <div className="tp-nav-item-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
                          <Lock size={18} />
                        </div>
                        <div className="tp-nav-item-text">
                          <span className="tp-nav-item-title">Platform Admin Console</span>
                          <span className="tp-nav-item-sub">Superuser control, financials &amp; audits</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                    </button>
                  )}

                  {activeUserRole === 'driver' && (
                    <>
                      <button
                        type="button"
                        className="tp-mobile-nav-item tp-mobile-nav-item-btn tp-mobile-highlight-item"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          if (onOpenDriverPortal) onOpenDriverPortal();
                          else if (onOpenPartnerHub) onOpenPartnerHub('driver');
                        }}
                      >
                        <div className="tp-nav-item-content">
                          <div className="tp-nav-item-icon-box" style={{ background: '#f8fafc', color: '#0f172a' }}>
                            <Car size={18} />
                          </div>
                          <div className="tp-nav-item-text">
                            <span className="tp-nav-item-title">Sarathi Driver Companion</span>
                            <span className="tp-nav-item-sub">Live dispatch queue &amp; trip fares</span>
                          </div>
                        </div>
                        <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                      </button>

                      {onOpenDriverPage && (
                        <button
                          type="button"
                          className="tp-mobile-nav-item tp-mobile-nav-item-btn"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onOpenDriverPage();
                          }}
                        >
                          <div className="tp-nav-item-content">
                            <div className="tp-nav-item-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                              <Compass size={18} />
                            </div>
                            <div className="tp-nav-item-text">
                              <span className="tp-nav-item-title">Driver Fleet Landing</span>
                              <span className="tp-nav-item-sub">Sarathi benefits &amp; EV registration</span>
                            </div>
                          </div>
                          <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                        </button>
                      )}
                    </>
                  )}

                  {(activeUserRole === 'restaurant' || activeUserRole === 'restaurant_staff') && (
                    <button
                      type="button"
                      className="tp-mobile-nav-item tp-mobile-nav-item-btn tp-mobile-highlight-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenPartnerHub) onOpenPartnerHub('restaurant');
                      }}
                    >
                      <div className="tp-nav-item-content">
                        <div className="tp-nav-item-icon-box" style={{ background: '#fff7ed', color: '#ea580c' }}>
                          <UtensilsCrossed size={18} />
                        </div>
                        <div className="tp-nav-item-text">
                          <span className="tp-nav-item-title">Restaurant Partner Desk</span>
                          <span className="tp-nav-item-sub">Table reservations &amp; prasadam orders</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                    </button>
                  )}

                  {(activeUserRole === 'hotel' || activeUserRole === 'hotel_staff') && (
                    <button
                      type="button"
                      className="tp-mobile-nav-item tp-mobile-nav-item-btn tp-mobile-highlight-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenPartnerHub) onOpenPartnerHub('hotel');
                      }}
                    >
                      <div className="tp-nav-item-content">
                        <div className="tp-nav-item-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                          <Building2 size={18} />
                        </div>
                        <div className="tp-nav-item-text">
                          <span className="tp-nav-item-title">Hotel &amp; Ashram Stay Desk</span>
                          <span className="tp-nav-item-sub">Room bookings &amp; guest check-ins</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                    </button>
                  )}

                  {activeUserRole === 'agency' && (
                    <button
                      type="button"
                      className="tp-mobile-nav-item tp-mobile-nav-item-btn tp-mobile-highlight-item"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onOpenPartnerHub) onOpenPartnerHub('agency');
                      }}
                    >
                      <div className="tp-nav-item-content">
                        <div className="tp-nav-item-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                          <Compass size={18} />
                        </div>
                        <div className="tp-nav-item-text">
                          <span className="tp-nav-item-title">Tour Agency &amp; Guide Desk</span>
                          <span className="tp-nav-item-sub">Group yatra bookings &amp; itineraries</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                    </button>
                  )}

                  <a
                    href="#popular"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="tp-nav-item-content">
                      <div className="tp-nav-item-icon-box" style={{ background: '#f8fafc', color: '#0f172a' }}>
                        <Compass size={18} />
                      </div>
                      <div className="tp-nav-item-text">
                        <span className="tp-nav-item-title">Sacred Dhams & Live Map</span>
                        <span className="tp-nav-item-sub">Interactive GPS pilgrimage navigation</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                  </a>

                  <a
                    href="#explore"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="tp-nav-item-content">
                      <div className="tp-nav-item-icon-box" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                        <Calendar size={18} />
                      </div>
                      <div className="tp-nav-item-text">
                        <span className="tp-nav-item-title">Brij Tour Packages</span>
                        <span className="tp-nav-item-sub">Darshan, Parikrama & Yatra Cabs</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                  </a>

                  <a
                    href="#gallery"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="tp-nav-item-content">
                      <div className="tp-nav-item-icon-box" style={{ background: '#fdf4ff', color: '#a21caf' }}>
                        <ImageIcon size={18} />
                      </div>
                      <div className="tp-nav-item-text">
                        <span className="tp-nav-item-title">Divine Darshan Gallery</span>
                        <span className="tp-nav-item-sub">4K live deity darshan & archives</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                  </a>

                  {onOpenPartnerHub && (
                    <button
                      type="button"
                      className="tp-mobile-nav-item tp-mobile-nav-item-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenPartnerHub(activeUserRole === 'admin' ? 'admin' : undefined);
                      }}
                    >
                      <div className="tp-nav-item-content">
                        <div className="tp-nav-item-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
                          <Building2 size={18} />
                        </div>
                        <div className="tp-nav-item-text">
                          <span className="tp-nav-item-title">Partner & Driver Hub</span>
                          <span className="tp-nav-item-sub">E-Rickshaw, stay & travel desk</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                    </button>
                  )}

                  <a
                    href="#contact"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="tp-nav-item-content">
                      <div className="tp-nav-item-icon-box" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                        <Headphones size={18} />
                      </div>
                      <div className="tp-nav-item-text">
                        <span className="tp-nav-item-title">Contact & Support</span>
                        <span className="tp-nav-item-sub">24x7 WhatsApp helpline</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="tp-mobile-nav-arrow" />
                  </a>
                </div>
              </div>

              {/* 3. Action Buttons Suite (Dynamically Tailored by Role) */}
              <div className="tp-mobile-cta-suite">
                {activeUserRole === 'driver' ? (
                  <button
                    type="button"
                    className="tp-btn-mobile-primary-action driver"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenDriverPortal) onOpenDriverPortal();
                      else if (onOpenPartnerHub) onOpenPartnerHub('driver');
                    }}
                  >
                    <Car size={16} />
                    <span>Open Driver Companion</span>
                  </button>
                ) : activeUserRole === 'admin' ? (
                  <button
                    type="button"
                    className="tp-btn-mobile-primary-action admin"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenAdmin) onOpenAdmin();
                    }}
                  >
                    <Lock size={16} />
                    <span>Open Admin Suite</span>
                  </button>
                ) : activeUserRole === 'restaurant' || activeUserRole === 'restaurant_staff' ? (
                  <button
                    type="button"
                    className="tp-btn-mobile-primary-action restaurant"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenPartnerHub) onOpenPartnerHub('restaurant');
                    }}
                  >
                    <UtensilsCrossed size={16} />
                    <span>Restaurant Partner Desk</span>
                  </button>
                ) : activeUserRole === 'hotel' || activeUserRole === 'hotel_staff' ? (
                  <button
                    type="button"
                    className="tp-btn-mobile-primary-action hotel"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenPartnerHub) onOpenPartnerHub('hotel');
                    }}
                  >
                    <Building2 size={16} />
                    <span>Hotel & Stay Desk</span>
                  </button>
                ) : activeUserRole === 'agency' ? (
                  <button
                    type="button"
                    className="tp-btn-mobile-primary-action agency"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenPartnerHub) onOpenPartnerHub('agency');
                    }}
                  >
                    <Compass size={16} />
                    <span>Tour Guide Desk</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tp-btn-mobile-primary-action"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsTripPackagesModalOpen(true);
                    }}
                  >
                    <Calendar size={16} />
                    <span>Book Yatra Package</span>
                  </button>
                )}

                <button
                  type="button"
                  className="tp-btn-mobile-outline-action"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (onClose) onClose();
                  }}
                >
                  <MapPin size={16} />
                  <span>Live Pilgrim GPS Map</span>
                </button>
              </div>

              {/* 4. Vrindopnishad Network Ecosystem Links */}
              <div className="tp-mobile-ecosystem-block">
                <div className="tp-mobile-section-label">VRINDOPNISHAD NETWORK</div>
                <ul className="tp-mobile-ecosystem-list">
                  <li>
                    <a href="https://path.vrindopnishad.in/" target="_blank" rel="noopener noreferrer">
                      <span>Vrindopnishad Path</span>
                      <ArrowUpRight size={16} />
                    </a>
                  </li>
                  <li>
                    <a href="https://pic.vrindopnishad.in/" target="_blank" rel="noopener noreferrer">
                      <span>Chitra Vrinda HD Darshan</span>
                      <ArrowUpRight size={16} />
                    </a>
                  </li>
                  <li>
                    <a href="https://api.whatsapp.com/send?phone=917618218181&text=Radhe%20Radhe%21%20I%20want%20to%20inquire%20about%20a%20Vrinda%20Yatra" target="_blank" rel="noopener noreferrer">
                      <span>24x7 WhatsApp Concierge</span>
                      <ArrowUpRight size={16} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. DYNAMIC SACRED PACKAGE DETAIL PAGE VIEW OR LANDING PAGE CONTENT */}
      {activePackageDetail ? (
        <PackageDetailPage
          pkg={activePackageDetail}
          onBack={handleClosePackageDetail}
          onBookStripe={handleInitiateStripeFromDetail}
          onBookInquiry={handleInitiateInquiryFromDetail}
          onOpenReservationModal={(pkgItem) => setSelectedItem(pkgItem)}
          onOpenHelpCenter={onOpenHelpCenter}
          initialCheckInDate={checkInDate}
          initialCheckOutDate={checkOutDate}
          initialGuests={roomsGuests}
          currentUser={currentUser}
          isFavorite={safeFavoriteIds.includes(activePackageDetail.id)}
          onToggleFavorite={toggleFavorite}
        />
      ) : (
        <>
          {/* 2. MASTER AVIATION HERO SECTION (Exact Reference Design) */}
          <section className="tp-hero-section" id="hero">
        <div className="tp-hero-plane-card">
          {/* Background Soaring Airplane Visual (Preloaded Layered Images for Instant Transitions) */}
          <div className="tp-plane-bg-layer">
            {heroSteps.map((stepItem) => (
              <img
                key={stepItem.step}
                src={stepItem.bgImage}
                alt="Passenger Airplane Soaring Through Sky and Clouds"
                className={`tp-plane-bg-img ${activeStep === stepItem.step ? 'active' : 'inactive'}`}
                loading={stepItem.step === 1 ? 'eager' : 'lazy'}
                fetchPriority={stepItem.step === 1 ? 'high' : 'auto'}
                decoding="async"
              />
            ))}
            <div className="tp-plane-sky-gradient" />
          </div>

          {/* Left Content Area with Step Indicator */}
          <div className="tp-hero-left-wrapper">
            {/* Step Indicator (Vertical on Desktop, Segmented Capsule on Mobile) */}
            <div className="tp-step-indicator">
              <div className="tp-step-line" />
              {heroSteps.map((stepItem) => (
                <button
                  key={stepItem.step}
                  className={`tp-step-node ${activeStep === stepItem.step ? 'active' : ''}`}
                  onClick={() => setActiveStep(stepItem.step)}
                  title={`Step ${stepItem.step}: ${stepItem.tagline}`}
                >
                  {activeStep === stepItem.step && (
                    <svg className="tp-step-ring" viewBox="0 0 36 36">
                      <circle className="tp-step-ring-bg" cx="18" cy="18" r="16" />
                      <circle
                        key={`ring-${stepItem.step}-${activeStep}`}
                        className="tp-step-ring-progress"
                        cx="18"
                        cy="18"
                        r="16"
                      />
                    </svg>
                  )}
                  <span className="tp-step-num">{stepItem.step}</span>
                </button>
              ))}
            </div>

            {/* Main Headline & Call To Action (Smooth Fade-In Transition) */}
            <div key={activeStep} className="tp-hero-copy tp-hero-copy-animated">
              <span className="tp-hero-eyebrow">{currentHero.tagline}</span>
              <h1 className="tp-hero-main-title">
                {currentHero.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx < currentHero.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h1>

              {/* Dual Button CTA */}
              <div className="tp-hero-dual-cta">
                <button
                  className="tp-btn-flight-cta"
                  onClick={() => {
                    setSelectedItem(popularPlaces[0]);
                  }}
                >
                  {currentHero.ctaText}
                </button>
                <button
                  className="tp-btn-circle-play"
                  onClick={() => {
                    setActiveStep((prev) => (prev % heroSteps.length) + 1);
                  }}
                  title="Next Flight Experience"
                >
                  <div className="tp-blue-dot-icon">
                    <Play size={12} fill="#2563eb" color="#2563eb" className="tp-play-mini-icon" />
                  </div>
                </button>
              </div>

              {/* Hero Interactive Universal Discovery Search Bar */}
              <div className="tp-hero-search-bar" onClick={() => setIsOmniSearchOpen(true)}>
                <div className="tp-hsb-left">
                  <Search size={16} className="tp-hsb-icon" />
                  <span className="tp-hsb-text">Search sacred dhams, yatra plans, passes, GPS map...</span>
                </div>
                <div className="tp-hsb-right">
                  <button
                    type="button"
                    className="tp-hsb-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOmniSearchOpen(true);
                    }}
                  >
                    <span>Search</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Bottom-Right Notched / Inset "Know More" Card */}
          <div
            className="tp-know-more-card"
            onClick={() => {
              const el = document.getElementById('explore');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="tp-km-header">
              <span className="tp-km-title">Know More</span>
              <ArrowRight size={16} className="tp-km-arrow" />
            </div>

            <div className="tp-km-body">
              {/* Overlapping 3 Destination Avatars */}
              <div className="tp-km-avatars">
                {awesomePlaceAvatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="Awesome place thumbnail"
                    className="tp-km-avatar-img"
                    style={{ zIndex: 3 - i }}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>

              {/* Awesome Places Text */}
              <div className="tp-km-info">
                <strong className="tp-km-info-title">Awesome Places</strong>
                <p className="tp-km-info-sub">1,300+ Curated Spots</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. HERO BOTTOM BAR (Social Pill Capsule + Partner Brand Logos) */}
        <div className="tp-hero-bottom-bar">
          {/* Left Social Pill */}
          <div className="tp-social-pill-capsule">
            <span className="tp-follow-label">Follow</span>
            <div className="tp-social-pill-icons">
              <a
                href="https://www.instagram.com/vrindopnishad"
                target="_blank"
                rel="noopener noreferrer"
                className="tp-social-pill-link tp-social-instagram"
                aria-label="Instagram"
                title="Instagram @vrindopnishad"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://www.youtube.com/@vrindopnishad"
                target="_blank"
                rel="noopener noreferrer"
                className="tp-social-pill-link tp-social-youtube"
                aria-label="YouTube"
                title="YouTube @vrindopnishad"
              >
                <Youtube size={15} />
              </a>
              <a
                href="https://www.facebook.com/vrindopnishad"
                target="_blank"
                rel="noopener noreferrer"
                className="tp-social-pill-link tp-social-facebook"
                aria-label="Facebook"
                title="Facebook @vrindopnishad"
              >
                <Facebook size={15} />
              </a>
              <a
                href="https://www.pinterest.com/vrindopnishad"
                target="_blank"
                rel="noopener noreferrer"
                className="tp-social-pill-link tp-social-pinterest"
                aria-label="Pinterest"
                title="Pinterest @vrindopnishad"
              >
                <PinterestIcon size={15} />
              </a>
            </div>
          </div>

          {/* Right Partner Logos */}
          <div className="tp-partner-logos-row">
            <div className="tp-partner-brand">
              <span className="tp-brand-airbnb">
                <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor">
                  <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533.992c3.125 5.867 6.716 13.064 6.716 17.739 0 5.179-3.921 9-12 9s-12-3.821-12-9c0-4.675 3.591-11.872 6.716-17.739l.533-.992C10.537 1.963 11.992 1 14 1h2zm0 2.222c-1.127 0-2.185.656-3.238 2.54l-.513.957C9.378 12.11 6 18.995 6 23c0 3.731 2.766 6.778 10 6.778s10-3.047 10-6.778c0-4.005-3.378-10.89-6.249-16.281l-.513-.957C18.185 3.878 17.127 3.222 16 3.222zm0 11.778c2.761 0 5 2.239 5 5 0 2.414-1.721 4.435-4 4.899V20a1 1 0 00-2 0v4.899c-2.279-.464-4-2.485-4-4.899 0-2.761 2.239-5 5-5z" />
                </svg>
                <span>airbnb</span>
              </span>
            </div>

            <div className="tp-partner-brand">
              <span className="tp-brand-booking">Booking.com</span>
            </div>

            <div className="tp-partner-brand">
              <span className="tp-brand-trivago">
                <span className="tp-tri-t">tri</span><span className="tp-tri-va">va</span><span className="tp-tri-go">go</span>
              </span>
            </div>

            <div className="tp-partner-brand">
              <span className="tp-brand-expedia">
                <Globe size={18} className="tp-expedia-icon" />
                <span>Expedia</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5. JOURNEY TO THE SKIES MADE SIMPLE (Zero-Latency Accordion) */}
      <PartnerJourneySection onSelectItem={setSelectedItem} />

      {/* 4. SECTION: POPULAR PLACE */}
      <section className="tp-section tp-popular-section" id="popular">
        <div className="tp-container">
          {/* Section Header */}
          <div className="tp-section-header">
            <div className="tp-header-left">
              <h2 className="tp-section-title">Popular Brij Yatra Spots</h2>
              <p className="tp-section-tagline">Sacred Brij Vibes & Highlights</p>
            </div>
            <div className="tp-header-right">
              <p className="tp-header-desc">
                Sacred Dhams and divine leela sthalis with authentic darshans and spiritual bliss.
              </p>
            </div>
          </div>


          {/* 4-Card Grid (Anchor Overlay Architecture) */}
          <div className="tp-popular-grid">
            {popularPlaces.map((place) => {
              const isActive = activePopularCardId === place.id;
              return (
                <div key={place.id} className="tp-popular-card-anchor">
                  <div
                    className={`tp-popular-card tp-morph-card ${isActive ? 'is-active' : ''}`}
                    onClick={(e) => {
                      if (window.innerWidth <= 900) {
                        if (activePopularCardId !== place.id) {
                          e.stopPropagation();
                          setActivePopularCardId(place.id);
                          return;
                        }
                      }
                      setSelectedItem(place);
                    }}
                  >
                    <div className="tp-card-media">
                      <img src={place.image} alt={place.title} className="tp-card-img" loading="lazy" />
                      <div className="tp-price-badge">{place.price}</div>
                    </div>
                    <div className="tp-card-info">
                      <h3 className="tp-card-title">{place.title}</h3>

                      {/* Resting Location Row */}
                      <div className="tp-card-location tp-card-resting-loc">
                        <MapPin size={13} className="tp-loc-icon" />
                        <span>{place.location.includes(',') ? place.location.split(',')[0] : place.location}</span>
                      </div>

                      {/* Morph Content Revealed as Floating Overlay on Hover / Active */}
                      <div className="tp-card-morph-body">
                        <p className="tp-card-morph-sub">{place.category || 'Vrindavan Yatra'}</p>

                        <div className="tp-card-morph-tags">
                          <span className="tp-card-tag-item">
                            <Tag size={13} className="tp-card-tag-icon" />
                            <span>from <strong>{place.price}</strong></span>
                          </span>
                          <span className="tp-card-tag-item">
                            <MapPin size={13} className="tp-card-tag-icon" />
                            <span>{place.location.includes(',') ? place.location.split(',')[0] : place.location}</span>
                          </span>
                        </div>

                        <div className="tp-card-morph-cta-suite">
                          <button
                            type="button"
                            className="tp-btn-card-pill-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(place);
                            }}
                          >
                            <span className="tp-btn-txt-desktop">View Darshan</span>
                            <span className="tp-btn-txt-mobile">Darshan</span>
                          </button>

                          <button
                            type="button"
                            className={`tp-btn-card-heart-pill ${safeFavoriteIds.includes(place.id) ? 'is-favorited' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(place.id, place.title);
                            }}
                            title={safeFavoriteIds.includes(place.id) ? "Remove from Favourites" : "Save to Favourites"}
                            aria-label={safeFavoriteIds.includes(place.id) ? "Remove from Favourites" : "Save to Favourites"}
                          >
                            <Heart
                              size={16}
                              fill={safeFavoriteIds.includes(place.id) ? '#ef4444' : 'none'}
                              color={safeFavoriteIds.includes(place.id) ? '#ef4444' : 'currentColor'}
                              className={safeFavoriteIds.includes(place.id) ? 'tp-heart-pop' : ''}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4.5. SECTION: OUR TRAVEL PHILOSOPHY (Matching Reference Design) */}
      <section className="tp-section tp-mission-section" id="mission">
        <div className="tp-container">
          <div className="tp-mission-main-layout">
            {/* Left Column: Mission Statement & Dual CTAs */}
            <div className="tp-mission-left-col">
              <div className="tp-mission-badge">
                <Compass size={14} className="tp-mission-badge-icon" />
                <span>{missionData.badge}</span>
              </div>

              <h2 className="tp-mission-title">
                {missionData.titlePart1}<br />
                <span className="tp-highlight-green">{missionData.titleHighlight}</span><br />
                {missionData.titlePart2}<br />
                {missionData.titlePart3}
              </h2>

              <p className="tp-mission-desc">
                {missionData.description}
              </p>

              <div className="tp-mission-cta-row">
                <button
                  className="tp-btn-mission-primary"
                  onClick={() => {
                    const el = document.getElementById('popular');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>{missionData.primaryBtnText}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  className="tp-btn-mission-secondary"
                  onClick={() => {
                    const el = document.getElementById('explore');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>{missionData.secondaryBtnText}</span>
                </button>
              </div>
            </div>

            {/* Right Column: 3 Feature Photo Pillar Cards */}
            <div className="tp-mission-pillars-grid">
              {missionData.pillars.map((pillar) => (
                <div key={pillar.id} className="tp-pillar-card">
                  <img
                    src={pillar.image}
                    alt={pillar.alt}
                    className="tp-pillar-img"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="tp-pillar-scrim" />

                  {/* Lower Overlay Content */}
                  <div className="tp-pillar-content">
                    <h3 className="tp-pillar-title">
                      {pillar.title.split('\n').map((l, idx) => (
                        <React.Fragment key={idx}>
                          {l}
                          {idx < pillar.title.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </h3>
                    <div className="tp-pillar-divider" />
                    <p className="tp-pillar-desc">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: TOP DESTINATION / BRIJ PACKAGES (Matching Reference Bento Grid) */}
      <section className="tp-section tp-explore-section" id="explore">
        <div className="tp-container">
          {/* Centered Minimalist Header */}
          <div className="tp-top-dest-header">
            <h2 className="tp-top-dest-title">Brij Vibers Packages</h2>
            <p className="tp-top-dest-subtitle">Curated spiritual yatras across Vrindavan, Mathura, Govardhan & Barsana</p>
          </div>

          {/* Clean Luxury Pill Filter Tabs */}
          <div className="tp-top-dest-tabs-wrap">
            <div className="tp-top-dest-tabs">
              {topDestinationTabs.map((tab) => (
                <button
                  key={tab}
                  className={`tp-top-dest-tab-btn ${activeTopTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTopTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Asymmetric 6-Card Bento Grid */}
          <div className="tp-explore-grid tp-bento-destination-grid">
            {(topDestinationsByTab[activeTopTab] || topDestinationsByTab['Vrindavan Dham']).map((dest, idx) => (
              <div
                key={dest.id}
                className={`tp-bento-card tp-bento-area-${idx + 1}`}
                onClick={() => setSelectedItem(dest)}
              >
                <img src={dest.image} alt={dest.title} className="tp-bento-img" loading="lazy" />
                <div className="tp-bento-scrim" />

                {/* Bottom Overlay Content */}
                <div className="tp-bento-content">
                  <span className="tp-bento-region">{dest.region}</span>
                  <h3 className="tp-bento-title">{dest.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5.5. SECTION: VRINDA VIHAR DIVINE DARSHAN GALLERY (Authentic Aspect Ratio Preservation) */}
      <section className="tp-section tp-gallery-section" id="gallery">
        {/* Controls Bar: Full-Width Search & Filter Pills */}
        <div className="tp-gallery-controls">
          {/* 1. Full-Width Search Input */}
          <div className="tp-gallery-search-wrap">
            <Search size={16} className="tp-gallery-search-icon" />
            <input
              type="text"
              className="tp-gallery-search-input"
              placeholder="Search deity, temple, or holy kund..."
              value={gallerySearch}
              onChange={(e) => setGallerySearch(e.target.value)}
            />
            {gallerySearch && (
              <button
                type="button"
                className="tp-gallery-search-clear"
                onClick={() => setGallerySearch('')}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* 2. Category Filter Pills */}
          <div className="tp-gallery-tabs-scroll">
            <div className="tp-gallery-tabs">
              {vrindaViharGalleryCategories.map((cat) => (
                <button
                  key={cat}
                  className={`tp-gallery-tab-btn ${galleryCategory === cat ? 'active' : ''}`}
                  onClick={() => handleGalleryCategoryChange(cat)}
                >
                  <span>{cat}</span>
                  <span className="tp-gallery-tab-count">{categoryCounts[cat] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Feedback (Only shown when active search filter applied) */}
        {gallerySearch && (
          <div className="tp-gallery-search-feedback">
            <span>
              Showing results for "<strong>{gallerySearch}</strong>" ({filteredGalleryItems.length} found)
            </span>
            <button
              type="button"
              className="tp-gallery-search-reset-link"
              onClick={() => setGallerySearch('')}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Aspect-Ratio Calibrated Dynamic Gallery Grid (Exact San Francisco Reference Card UI) */}
        {filteredGalleryItems.length > 0 ? (
          <>
            <div className="tp-gallery-flex-grid">
              {galleryColumns.map((colItems, colIdx) => (
                <div key={colIdx} className="tp-gallery-flex-col">
                  {colItems.map((item) => {
                    const isActive = activeGalleryCardId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`tp-gallery-card tp-morph-card ${isActive ? 'is-active' : ''}`}
                        onClick={(e) => {
                          if (window.innerWidth <= 900) {
                            if (activeGalleryCardId !== item.id) {
                              e.stopPropagation();
                              setActiveGalleryCardId(item.id);
                              return;
                            }
                          }
                          setLightboxItem(item);
                        }}
                      >
                        {/* 1. Picture Handling: Soft Rounded Inset Picture Container */}
                        <div
                          className="tp-gallery-card-img-wrap"
                          style={{
                            aspectRatio: item.aspectRatio || '4/5'
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="tp-gallery-card-photo"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="tp-price-badge">{item.price ? `${item.price}/-` : '1.2k/-'}</div>
                        </div>

                        {/* 2. Content Section: Resting State & Hover/Active Morph */}
                        <div className="tp-gallery-card-body">
                          <h4 className="tp-gallery-card-heading">{item.title}</h4>

                          {/* Resting Location Row */}
                          <div className="tp-card-location tp-card-resting-loc">
                            <MapPin size={13} className="tp-loc-icon" />
                            <span>{item.location.includes(',') ? item.location.split(',')[0] : item.location}</span>
                          </div>

                          {/* Morph Body Revealed on Hover / Active */}
                          <div className="tp-card-morph-body">
                            <p className="tp-gallery-card-category-sub">{item.category}</p>

                            <div className="tp-gallery-card-tags-row">
                              <span className="tp-card-tag-item">
                                <Tag size={13} className="tp-card-tag-icon" />
                                <span>from <strong>{item.price || '₹1,200'}</strong></span>
                              </span>
                              <span className="tp-card-tag-item">
                                <MapPin size={13} className="tp-card-tag-icon" />
                                <span>{item.location.includes(',') ? item.location.split(',')[0] : item.location}</span>
                              </span>
                            </div>

                            <div className="tp-gallery-card-cta-suite">
                              <button
                                type="button"
                                className="tp-btn-card-pill-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLightboxItem(item);
                                }}
                              >
                                <span className="tp-btn-txt-desktop">View Darshan</span>
                                <span className="tp-btn-txt-mobile">Darshan</span>
                              </button>

                              <button
                                type="button"
                                className={`tp-btn-card-heart-pill ${safeFavoriteIds.includes(item.id) ? 'is-favorited' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id, item.title);
                                }}
                                title={safeFavoriteIds.includes(item.id) ? "Remove from Favourites" : "Save to Favourites"}
                                aria-label={safeFavoriteIds.includes(item.id) ? "Remove from Favourites" : "Save to Favourites"}
                              >
                                <Heart
                                  size={16}
                                  fill={safeFavoriteIds.includes(item.id) ? '#ef4444' : 'none'}
                                  color={safeFavoriteIds.includes(item.id) ? '#ef4444' : 'currentColor'}
                                  className={safeFavoriteIds.includes(item.id) ? 'tp-heart-pop' : ''}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Minimalist Gallery Load More Action Deck */}
            {filteredGalleryItems.length > INITIAL_GALLERY_LIMIT && (
              <div className="tp-gallery-action-deck">
                {hasMoreGalleryItems ? (
                  <button
                    type="button"
                    className="tp-btn-gallery-more"
                    onClick={() =>
                      setGalleryVisibleCount((prev) =>
                        Math.min(prev + GALLERY_BATCH_SIZE, filteredGalleryItems.length)
                      )
                    }
                  >
                    <span>Show More</span>
                    <ChevronDown size={18} className="tp-gallery-more-chevron" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tp-btn-gallery-collapse-minimal"
                    onClick={() => {
                      setGalleryVisibleCount(INITIAL_GALLERY_LIMIT);
                      const el = document.getElementById('gallery');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span>Show Less</span>
                    <ChevronDown size={18} className="tp-gallery-collapse-chevron" />
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="tp-gallery-empty-state">
            <ImageIcon size={36} className="tp-gallery-empty-icon" />
            <h4>No Sacred Darshan found for "{gallerySearch}"</h4>
            <p>Try searching for Radha Raman, Bihari Ji, Govardhan, or Radha Vallabh.</p>
            <button
              className="tp-btn-gallery-reset"
              onClick={() => {
                setGallerySearch('');
                handleGalleryCategoryChange('All Darshans');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* 6. SECTION: FEATURED EXPEDITIONS & TOURS (Refined Luxury Layout) */}
      <section className="tp-section tp-initiatives-section" id="initiatives">
        <div className="tp-container">
          {/* Header Row */}
          <div className="tp-init-header-row">
            <div className="tp-init-header-left">
              <div className="tp-mission-badge">
                <Sparkles size={14} className="tp-mission-badge-icon" />
                <span>{initiativesData.badge}</span>
              </div>
              <h2 className="tp-init-main-title">
                Real Journeys. Unrivaled Wonder.
              </h2>
              <p className="tp-init-main-desc">
                {initiativesData.description}
              </p>
            </div>

            <div className="tp-init-header-right">
              <button
                className="tp-init-view-all-btn"
                onClick={() => {
                  const el = document.getElementById('explore');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>{initiativesData.viewAllText}</span>
                <ArrowRight size={15} />
              </button>

              <div className="tp-init-arrows">
                <button
                  className="tp-init-arrow-btn"
                  title="Previous Tour"
                  onClick={handleInitPrev}
                  aria-label="Previous Tour"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  className="tp-init-arrow-btn"
                  title="Next Tour"
                  onClick={handleInitNext}
                  aria-label="Next Tour"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Horizontal Cards Deck */}
          <div className="tp-initiatives-carousel-deck" ref={initiativesGridRef}>
            {initiativesData.cards.map((card) => (
              <div
                key={card.id}
                className="tp-init-luxury-card"
                onClick={() => setSelectedItem({
                  ...popularPlaces[0],
                  title: card.title.replace('\n', ' '),
                  image: card.image,
                  category: card.category,
                  description: card.description
                })}
              >
                <div className="tp-init-media">
                  <img src={card.image} alt={card.title} className="tp-init-img" loading="lazy" />
                  <span className="tp-init-category-badge">{card.category}</span>
                </div>
                <div className="tp-init-body">
                  <h3 className="tp-init-title">
                    {card.title.replace('\n', ' ')}
                  </h3>
                  <p className="tp-init-desc">{card.description}</p>
                  <button
                    className="tp-init-link-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({
                        ...popularPlaces[0],
                        title: card.title.replace('\n', ' '),
                        image: card.image,
                        category: card.category
                      });
                    }}
                  >
                    <span>{card.linkText}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Centered Luxury Organic Newsletter Card */}
          <div className="tp-init-newsletter-wrap">
            <div className="tp-lime-newsletter-card">
              <div className="tp-lime-nl-text">
                <h4 className="tp-lime-nl-title">{initiativesData.newsletterCard.title}</h4>
                <p className="tp-lime-nl-desc">{initiativesData.newsletterCard.description}</p>
              </div>

              <form
                onSubmit={handleNewsletterSubmit}
                className={`tp-lime-nl-form ${isNlActive ? 'search-active' : ''}`}
              >
                <Mail size={16} className="tp-lime-nl-icon" />
                <input
                  type="email"
                  placeholder={initiativesData.newsletterCard.placeholder}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  onFocus={() => setIsNlActive(true)}
                  onBlur={() => {
                    if (!newsletterEmail) setIsNlActive(false);
                  }}
                  className="tp-lime-nl-input"
                  required
                />
                <button
                  type="submit"
                  className="tp-btn-lime-subscribe"
                  title={initiativesData.newsletterCard.buttonText}
                >
                  <span className="tp-btn-lime-label">{initiativesData.newsletterCard.buttonText}</span>
                  <ArrowRight size={15} className="tp-btn-lime-arrow" />
                </button>
              </form>

              {newsletterSubscribed && (
                <div className="tp-lime-nl-success">
                  <CheckCircle2 size={14} />
                  <span>Thank you for subscribing!</span>
                </div>
              )}

              <div className="tp-lime-nl-avatars-row">
                <div className="tp-lime-avatars">
                  {awesomePlaceAvatars.map((url, i) => (
                    <img key={i} src={url} alt="Community avatar" className="tp-lime-avatar-img" />
                  ))}
                </div>
                <span className="tp-lime-join-text">{initiativesData.newsletterCard.joinText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* 8. MASTER SUSTAINABLE FOOTER (Matching Reference Design) */}
      <footer className="tp-footer tp-master-sustainable-footer" id="contact">
        <div className="tp-container">
          <div className="tp-footer-grid">
            {/* Column 1: Brand & Sustainable Tagline */}
            <div className="tp-footer-col tp-footer-brand-col">
              <div className="tp-navbar-brand">
                <div className="tp-brand-icon-outer">
                  <div className="tp-brand-icon-inner" />
                </div>
                <span className="tp-logo-text-black">Vrinda.</span>
              </div>
              <p className="tp-footer-brand-tagline">
                {footerNavigation.brandTagline}
              </p>
            </div>

            {/* Link Columns 2, 3, 4 */}
            {footerNavigation.columns.map((col, idx) => (
              <div key={idx} className="tp-footer-col">
                <h5 className="tp-footer-heading">{col.title}</h5>
                <ul className="tp-footer-links">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.href === '#admin' ? (
                        <button
                          type="button"
                          className="tp-footer-admin-btn"
                          onClick={() => {
                            if (onOpenAdmin) onOpenAdmin();
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'inherit',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {link.label}
                        </button>
                      ) : link.tab ? (
                        <button
                          type="button"
                          className="tp-footer-admin-btn"
                          onClick={() => {
                            if (link.tab === 'help' && onOpenHelpCenter) {
                              onOpenHelpCenter();
                            } else if (onOpenInfoModal) {
                              onOpenInfoModal(link.tab);
                            } else {
                              window.location.href = link.href;
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'inherit',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {link.label}
                        </button>
                      ) : link.isCookieTrigger ? (
                        <button
                          type="button"
                          className="tp-footer-link-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            if (typeof window !== 'undefined' && window.openCookieConsent) {
                              window.openCookieConsent();
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            font: 'inherit',
                            color: 'inherit',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a href={link.href}>{link.label}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Column 5: Follow Us & Copyright */}
            <div className="tp-footer-col tp-footer-social-col">
              <h5 className="tp-footer-heading">Follow Us</h5>
              <div className="tp-footer-social-circles">
                <a
                  href="https://www.instagram.com/vrindopnishad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-social-circle-link tp-footer-instagram"
                  aria-label="Instagram"
                  title="Instagram @vrindopnishad"
                >
                  <Instagram size={15} />
                </a>
                <a
                  href="https://www.youtube.com/@vrindopnishad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-social-circle-link tp-footer-youtube"
                  aria-label="YouTube"
                  title="YouTube @vrindopnishad"
                >
                  <Youtube size={15} />
                </a>
                <a
                  href="https://www.facebook.com/vrindopnishad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-social-circle-link tp-footer-facebook"
                  aria-label="Facebook"
                  title="Facebook @vrindopnishad"
                >
                  <Facebook size={15} />
                </a>
                <a
                  href="https://www.pinterest.com/vrindopnishad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tp-social-circle-link tp-footer-pinterest"
                  aria-label="Pinterest"
                  title="Pinterest @vrindopnishad"
                >
                  <PinterestIcon size={15} />
                </a>
              </div>
              <p className="tp-footer-copy-text">{footerNavigation.copyright}</p>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS & POPUPS
          ========================================================================= */}
      {/* Universal Omni-Search Spotlight Modal */}
      <OmniSearchModal
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
        onSelectTrip={(pkg) => setSelectedItem(pkg)}
        onSelectPlace={(place) => setSelectedItem(place)}
        onSelectService={(srv) => {
          if (srv.actionType === 'live_map') {
            if (onClose) onClose();
          } else if (srv.actionType === 'packages_modal') {
            setIsTripPackagesModalOpen(true);
          } else if (srv.actionType === 'referral') {
            handleOpenReferralProgram();
          } else if (srv.actionType === 'partner_hub') {
            if (onOpenPartnerHub) onOpenPartnerHub(activeUserRole === 'admin' ? 'admin' : undefined);
          } else if (srv.actionType === 'admin') {
            if (onOpenAdmin) onOpenAdmin();
          } else if (srv.actionType === 'scroll_gallery') {
            const el = document.getElementById('gallery');
            el?.scrollIntoView({ behavior: 'smooth' });
          } else if (srv.actionType === 'auth') {
            setAuthMode('login');
            setIsAuthModalOpen(true);
          }
        }}
        onSelectGalleryItem={(item) => setLightboxItem(item)}
      />

      {/* Interactive Trip Packages Selector Modal */}
      <TripPackagesModal
        isOpen={isTripPackagesModalOpen}
        onClose={() => setIsTripPackagesModalOpen(false)}
        onSelectPackage={handleSelectTripPackage}
        onOpenDetail={handleOpenPackageDetail}
      />

      {/* Interactive Role & Category Authority Configuration Modal */}
      <RoleAuthorityModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        activeRole={activeUserRole}
        onSelectRole={handleSwitchRole}
      />

      {/* Luxury 3-Stage Sacred Package Reservation Modal (Cart -> Checkout -> Success) */}
      <PackageReservationModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        packageItem={selectedItem}
        onOpenDetail={handleOpenPackageDetail}
        onOpenHelpCenter={onOpenHelpCenter}
        currentUser={currentUser}
      />

      {/* Transaction Recall Notification Banner with Live Countdown Timer */}
      <TransactionRecallBanner
        onResumeReservation={(pkg) => setSelectedItem(pkg)}
        isModalOpen={Boolean(selectedItem) || Boolean(activePackageDetail)}
      />

      {/* Stripe Payment Gateway Modal */}
      {stripeModalItem && (
        <StripePaymentModal
          isOpen={Boolean(stripeModalItem)}
          onClose={() => setStripeModalItem(null)}
          item={stripeModalItem}
          dates={formatTripDates(checkInDate, checkOutDate)}
          guests={roomsGuests ? roomsGuests.replace('1 Room, ', '') : '2 Guests'}
          customerInfo={{
            name: bookingName || currentUser?.name || '',
            email: bookingEmail || currentUser?.email || '',
            phone: bookingPhone || currentUser?.phone || '',
          }}
          onPaymentSuccess={(receipt) => {
            setStripeModalItem(null);
            setSelectedItem(null);
            if (onOpenHelpCenter) {
              onOpenHelpCenter();
            }
          }}
        />
      )}

      {/* Video Virtual Tour Modal */}
      {isVideoModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="tp-modal-overlay" onClick={() => setIsVideoModalOpen(false)}>
          <div className="tp-video-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="tp-video-close" onClick={() => setIsVideoModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="tp-iframe-wrap">
              <iframe
                src="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1"
                title="Aviation Virtual Flight Experience"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="tp-modal-overlay" onClick={() => setIsFilterModalOpen(false)}>
          <div className="tp-modal-card tp-filter-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-header">
              <div className="tp-modal-header-text">
                <span className="tp-modal-tag">CUSTOMIZE BRIJ YATRA</span>
                <h3 className="tp-modal-title">Filter Brij Vibers Packages</h3>
              </div>
              <button
                className="tp-modal-close"
                onClick={() => setIsFilterModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tp-modal-body">
              <div className="tp-filter-group">
                <label className="tp-filter-label">
                  <span>Maximum Price per Person</span>
                  <strong className="tp-filter-val">
                    {(priceFilter / 1000).toFixed(priceFilter % 1000 === 0 ? 0 : 1)}k/-
                  </strong>
                </label>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(Number(e.target.value))}
                  className="tp-filter-range"
                />
                <div className="tp-range-labels">
                  <span>1k/-</span>
                  <span>7.5k/-</span>
                  <span>15k+/-</span>
                </div>
              </div>

              <div className="tp-filter-group">
                <label className="tp-filter-label">
                  <span>Minimum Rating</span>
                  <strong className="tp-filter-val">★ {minRatingFilter}</strong>
                </label>
                <div className="tp-rating-pill-group">
                  {[4.0, 4.5, 4.8, 4.9].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`tp-rating-pill ${minRatingFilter === rating ? 'active' : ''}`}
                      onClick={() => setMinRatingFilter(rating)}
                    >
                      ★ {rating}+
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="tp-btn-luxury-reserve"
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={() => setIsFilterModalOpen(false)}
              >
                <span>Apply Filters ({filteredDestinations.length} Results)</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 11. iOS STYLE LUXURY AUTH & PROFILE LOGIN MODAL */}
      {isAuthModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="tp-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
          <div className="tp-modal-card tp-auth-ios-card" onClick={(e) => e.stopPropagation()}>
            <div className="tp-auth-ios-header">
              <button
                className="tp-auth-ios-close-btn"
                onClick={() => setIsAuthModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="tp-auth-ios-body">
              {authMode === 'phone_prompt' ? (
                <div className="tp-auth-ios-intro-block tp-auth-prompt-intro">
                  <div className="tp-auth-prompt-avatar-wrapper">
                    <img
                      src={
                        (pendingGoogleUser?.avatar || currentUser?.avatar) ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(pendingGoogleUser?.name || currentUser?.name || 'User')}&background=0b0f19&color=ffffff&bold=true`
                      }
                      alt={pendingGoogleUser?.name || currentUser?.name || 'User avatar'}
                      className="tp-auth-prompt-avatar-lg"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pendingGoogleUser?.name || currentUser?.name || 'User')}&background=0b0f19&color=ffffff&bold=true`;
                      }}
                    />
                    <div className="tp-auth-prompt-google-badge" title="Google Verified">
                      <svg width="11" height="11" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                  </div>

                  <h2 className="tp-auth-ios-title" style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                    Welcome, {getDisplayName(pendingGoogleUser?.name || currentUser?.name)}
                  </h2>
                  <span className="tp-auth-prompt-email-badge">
                    {pendingGoogleUser?.email || currentUser?.email}
                  </span>

                  <p className="tp-auth-ios-subtitle" style={{ marginTop: '0.4rem' }}>
                    Please provide your mobile number to receive instant booking vouchers and live trip updates.
                  </p>
                </div>
              ) : authMode === 'signup' ? (
                <div className="tp-auth-ios-intro-block">
                  <div className="tp-auth-ios-icon-badge">
                    <Sparkles size={22} color="#1b3b18" />
                  </div>
                  <h2 className="tp-auth-ios-title">
                    {signupStep === 1 && 'Create Account'}
                    {signupStep === 2 && "What's Your Name?"}
                    {signupStep === 3 && 'Mobile & Contact'}
                  </h2>
                  <p className="tp-auth-ios-subtitle">
                    {signupStep === 1 && 'Step 1 of 3: Enter your login email & password'}
                    {signupStep === 2 && 'Step 2 of 3: Enter your full legal name for reservations'}
                    {signupStep === 3 && 'Step 3 of 3: Add your mobile number for live concierge sync'}
                  </p>
                  <div className="tp-auth-progress-bars">
                    <span className={`tp-auth-prog-seg ${signupStep >= 1 ? 'active' : ''}`} />
                    <span className={`tp-auth-prog-seg ${signupStep >= 2 ? 'active' : ''}`} />
                    <span className={`tp-auth-prog-seg ${signupStep >= 3 ? 'active' : ''}`} />
                  </div>
                </div>
              ) : (
                <div className="tp-auth-ios-intro-block">
                  <h2 className="tp-auth-ios-title">Login</h2>
                </div>
              )}

              {/* Dynamic Auth Form: Phone Prompt, Login, or 3-Step Registration */}
              {authMode === 'phone_prompt' ? (
                <form onSubmit={handlePhonePromptSubmit} className="tp-auth-ios-form">
                  <div className="tp-auth-pill-input-wrap">
                    <Phone size={17} className="tp-auth-pill-icon" />
                    <input
                      type="tel"
                      className="tp-auth-pill-input"
                      placeholder="10-digit Mobile (e.g. 9876543210)"
                      value={authPhoneInput}
                      onChange={(e) => setAuthPhoneInput(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  {authError && <div className="tp-auth-error-msg">{authError}</div>}
                  {authSuccessMsg && <div className="tp-auth-success-msg">✓ {authSuccessMsg}</div>}

                  <button type="submit" className="tp-btn-auth-primary-green">
                    <span>Complete Sign In ✓</span>
                  </button>

                  <button
                    type="button"
                    className="tp-auth-skip-btn"
                    onClick={handlePhonePromptSkip}
                  >
                    Skip for now
                  </button>
                </form>
              ) : authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="tp-auth-ios-form">
                  <div className="tp-auth-pill-input-wrap">
                    <Mail size={17} className="tp-auth-pill-icon" />
                    <input
                      type="email"
                      className="tp-auth-pill-input"
                      placeholder="Email"
                      value={authEmailInput}
                      onChange={(e) => setAuthEmailInput(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="tp-auth-pill-input-wrap">
                    <Lock size={17} className="tp-auth-pill-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="tp-auth-pill-input"
                      placeholder="Password"
                      value={authPasswordInput}
                      onChange={(e) => setAuthPasswordInput(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="tp-auth-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <MorphingIcon icon={showPassword ? "eyeOff" : "eye"} size={16} spring="bouncy" />
                    </button>
                  </div>

                  <div className="tp-auth-forgot-row">
                    <button
                      type="button"
                      className="tp-auth-forgot-link"
                      onClick={() => setAuthError('Password reset link sent to your email.')}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Optional Referral Code for Login */}
                  <div className="tp-auth-referral-toggle-row">
                    <button
                      type="button"
                      className="tp-auth-referral-toggle-btn"
                      onClick={() => setShowReferralField(!showReferralField)}
                    >
                      <Gift size={14} color="#ec4899" />
                      <span>{showReferralField ? 'Hide Referral Code' : 'Have a Referral / Invite Code?'}</span>
                      <span className="tp-auth-referral-bonus-badge">+500 Pts</span>
                    </button>
                  </div>

                  {showReferralField && (
                    <div className="tp-auth-pill-input-wrap tp-auth-pill-referral-wrap">
                      <Gift size={17} className="tp-auth-pill-icon" color="#ec4899" />
                      <input
                        type="text"
                        className="tp-auth-pill-input"
                        placeholder="Referral Code (e.g. VRINDA-ABC12)"
                        value={authReferralInput}
                        onChange={(e) => setAuthReferralInput(e.target.value.toUpperCase())}
                      />
                    </div>
                  )}

                  {authError && <div className="tp-auth-error-msg">{authError}</div>}
                  {authSuccessMsg && <div className="tp-auth-success-msg">✓ {authSuccessMsg}</div>}

                  <button type="submit" className="tp-btn-auth-primary-green">
                    <span>Login</span>
                  </button>
                </form>
              ) : (
                /* 3-STEP SIGN UP FORMS */
                <div className="tp-auth-step-container">
                  {/* STEP 1: EMAIL & PASSWORD */}
                  {signupStep === 1 && (
                    <form onSubmit={handleStep1Next} className="tp-auth-ios-form">
                      <div className="tp-auth-pill-input-wrap">
                        <Mail size={17} className="tp-auth-pill-icon" />
                        <input
                          type="email"
                          className="tp-auth-pill-input"
                          placeholder="Email"
                          value={authEmailInput}
                          onChange={(e) => setAuthEmailInput(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      <div className="tp-auth-pill-input-wrap">
                        <Lock size={17} className="tp-auth-pill-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="tp-auth-pill-input"
                          placeholder="Create Password"
                          value={authPasswordInput}
                          onChange={(e) => setAuthPasswordInput(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="tp-auth-eye-btn"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          <MorphingIcon icon={showPassword ? "eyeOff" : "eye"} size={16} spring="bouncy" />
                        </button>
                      </div>

                      {/* Optional Referral Code for Sign Up Step 1 */}
                      <div className="tp-auth-referral-toggle-row">
                        <button
                          type="button"
                          className="tp-auth-referral-toggle-btn"
                          onClick={() => setShowReferralField(!showReferralField)}
                        >
                          <Gift size={14} color="#ec4899" />
                          <span>{showReferralField ? 'Hide Referral Code' : 'Have a Referral / Invite Code?'}</span>
                          <span className="tp-auth-referral-bonus-badge">+500 Pts</span>
                        </button>
                      </div>

                      {showReferralField && (
                        <div className="tp-auth-pill-input-wrap tp-auth-pill-referral-wrap">
                          <Gift size={17} className="tp-auth-pill-icon" color="#ec4899" />
                          <input
                            type="text"
                            className="tp-auth-pill-input"
                            placeholder="Referral Code (e.g. VRINDA-ABC12)"
                            value={authReferralInput}
                            onChange={(e) => setAuthReferralInput(e.target.value.toUpperCase())}
                          />
                        </div>
                      )}

                      {authError && <div className="tp-auth-error-msg">{authError}</div>}

                      <button type="submit" className="tp-btn-auth-primary-green">
                        <span>Continue to Step 2 →</span>
                      </button>
                    </form>
                  )}

                  {/* STEP 2: USER FULL LEGAL NAME */}
                  {signupStep === 2 && (
                    <form onSubmit={handleStep2Next} className="tp-auth-ios-form">
                      <div className="tp-auth-pill-input-wrap">
                        <User size={17} className="tp-auth-pill-icon" />
                        <input
                          type="text"
                          className="tp-auth-pill-input"
                          placeholder="Full Legal Name"
                          value={authNameInput}
                          onChange={(e) => setAuthNameInput(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      {authError && <div className="tp-auth-error-msg">{authError}</div>}

                      <div className="tp-auth-step-btn-row">
                        <button
                          type="button"
                          className="tp-btn-auth-back"
                          onClick={() => {
                            setAuthError('');
                            setSignupStep(1);
                          }}
                        >
                          ← Back
                        </button>
                        <button type="submit" className="tp-btn-auth-primary-green">
                          <span>Next: Phone Number →</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: WHATSAPP / PHONE NUMBER */}
                  {signupStep === 3 && (
                    <form onSubmit={handleStep3Submit} className="tp-auth-ios-form">
                      <div className="tp-auth-pill-input-wrap">
                        <Phone size={17} className="tp-auth-pill-icon" />
                        <input
                          type="tel"
                          className="tp-auth-pill-input"
                          placeholder="10-digit Mobile (e.g. 9876543210)"
                          value={authPhoneInput}
                          onChange={(e) => setAuthPhoneInput(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>

                      {authError && <div className="tp-auth-error-msg">{authError}</div>}
                      {authSuccessMsg && <div className="tp-auth-success-msg">✓ {authSuccessMsg}</div>}

                      <div className="tp-auth-step-btn-row">
                        <button
                          type="button"
                          className="tp-btn-auth-back"
                          onClick={() => {
                            setAuthError('');
                            setSignupStep(2);
                          }}
                        >
                          ← Back
                        </button>
                        <button type="submit" className="tp-btn-auth-primary-green">
                          <span>Complete Registration ✓</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Show OAuth & Guest on Step 1 and Login only */}
              {authMode !== 'phone_prompt' && (authMode === 'login' || (authMode === 'signup' && signupStep === 1)) && (
                <>
                  <div className="tp-auth-ios-divider">
                    <span>or</span>
                  </div>

                  <div className="tp-auth-social-stack">
                    <button
                      type="button"
                      className="tp-btn-ios-pill tp-btn-ios-google"
                      onClick={handleGoogleAuth}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" className="tp-oauth-icon">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>

                    <button
                      type="button"
                      className="tp-btn-ios-pill tp-btn-ios-apple"
                      onClick={handleAppleAuth}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="tp-oauth-icon">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.64 1.35-.56.65-1.05 1.72-.92 2.74 1.01.08 2.03-.49 2.63-1.24" />
                      </svg>
                      <span>Continue with Apple</span>
                    </button>

                    <button
                      type="button"
                      className="tp-btn-ios-pill tp-btn-ios-guest"
                      onClick={handleGuestAuth}
                    >
                      <UserCheck size={18} className="tp-oauth-icon" />
                      <span>Continue As Guest</span>
                    </button>
                  </div>
                </>
              )}

              {/* Bottom Switch Row */}
              {authMode !== 'phone_prompt' && (
                <div className="tp-auth-ios-footer">
                  {authMode === 'login' ? (
                    <p className="tp-auth-ios-switch-text">
                      Need an account?{' '}
                      <strong
                        onClick={() => {
                          setAuthError('');
                          setAuthSuccessMsg('');
                          setAuthMode('signup');
                          setSignupStep(1);
                        }}
                      >
                        Sign up
                      </strong>
                    </p>
                  ) : (
                    <p className="tp-auth-ios-switch-text">
                      Already have an account?{' '}
                      <strong
                        onClick={() => {
                          setAuthError('');
                          setAuthSuccessMsg('');
                          setAuthMode('login');
                        }}
                      >
                        Log in
                      </strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 12. VRINDA VIHAR MASTER CARD LIGHTBOX (MATCHING REFERENCE UI) */}
      {lightboxItem && typeof document !== 'undefined' && createPortal(
        <div
          className="tp-lightbox-overlay"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
        >
          <div className="tp-lightbox-card-wrapper" onClick={(e) => e.stopPropagation()}>
            {/* Master White Studio Card (Exact San Francisco Reference Card UI) */}
            <div className="tp-master-card-container">
              {/* 1. Inset Picture Container with Soft Rounded Corners */}
              <div className="tp-master-card-img-frame">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.title}
                  className="tp-master-card-img"
                />

                {/* Floating Top Header Badges on Image */}
                <div className="tp-master-card-top-row">
                  <span className="tp-master-count-pill">
                    {filteredGalleryItems.findIndex((i) => i.id === lightboxItem.id) + 1} / {filteredGalleryItems.length}
                  </span>

                  <button
                    type="button"
                    className="tp-master-glass-btn tp-master-close-btn"
                    onClick={() => setLightboxItem(null)}
                    title="Close (Esc)"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* 2. Content Section Below Picture on Clean White Card */}
              <div className="tp-master-card-body">
                <h2 className="tp-master-card-title">{lightboxItem.title}</h2>
                <p className="tp-master-card-category">{lightboxItem.category}</p>

                <div className="tp-master-meta-tags">
                  <span className="tp-master-meta-tag">
                    <Tag size={13} className="tp-master-meta-icon" />
                    <span>from <strong>{lightboxItem.price || '₹1,200'}</strong></span>
                  </span>
                  <span className="tp-master-meta-tag">
                    <MapPin size={13} className="tp-master-meta-icon" />
                    <span>{lightboxItem.location}</span>
                  </span>
                </div>

                <div className="tp-master-cta-row">
                  <button
                    type="button"
                    className="tp-btn-master-primary"
                    onClick={() => {
                      const itemToBook = {
                        ...popularPlaces[0],
                        title: lightboxItem.title,
                        location: lightboxItem.location,
                        image: lightboxItem.image,
                        description: lightboxItem.description,
                        category: lightboxItem.category
                      };
                      setLightboxItem(null);
                      setSelectedItem(itemToBook);
                    }}
                  >
                    <Calendar size={16} />
                    <span>Book Darshan Yatra</span>
                  </button>

                  <button
                    type="button"
                    className="tp-btn-master-icon"
                    onClick={() => {
                      shareWebPPicture({
                        imageUrl: lightboxItem.image,
                        title: `${lightboxItem.title} — Vrinda Vihar`,
                        text: `Divine Darshan: ${lightboxItem.title} in ${lightboxItem.location} (${lightboxItem.category}). Explore sacred Brij Dhams on Vrinda Vihar.`,
                        url: `https://to.vrindopnishad.in/#gallery`,
                        filename: `${lightboxItem.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.webp`,
                        onSuccess: () => {
                          setFloatingToast({
                            id: `share_${lightboxItem.id}_${Date.now()}`,
                            icon: <Sparkles size={18} color="#10b981" />,
                            highlight: true,
                            title: 'Picture Shared in WebP',
                            desc: 'High-quality, ultra-lightweight WebP image prepared for sharing.',
                            ctaText: 'View Gallery',
                            onCta: () => setFloatingToast(null)
                          });
                        }
                      });
                    }}
                    title="Share WebP Picture"
                    aria-label="Share WebP Picture"
                  >
                    <Share2 size={18} />
                  </button>

                  <button
                    type="button"
                    className={`tp-btn-master-icon ${safeFavoriteIds.includes(lightboxItem.id) ? 'is-favorited' : ''}`}
                    onClick={() => toggleFavorite(lightboxItem.id, lightboxItem.title)}
                    title={safeFavoriteIds.includes(lightboxItem.id) ? "Remove from Favourites" : "Save to Favourites"}
                    aria-label={safeFavoriteIds.includes(lightboxItem.id) ? "Remove from Favourites" : "Save to Favourites"}
                  >
                    <Heart
                      size={18}
                      fill={safeFavoriteIds.includes(lightboxItem.id) ? '#ef4444' : 'none'}
                      color={safeFavoriteIds.includes(lightboxItem.id) ? '#ef4444' : 'currentColor'}
                      className={safeFavoriteIds.includes(lightboxItem.id) ? 'tp-heart-pop' : ''}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Pilgrim Referral & Category Direct Share Modal */}
      {isReferralModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="tp-auth-modal-overlay" onClick={() => setIsReferralModalOpen(false)}>
          <div
            className="tp-auth-modal-card"
            style={{ maxWidth: '490px', width: '94%' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="referral-modal-title"
          >
            <div className="tp-auth-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fdf2f8', border: '1px solid #fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={20} color="#ec4899" />
                </div>
                <div>
                  <h3 id="referral-modal-title" className="tp-auth-modal-title" style={{ fontSize: '1.08rem', margin: 0 }}>
                    Referral &amp; Direct Share Engine
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800 }}>Earn 500 Brij Points • 0% Commission Partners</span>
                </div>
              </div>
              <button
                type="button"
                className="tp-auth-modal-close-btn"
                onClick={() => setIsReferralModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {!currentUser ? (
              <div className="tp-auth-modal-body" style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fdf2f8', border: '1.5px solid #fbcfe8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <Gift size={26} color="#ec4899" />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  Register to Unlock Your Direct Referral Code
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.3rem 0' }}>
                  Create your free pilgrim profile in 30 seconds to generate your personal invite links for Drivers, Hotels, Dining &amp; Devotees and earn <strong>500 Brij Reward Points</strong> per referral!
                </p>
                <button
                  type="button"
                  className="tp-btn-auth-primary-green"
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                  onClick={() => {
                    setIsReferralModalOpen(false);
                    setIsAuthModalOpen(true);
                    setAuthMode('signup');
                    setSignupStep(1);
                  }}
                >
                  <span>Sign In / Create Free Account →</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReferralModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Maybe Later
                </button>
              </div>
            ) : (() => {
              const myRefCode = currentUser.referralCode || `VRINDA-${(currentUser.uid || currentUser.id || currentUser.email || 'DEVOTE').replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase()}`;
              const activeCategoryConfig = REFERRAL_CATEGORIES.find(c => c.id === selectedRefCategory) || REFERRAL_CATEGORIES[0];
              const activeLink = activeCategoryConfig.getLink(myRefCode);
              const activeMsg = activeCategoryConfig.whatsappMsg(myRefCode);

              const handleCopyCategoryLink = (cat) => {
                const link = cat.getLink(myRefCode);
                navigator.clipboard?.writeText(link);
                setCopiedRefTarget(cat.id);
                setFloatingToast({
                  id: `copy_link_${Date.now()}`,
                  icon: <AnimatedIcon name="checkmark" size={17} strokeColor="#10b981" speed={1.2} />,
                  highlight: true,
                  title: 'Invite Link Copied',
                  desc: 'Share with friends & earn 500 Pts'
                });
                setTimeout(() => setCopiedRefTarget(''), 2200);
              };

              const handleDeviceShare = async () => {
                await shareLinkWithFallback({
                  title: activeCategoryConfig.title,
                  text: activeMsg,
                  url: activeLink
                });
                setCopiedRefTarget(activeCategoryConfig.id);
                setFloatingToast({
                  id: `share_link_${Date.now()}`,
                  icon: <AnimatedIcon name="checkmark" size={17} strokeColor="#10b981" speed={1.2} />,
                  highlight: true,
                  title: 'Invite Link Shared',
                  desc: null
                });
                setTimeout(() => setCopiedRefTarget(''), 2200);
              };

              return (
                <div className="tp-auth-modal-body" style={{ marginTop: '0.8rem' }}>
                  <div style={{ background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '0.8rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                        Your Referral Code
                      </span>
                      <span style={{ fontSize: '1.12rem', fontWeight: 900, color: '#0f172a', letterSpacing: '0.06em' }}>
                        {myRefCode}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(myRefCode);
                          setCopiedRefTarget('CODE');
                          setFloatingToast({
                            id: `copy_code_${Date.now()}`,
                            icon: <AnimatedIcon name="checkmark" size={17} strokeColor="#10b981" speed={1.2} />,
                            highlight: true,
                            title: 'Referral Code Copied',
                            desc: myRefCode
                          });
                          setTimeout(() => setCopiedRefTarget(''), 2200);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '5px 9px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#334155'
                        }}
                      >
                        <MorphingIcon icon={copiedRefTarget === 'CODE' ? "check" : "copy"} size={12} color={copiedRefTarget === 'CODE' ? '#10b981' : 'currentColor'} spring="bouncy" />
                        <span>{copiedRefTarget === 'CODE' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Selector Tabs */}
                  <div className="tp-ref-category-tabs">
                    {REFERRAL_CATEGORIES.map(cat => {
                      const isSel = selectedRefCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`tp-ref-tab-btn ${isSel ? 'active' : ''}`}
                          onClick={() => setSelectedRefCategory(cat.id)}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Selected Category Card */}
                  <div className="tp-ref-preview-card">
                    <div className="tp-ref-preview-header">
                      <span className="tp-ref-target-badge">{activeCategoryConfig.targetBadge}</span>
                      <h4 className="tp-ref-target-title">{activeCategoryConfig.title}</h4>
                      <p className="tp-ref-target-desc">{activeCategoryConfig.desc}</p>
                    </div>

                    <div className="tp-ref-link-box">
                      <input
                        type="text"
                        readOnly
                        value={activeLink}
                        className="tp-ref-link-input"
                      />
                      <button
                        type="button"
                        className="tp-ref-copy-btn"
                        onClick={() => handleCopyCategoryLink(activeCategoryConfig)}
                      >
                        <MorphingIcon icon={copiedRefTarget === activeCategoryConfig.id ? "check" : "copy"} size={14} color={copiedRefTarget === activeCategoryConfig.id ? '#10b981' : 'currentColor'} spring="bouncy" />
                        <span>{copiedRefTarget === activeCategoryConfig.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="tp-ref-actions-row">
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeMsg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tp-ref-action-btn-whatsapp"
                      >
                        <Send size={14} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Toggle: View All Category Direct Links */}
                  <div className="tp-ref-direct-list-wrap">
                    <div className="tp-ref-direct-list-title">
                      <span>Direct Links for All Categories</span>
                    </div>

                    <div className="tp-ref-direct-list">
                      {REFERRAL_CATEGORIES.map(cat => {
                        const link = cat.getLink(myRefCode);
                        const isCopied = copiedRefTarget === cat.id;
                        return (
                          <div key={cat.id} className="tp-ref-direct-item">
                            <div className="tp-ref-direct-item-left">
                              <span className="tp-ref-direct-icon">{cat.icon}</span>
                              <div className="tp-ref-direct-info">
                                <strong>{cat.title}</strong>
                                <small>{link}</small>
                              </div>
                            </div>
                            <div className="tp-ref-direct-actions">
                              <button
                                type="button"
                                className="tp-ref-mini-btn"
                                onClick={() => handleCopyCategoryLink(cat)}
                                title="Copy Link"
                              >
                                <MorphingIcon icon={isCopied ? "check" : "copy"} size={13} color={isCopied ? '#10b981' : 'currentColor'} spring="bouncy" />
                              </button>
                              <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(cat.whatsappMsg(myRefCode))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tp-ref-mini-btn whatsapp"
                                title="Share on WhatsApp"
                              >
                                <Send size={13} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReferralModalOpen(false)}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      marginTop: '0.8rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              );
            })()}
          </div>
        </div>,
        document.body
      )}

      {/* Floating Dynamic Island Morphing Luxury Capsule (Information Only) */}
      {floatingToast && (floatingToast.title || floatingToast.message || floatingToast.desc) && !isAnyModalActive && typeof document !== 'undefined' && createPortal(
        <aside
          key={floatingToast.id || 'apple_dynamic_island'}
          className={`tp-dynamic-island tp-floating-toast ${floatingToast.roleKey ? `role-${floatingToast.roleKey}` : ''} stage-${toastStage}`}
          role="status"
          aria-live="polite"
          onMouseEnter={handleToastMouseEnter}
          onMouseLeave={handleToastMouseLeave}
          onTouchStart={handleToastTouchStart}
          onTouchEnd={handleToastTouchEnd}
          onClick={dismissFloatingToast}
        >
          {/* Dynamic Glowing Glyph */}
          <div className={`tp-island-glyph-wrap tp-toast-icon-wrap ${floatingToast.highlight ? 'highlight' : ''}`}>
            {floatingToast.icon || <Sparkles size={16} color="#10b981" />}
          </div>

          {/* Dynamic Island Single-Line Text */}
          <div className="tp-island-content tp-toast-body">
            <span className="tp-island-title tp-toast-title">{floatingToast.title || floatingToast.message}</span>
            {floatingToast.desc && (
              <>
                <span className="tp-island-dot">•</span>
                <span className="tp-island-sub tp-toast-desc">{floatingToast.desc}</span>
              </>
            )}
          </div>
        </aside>,
        document.body
      )}

      {/* Floating Vrinda Vihar Help Centre Live Widget Launcher (Hidden while toast or modal is active) */}
      {!floatingToast && !isAnyModalActive && typeof document !== 'undefined' && createPortal(
        <button
          type="button"
          className="hc-floating-launcher"
          onClick={() => {
            if (onOpenHelpCenter) onOpenHelpCenter();
          }}
          title="Chat with Vrinda Vihar Help Centre"
          aria-label="Open Help Centre"
        >
          <span className="hc-launcher-indicator" />
          <Headphones size={16} />
          <span className="hc-launcher-label">Help Centre</span>
        </button>,
        document.body
      )}

      {/* Persistent Live Ride Floating Activity Pill (Apple Dynamic Island Capsule) */}
      {persistedRide && (persistedRide.status === 'searching' || persistedRide.status === 'requested' || persistedRide.status === 'accepted' || persistedRide.status === 'driver_arrived' || persistedRide.status === 'in_progress') && !isInstantRideModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className={`vt-floating-live-ride-pill ${isCapsuleDocked ? 'docked-top' : ''} ${persistedRide.status === 'searching' || persistedRide.status === 'requested' ? 'status-amber' : 'status-emerald'}`}
          onClick={() => {
            if (persistedRide.destName) {
              setRideDestination({ name: persistedRide.destName, lat: persistedRide.destLat, lng: persistedRide.destLng });
            }
            setIsInstantRideModalOpen(true);
          }}
          title="Tap to view live ride status"
          role="button"
          tabIndex={0}
        >
          <div className="vt-flr-info">
            <span className={`vt-flr-title ${persistedRide.status === 'searching' || persistedRide.status === 'requested' ? 'shimmering' : ''}`}>
              {persistedRide.status === 'searching' || persistedRide.status === 'requested'
                ? 'Finding Sarathi'
                : persistedRide.status === 'driver_arrived'
                  ? 'Sarathi Arrived'
                  : 'Sarathi on the way'}
            </span>
            {persistedRide.status === 'driver_arrived' ? (
              <>
                <span className="vt-flr-dot-sep">•</span>
                <span className="vt-flr-pin-badge">PIN {persistedRide.safetyPin || '9653'}</span>
              </>
            ) : persistedRide.destName ? (
              <>
                <span className="vt-flr-dot-sep">•</span>
                <span className="vt-flr-sub">
                  {persistedRide.destName.replace(/^Shri\s+/i, '').replace(/\s+(Mandir|Temple|Ashram|Dham|Bhojnalaya)$/i, '').trim()}
                </span>
              </>
            ) : null}
          </div>
          <div className="vt-flr-trailing">
            <div className={`vt-flr-wave-bars ${persistedRide.status === 'searching' || persistedRide.status === 'requested' ? 'amber' : 'emerald'}`} title="Live Active">
              <span className="vt-flr-wave-bar" />
              <span className="vt-flr-wave-bar" />
              <span className="vt-flr-wave-bar" />
            </div>
            <ChevronRight size={13} strokeWidth={2.4} className="vt-flr-chevron" />
          </div>
        </div>,
        document.body
      )}

      {/* UBER-GRADE INSTANT RIDE BOOKING MODAL */}
      {isInstantRideModalOpen && (
        <InstantRideModal
          destination={rideDestination}
          onSelectDestination={setRideDestination}
          userPosition={position}
          drivers={drivers}
          activeRide={activeRide}
          onRequestRide={async (driver, extraDetails = {}) => {
            try {
              const rideData = {
                pickupLat: extraDetails.pickupLat || position?.lat || 27.646,
                pickupLng: extraDetails.pickupLng || position?.lng || 77.377,
                pickupName: extraDetails.pickupName || (position ? 'Your Current GPS Location' : 'Braj Mandal Center'),
                destName: extraDetails.destName || rideDestination?.name || 'Shri Bankey Bihari Mandir',
                destLat: extraDetails.destLat || rideDestination?.lat || 27.580456,
                destLng: extraDetails.destLng || rideDestination?.lng || 77.701103,
                status: 'requested',
                tier: extraDetails.tier || 'erickshaw',
                fare: extraDetails.fare || 40,
                paymentMethod: extraDetails.paymentMethod || 'cash_upi',
                safetyPin: extraDetails.safetyPin || '4821',
                distanceKm: extraDetails.distanceKm || 1.2,
                timestamp: Date.now()
              };
              if (driver?.id && driver.id !== 'drv_demo_vrinda') {
                await updateDoc(doc(firestore, 'drivers', driver.id), { currentRide: rideData });
              }
              setActiveRide({ driver, status: 'requested', rideData });
            } catch (err) {
              console.warn('Ride request error:', err);
              setActiveRide({ driver, status: 'requested' });
            }
          }}
          onCancelRide={async () => {
            if (activeRide?.driver?.id && activeRide.driver.id !== 'drv_demo_vrinda') {
              try {
                await updateDoc(doc(firestore, 'drivers', activeRide.driver.id), { currentRide: deleteField() });
              } catch (err) { }
            }
            setActiveRide(null);
            setIsInstantRideModalOpen(false);
          }}
          onClose={() => {
            setIsInstantRideModalOpen(false);
            if (activeRide?.status === 'completed') {
              setActiveRide(null);
            }
          }}
        />
      )}

      {/* Modern Floating Cookie Consent Bar */}
      <CookieConsentBar />
    </div>
  );
}
