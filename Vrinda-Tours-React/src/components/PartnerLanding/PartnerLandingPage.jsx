import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass, Calendar, Users, MapPin, Search, Star,
  ArrowRight, ArrowLeft, ArrowUpRight, CheckCircle2, Play, SlidersHorizontal,
  X, Menu, Plane, Building2, Bus, Car, Mail, Send, ChevronRight, ChevronDown,
  Sparkles, ShieldCheck, Heart, Share2, Phone, Twitter, Facebook, Instagram, Youtube, Github, Globe,
  CreditCard, LayoutGrid, Ticket, Leaf, Sprout, Waves, Linkedin,
  LogIn, LogOut, User, Lock, UserCheck, Eye, EyeOff,
  Maximize2, ZoomIn, Image as ImageIcon, ExternalLink, Tag, Gift
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
  missionData,
  initiativesData,
  footerNavigation,
  exploreDestinations,
  topDestinationTabs,
  topDestinationsByTab,
  bookingTabs,
  vrindaViharGalleryCategories,
  vrindaViharGalleryData,
  getCachedData,
  setCachedData
} from '../../data/landingData';
import { supabase } from '../../config/supabase';
import { shareWebPPicture, getOptimizedWebPUrl } from '../../utils/imageOptimizer';
import { validatePhoneNumber } from '../../utils/phoneValidator';
import { syncPilgrimToSupabase, getPilgrimReferralStats } from '../../services/referralService';
import './PartnerLandingPage.css';

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

