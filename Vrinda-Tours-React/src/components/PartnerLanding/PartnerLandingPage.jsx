import React, { useState } from 'react';
import { 
  X, Compass, Calendar, Users, MapPin, Search, Star, 
  ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, 
  Car, Utensils, Building2, ChevronDown, Sparkles
} from 'lucide-react';
import './PartnerLandingPage.css';

export default function PartnerLandingPage({ onClose, onOpenPartnerHub }) {
  // Booking Capsule State
  const [destLocation, setDestLocation] = useState('Vrindavan & Mathura');
  const [travelersCount, setTravelersCount] = useState(2);
  const [checkInDate, setCheckInDate] = useState('2026-08-28');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-30');

  // Selected Yatra for Booking Modal
  const [selectedYatra, setSelectedYatra] = useState(null);
  const [yatraPilgrims, setYatraPilgrims] = useState(2);
  const [yatraDate, setYatraDate] = useState('2026-08-28');
  const [yatraName, setYatraName] = useState('');
  const [yatraPhone, setYatraPhone] = useState('');
  const [yatraBookedSuccess, setYatraBookedSuccess] = useState(false);

  // Partner Revenue Calculator
  const [calcTrips, setCalcTrips] = useState(12);
  const [activeSegment, setActiveSegment] = useState('driver');

  const calcEarnings = activeSegment === 'driver' 
    ? calcTrips * 120 * 30 
    : (activeSegment === 'restaurant' ? calcTrips * 350 * 30 : calcTrips * 1200 * 30);

  // Curated Yatra Packages using User-Provided Master Artworks
  const yatraPackages = [
    {
      id: 'yatra_84kos',
      title: '84 Kos Brij Chaurasi Kos Maha Yatra',
      duration: '7 Days / 6 Nights',
      departure: '28 Aug 2026',
      rating: 4.9,
      price: 14999,
      image: '/user_temple_rath_aerial.png',
      desc: 'Complete sacred pilgrimage covering Mathura, Vrindavan, Govardhan, Barsana, Nandgaon, Gokul, and Radha Kund with guided holy Katha.'
    },
    {
      id: 'yatra_barsana_festive',
      title: 'Barsana & Nandgaon Radha Rani Royal Yatra',
      duration: '2 Days / 1 Night',
      departure: '30 Aug 2026',
      rating: 5.0,
      price: 3999,
      image: '/user_barsana_elephant_procession.png',
      desc: 'Climb sacred Brahmagiri hill to Shriji Temple, witness flower-petal processions, visit Rangeeli Mahal, and experience royal evening Aarti.'
    },
    {
      id: 'yatra_keshi_aarti',
      title: 'Keshi Ghat Yamuna Maha Aarti & Express Darshan',
      duration: 'Full Day (12 Hours)',
      departure: 'Daily Departures',
      rating: 4.9,
      price: 1499,
      image: '/user_maha_aarti_night.png',
      desc: 'Witness glowing multi-tiered brass pyramid Maha Aarti at holy Yamuna ghats, Bankey Bihari Darshan, and Prem Mandir musical light show.'
    },
    {
      id: 'yatra_govardhan_parikrama',
      title: 'Sacred Govardhan Parikrama & Nidhi Van Yatra',
      duration: '2 Days / 1 Night',
      departure: '01 Sep 2026',
      rating: 5.0,
      price: 3499,
      image: '/user_krishna_bull_mist.png',
      desc: 'Complete 21km Giriraj Parikrama with dedicated battery vehicle escort. Visits to Daan Ghati, Mukharvind, Kusum Sarovar & sacred groves.'
    }
  ];

  // Featured Sacred Destinations (5 Tall Panoramas using User Artworks)
  const featuredDestinations = [
    {
      name: 'Keshi Ghat Yamuna Maha Aarti',
      location: 'Holy Yamuna Riverfront',
      image: '/user_maha_aarti_night.png'
    },
    {
      name: 'Barsana Shriji Mandir & Royal Festivities',
      location: 'Brahmagiri Hilltop',
      image: '/user_barsana_elephant_procession.png'
    },
    {
      name: 'Grand Temple Rath Procession',
      location: 'Vrindavan • Chaurasi Kos',
      image: '/user_temple_rath_aerial.png'
    },
    {
      name: 'Sacred Govardhan Hill & Ancient Shrines',
      location: 'Giriraj Parikrama Marg',
      image: '/user_temple_monkeys_autumn.jpg'
    },
    {
      name: 'Holy River Ghats & Lord Shiva Sanctum',
      location: 'Vrindavan Dham',
      image: '/user_holy_ghat_shiva.png'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "Vrinda made our 72-year-old grandmother's Govardhan Parikrama effortless. The battery rickshaw right from the ashram doorstep was pure bliss.",
      author: "Shyam Sundar Agarwal",
      role: "Pilgrim from Delhi",
      avatar: "/user_krishna_bull_mist.png"
    },
    {
      quote: "Zero queue chaos at Bankey Bihari and Prem Mandir. The assigned Brijwasi Sevak guided us through quiet gates and arranged pure sattvic thali.",
      author: "Radha Krishna Sharma",
      role: "Family Yatra from Mumbai",
      avatar: "/user_temple_ghat_cow.jpg"
    },
    {
      quote: "Managing my E-rickshaw pickups through Vrinda Partner Hub gives me guaranteed pilgrim rides from Mathura station every morning.",
      author: "Gopal Das Brijwasi",
      role: "E-Rickshaw Partner • Vrindavan",
      avatar: "/user_brij_rickshaw_street.jpg"
    }
  ];

  const handleBookYatraSubmit = (e) => {
    e.preventDefault();
    setYatraBookedSuccess(true);
    const text = encodeURIComponent(
      `Radhe Radhe! I want to book the *${selectedYatra.title}* on *${yatraDate}* for *${yatraPilgrims} Devotees*.\nLead Pilgrim: ${yatraName}\nPhone: ${yatraPhone}\nTotal Est: ₹${selectedYatra.price * yatraPilgrims}`
    );
    setTimeout(() => {
      window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
      setSelectedYatra(null);
      setYatraBookedSuccess(false);
    }, 1200);
  };

  return (
    <div className="pl-page-wrapper">
      {/* 1. FLOATING PILL ISLAND NAVBAR */}
      <header className="pl-navbar-haven-wrapper">
        <div className="pl-navbar-haven-pill">
          <div className="pl-haven-brand" onClick={onClose}>
            <div className="pl-haven-logo-icon">🪔</div>
            <h2>Vrinda</h2>
          </div>

          <nav className="pl-haven-links">
            <a className="pl-haven-link" onClick={() => {
              const el = document.getElementById('packages-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Yatras
            </a>
            <a className="pl-haven-link" onClick={() => {
              const el = document.getElementById('destinations-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Destinations
            </a>
            <a className="pl-haven-link" onClick={() => {
              const el = document.getElementById('partner-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              Partner Hub
            </a>
          </nav>

          <div className="pl-haven-actions">
            <button 
              className="pl-btn-haven-dark"
              onClick={() => {
                if (onOpenPartnerHub) onOpenPartnerHub('driver');
              }}
            >
              Partner Desk
            </button>
            <button className="pl-btn-haven-close" onClick={onClose} title="Return to Pilgrim Map">
              <X size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. FULL-BLEED SUNLIT USER ARTWORK HERO SECTION */}
      <section className="pl-hero-haven">
        <div className="pl-hero-haven-content">
          <div className="pl-haven-badge">
            <span>✨ Sacred Brij Pilgrimages Made Effortless 🪔</span>
          </div>

          <h1 className="pl-haven-title">
            Devotion with ease.
          </h1>

          <p className="pl-haven-desc">
            Plan your sacred Brij pilgrimage with seamless verified stays, battery mobility, and local sevaks. So you can take a breath and stay in devotion.
          </p>

          <div className="pl-haven-cta-group">
            <button 
              className="pl-btn-haven-primary"
              onClick={() => {
                const el = document.getElementById('packages-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Yatras ➔
            </button>
            <button 
              className="pl-btn-haven-secondary"
              onClick={onClose}
            >
              🗺️ Open Live Map
            </button>
          </div>
        </div>

        {/* Floating Bottom Scroll Indicator */}
        <div 
          className="pl-haven-scroll-badge"
          onClick={() => {
            const el = document.getElementById('booking-bar-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          SCROLL ↓
        </div>
      </section>

      {/* 3. FLOATING BOOKING CAPSULE BAR */}
      <div className="pl-booking-bar-haven-wrap" id="booking-bar-section">
        <div className="pl-booking-capsule-bar">
          <div className="pl-capsule-col">
            <label>DESTINATION</label>
            <select 
              value={destLocation} 
              onChange={e => setDestLocation(e.target.value)}
              className="pl-capsule-select"
            >
              <option value="Vrindavan & Mathura">Vrindavan & Mathura</option>
              <option value="Govardhan Parikrama">Govardhan Parikrama</option>
              <option value="Barsana & Nandgaon">Barsana & Nandgaon</option>
              <option value="84 Kos Maha Circuit">84 Kos Maha Circuit</option>
            </select>
          </div>

          <div className="pl-capsule-divider" />

          <div className="pl-capsule-col">
            <label>DEVOTEES</label>
            <select 
              value={travelersCount} 
              onChange={e => setTravelersCount(Number(e.target.value))}
              className="pl-capsule-select"
            >
              <option value={1}>1 Devotee (Solo)</option>
              <option value={2}>2 Devotees (Couple)</option>
              <option value={4}>4 Devotees (Family AC Cab)</option>
              <option value={6}>6+ Devotees (Group)</option>
            </select>
          </div>

          <div className="pl-capsule-divider" />

          <div className="pl-capsule-col">
            <label>CHECK IN</label>
            <input 
              type="date" 
              value={checkInDate} 
              onChange={e => setCheckInDate(e.target.value)}
              className="pl-capsule-input"
            />
          </div>

          <div className="pl-capsule-divider" />

          <div className="pl-capsule-col">
            <label>CHECK OUT</label>
            <input 
              type="date" 
              value={checkOutDate} 
              onChange={e => setCheckOutDate(e.target.value)}
              className="pl-capsule-input"
            />
          </div>

          <button 
            className="pl-btn-capsule-submit"
            onClick={() => {
              setSelectedYatra(yatraPackages[0]);
            }}
          >
            Book Now <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* 4. BEST PACKAGES FOR YOU (Featuring User Artworks) */}
      <section className="pl-packages-section" id="packages-section">
        <div className="pl-section-top-row">
          <div>
            <h2>Best Packages for you</h2>
            <p>Experience hassle-free divine Darshan with verified stays and door-to-temple battery mobility.</p>
          </div>
          <div className="pl-nav-arrows">
            <button className="pl-arrow-btn"><ArrowLeft size={16} /></button>
            <button className="pl-arrow-btn"><ArrowRight size={16} /></button>
          </div>
        </div>

        <div className="pl-packages-grid">
          {yatraPackages.map(pkg => (
            <div key={pkg.id} className="pl-package-card">
              <div className="pl-pkg-img-wrap">
                <img src={pkg.image} alt={pkg.title} className="pl-pkg-img" />
                <span className="pl-price-pill-orange">₹{pkg.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="pl-pkg-body">
                <div className="pl-stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <h4>{pkg.title}</h4>
                <div className="pl-pkg-meta-row">
                  <span>DEPARTURE <strong>{pkg.departure}</strong></span>
                  <span>DURATION <strong>{pkg.duration}</strong></span>
                </div>
                <p>{pkg.desc}</p>
                <button 
                  className="pl-btn-pkg-book"
                  onClick={() => setSelectedYatra(pkg)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED SACRED DESTINATIONS (5 Tall Panorama Cards using User Artworks) */}
      <section className="pl-destinations-section" id="destinations-section">
        <h2>Featured Sacred Destinations</h2>
        <p>Explore the timeless holy shrines and ghats where every step is filled with divine grace.</p>

        <div className="pl-dest-grid">
          {featuredDestinations.map((dest, i) => (
            <div key={i} className="pl-dest-card">
              <img src={dest.image} alt={dest.name} className="pl-dest-img" />
              <div className="pl-dest-overlay">
                <div>
                  <h4>{dest.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: '#fde68a', fontWeight: 600 }}>{dest.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SATISFIED DEVOTEES FEEDBACK */}
      <section className="pl-feedback-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2>Satisfied Devotees Feedback</h2>
          <p>Real stories from pilgrims who experienced peaceful Brij Yatra with Vrinda.</p>
        </div>

        <div className="pl-feedback-grid">
          {testimonials.map((test, i) => (
            <div key={i} className="pl-feedback-card">
              <div className="pl-quote-icon-orange">❝</div>
              <p className="pl-feedback-quote">"{test.quote}"</p>
              <div className="pl-feedback-author">
                <div className="pl-author-meta">
                  <img src={test.avatar} alt={test.author} className="pl-author-avatar" />
                  <div className="pl-author-info">
                    <h5>{test.author}</h5>
                    <span>{test.role}</span>
                  </div>
                </div>
                <div className="pl-stars-row">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={13} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PARTNER PORTAL ESTIMATOR */}
      <section className="pl-packages-section" id="partner-section" style={{ background: '#fdfbf7', border: '1px solid #fef3c7', padding: '4rem 3rem', borderRadius: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            LOCAL MERCHANT & DRIVER PLATFORM
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', margin: '0.4rem 0' }}>
            Estimate Your Monthly Revenue
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            See how much local E-rickshaws, ashrams, and restaurants earn with direct pilgrim traffic.
          </p>
        </div>

        <div className="pl-calc-card">
          <div className="pl-calc-row">
            <div className="pl-calc-label-row">
              <span>Average Daily Rides Completed</span>
              <strong>{calcTrips} Rides/day</strong>
            </div>
            <input 
              type="range" 
              min="4" 
              max="35" 
              value={calcTrips}
              onChange={e => setCalcTrips(Number(e.target.value))}
              className="pl-calc-slider"
            />
          </div>

          <div className="pl-calc-result-box">
            <div className="pl-calc-result-left">
              <span>Estimated Gross Monthly Earnings</span>
              <h3>₹{calcEarnings.toLocaleString('en-IN')} / month</h3>
            </div>
            <button 
              className="pl-btn-haven-primary"
              style={{ height: '44px', padding: '0 22px', fontSize: '0.88rem' }}
              onClick={() => {
                if (onOpenPartnerHub) onOpenPartnerHub('driver');
              }}
            >
              Open Partner Hub
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="pl-footer-haven">
        <div className="pl-footer-top">
          <div className="pl-haven-brand" onClick={onClose}>
            <div className="pl-haven-logo-icon">🪔</div>
            <h2>Vrinda</h2>
          </div>

          <div className="pl-haven-links">
            <span className="pl-haven-link">Who we are</span>
            <span className="pl-haven-link">Sacred Circuits</span>
            <span className="pl-haven-link">Ashrams</span>
            <span className="pl-haven-link">Contact us</span>
          </div>
        </div>

        <div className="pl-footer-bottom">
          Copyright © {new Date().getFullYear()} Vrinda Tours. All rights reserved. Radhe Radhe!
        </div>
      </footer>

      {/* 9. BOOK YATRA MODAL DIALOG */}
      {selectedYatra && (
        <div className="pl-yatra-modal-overlay" onClick={() => setSelectedYatra(null)}>
          <div className="pl-yatra-modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Book Yatra Package</h4>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{selectedYatra.title} ({selectedYatra.duration})</span>
              </div>
              <button className="pl-btn-haven-close" onClick={() => setSelectedYatra(null)}>
                ✕
              </button>
            </div>

            {yatraBookedSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#0f172a' }}>Yatra Request Dispatched!</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Opening WhatsApp with your verified Brij Yatra coordinator...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookYatraSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="pl-input-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    value={yatraDate} 
                    onChange={e => setYatraDate(e.target.value)} 
                    required 
                  />
                </div>

                <div className="pl-input-group">
                  <label>Number of Pilgrims (Devotees)</label>
                  <select 
                    value={yatraPilgrims} 
                    onChange={e => setYatraPilgrims(Number(e.target.value))}
                  >
                    <option value={1}>1 Pilgrim (Solo Darshan)</option>
                    <option value={2}>2 Pilgrims (Couple / Duo)</option>
                    <option value={4}>4 Pilgrims (Family AC Cab)</option>
                    <option value={6}>6 Pilgrims (Large Family)</option>
                    <option value={10}>10+ Pilgrims (Maha Yatra Group)</option>
                  </select>
                </div>

                <div className="pl-input-group">
                  <label>Lead Pilgrim Full Name</label>
                  <input 
                    type="text" 
                    value={yatraName} 
                    onChange={e => setYatraName(e.target.value)} 
                    placeholder="e.g. Shyam Sundar Sharma" 
                    required 
                  />
                </div>

                <div className="pl-input-group">
                  <label>WhatsApp / Contact Number</label>
                  <input 
                    type="tel" 
                    value={yatraPhone} 
                    onChange={e => setYatraPhone(e.target.value)} 
                    placeholder="+91 98765 43210" 
                    required 
                  />
                </div>

                <div style={{ background: '#fdfbf7', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#64748b' }}>Total Estimated Amount:</span>
                  <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f59e0b' }}>
                    ₹{(selectedYatra.price * yatraPilgrims).toLocaleString('en-IN')}
                  </strong>
                </div>

                <button type="submit" className="pl-btn-haven-primary" style={{ height: '48px', width: '100%', fontSize: '0.95rem', background: '#0f172a', color: '#ffffff', justifyContent: 'center' }}>
                  <MessageCircle size={18} /> Confirm & Dispatch on WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
