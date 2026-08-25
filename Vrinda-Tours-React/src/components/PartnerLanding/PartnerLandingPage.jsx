import React, { useState, useEffect, useRef } from 'react';
import {
  Compass, Calendar, Users, MapPin, Search, Star,
  ArrowRight, ArrowLeft, CheckCircle2, Play, SlidersHorizontal,
  X, Plane, Building2, Bus, Car, Mail, Send, ChevronRight,
  Sparkles, ShieldCheck, Heart, Share2, Phone, Twitter, Facebook, Instagram, Github, Globe,
  CreditCard, LayoutGrid, Ticket, Leaf, Sprout, Waves, Linkedin
} from 'lucide-react';
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
  getCachedData,
  setCachedData
} from '../../data/landingData';
import './PartnerLandingPage.css';

export default function PartnerLandingPage({ onClose, onOpenPartnerHub }) {
  // Hero Step Slider State
  const [activeStep, setActiveStep] = useState(1);
  const currentHero = heroSteps.find(h => h.step === activeStep) || heroSteps[0];

  // Journey Animated Carousel State (Defaulting to step 2 "Book A Ticket" matching reference design)
  const [activeJourneyStep, setActiveJourneyStep] = useState(2);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      setActiveJourneyStep(prev => (prev === 3 ? 1 : prev + 1));
    } else if (diff < -45) {
      setActiveJourneyStep(prev => (prev === 1 ? 3 : prev - 1));
    }
    setTouchStartX(null);
  };

  // Calculate 3-card ordered carousel (Active card is always centered, flanked symmetrically by left and right cards)
  const orderedJourneySteps = (() => {
    if (activeJourneyStep === 1) return [journeySteps[2], journeySteps[0], journeySteps[1]]; // [3, 1, 2]
    if (activeJourneyStep === 2) return [journeySteps[0], journeySteps[1], journeySteps[2]]; // [1, 2, 3]
    return [journeySteps[1], journeySteps[2], journeySteps[0]]; // [2, 3, 1]
  })();

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

  // Modals & Interactive States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'login' | 'signup'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState(250);
  const [minRatingFilter, setMinRatingFilter] = useState(4.5);

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
    setBookingSuccess(true);
    setTimeout(() => {
      const message = encodeURIComponent(
        `Hello! I would like to confirm booking for *${selectedItem?.title || destination}*.\nGuest: ${bookingName}\nEmail: ${bookingEmail}\nPhone: ${bookingPhone}\nDates: ${checkInDate} to ${checkOutDate}\nParty: ${roomsGuests}`
      );
      window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
      setSelectedItem(null);
      setBookingSuccess(false);
      setBookingName('');
      setBookingEmail('');
      setBookingPhone('');
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
            <a href="#about" className="tp-nav-item uppercase">ABOUT</a>
            <a href="#popular" className="tp-nav-item uppercase">TOUR</a>
            <a href="#explore" className="tp-nav-item uppercase">PACKAGE</a>
            <a href="#footer" className="tp-nav-item uppercase">CONTACT</a>
          </nav>

          {/* Action CTAs */}
          <div className="tp-nav-actions">
            <button
              className="tp-btn-dark-pill"
              onClick={() => {
                setSelectedItem(popularPlaces[0]);
              }}
            >
              Book Trip
            </button>

            {/* Quick Live Pilgrim Map Switcher */}
            <button
              className="tp-btn-map-toggle"
              onClick={onClose}
              title="Switch to Live Vrinda Pilgrim Map & GPS Booking"
            >
              <MapPin size={15} />
              <span>Live Map</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MASTER AVIATION HERO SECTION (Exact Reference Design) */}
      <section className="tp-hero-section" id="hero">
        <div className="tp-hero-plane-card">
          {/* Background Soaring Airplane Visual */}
          <div className="tp-plane-bg-layer">
            <img
              key={currentHero.step}
              src={currentHero.bgImage}
              alt="Passenger Airplane Soaring Through Sky and Clouds"
              className="tp-plane-bg-img tp-fade-in-img"
              loading="eager"
            />
            <div className="tp-plane-sky-gradient" />
          </div>

          {/* Left Content Area with Step Indicator */}
          <div className="tp-hero-left-wrapper">
            {/* Vertical Step Indicator (1, 2, 3) */}
            <div className="tp-step-indicator">
              <div className="tp-step-line" />
              {[1, 2, 3].map((stepNum) => (
                <button
                  key={stepNum}
                  className={`tp-step-node ${activeStep === stepNum ? 'active' : ''}`}
                  onClick={() => setActiveStep(stepNum)}
                  title={`Step ${stepNum}`}
                >
                  {stepNum}
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
                  onClick={() => setIsVideoModalOpen(true)}
                  title="Experience In-Flight Virtual Tour"
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
              <a href="#twitter" className="tp-social-pill-link" aria-label="Twitter">
                <Twitter size={14} />
              </a>
              <a href="#facebook" className="tp-social-pill-link tp-social-facebook" aria-label="Facebook">
                <Facebook size={14} />
              </a>
              <a href="#instagram" className="tp-social-pill-link" aria-label="Instagram">
                <Instagram size={14} />
              </a>
              <a href="#github" className="tp-social-pill-link" aria-label="GitHub">
                <Github size={14} />
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

      {/* 3.5. JOURNEY TO THE SKIES MADE SIMPLE */}
      <section className="tp-journey-section" id="journey">
        <div className="tp-container">
          <div className="tp-journey-header">
            <h2 className="tp-journey-title">Journey To The Skies Made Simple</h2>
            <p className="tp-journey-sub">Find your destination, book premium tickets, and fly with ease.</p>
          </div>

          {/* 3-Card Stage Matching Reference Design */}
          <div
            className="tp-journey-stage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {orderedJourneySteps.map((step) => {
              const isActive = activeJourneyStep === step.stepNumber;
              return (
                <div
                  key={step.id}
                  className={`tp-journey-card ${isActive ? 'tp-j-active' : 'tp-j-inactive'}`}
                  onClick={() => setActiveJourneyStep(step.stepNumber)}
                >
                  {/* Synchronized Inactive View Layer */}
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


                  {/* Synchronized Active View Layer */}
                  <div className="tp-j-active-view">
                    {/* Top Header Row with Glass Icon & Organic Ocean Cutout */}
                    <div className="tp-j-top-row">
                      <div className="tp-j-glass-badge">
                        <LayoutGrid size={18} className="tp-j-glass-icon" />
                      </div>

                      {/* Curved Organic Ocean Speedboat Window */}
                      <div className="tp-j-photo-window">
                        <img
                          src={step.photo}
                          alt={step.shortTitle}
                          className="tp-j-cutout-img"
                          loading="lazy"
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
                        className="tp-j-learn-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(popularPlaces[step.stepNumber - 1] || popularPlaces[0]);
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
                className={`tp-j-dot ${activeJourneyStep === s.stepNumber ? 'active' : ''}`}
                onClick={() => setActiveJourneyStep(s.stepNumber)}
                title={s.shortTitle}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION: POPULAR PLACE */}
      <section className="tp-section tp-popular-section" id="popular">
        <div className="tp-container">
          {/* Section Header */}
          <div className="tp-section-header">
            <div className="tp-header-left">
              <h2 className="tp-section-title">Popular Destinations</h2>
              <p className="tp-section-tagline">Heaven on earth</p>
            </div>
            <div className="tp-header-right">
              <p className="tp-header-desc">
                World-class destinations with breathtaking views and unforgettable experiences.
              </p>
            </div>
          </div>


          {/* 4-Card Grid */}
          <div className="tp-popular-grid">
            {popularPlaces.map((place) => (
              <div
                key={place.id}
                className="tp-popular-card"
                onClick={() => setSelectedItem(place)}
              >
                <div className="tp-card-media">
                  <img src={place.image} alt={place.title} className="tp-card-img" loading="lazy" />
                  <div className="tp-price-badge">{place.price}</div>
                </div>
                <div className="tp-card-info">
                  <h3 className="tp-card-title">{place.title}</h3>
                  <div className="tp-card-location">
                    <MapPin size={14} className="tp-loc-icon" />
                    <span>{place.location}</span>
                  </div>
                </div>
              </div>
            ))}
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
                  />
                  <div className="tp-pillar-scrim" />

                  {/* Top/Middle Circular Glass Badge */}
                  <div className="tp-pillar-badge-wrap">
                    <div className="tp-pillar-icon-circle">
                      {pillar.icon === 'Compass' && <Compass size={20} className="tp-pillar-icon" />}
                      {pillar.icon === 'MapPin' && <MapPin size={20} className="tp-pillar-icon" />}
                      {pillar.icon === 'Plane' && <Plane size={20} className="tp-pillar-icon" />}
                      {pillar.icon === 'Globe' && <Globe size={20} className="tp-pillar-icon" />}
                    </div>
                  </div>

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

      {/* 5. SECTION: TOP DESTINATION (Matching Reference Bento Grid) */}
      <section className="tp-section tp-explore-section" id="explore">
        <div className="tp-container">
          {/* Centered Minimalist Header */}
          <div className="tp-top-dest-header">
            <h2 className="tp-top-dest-title">Top Destination</h2>
            <p className="tp-top-dest-subtitle">specific reasons why this should be your main goal</p>
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
            {(topDestinationsByTab[activeTopTab] || topDestinationsByTab['Nusa Tenggara Timur']).map((dest, idx) => (
              <div
                key={dest.id}
                className={`tp-bento-card tp-bento-area-${idx + 1}`}
                onClick={() => setSelectedItem(dest)}
              >
                <img src={dest.image} alt={dest.title} className="tp-bento-img" loading="lazy" />
                <div className="tp-bento-scrim" />

                {/* Top-Left Rating Pill */}
                <div className="tp-bento-rating-badge">
                  <Star size={11} fill="#fbbf24" color="#fbbf24" />
                  <span>{dest.rating}</span>
                </div>

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
                <a href="#twitter" className="tp-social-circle-link" aria-label="Twitter">
                  <Twitter size={15} />
                </a>
                <a href="#instagram" className="tp-social-circle-link" aria-label="Instagram">
                  <Instagram size={15} />
                </a>
                <a href="#facebook" className="tp-social-circle-link" aria-label="Facebook">
                  <Facebook size={15} />
                </a>
                <a href="#linkedin" className="tp-social-circle-link" aria-label="LinkedIn">
                  <Linkedin size={15} />
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
              <img src={selectedItem.image} alt={selectedItem.title} className="tp-modal-hero-img" />
              <div className="tp-modal-hero-scrim" />
              
              {/* Floating Header Badges */}
              <div className="tp-modal-hero-top-bar">
                <span className="tp-modal-badge-category">
                  <Compass size={13} />
                  <span>{selectedItem.category || 'Featured Tour'}</span>
                </span>
                <button className="tp-modal-close-glass" onClick={() => setSelectedItem(null)} aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>

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
              
              {/* Trip Highlights 3-Card Deck */}
              <div className="tp-modal-trip-meta-bar">
                <div className="tp-meta-pill">
                  <div className="tp-meta-icon-badge">
                    <Calendar size={13} />
                  </div>
                  <div className="tp-meta-text">
                    <span className="tp-meta-lbl">Dates</span>
                    <strong className="tp-meta-val">{formatTripDates(checkInDate, checkOutDate)}</strong>
                  </div>
                </div>

                <div className="tp-meta-pill">
                  <div className="tp-meta-icon-badge">
                    <Users size={13} />
                  </div>
                  <div className="tp-meta-text">
                    <span className="tp-meta-lbl">Travelers</span>
                    <strong className="tp-meta-val">{roomsGuests || '2 Guests'}</strong>
                  </div>
                </div>

                <div className="tp-meta-pill tp-meta-price-card">
                  <div className="tp-meta-icon-badge">
                    <Sparkles size={13} />
                  </div>
                  <div className="tp-meta-text">
                    <span className="tp-meta-lbl">Starting Rate</span>
                    <strong className="tp-meta-val-price">{selectedItem.price} <small>{selectedItem.priceUnit || '/pax'}</small></strong>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              {bookingSuccess ? (
                <div className="tp-booking-success-box">
                  <div className="tp-success-icon-wrap">
                    <CheckCircle2 size={42} className="tp-success-icon" />
                  </div>
                  <h4>Reservation Confirmed!</h4>
                  <p>Opening WhatsApp to connect with your dedicated Vrinda Tours travel concierge...</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="tp-booking-form">
                  <div className="tp-input-group">
                    <label>Your Full Name</label>
                    <div className="tp-input-icon-wrap">
                      <Users size={15} className="tp-field-icon" />
                      <input
                        type="text"
                        placeholder="e.g. Johnathan Doe"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="tp-form-row-2col">
                    <div className="tp-input-group">
                      <label>Email Address</label>
                      <div className="tp-input-icon-wrap">
                        <Mail size={15} className="tp-field-icon" />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="tp-input-group">
                      <label>WhatsApp Number</label>
                      <div className="tp-input-icon-wrap">
                        <Phone size={15} className="tp-field-icon" />
                        <input
                          type="tel"
                          placeholder="+1 (555) 019-2834"
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trust Perks */}
                  <div className="tp-modal-trust-perks">
                    <span className="tp-trust-tag"><ShieldCheck size={13} /> Free Cancellation & Rescheduling</span>
                    <span className="tp-trust-tag"><Sparkles size={13} /> 24/7 Dedicated Concierge</span>
                  </div>

                  <button type="submit" className="tp-btn-luxury-reserve">
                    <span>Reserve Itinerary on WhatsApp</span>
                    <ArrowRight size={16} />
                  </button>
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
              <h3>Filter Destinations</h3>
              <button className="tp-modal-close" onClick={() => setIsFilterModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="tp-filter-modal-body">
              <div className="tp-filter-section">
                <div className="tp-filter-label-row">
                  <span>Maximum Price</span>
                  <strong>${priceFilter} / person</strong>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(Number(e.target.value))}
                  className="tp-range-slider"
                />
              </div>

              <div className="tp-filter-section">
                <div className="tp-filter-label-row">
                  <span>Minimum Rating</span>
                  <strong>⭐ {minRatingFilter} & up</strong>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="5.0"
                  step="0.1"
                  value={minRatingFilter}
                  onChange={(e) => setMinRatingFilter(Number(e.target.value))}
                  className="tp-range-slider"
                />
              </div>

              <button
                className="tp-btn-flight-cta"
                style={{ width: '100%', marginTop: '1rem', height: '48px' }}
                onClick={() => setIsFilterModalOpen(false)}
              >
                Apply Filters ({filteredDestinations.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