export default function PartnerLandingPage({ onClose, onOpenPartnerHub }) {
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

  // Vrinda Vihar Divine Darshan Gallery State
  const [galleryCategory, setGalleryCategory] = useState(() => getCachedData('gallery_cat', 'All Darshans'));
  const [gallerySearch, setGallerySearch] = useState('');
  const [lightboxItem, setLightboxItem] = useState(null);

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
  const [activePopularCardId, setActivePopularCardId] = useState(null);
  const [activeGalleryCardId, setActiveGalleryCardId] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  const [floatingToast, setFloatingToast] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
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
        title: '✨ Sign In to Access Referral Rewards',
        desc: 'Please register your free pilgrim profile to generate your unique invite code and earn 500 Brij Reward Points!',
        ctaText: 'Sign In / Register',
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
          title: '🎁 Pilgrim Invite Applied!',
          desc: `Welcome! Referred with code ${cleanRef}. 500 Brij Points unlocked on registration.`,
          ctaText: 'Sign In / Register',
          onCta: () => {
            setIsAuthModalOpen(true);
            setAuthMode('signup');
            setSignupStep(1);
            setFloatingToast(null);
          }
        });
      }
    } catch { }
  }, []);

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Saved / Favorited Yatras & Sacred Darshans
  const [favoriteIds, setFavoriteIds] = useState(() => getCachedData('traveler_favorites', []));

  const toggleFavorite = (itemId, itemTitle) => {
    if (!itemId) return;
    setFavoriteIds((prev) => {
      const isFav = prev.includes(itemId);
      const updated = isFav ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      setCachedData('traveler_favorites', updated);

      setFloatingToast({
        id: `fav_${itemId}_${Date.now()}`,
        icon: <Heart size={18} fill={isFav ? 'none' : '#ef4444'} color="#ef4444" />,
        highlight: !isFav,
        title: isFav ? 'Removed from Favourites' : 'Added to Favourites',
        desc: isFav
          ? `Removed from your saved list.`
          : `Saved to your favourites.`,
        ctaText: isFav ? 'Undo' : 'View All',
        onCta: () => {
          if (isFav) {
            setFavoriteIds((current) => {
              const reAdded = [...current, itemId];
              setCachedData('traveler_favorites', reAdded);
              return reAdded;
            });
          } else {
            const el = document.getElementById('gallery') || document.getElementById('popular');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
          setFloatingToast(null);
        }
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
    return {
      uid: u.id,
      name,
      email,
      phone: existingPhone,
      avatar,
      initials,
      authProvider: u.app_metadata?.provider || 'password',
      memberId: `VRD-${u.id.slice(0, 5).toUpperCase()}`,
      isAnonymous: false
    };
  };

  // Sync Supabase Auth state changes in real-time
  useEffect(() => {
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

  // Proactive registration & complete profile toast notification
  useEffect(() => {
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('vrinda_toast_dismissed');
      if (dismissed) return;

      if (!currentUser) {
        setFloatingToast({
          id: 'register_prompt',
          icon: <Sparkles size={18} />,
          highlight: true,
          title: 'Unlock 15% Member Discount',
          desc: 'Sign in or register your profile for instant booking vouchers & live GPS navigation.',
          ctaText: 'Register',
          onCta: () => {
            setAuthMode('signup');
            setSignupStep(1);
            setIsAuthModalOpen(true);
            setFloatingToast(null);
          }
        });
      } else if (!currentUser.phone) {
        setFloatingToast({
          id: 'phone_prompt',
          icon: <Phone size={18} />,
          highlight: true,
          title: 'Complete Your Profile',
          desc: 'Add your WhatsApp number to receive booking confirmations & driver arrival alerts.',
          ctaText: 'Add Phone Number',
          onCta: () => {
            setPendingGoogleUser(currentUser);
            setAuthPhoneInput(currentUser.phone || '');
            setAuthMode('phone_prompt');
            setIsAuthModalOpen(true);
            setFloatingToast(null);
          }
        });
      } else if (currentUser.isAnonymous) {
        setFloatingToast({
          id: 'guest_prompt',
          icon: <UserCheck size={18} />,
          highlight: false,
          title: 'Register Full Profile',
          desc: 'You are browsing as Guest. Register to sync bookings and get pilgrim discounts.',
          ctaText: 'Register Now',
          onCta: () => {
            setAuthMode('signup');
            setSignupStep(1);
            setIsAuthModalOpen(true);
            setFloatingToast(null);
          }
        });
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [currentUser]);

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

      setAuthSuccessMsg(refCodeEntered ? '🎉 Registration complete! +500 Brij Reward Points added.' : 'Account created & signed in successfully!');
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
    const guestUser = {
      uid: guestId,
      name: 'Guest Traveler',
      email: '',
      phone: '',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0b0f19&textColor=ffffff`,
      initials: 'GT',
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

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const finalName = bookingName || currentUser?.name || 'Guest Traveler';
    const finalEmail = bookingEmail || currentUser?.email || 'Not provided';
    const finalPhone = bookingPhone || currentUser?.phone || '';

    if (finalPhone) {
      const validation = validatePhoneNumber(finalPhone);
      if (!validation.isValid) {
        setFloatingToast({
          id: `err_${Date.now()}`,
          title: 'Invalid Phone Number',
          desc: validation.message,
          highlight: true
        });
        setTimeout(() => setFloatingToast(null), 4000);
        return;
      }
    } else {
      setFloatingToast({
        id: `err_${Date.now()}`,
        title: 'Phone Required',
        desc: 'Please enter your 10-digit mobile number for booking confirmation.',
        highlight: true
      });
      setTimeout(() => setFloatingToast(null), 4000);
      return;
    }

    setBookingSuccess(true);
    setTimeout(() => {
      const message = encodeURIComponent(
        `Hello! I would like to confirm booking for *${selectedItem?.title || destination}*.\nGuest: ${finalName}\nEmail: ${finalEmail}\nPhone: ${finalPhone}\nDates: ${checkInDate} to ${checkOutDate}\nParty: ${roomsGuests}`
      );
      window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
      setSelectedItem(null);
      setBookingSuccess(false);
      if (!currentUser) {
        setBookingName('');
        setBookingEmail('');
        setBookingPhone('');
      }
    }, 1200);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setCachedData('newsletter_email', newsletterEmail);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2500);
  };

  return (
    <div className="tp-page-wrapper">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="tp-navbar">
        <div className="tp-nav-container">
          {/* Logo */}
          <div className="tp-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="tp-logo-mark-modern">
              <div className="tp-logo-outer-ring">
                <div className="tp-logo-inner-dot" />
              </div>
            </div>
            <span className="tp-logo-text-black">Vrinda.</span>
          </div>

          {/* Navigation Links */}
          <nav className="tp-nav-menu">
            <a href="#about" className="tp-nav-item">About</a>
            <a href="#popular" className="tp-nav-item">Tours</a>
            <a href="#explore" className="tp-nav-item">Packages</a>
            <a href="#gallery" className="tp-nav-item">Divine Darshan</a>
            <a href="#initiatives" className="tp-nav-item">Journal</a>
            <a href="#contact" className="tp-nav-item">Contact</a>
          </nav>

          {/* Action CTAs */}
          <div className="tp-nav-actions">
            {/* User Profile / Auth Action (Desktop) */}
            {currentUser ? (
              <div className="tp-nav-user-wrapper tp-desktop-auth" ref={profileMenuRef}>
                <button
                  type="button"
                  className={`tp-nav-user-pill ${isProfileMenuOpen ? 'active' : ''}`}
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  title="Account Profile & Settings"
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
                  <ChevronDown size={14} className={`tp-nav-user-chevron ${isProfileMenuOpen ? 'open' : ''}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="tp-profile-dropdown">
                    <div className="tp-profile-dropdown-header">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="tp-profile-dropdown-avatar"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=0b0f19&color=ffffff&bold=true`;
                        }}
                      />
                      <div className="tp-profile-dropdown-user-info">
                        <h4 className="tp-profile-dropdown-name">{currentUser.name}</h4>
                        <p className="tp-profile-dropdown-email">{currentUser.email || 'Guest Traveler'}</p>
                        <span className="tp-profile-dropdown-badge">
                          <Sparkles size={10} /> {currentUser.authProvider === 'google' ? 'Google Account' : currentUser.isAnonymous ? 'Guest Pass' : 'Verified Member'}
                        </span>
                      </div>
                    </div>

                    {/* Incomplete Registration Banner or Verified Status */}
                    {!currentUser.phone ? (
                      <div className="tp-profile-incomplete-card">
                        <div className="tp-profile-incomplete-header">
                          <span className="tp-incomplete-badge">⚠️ Action Required</span>
                          <span className="tp-incomplete-pct">60%</span>
                        </div>
                        <div className="tp-profile-progress-bar">
                          <div className="tp-profile-progress-fill" style={{ width: '60%' }} />
                        </div>
                        <p className="tp-profile-incomplete-desc">
                          Add WhatsApp for live GPS & booking vouchers.
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
                          <span>Add WhatsApp for Live GPS</span>
                        </button>
                      </div>
                    ) : currentUser.isAnonymous ? (
                      <div className="tp-profile-incomplete-card">
                        <div className="tp-profile-incomplete-header">
                          <span className="tp-incomplete-badge">⚠️ Guest Mode</span>
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
                        <div className="tp-profile-verified-pill">
                          <CheckCircle2 size={13} color="#059669" />
                          <span>100% Complete • Verified Member</span>
                        </div>
                      </div>
                    )}

                    <div className="tp-profile-dropdown-divider" />

                    <div className="tp-profile-dropdown-menu">
                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          const el = document.getElementById('gallery') || document.getElementById('popular');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Heart size={15} fill={favoriteIds.length > 0 ? '#ef4444' : 'none'} color={favoriteIds.length > 0 ? '#ef4444' : 'currentColor'} />
                        <span>Saved Favourites ({favoriteIds.length})</span>
                      </button>

                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setSelectedItem(popularPlaces[0]);
                        }}
                      >
                        <Compass size={15} />
                        <span>Book A Tour / Stay</span>
                      </button>

                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleOpenReferralProgram();
                        }}
                      >
                        <Gift size={15} color="#ec4899" />
                        <span>Refer Pilgrims & Earn 500 Pts</span>
                      </button>

                      <button
                        type="button"
                        className="tp-profile-dropdown-item"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (onOpenPartnerHub) onOpenPartnerHub();
                        }}
                      >
                        <Building2 size={15} />
                        <span>Partner & Driver Hub</span>
                      </button>
                    </div>

                    <div className="tp-profile-dropdown-divider" />

                    <div className="tp-profile-dropdown-footer">
                      <button
                        type="button"
                        className="tp-profile-dropdown-logout-btn"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut size={15} />
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

            {/* Book Trip Button */}
            <button
              className="tp-btn-dark-pill"
              onClick={() => {
                setSelectedItem(popularPlaces[0]);
              }}
            >
              Book Trip
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

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              className={`tp-hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN NAVIGATION DRAWER (Vrindopnishad Design) */}
      {isMobileMenuOpen && (
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
                      <span className="tp-mobile-profile-badge">
                        <Sparkles size={11} /> {currentUser.authProvider === 'google' ? 'Google Account' : currentUser.isAnonymous ? 'Guest Pass' : 'Verified Member'}
                      </span>
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
                      <span>Add WhatsApp for Live GPS</span>
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
                  <div className="tp-mobile-guest-text">
                    <h4>Jay Radhe, Dost! 🙏</h4>
                    <p>Sign in to sync bookings, live GPS & member discounts.</p>
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
                    <LogIn size={15} />
                    <span>Register</span>
                  </button>
                </div>
              )}

              {/* 2. Main Navigation Links (Vrindopnishad List Style) */}
              <div className="tp-mobile-nav-block">
                <div className="tp-mobile-section-label">PILGRIMAGE SECTIONS</div>
                <div className="tp-mobile-nav-list">
                  <a
                    href="#about"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>About Vrinda</span>
                    <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                  </a>
                  <a
                    href="#popular"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Sacred Dhams & Trails</span>
                    <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                  </a>
                  <a
                    href="#explore"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Brij Tour Packages</span>
                    <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                  </a>
                  <a
                    href="#gallery"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Divine Darshan Gallery</span>
                    <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                  </a>
                  <a
                    href="#initiatives"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Pilgrim Journal & Stories</span>
                    <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                  </a>
                  <button
                    type="button"
                    className="tp-mobile-nav-item tp-mobile-nav-item-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleOpenReferralProgram();
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Gift size={16} color="#ec4899" />
                      <span>Refer Pilgrims (Earn 500 Pts)</span>
                    </span>
                    <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                  </button>

                  {onOpenPartnerHub && (
                    <button
                      type="button"
                      className="tp-mobile-nav-item tp-mobile-nav-item-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenPartnerHub();
                      }}
                    >
                      <span>Partner & Driver Hub</span>
                      <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                    </button>
                  )}
                  <a
                    href="#contact"
                    className="tp-mobile-nav-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Contact & Support</span>
                    <ArrowRight size={18} className="tp-mobile-nav-arrow" />
                  </a>
                </div>
              </div>

              {/* 3. Action Buttons Suite (Max 2 Buttons) */}
              <div className="tp-mobile-cta-suite">
                <button
                  type="button"
                  className="tp-btn-mobile-primary-action"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setSelectedItem(popularPlaces[0]);
                  }}
                >
                  <Calendar size={16} />
                  <span>Book Yatra</span>
                </button>

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
        </div>
      )}

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
                            className={`tp-btn-card-heart-pill ${favoriteIds.includes(place.id) ? 'is-favorited' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(place.id, place.title);
                            }}
                            title={favoriteIds.includes(place.id) ? "Remove from Favourites" : "Save to Favourites"}
                            aria-label={favoriteIds.includes(place.id) ? "Remove from Favourites" : "Save to Favourites"}
                          >
                            <Heart
                              size={16}
                              fill={favoriteIds.includes(place.id) ? '#ef4444' : 'none'}
                              color={favoriteIds.includes(place.id) ? '#ef4444' : 'currentColor'}
                              className={favoriteIds.includes(place.id) ? 'tp-heart-pop' : ''}
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
                                className={`tp-btn-card-heart-pill ${favoriteIds.includes(item.id) ? 'is-favorited' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id, item.title);
                                }}
                                title={favoriteIds.includes(item.id) ? "Remove from Favourites" : "Save to Favourites"}
                                aria-label={favoriteIds.includes(item.id) ? "Remove from Favourites" : "Save to Favourites"}
                              >
                                <Heart
                                  size={16}
                                  fill={favoriteIds.includes(item.id) ? '#ef4444' : 'none'}
                                  color={favoriteIds.includes(item.id) ? '#ef4444' : 'currentColor'}
                                  className={favoriteIds.includes(item.id) ? 'tp-heart-pop' : ''}
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
                      <a href={link.href}>{link.label}</a>
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
      {selectedItem && (
        <div className="tp-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="tp-modal-card tp-booking-modal-card" onClick={(e) => e.stopPropagation()}>

            {/* Top Hero Banner with Media & Close Button */}
            <div className="tp-modal-hero-cover">
              <img src={selectedItem.image} alt={selectedItem.title} className="tp-modal-hero-img" loading="eager" decoding="async" />
              <div className="tp-modal-hero-scrim" />

              {/* Minimal Clean Close Icon */}
              <button className="tp-modal-close-icon" onClick={() => setSelectedItem(null)} aria-label="Close modal">
                <X size={20} />
              </button>

              {/* Destination Title & Location Floating on Hero */}
              <div className="tp-modal-hero-content">
                <div className="tp-modal-hero-loc-row">
                  <MapPin size={13} className="tp-modal-hero-loc-icon" />
                  <span>{selectedItem.location || selectedItem.region || 'Curated Expedition'}</span>
                  <span className="tp-modal-rating-badge">
                    <Star size={11} fill="#fbbf24" color="#fbbf24" />
                    <span>{selectedItem.rating || '4.9'}</span>
                  </span>
                </div>
                <h3 className="tp-modal-hero-title">{selectedItem.title}</h3>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="tp-modal-body-wrapper">

              {/* Trip Highlights Info Bar: Clean Modern Inline Meta Row (Matching Reference Image) */}
              <div className="tp-modal-trip-meta-bar">
                <div className="tp-meta-chip-item">
                  <Tag size={14} className="tp-meta-chip-icon" />
                  <span className="tp-meta-chip-text">
                    from <strong>{selectedItem.price}</strong> <small>{selectedItem.priceUnit || '/day'}</small>
                  </span>
                </div>

                <div className="tp-meta-chip-item">
                  <Calendar size={14} className="tp-meta-chip-icon" />
                  <span className="tp-meta-chip-text">
                    <strong>{formatTripDates(checkInDate, checkOutDate)}</strong>
                  </span>
                </div>

                <div className="tp-meta-chip-item">
                  <Users size={14} className="tp-meta-chip-icon" />
                  <span className="tp-meta-chip-text">
                    <strong>{roomsGuests ? roomsGuests.replace('1 Room, ', '') : '2 Guests'}</strong>
                  </span>
                </div>
              </div>

              {/* Sign In Prompt for Guest Travelers */}
              {!currentUser && (
                <div
                  className="tp-modal-login-prompt"
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tp-login-prompt-content">
                    <Sparkles size={13} className="tp-prompt-sparkle" />
                    <span>Sign in for <strong>1-click booking autofill</strong></span>
                  </div>
                  <span className="tp-prompt-cta-link">
                    <span>Sign In</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              )}

              {/* Form Content */}
              {bookingSuccess ? (
                <div className="tp-booking-success-box">
                  <div className="tp-success-icon-wrap">
                    <CheckCircle2 size={42} className="tp-success-icon" />
                  </div>
                  <h4>Reservation Confirmed!</h4>
                  <p>Opening WhatsApp to connect with your dedicated Vrinda Vihar travel concierge...</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="tp-auth-ios-form">
                  {currentUser && (
                    <div className="tp-modal-traveler-strip">
                      <div className="tp-traveler-strip-left">
                        <div className="tp-traveler-strip-avatar">
                          {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.name} />
                          ) : (
                            <User size={15} />
                          )}
                        </div>
                        <div className="tp-traveler-strip-text">
                          <span className="tp-traveler-strip-name">{currentUser.name}</span>
                          <span className="tp-traveler-strip-email">{currentUser.email}</span>
                        </div>
                      </div>
                      <span className="tp-traveler-strip-badge">
                        <CheckCircle2 size={12} />
                        <span>Verified</span>
                      </span>
                    </div>
                  )}

                  {/* Show Name input ONLY if not already known */}
                  {!currentUser?.name && (
                    <div className="tp-auth-pill-input-wrap">
                      <User size={17} className="tp-auth-pill-icon" />
                      <input
                        type="text"
                        className="tp-auth-pill-input"
                        placeholder="Your Full Name"
                        value={bookingName}
                        onChange={(e) => handleBookingNameChange(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Show Email input ONLY if not already known */}
                  {!currentUser?.email && (
                    <div className="tp-auth-pill-input-wrap">
                      <Mail size={17} className="tp-auth-pill-icon" />
                      <input
                        type="email"
                        className="tp-auth-pill-input"
                        placeholder="Email Address"
                        value={bookingEmail}
                        onChange={(e) => handleBookingEmailChange(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Mobile input (the only missing piece when logged in) */}
                  <div className="tp-auth-pill-input-wrap">
                    <Phone size={17} className="tp-auth-pill-icon" />
                    <input
                      type="tel"
                      className="tp-auth-pill-input"
                      placeholder="10-digit Mobile (e.g. 9876543210)"
                      value={bookingPhone}
                      onChange={(e) => handleBookingPhoneChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="tp-modal-cta-row">
                    <button type="submit" className="tp-btn-auth-primary-green">
                      <span>Reserve on WhatsApp</span>
                      <ArrowRight size={16} className="tp-modal-btn-arrow" />
                    </button>
                    <button
                      type="button"
                      className={`tp-btn-modal-heart-circle ${favoriteIds.includes(selectedItem?.id) ? 'is-favorited' : ''}`}
                      onClick={() => toggleFavorite(selectedItem?.id, selectedItem?.title)}
                      title={favoriteIds.includes(selectedItem?.id) ? "Remove from Favourites" : "Save to Favourites"}
                      aria-label={favoriteIds.includes(selectedItem?.id) ? "Remove from Favourites" : "Save to Favourites"}
                    >
                      <Heart
                        size={18}
                        fill={favoriteIds.includes(selectedItem?.id) ? '#ef4444' : 'none'}
                        color={favoriteIds.includes(selectedItem?.id) ? '#ef4444' : 'currentColor'}
                        className={favoriteIds.includes(selectedItem?.id) ? 'tp-heart-pop' : ''}
                      />
                    </button>
                  </div>

                  {/* Subtle Professional Trust Perks */}
                  <div className="tp-modal-trust-perks">
                    <span className="tp-trust-tag">
                      <ShieldCheck size={13} />
                      <span>Free Cancellation</span>
                    </span>
                    <span className="tp-trust-dot">•</span>
                    <span className="tp-trust-tag">
                      <Sparkles size={13} />
                      <span>24/7 Concierge</span>
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Virtual Tour Modal */}
      {isVideoModalOpen && (
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
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
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
        </div>
      )}

      {/* 11. iOS STYLE LUXURY AUTH & PROFILE LOGIN MODAL */}
      {isAuthModalOpen && (
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
                    Please provide your WhatsApp / Phone number to receive instant booking vouchers and live trip updates.
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
                    {signupStep === 3 && 'WhatsApp & Contact'}
                  </h2>
                  <p className="tp-auth-ios-subtitle">
                    {signupStep === 1 && 'Step 1 of 3: Enter your login email & password'}
                    {signupStep === 2 && 'Step 2 of 3: Enter your full legal name for reservations'}
                    {signupStep === 3 && 'Step 3 of 3: Add your number for instant WhatsApp concierge sync'}
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
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
        </div>
      )}

      {/* 12. VRINDA VIHAR MASTER CARD LIGHTBOX (MATCHING REFERENCE UI) */}
      {lightboxItem && (
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
                            title: '✨ Picture Shared in WebP',
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
                    className={`tp-btn-master-icon ${favoriteIds.includes(lightboxItem.id) ? 'is-favorited' : ''}`}
                    onClick={() => toggleFavorite(lightboxItem.id, lightboxItem.title)}
                    title={favoriteIds.includes(lightboxItem.id) ? "Remove from Favourites" : "Save to Favourites"}
                    aria-label={favoriteIds.includes(lightboxItem.id) ? "Remove from Favourites" : "Save to Favourites"}
                  >
                    <Heart
                      size={18}
                      fill={favoriteIds.includes(lightboxItem.id) ? '#ef4444' : 'none'}
                      color={favoriteIds.includes(lightboxItem.id) ? '#ef4444' : 'currentColor'}
                      className={favoriteIds.includes(lightboxItem.id) ? 'tp-heart-pop' : ''}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pilgrim Referral & Rewards Modal */}
      {isReferralModalOpen && (
        <div className="tp-auth-modal-overlay" onClick={() => setIsReferralModalOpen(false)}>
          <div
            className="tp-auth-modal-card"
            style={{ maxWidth: '440px' }}
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
                  <h3 id="referral-modal-title" className="tp-auth-modal-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                    Pilgrim Referral Program
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 800 }}>✨ Earn 500 Brij Points</span>
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
                  Register to Unlock Your Referral Code
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.3rem 0' }}>
                  Create your free pilgrim profile in 30 seconds to generate your personal invite link, share with friends & family, and earn <strong>500 Brij Reward Points</strong> per referral!
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
            ) : (
              <div className="tp-auth-modal-body" style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.84rem', color: '#52525b', lineHeight: 1.5, margin: '0 0 1.2rem 0' }}>
                  Invite your spiritual family and friends to Vrinda Vihar. When they take their first e-rickshaw ride or hotel stay, <strong>both of you earn 500 Brij Reward Points</strong> and unlock <strong>15% OFF</strong> on divine stays!
                </p>

                {/* Referral Code Box */}
                <div style={{ background: '#fafafa', border: '1.5px dashed #cbd5e1', borderRadius: '16px', padding: '1rem', marginBottom: '1.2rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
                    Your Unique Pilgrim Invite Code
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#09090b', letterSpacing: '0.08em', fontFamily: 'monospace', margin: '4px 0 6px 0' }}>
                    {currentUser.referralCode || `VRINDA-${(currentUser.uid || currentUser.id || currentUser.email || 'DEVOTE').replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase()}`}
                  </div>

                  {/* Live Supabase Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '6px 0 10px 0', flexWrap: 'wrap' }}>
                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800, color: '#047857' }}>
                      🌟 {referralStats.totalPoints || currentUser.rewardPoints || 0} Brij Points
                    </div>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800, color: '#1d4ed8' }}>
                      👥 {referralStats.totalReferrals || 0} Devotees Joined
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const code = currentUser.referralCode || `VRINDA-${(currentUser.uid || currentUser.id || currentUser.email || 'DEVOTE').replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase()}`;
                      const link = `${window.location.origin}/?ref=${code}`;
                      navigator.clipboard?.writeText(link);
                      setCopiedReferral(true);
                      setTimeout(() => setCopiedReferral(false), 2500);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      background: copiedReferral ? '#16a34a' : '#18181b',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Share2 size={13} />
                    <span>{copiedReferral ? '✓ Link Copied to Clipboard!' : 'Copy Referral Link'}</span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Radhe Radhe! 🙏 Use my invite link on Vrinda Vihar to get 500 Brij Reward Points and 15% OFF on verified stays & E-Rickshaw rides across Vrindavan, Mathura & Barsana:\n\n${window.location.origin}/?ref=${currentUser.referralCode || `VRINDA-${(currentUser.uid || currentUser.id || currentUser.email || 'DEVOTE').replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase()}`}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '0.85rem',
                      background: '#25D366',
                      color: '#ffffff',
                      borderRadius: '999px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    <Send size={15} />
                    <span>Share Invite via WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsReferralModalOpen(false)}
                    style={{
                      padding: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      color: '#71717a',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Interactive Toast for Registration & Profile Completion Prompt */}
      {floatingToast && (
        <aside className="tp-floating-toast" role="status" aria-live="polite">
          <div className={`tp-toast-icon-wrap ${floatingToast.highlight ? 'highlight' : ''}`}>
            {floatingToast.icon}
          </div>
          <div className="tp-toast-body">
            <h4 className="tp-toast-title">{floatingToast.title}</h4>
            <p className="tp-toast-desc">{floatingToast.desc}</p>
            <div className="tp-toast-actions">
              <button
                type="button"
                className="tp-toast-cta"
                onClick={floatingToast.onCta}
              >
                {floatingToast.ctaText}
              </button>
              <button
                type="button"
                className="tp-toast-dismiss"
                onClick={() => {
                  setFloatingToast(null);
                  sessionStorage.setItem('vrinda_toast_dismissed', 'true');
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            type="button"
            className="tp-toast-close-btn"
            onClick={() => {
              setFloatingToast(null);
              sessionStorage.setItem('vrinda_toast_dismissed', 'true');
            }}
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        </aside>
      )}
    </div>
  );
}
