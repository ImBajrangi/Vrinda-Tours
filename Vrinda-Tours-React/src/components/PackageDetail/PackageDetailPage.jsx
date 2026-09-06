import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Compass, MapPin, Calendar, Users, Star, ArrowLeft, ArrowRight,
  Clock, ShieldCheck, Sparkles, Heart, Share2, Phone, CreditCard,
  CheckCircle2, Check, Minus, ChevronDown, ChevronUp, Copy,
  Headphones, Award, AlertCircle, Eye, Info, Car, UtensilsCrossed,
  ExternalLink, BedDouble, HelpCircle, Tag, Plus, CheckSquare, Square,
  Sunrise, Moon
} from 'lucide-react';
import { getPackageDeepDetails } from '../../data/packageDeepData';
import { updatePageSEO } from '../../utils/seoHelper';
import { getCachedData, setCachedData } from '../../data/landingData';
import AnimatedCheckCircle from '../UI/AnimatedCheckCircle';
import './PackageDetailPage.css';

const DETAIL_ADDONS = [
  { id: 'addon_vip', title: 'VIP Sugam Darshan Pass', price: 499, subtitle: 'Priority access at Bankey Bihari & Prem Mandir' },
  { id: 'addon_prasad', title: 'Chhappan Bhog Mahaprasad Box', price: 350, subtitle: 'Fresh Mathura peda & sacred tulsi prasad' },
  { id: 'addon_guide', title: 'Dedicated Brajwasi Katha Guide', price: 599, subtitle: 'Local scholar guide for all sacred leelas' }
];

/**
 * Luxury Sacred Brij Package Deep Detail Page
 * Features deep devotional lore, slot-by-slot itinerary, inclusions,
 * interactive gallery, verified reviews, FAQs, and sticky concierge booking.
 */
export default function PackageDetailPage({
  pkg,
  onBack,
  onBookStripe,
  onBookInquiry,
  onOpenReservationModal,
  onOpenHelpCenter,
  initialCheckInDate,
  initialCheckOutDate,
  initialGuests = '2 Guests',
  currentUser,
  isFavorite = false,
  onToggleFavorite
}) {
  // 1. Resolve deep package data with caching for low-performance resilience
  const packageDetails = useMemo(() => {
    if (!pkg) return null;
    const cacheKey = `pkg_detail_${pkg.id || 'default'}`;
    const cached = getCachedData(cacheKey, null);
    const resolved = getPackageDeepDetails(pkg);
    if (resolved) {
      setCachedData(cacheKey, resolved);
      return resolved;
    }
    return cached || pkg;
  }, [pkg]);

  // Gallery state
  const galleryList = useMemo(() => {
    if (packageDetails?.galleryImages && packageDetails.galleryImages.length > 0) {
      return packageDetails.galleryImages;
    }
    return [packageDetails?.image || '/vrinda-vihar/radha-raman-ji-1.webp'];
  }, [packageDetails]);

  const [selectedImage, setSelectedImage] = useState(galleryList[0]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Booking widget form state
  const [travelDate, setTravelDate] = useState(() => {
    if (initialCheckInDate) return initialCheckInDate;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('morning'); // 'morning' | 'evening'
  const [guestsCount, setGuestsCount] = useState(initialGuests.includes('Guest') ? parseInt(initialGuests, 10) || 2 : 2);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [promoCode, setPromoCode] = useState('RADHA500');
  const [isPromoApplied, setIsPromoApplied] = useState(true);
  const [promoDiscount, setPromoDiscount] = useState(500);

  const [pilgrimPhone, setPilgrimPhone] = useState(currentUser?.phone || '');
  const [pilgrimName, setPilgrimName] = useState(currentUser?.name || '');
  const [formError, setFormError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');

  // Update selected image if package changes
  useEffect(() => {
    if (galleryList.length > 0) {
      setSelectedImage(galleryList[0]);
      setActiveImgIndex(0);
    }
  }, [galleryList]);

  // Dynamic SEO & JSON-LD Structured Data for Google Rich Snippets
  useEffect(() => {
    if (!packageDetails) return;

    const pageTitle = `${packageDetails.title} — Detailed Sacred Itinerary & Darshan Pass`;
    const pageDesc = packageDetails.tagline || packageDetails.overview?.slice(0, 160) || 'Book exclusive guided darshan and sacred pilgrimage tour across Mathura, Vrindavan, and Brij Dham with Vrinda Vihar.';
    const canonicalUrl = `/package/${packageDetails.id || 'brij-darshan'}?package=${encodeURIComponent(packageDetails.id || '')}`;

    updatePageSEO({
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      image: packageDetails.image,
      keywords: `${packageDetails.title}, Vrindavan tour package, Mathura Vrindavan darshan, Brij Yatra itinerary, temple darshan booking, Vrinda Vihar`,
      type: 'tourist_trip'
    });

    // Inject JSON-LD TouristTrip schema for rich search snippets
    const scriptId = 'jsonld-tourist-trip';
    let scriptTag = document.getElementById(scriptId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      'name': packageDetails.title,
      'description': packageDetails.overview || packageDetails.tagline,
      'touristType': ['Pilgrim', 'Spiritual Devotee', 'Family'],
      'image': packageDetails.image?.startsWith('http') ? packageDetails.image : `https://to.vrindopnishad.in${packageDetails.image}`,
      'offers': {
        '@type': 'Offer',
        'price': packageDetails.numericPrice || 2199,
        'priceCurrency': 'INR',
        'availability': 'https://schema.org/InStock',
        'validFrom': new Date().toISOString()
      },
      'provider': {
        '@type': 'TravelAgency',
        'name': 'Vrinda Vihar Pilgrimage Concierge',
        'telephone': '+91-7351050050',
        'url': 'https://to.vrindopnishad.in'
      }
    };

    scriptTag.text = JSON.stringify(schemaData);

    // Scroll to top smoothly when opening
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [packageDetails]);

  // Share handler
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: packageDetails?.title || 'Vrinda Vihar Package',
          text: packageDetails?.tagline || 'Experience Sacred Brij Dham with Vrinda Vihar',
          url
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      // Fallback
    }
  };

  // Base numerical price
  const basePerPerson = packageDetails?.numericPrice || 2199;
  const baseTotal = basePerPerson * guestsCount;
  const addonsTotal = selectedAddons.reduce((acc, id) => {
    const ad = DETAIL_ADDONS.find((a) => a.id === id);
    return acc + (ad ? ad.price : 0);
  }, 0);
  const orderSubtotal = baseTotal + addonsTotal;
  const discountAmount = isPromoApplied ? promoDiscount : 0;
  const estimatedTotal = Math.max(0, orderSubtotal - discountAmount);

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'RADHA500' || code === 'VRINDA2026') {
      setIsPromoApplied(true);
      setPromoDiscount(500);
      setFormError('');
    } else if (code === 'VIPYATRA') {
      setIsPromoApplied(true);
      setPromoDiscount(800);
      setFormError('');
    } else {
      setIsPromoApplied(false);
      setPromoDiscount(0);
      setFormError('Invalid promo code. Try RADHA500');
    }
  };

  // Validation & Booking triggers
  const handlePrimaryReservation = (e) => {
    if (e) e.preventDefault();
    const configuredItem = {
      ...packageDetails,
      numericPrice: basePerPerson,
      bookingDate: travelDate,
      selectedSlot,
      devoteeCount: guestsCount,
      selectedAddons,
      promoCode: isPromoApplied ? promoCode : '',
      promoDiscount: discountAmount,
      pilgrimName: pilgrimName || currentUser?.name || '',
      pilgrimPhone: pilgrimPhone || currentUser?.phone || ''
    };

    if (onOpenReservationModal) {
      onOpenReservationModal(configuredItem);
    } else if (onBookStripe) {
      onBookStripe(configuredItem);
    }
  };

  const handleInitiateInquiry = (e) => {
    if (e) e.preventDefault();
    if (!pilgrimPhone || pilgrimPhone.trim().length < 10) {
      setFormError('Please provide a valid 10-digit WhatsApp number for voucher confirmation.');
      return;
    }
    setFormError('');

    if (onBookInquiry) {
      onBookInquiry({
        ...packageDetails,
        bookingDate: travelDate,
        selectedSlot,
        guestsCount,
        pilgrimName: pilgrimName || currentUser?.name || 'Devotee Pilgrim',
        pilgrimPhone,
        estimatedTotal
      });
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!packageDetails) {
    return (
      <div className="pkg-detail-empty-state">
        <Compass size={40} className="pkg-detail-empty-icon" />
        <h2>Package Information Not Found</h2>
        <p>The requested pilgrimage itinerary could not be loaded.</p>
        <button type="button" className="pkg-detail-btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Return to All Packages</span>
        </button>
      </div>
    );
  }

  return (
    <div className="pkg-detail-page-container">
      {/* 1. Header Bar & Navigation */}
      <header className="pkg-detail-header-nav">
        <div className="pkg-detail-header-inner">
          <button
            type="button"
            className="pkg-detail-nav-back"
            onClick={onBack}
            aria-label="Back to Packages"
          >
            <ArrowLeft size={16} />
            <span className="pkg-nav-back-label">Back to Packages</span>
          </button>

          <div className="pkg-detail-breadcrumbs">
            <span className="pkg-crumb-muted">Home</span>
            <span className="pkg-crumb-sep">/</span>
            <span className="pkg-crumb-muted">Brij Yatra</span>
            <span className="pkg-crumb-sep">/</span>
            <span className="pkg-crumb-active">{packageDetails.title}</span>
          </div>

          <div className="pkg-detail-nav-actions">
            <button
              type="button"
              className={`pkg-detail-action-btn ${copiedLink ? 'is-copied' : ''}`}
              onClick={handleShare}
              title="Share Itinerary"
            >
              {copiedLink ? <Check size={15} color="#16a34a" /> : <Share2 size={15} />}
              <span className="pkg-btn-txt">{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            {onToggleFavorite && (
              <button
                type="button"
                className={`pkg-detail-action-btn ${isFavorite ? 'is-favorited' : ''}`}
                onClick={() => onToggleFavorite(packageDetails.id, packageDetails.title)}
                title={isFavorite ? "Saved in Favourites" : "Save to Favourites"}
              >
                <Heart size={15} fill={isFavorite ? '#ef4444' : 'none'} color={isFavorite ? '#ef4444' : 'currentColor'} />
                <span className="pkg-btn-txt">{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout: 2 Columns on Desktop */}
      <main className="pkg-detail-main-layout">
        {/* Left Column: Deep Narrative, Gallery, Itinerary, Inclusions & FAQs */}
        <section className="pkg-detail-left-content">

          {/* Title & Badge Suite */}
          <div className="pkg-detail-title-block">
            <div className="pkg-detail-badge-row">
              {packageDetails.badge && (
                <span className="pkg-detail-pill-badge">{packageDetails.badge}</span>
              )}
              <span className="pkg-detail-location-pill">
                <MapPin size={13} />
                <span>{packageDetails.location || packageDetails.region || 'Old Vrindavan'}</span>
              </span>
              <div className="pkg-detail-rating-pill">
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <strong>{packageDetails.rating || '5.0'}</strong>
                <span>({packageDetails.reviewsCount || 295} verified devotee reviews)</span>
              </div>
            </div>

            <h1 className="pkg-detail-main-title">{packageDetails.title}</h1>
            {packageDetails.tagline && (
              <p className="pkg-detail-tagline">{packageDetails.tagline}</p>
            )}
          </div>

          {/* Hero Gallery Section (Apple Pro Showcase) */}
          <div className="pkg-gallery-container">
            <div className="pkg-gallery-main-view">
              <img
                src={selectedImage}
                alt={packageDetails.title}
                className="pkg-gallery-hero-img"
                loading="eager"
              />
              <div className="pkg-gallery-img-scrim" />
              
              {/* Top Corner Floating Badges */}
              <div className="pkg-gallery-top-badges">
                <span className="pkg-gallery-counter-pill">
                  📸 {activeImgIndex + 1} / {galleryList.length} Photos
                </span>
              </div>

              {/* Bottom Scrim Floating Trust Pills */}
              <div className="pkg-gallery-overlay-meta">
                <span className="pkg-overlay-badge">
                  <ShieldCheck size={14} />
                  <span>Certified Vrinda Vihar Lineage Yatra</span>
                </span>
                <span className="pkg-overlay-badge">
                  <Sparkles size={14} />
                  <span>Guaranteed Front-Row Darshan Assistance</span>
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails Carousel */}
            {galleryList.length > 1 && (
              <div className="pkg-gallery-thumbs-row">
                {galleryList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pkg-gallery-thumb-btn ${activeImgIndex === idx ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedImage(imgUrl);
                      setActiveImgIndex(idx);
                    }}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`${packageDetails.title} view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sticky In-Page Navigation Bar */}
          <nav className="pkg-inpage-subnav" aria-label="Package sections">
            <button
              type="button"
              className={`pkg-subnav-btn ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => scrollToSection('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={`pkg-subnav-btn ${activeSection === 'itinerary' ? 'active' : ''}`}
              onClick={() => scrollToSection('itinerary')}
            >
              Sacred Timeline
            </button>
            <button
              type="button"
              className={`pkg-subnav-btn ${activeSection === 'spots' ? 'active' : ''}`}
              onClick={() => scrollToSection('spots')}
            >
              Temples Covered
            </button>
            <button
              type="button"
              className={`pkg-subnav-btn ${activeSection === 'inclusions' ? 'active' : ''}`}
              onClick={() => scrollToSection('inclusions')}
            >
              Inclusions
            </button>
            <button
              type="button"
              className={`pkg-subnav-btn ${activeSection === 'reviews' ? 'active' : ''}`}
              onClick={() => scrollToSection('reviews')}
            >
              Devotee Reviews
            </button>
            <button
              type="button"
              className={`pkg-subnav-btn ${activeSection === 'faqs' ? 'active' : ''}`}
              onClick={() => scrollToSection('faqs')}
            >
              FAQs
            </button>
          </nav>

          {/* Key Amenities At-A-Glance Row */}
          <div className="pkg-glance-bar">
            <div className="pkg-glance-item">
              <Clock size={18} className="pkg-glance-icon" />
              <div className="pkg-glance-text">
                <span className="pkg-glance-label">Duration</span>
                <strong className="pkg-glance-val">{packageDetails.duration}</strong>
              </div>
            </div>

            <div className="pkg-glance-item">
              <Car size={18} className="pkg-glance-icon" />
              <div className="pkg-glance-text">
                <span className="pkg-glance-label">Transport</span>
                <strong className="pkg-glance-val">{packageDetails.transport}</strong>
              </div>
            </div>

            <div className="pkg-glance-item">
              <Award size={18} className="pkg-glance-icon" />
              <div className="pkg-glance-text">
                <span className="pkg-glance-label">Devotional Guide</span>
                <strong className="pkg-glance-val">{packageDetails.guide}</strong>
              </div>
            </div>

            <div className="pkg-glance-item">
              <ShieldCheck size={18} className="pkg-glance-icon" />
              <div className="pkg-glance-text">
                <span className="pkg-glance-label">Cancellation</span>
                <strong className="pkg-glance-val">100% Free up to 24h</strong>
              </div>
            </div>
          </div>

          {/* Overview & Sacred Lore Block */}
          <div className="pkg-section-card" id="overview">
            <h2 className="pkg-section-title">
              <Sparkles size={20} className="pkg-sec-icon" />
              <span>Sacred Significance & Dham Lore</span>
            </h2>
            <p className="pkg-narrative-text">{packageDetails.overview}</p>

            {packageDetails.sacredHistory && (
              <div className="pkg-sacred-history-box">
                <div className="pkg-sacred-quote-mark">“</div>
                <div className="pkg-sacred-history-content">
                  <h4>Spiritual History & Goswami Lineage</h4>
                  {packageDetails.sacredHistory.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights bullet checks */}
            {packageDetails.highlights && packageDetails.highlights.length > 0 && (
              <div className="pkg-highlights-group">
                <h4 className="pkg-highlights-subhead">Yatra Highlights & Devotional Benefits:</h4>
                <div className="pkg-highlights-grid">
                  {packageDetails.highlights.map((item, idx) => (
                    <div key={idx} className="pkg-highlight-item">
                      <CheckCircle2 size={16} className="pkg-check-icon" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Slot-by-Slot Divine Itinerary Timeline */}
          {packageDetails.itinerary && packageDetails.itinerary.length > 0 && (
            <div className="pkg-section-card" id="itinerary">
              <h2 className="pkg-section-title">
                <Clock size={20} className="pkg-sec-icon" />
                <span>Slot-by-Slot Divine Itinerary</span>
              </h2>
              <p className="pkg-section-sub">
                Carefully synchronized with Vedic temple aarti timings and parikrama traditions.
              </p>

              <div className="pkg-itinerary-timeline">
                {packageDetails.itinerary.map((slot, idx) => (
                  <div key={idx} className="pkg-timeline-step">
                    <div className="pkg-timeline-node">
                      <span className="pkg-node-dot" />
                      {idx < packageDetails.itinerary.length - 1 && <span className="pkg-node-line" />}
                    </div>
                    <div className="pkg-timeline-content">
                      <div className="pkg-timeline-time-badge">
                        <Clock size={12} />
                        <span>{slot.time}</span>
                      </div>
                      <h3 className="pkg-timeline-title">{slot.title}</h3>
                      <p className="pkg-timeline-desc">{slot.desc}</p>
                      {slot.highlight && (
                        <div className="pkg-timeline-highlight-tag">
                          <Sparkles size={12} />
                          <span>{slot.highlight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sacred Temples & Spots Covered */}
          {packageDetails.spotsCovered && packageDetails.spotsCovered.length > 0 && (
            <div className="pkg-section-card" id="spots">
              <h2 className="pkg-section-title">
                <MapPin size={20} className="pkg-sec-icon" />
                <span>Sacred Temples & Tirtha Spots Covered</span>
              </h2>
              <div className="pkg-spots-grid">
                {packageDetails.spotsCovered.map((spot, idx) => (
                  <div key={idx} className="pkg-spot-card">
                    <div className="pkg-spot-media">
                      <img src={spot.image} alt={spot.name} loading="lazy" />
                    </div>
                    <div className="pkg-spot-info">
                      <h4 className="pkg-spot-name">{spot.name}</h4>
                      <p className="pkg-spot-note">{spot.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions vs Exclusions Comparison */}
          <div className="pkg-section-card" id="inclusions">
            <h2 className="pkg-section-title">
              <Award size={20} className="pkg-sec-icon" />
              <span>Pavitra Seva: Inclusions & Transparency</span>
            </h2>

            <div className="pkg-inclusions-dual-col">
              {/* Inclusions */}
              <div className="pkg-inc-col pkg-inc-yes">
                <div className="pkg-inc-header">
                  <CheckCircle2 size={18} color="#16a34a" />
                  <h4>What's Included in Your Pass</h4>
                </div>
                <ul className="pkg-inc-list">
                  {packageDetails.inclusions?.map((inc, i) => (
                    <li key={i}>
                      <Check size={15} className="pkg-inc-bullet yes" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="pkg-inc-col pkg-inc-no">
                <div className="pkg-inc-header">
                  <AlertCircle size={18} color="#94a3b8" />
                  <h4>What's Not Included</h4>
                </div>
                <ul className="pkg-inc-list">
                  {packageDetails.exclusions?.map((exc, i) => (
                    <li key={i}>
                      <Minus size={15} className="pkg-inc-bullet no" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Verified Pilgrim Reviews */}
          {packageDetails.reviews && packageDetails.reviews.length > 0 && (
            <div className="pkg-section-card" id="reviews">
              <div className="pkg-reviews-head-row">
                <h2 className="pkg-section-title">
                  <Star size={20} className="pkg-sec-icon" />
                  <span>Devotee Experiences & Verified Reviews</span>
                </h2>
                <span className="pkg-reviews-score-badge">
                  ★ {packageDetails.rating || '5.0'} / 5.0
                </span>
              </div>

              <div className="pkg-reviews-grid">
                {packageDetails.reviews.map((rev, idx) => (
                  <div key={idx} className="pkg-review-card">
                    <div className="pkg-rev-user-row">
                      <div className="pkg-rev-avatar">
                        {rev.name.charAt(0)}
                      </div>
                      <div className="pkg-rev-meta">
                        <span className="pkg-rev-name">{rev.name}</span>
                        <span className="pkg-rev-city">{rev.city} • {rev.date}</span>
                      </div>
                      <div className="pkg-rev-stars">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p className="pkg-rev-comment">"{rev.comment}"</p>
                    <div className="pkg-rev-badge">
                      <CheckCircle2 size={12} />
                      <span>Verified Pilgrim Darshan</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Devotional FAQ Accordion */}
          {packageDetails.faqs && packageDetails.faqs.length > 0 && (
            <div className="pkg-section-card" id="faqs">
              <h2 className="pkg-section-title">
                <HelpCircle size={20} className="pkg-sec-icon" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="pkg-faq-list">
                {packageDetails.faqs.map((faq, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div key={idx} className={`pkg-faq-item ${isOpen ? 'is-open' : ''}`}>
                      <button
                        type="button"
                        className="pkg-faq-question-btn"
                        onClick={() => setExpandedFaq(isOpen ? -1 : idx)}
                        aria-expanded={isOpen}
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {isOpen && (
                        <div className="pkg-faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Sticky Floating Luxury Reservation Card (DashBite / Apple Store Level) */}
        <aside className="pkg-detail-right-sidebar">
          <div className="pkg-sidebar-sticky-box">
            {/* Price Header Card */}
            <div className="pkg-price-banner">
              <div className="pkg-price-left">
                <span className="pkg-price-prefix">PILGRIMAGE PASS</span>
                <div className="pkg-price-num-row">
                  <span className="pkg-currency">₹</span>
                  <span className="pkg-price-val">
                    {basePerPerson.toLocaleString('en-IN')}
                  </span>
                  <span className="pkg-price-unit">{packageDetails.priceUnit || '/person'}</span>
                </div>
                <div className="pkg-price-discount-row">
                  <span className="pkg-strike-price">₹{(basePerPerson * 1.33).toFixed(0)}</span>
                  <span className="pkg-save-tag">25% OFF</span>
                </div>
              </div>
              <div className="pkg-price-secure-badge">
                <ShieldCheck size={20} color="#16a34a" />
                <span>Best Price Guaranteed</span>
              </div>
            </div>

            {/* Quick Booking Form */}
            <form onSubmit={handlePrimaryReservation} className="pkg-booking-widget-form">
              {/* Darshan Slot Selector */}
              <div className="pkg-form-field">
                <label className="pkg-field-label">
                  <Clock size={14} />
                  <span>Choose Darshan Timing Slot</span>
                </label>
                <div className="pkg-slot-pill-group">
                  <button
                    type="button"
                    className={`pkg-slot-pill ${selectedSlot === 'morning' ? 'active' : ''}`}
                    onClick={() => setSelectedSlot('morning')}
                  >
                    <div className="pkg-slot-top">
                      <Sunrise size={15} className="pkg-slot-icon" />
                      <span className="pkg-slot-title">Morning Slot</span>
                    </div>
                    <span className="pkg-slot-time">06:00 AM Mangala</span>
                  </button>
                  <button
                    type="button"
                    className={`pkg-slot-pill ${selectedSlot === 'evening' ? 'active' : ''}`}
                    onClick={() => setSelectedSlot('evening')}
                  >
                    <div className="pkg-slot-top">
                      <Moon size={15} className="pkg-slot-icon" />
                      <span className="pkg-slot-title">Evening Slot</span>
                    </div>
                    <span className="pkg-slot-time">04:30 PM Sandhya</span>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div className="pkg-form-field">
                <label className="pkg-field-label">
                  <Calendar size={14} />
                  <span>Choose Darshan Date</span>
                </label>
                <div className="pkg-date-input-wrap">
                  <input
                    type="date"
                    className="pkg-input-clean"
                    value={travelDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTravelDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Number of Pilgrims Stepper */}
              <div className="pkg-form-field">
                <label className="pkg-field-label">
                  <Users size={14} />
                  <span>Number of Pilgrims</span>
                </label>
                <div className="pkg-guests-counter">
                  <button
                    type="button"
                    className="pkg-counter-btn"
                    onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                    disabled={guestsCount <= 1}
                    aria-label="Decrease pilgrims"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="pkg-counter-val">{guestsCount} Devotee{guestsCount > 1 ? 's' : ''}</span>
                  <button
                    type="button"
                    className="pkg-counter-btn"
                    onClick={() => setGuestsCount(Math.min(20, guestsCount + 1))}
                    disabled={guestsCount >= 20}
                    aria-label="Increase pilgrims"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Sacred Add-ons Selection Suite */}
              <div className="pkg-addons-quick-box">
                <span className="pkg-addons-quick-title">Enhance Your Yatra (Optional)</span>
                <div className="pkg-addons-options-list">
                  {DETAIL_ADDONS.map((ad) => {
                    const isChecked = selectedAddons.includes(ad.id);
                    return (
                      <div
                        key={ad.id}
                        className={`pkg-addon-quick-item ${isChecked ? 'selected' : ''}`}
                        onClick={() => toggleAddon(ad.id)}
                      >
                        <div className="pkg-addon-check-icon">
                          <AnimatedCheckCircle
                            checked={isChecked}
                            size={20}
                            color="#0f172a"
                          />
                        </div>
                        <div className="pkg-addon-text">
                          <span className="pkg-addon-name">{ad.title}</span>
                          <span className="pkg-addon-sub">{ad.subtitle}</span>
                        </div>
                        <strong className="pkg-addon-price">+₹{ad.price}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Promo Code Input Bar */}
              <div className="pkg-promo-section-wrap">
                <div className="pkg-promo-quick-row">
                  <input
                    type="text"
                    className="pkg-promo-quick-input"
                    placeholder="Enter Promo (RADHA500)"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      if (isPromoApplied) setIsPromoApplied(false);
                    }}
                  />
                  <button
                    type="button"
                    className={`pkg-promo-quick-btn ${isPromoApplied ? 'confirmed' : ''}`}
                    onClick={handleApplyPromo}
                  >
                    {isPromoApplied ? (
                      <>
                        <Check size={13} strokeWidth={3} />
                        <span>Confirmed</span>
                      </>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {isPromoApplied && (
                  <div className="pkg-promo-applied-tag">
                    <Sparkles size={13} className="pkg-promo-sparkle" />
                    <span>Devotee savings applied • ₹{promoDiscount} off yatra</span>
                  </div>
                )}
              </div>

              {/* WhatsApp / Mobile for Instant Pass */}
              <div className="pkg-form-field">
                <label className="pkg-field-label">
                  <Phone size={14} />
                  <span>WhatsApp Mobile for Instant Pass *</span>
                </label>
                <div className="pkg-phone-input-wrap">
                  <div className="pkg-phone-prefix">
                    <span>🇮🇳</span>
                    <span className="pkg-prefix-code">+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={11}
                    className="pkg-input-clean pkg-phone-field"
                    placeholder="98765 43210"
                    value={pilgrimPhone}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                      const formatted = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5)}` : raw;
                      setPilgrimPhone(formatted);
                      if (formError) setFormError('');
                    }}
                  />
                </div>
              </div>

              {formError && (
                <div className="pkg-form-err-msg">
                  <AlertCircle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Itemized Order Summary */}
              <div className="pkg-fare-summary-box">
                <div className="pkg-fare-row">
                  <span>Pass fare ({guestsCount} {guestsCount > 1 ? 'pilgrims' : 'pilgrim'})</span>
                  <strong>₹{baseTotal.toLocaleString('en-IN')}</strong>
                </div>
                {addonsTotal > 0 && (
                  <div className="pkg-fare-row">
                    <span>Sacred Add-ons ({selectedAddons.length})</span>
                    <strong>+ ₹{addonsTotal.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {isPromoApplied && (
                  <div className="pkg-fare-row pkg-fare-discount-row">
                    <span>Devotee Promo Code</span>
                    <strong className="pkg-fare-discount-val">- ₹{discountAmount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                <div className="pkg-fare-row">
                  <span>AC Transport & Guide</span>
                  <span className="pkg-fare-free">FREE</span>
                </div>
                <div className="pkg-fare-row">
                  <span>Taxes & Temple Darshan Access</span>
                  <span className="pkg-fare-free">FREE</span>
                </div>
                <div className="pkg-fare-dashed-divider" />
                <div className="pkg-fare-row pkg-fare-total">
                  <strong>Total Amount</strong>
                  <strong className="pkg-total-highlight">
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="pkg-widget-ctas">
                {/* 1. Primary Reserve Button (DashBite 3-Stage Trigger) */}
                <button
                  type="submit"
                  className="pkg-btn-cta-primary"
                >
                  <span>Reserve Pilgrimage Pass (₹{estimatedTotal.toLocaleString('en-IN')})</span>
                  <ArrowRight size={16} />
                </button>

                {/* 2. Help Centre Live Concierge */}
                <button
                  type="button"
                  className="pkg-btn-cta-inquiry"
                  onClick={() => {
                    if (onOpenHelpCenter) {
                      onOpenHelpCenter();
                    } else if (onBookInquiry) {
                      onBookInquiry(packageDetails);
                    }
                  }}
                >
                  <Headphones size={16} />
                  <span>Chat with Help Centre</span>
                </button>
              </div>
            </form>

            {/* Trust Perks List */}
            <div className="pkg-sidebar-trust-box">
              <div className="pkg-trust-item">
                <CheckCircle2 size={15} color="#16a34a" />
                <span>100% Verified Brajwasi Goswami Guides</span>
              </div>
              <div className="pkg-trust-item">
                <CheckCircle2 size={15} color="#16a34a" />
                <span>Free cancellation up to 24 hours</span>
              </div>
              <div className="pkg-trust-item">
                <CheckCircle2 size={15} color="#16a34a" />
                <span>Instant confirmation on WhatsApp</span>
              </div>
              <div className="pkg-trust-item">
                <CheckCircle2 size={15} color="#16a34a" />
                <span>Direct pickup from hotel or ashram</span>
              </div>
            </div>

            {/* Live Helpline Strip */}
            <div className="pkg-helpline-strip">
              <Phone size={14} />
              <span>Need help? Call Concierge: </span>
              <a href="tel:+917351050050" className="pkg-helpline-phone">+91 73510 50050</a>
            </div>
          </div>
        </aside>
      </main>

      {/* Mobile Sticky Booking Bar (Fixed at bottom on screens < 960px) */}
      <div className="pkg-mobile-sticky-bar">
        <div className="pkg-mobile-sticky-bar-inner">
          <div className="pkg-mobile-bar-left">
            <div className="pkg-mobile-bar-label-row">
              <span className="pkg-mobile-bar-label">TOTAL PASS FARE</span>
              {isPromoApplied && <span className="pkg-mobile-discount-tag">SAVED ₹{discountAmount}</span>}
            </div>
            <div className="pkg-mobile-bar-price">
              <span className="pkg-mobile-price-val">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              <span className="pkg-mobile-price-unit">/ {guestsCount} Devotee{guestsCount > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="pkg-mobile-bar-actions">
            <button
              type="button"
              className="pkg-mobile-btn-inquiry"
              onClick={() => {
                if (onOpenHelpCenter) {
                  onOpenHelpCenter();
                } else if (onBookInquiry) {
                  onBookInquiry(packageDetails);
                }
              }}
              title="Help Centre WhatsApp Concierge"
              aria-label="WhatsApp Concierge"
            >
              <Headphones size={15} />
            </button>
            <button
              type="button"
              className="pkg-mobile-btn-primary"
              onClick={handlePrimaryReservation}
            >
              <span>Reserve Pass</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

