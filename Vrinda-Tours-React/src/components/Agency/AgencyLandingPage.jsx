import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Shield, CheckCircle2, ChevronRight, ChevronDown, Phone, User, 
  MapPin, Navigation, ArrowRight, X, Sparkles, 
  Clock, TrendingUp, Check, ShieldCheck, AlertCircle, LogIn, HeartHandshake,
  Zap, ArrowUpRight, ArrowLeft, CheckSquare, Award, BadgePercent, Sparkle,
  Mail, Lock, Eye, EyeOff, Bus, Users, Flag, Map, Car, Building2, UtensilsCrossed
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { validatePhoneNumber } from '../../utils/phoneValidator';
import './AgencyLandingPage.css';

export const AgencyGraphic = ({ type = '', size = 22 }) => {
  if (type.includes('Guide')) return <Flag size={size} />;
  if (type.includes('Tempo') || type.includes('Bus') || type.includes('Fleet')) return <Bus size={size} />;
  if (type.includes('Planner') || type.includes('Custom')) return <Map size={size} />;
  return <Compass size={size} />;
};

export const AGENCY_TYPES = [
  {
    id: '84 Kos Parikrama Agency',
    label: '84 Kos Parikrama Agency',
    desc: 'Complete 84 Kos Braj Parikrama packages with stay & food',
    category: '84 KOS YATRA',
    earningEst: '₹80,000–₹3,00,000 / mo',
    tripRate: '3–8 Yatra Groups / Mo'
  },
  {
    id: 'Certified Braj Dham Guide',
    label: 'Temple Guide & Walks',
    desc: 'Historical & spiritual darshan walks for families & VIPs',
    category: 'SACRED GUIDE',
    earningEst: '₹2,000–₹5,500 / day',
    tripRate: '2–4 Guided Tours / Day'
  },
  {
    id: 'Tempo Traveller & Bus Fleet',
    label: 'Pilgrim Fleet & Tempo',
    desc: '9 to 26-seater AC tempo travellers and luxury bus fleet',
    category: 'PILGRIM FLEET',
    earningEst: '₹60,000–₹2,20,000 / mo',
    tripRate: '10–25 Outstation Trips / Mo'
  },
  {
    id: 'Custom Yatra Planner',
    label: 'Custom Yatra Packages',
    desc: 'End-to-end Vrindavan, Govardhan & Barsana holiday tours',
    category: 'TOUR PLANNER',
    earningEst: '₹50,000–₹1,90,000 / mo',
    tripRate: '8–18 Package Bookings / Mo'
  }
];

export const AGENCY_TOURS = [
  '84 Kos Braj Parikrama',
  'Vrindavan 7 Main Mandir Darshan',
  'Giriraj Govardhan Parikrama',
  'Barsana & Nandgaon Darshan',
  'Yamuna Aarti & Sacred Boat Tour',
  'Mathura Janmabhoomi & Gokul',
  'VIP Fast-Track Temple Darshan',
  'Custom Corporate & Family Yatra'
];

export const FLEET_SIZES = ['1–3 Vehicles / Guides', '4–10 Fleet', '10–25 Fleet', '25+ Large Fleet'];

const OPERATING_ZONES = [
  {
    id: 'All Braj Region',
    name: 'All Braj Region (पूरा ब्रज)',
    simpleName: 'All Braj Region',
    hindi: 'पूरा ब्रज धाम',
    hotspots: '84 Kos & Inter-Dham Trips'
  },
  {
    id: 'Vrindavan',
    name: 'Vrindavan (वृंदावन)',
    simpleName: 'Vrindavan',
    hindi: 'वृंदावन',
    hotspots: 'Bankey Bihari, ISKCON, Prem Mandir'
  },
  {
    id: 'Mathura',
    name: 'Mathura (मथुरा)',
    simpleName: 'Mathura',
    hindi: 'मथुरा',
    hotspots: 'Mathura Station & Janmabhoomi'
  },
  {
    id: 'Govardhan',
    name: 'Govardhan (गोवर्धन)',
    simpleName: 'Govardhan',
    hindi: 'गोवर्धन',
    hotspots: 'Giriraj Parikrama & Daan Ghati'
  },
  {
    id: 'Barsana',
    name: 'Barsana (बरसाना)',
    simpleName: 'Barsana',
    hindi: 'बरसाना',
    hotspots: 'Radha Rani Mandir & Nandgaon'
  }
];

export default function AgencyLandingPage({ 
  onClose, 
  onOpenAgencyCompanion,
  onOpenDriverPage,
  onOpenHotelPage,
  onOpenRestaurantPage
}) {
  const [activeView, setActiveView] = useState('landing'); // 'landing' | 'wizard'
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal/Auth, 2: Agency & Packages, 3: Zone & Confirm
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [regSessionId] = useState(() => 'areg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    agencyType: '84 Kos Parikrama Agency',
    fleetSize: '4–10 Fleet',
    agencyTours: ['84 Kos Braj Parikrama', 'Vrindavan 7 Main Mandir Darshan', 'Giriraj Govardhan Parikrama'],
    zone: 'All Braj Region (पूरा ब्रज)',
    googleVerified: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login Form State
  const [loginMode, setLoginMode] = useState('phone'); // 'phone' | 'email'
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Portal Switcher Dropdown State
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const portalDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (portalDropdownRef.current && !portalDropdownRef.current.contains(e.target)) {
        setPortalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Floating "Register Now" Pill on Scroll State
  const [showFloatingPill, setShowFloatingPill] = useState(false);
  const mainBodyRef = useRef(null);

  const handleBodyScroll = () => {
    if (activeView !== 'landing' || !mainBodyRef.current) {
      if (showFloatingPill) setShowFloatingPill(false);
      return;
    }

    const scrollContainer = mainBodyRef.current;
    const scrollTop = scrollContainer.scrollTop;

    // Show only after scrolling past hero section (~260px)
    if (scrollTop < 260) {
      setShowFloatingPill(false);
      return;
    }

    // Check if FAQ section is reached
    const faqEl = scrollContainer.querySelector('#faq');
    if (faqEl) {
      const faqRect = faqEl.getBoundingClientRect();
      // If FAQ top reaches near the viewport bottom (within 90px) or is currently visible, hide the pill
      if (faqRect.top <= window.innerHeight - 90) {
        setShowFloatingPill(false);
        return;
      }
    }

    setShowFloatingPill(true);
  };

  const selectedAgencyObj = AGENCY_TYPES.find(a => a.id === regForm.agencyType) || AGENCY_TYPES[0];

  const toggleTour = (tour) => {
    setRegForm(prev => {
      const currentList = prev.agencyTours || [];
      const exists = currentList.includes(tour);
      const updatedList = exists ? currentList.filter(i => i !== tour) : [...currentList, tour];
      return { ...prev, agencyTours: updatedList };
    });
  };

  // Check and process return from Google OAuth
  useEffect(() => {
    let isMounted = true;
    const checkGoogleAuthReturn = async () => {
      try {
        const rawPending = sessionStorage.getItem('vt_pending_agency_reg');
        if (!rawPending) return;

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          sessionStorage.removeItem('vt_pending_agency_reg');

          const user = session.user;
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name || 'Travel Agency Partner';
          const googleEmail = user.email || '';
          
          let pendingData = {};
          try { pendingData = JSON.parse(rawPending); } catch (e) {}

          if (pendingData.intent === 'step1_google_login' || !pendingData.completed) {
            setRegForm(prev => ({
              ...prev,
              name: googleName,
              email: googleEmail,
              phone: pendingData.phone || prev.phone,
              googleVerified: true
            }));
            setActiveView('wizard');
            setCurrentStep(2);

            try {
              await supabase.from('agency_registrations').upsert({
                id: pendingData.regSessionId || ('areg_' + Date.now()),
                step: 1,
                agency_name: googleName,
                contact_person: googleName,
                phone: pendingData.phone || '',
                email: googleEmail,
                status: 'step_1_google_verified',
                completed: false,
                metadata: {
                  auth_provider: 'google',
                  google_email: googleEmail,
                  google_id: user.id
                },
                updated_at: new Date().toISOString()
              });
            } catch (syncErr) {
              console.warn('Agency registration Supabase sync fallback:', syncErr);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Google auth check notice:', err);
      }
    };

    checkGoogleAuthReturn();
    return () => { isMounted = false; };
  }, [onOpenAgencyCompanion]);

  // Helper to sync registration progress to Supabase continuously
  const syncProgressToSupabase = async (stepNumber, additionalData = {}) => {
    try {
      const phoneValidation = validatePhoneNumber(regForm.phone);
      const cleanPhone = phoneValidation.clean || regForm.phone;
      
      const payload = {
        id: regSessionId,
        step: stepNumber,
        agency_name: regForm.name.trim() || null,
        contact_person: regForm.name.trim() || null,
        phone: cleanPhone || null,
        email: regForm.email.trim() || null,
        agency_type: regForm.agencyType,
        fleet_size: regForm.fleetSize,
        tour_packages: regForm.agencyTours || [],
        zone: regForm.zone || 'All Braj Region',
        status: stepNumber === 3 ? 'completed' : `step_${stepNumber}_completed`,
        completed: stepNumber === 3,
        metadata: {
          googleVerified: regForm.googleVerified || false,
          ...additionalData
        },
        updated_at: new Date().toISOString()
      };

      try {
        localStorage.setItem('vt_agency_reg_' + regSessionId, JSON.stringify(payload));
      } catch (e) {}

      const { error } = await supabase.from('agency_registrations').upsert(payload);
      if (error) {
        if (error.status !== 403 && error.code !== '42P01') {
          console.warn('agency_registrations sync step ' + stepNumber + ' notice:', error.message);
        }
      }
    } catch (err) {
      console.warn('agency_registrations sync fallback:', err?.message || err);
    }
  };

  // 1-Tap Google Sign In for Step 1
  const handleGoogleSignInStep1 = async () => {
    setRegError('');
    setIsSubmitting(true);
    try {
      sessionStorage.setItem('vt_pending_agency_reg', JSON.stringify({
        regSessionId,
        phone: regForm.phone,
        agencyType: regForm.agencyType,
        fleetSize: regForm.fleetSize,
        zone: regForm.zone,
        intent: 'step1_google_login'
      }));

      await syncProgressToSupabase(1, {
        agency_type: regForm.agencyType,
        status: 'google_auth_initiated'
      });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google registration error:', err);
      setRegError(err.message || 'Google registration is temporarily unavailable. Please fill in details directly below.');
      setIsSubmitting(false);
    }
  };

  // Step 1 Validation & Proceed
  const handleStep1Next = async (e) => {
    e.preventDefault();
    setRegError('');
    
    if (!regForm.name.trim() || regForm.name.trim().length < 2) {
      setRegError('Please enter agency or contact person name');
      return;
    }

    if (!regForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      setRegError('Please enter a valid email address for your agency account');
      return;
    }

    const phoneValidation = validatePhoneNumber(regForm.phone);
    if (!phoneValidation.isValid) {
      setRegError(phoneValidation.message || 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!regForm.googleVerified && (!regForm.password || regForm.password.length < 6)) {
      setRegError('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    if (!regForm.googleVerified && regForm.password) {
      try {
        const { error: signUpErr } = await supabase.auth.signUp({
          email: regForm.email.trim(),
          password: regForm.password,
          options: {
            data: {
              full_name: regForm.name.trim(),
              phone: phoneValidation.clean || regForm.phone,
              role: 'agency'
            }
          }
        });
        if (signUpErr && !signUpErr.message.includes('already registered')) {
          console.warn('Supabase auth signup notice:', signUpErr.message);
        }
      } catch (authErr) {
        console.warn('Supabase auth signup exception:', authErr);
      }
    }

    setIsSubmitting(false);

    await syncProgressToSupabase(1, {
      email: regForm.email.trim(),
      google_verified: regForm.googleVerified
    });
    setCurrentStep(2);
  };

  // Step 2 Proceed
  const handleStep2Next = (e) => {
    e.preventDefault();
    syncProgressToSupabase(2);
    setCurrentStep(3);
  };

  // Final Registration Submit
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setIsSubmitting(true);

    try {
      const phoneValidation = validatePhoneNumber(regForm.phone);
      const cleanPhone = phoneValidation.clean || regForm.phone;
      const newAgencyId = 'a_' + Date.now();

      await syncProgressToSupabase(3, {
        status: 'completed',
        completed: true
      });

      try {
        await supabase.from('partners').upsert({
          id: newAgencyId,
          name: regForm.name.trim(),
          phone: cleanPhone,
          email: regForm.email.trim(),
          category: 'agency',
          role_details: `🚩 ${regForm.agencyType} • ${regForm.fleetSize} • ${regForm.zone.split(' ')[0]}`,
          rating: 5.0,
          status: 'Pending Admin Verification',
          verified: false,
          category_locked: false,
          photo_url: `https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400`,
          metadata: {
            agencyType: regForm.agencyType,
            fleetSize: regForm.fleetSize,
            tourPackages: regForm.agencyTours,
            zone: regForm.zone,
            email: regForm.email.trim()
          },
          created_at: new Date().toISOString()
        });
      } catch (pErr) {
        console.warn('partners table notice:', pErr);
      }

      try {
        await addDoc(collection(firestore, 'agencies'), {
          agencyName: regForm.name.trim(),
          contactPerson: regForm.name.trim(),
          phone: cleanPhone,
          email: regForm.email.trim(),
          agencyType: regForm.agencyType,
          fleetSize: regForm.fleetSize,
          tourPackages: regForm.agencyTours,
          zone: regForm.zone,
          rating: 5.0,
          status: 'pending_verification',
          verified: false,
          createdAt: new Date().toISOString()
        });
      } catch (fbErr) {
        console.warn('Firestore backup notice:', fbErr);
      }

      sessionStorage.setItem('vt_partner_id', newAgencyId);
      sessionStorage.setItem('vt_partner_role', 'agency');
      
      setRegSuccess(true);
      setTimeout(() => {
        if (onOpenAgencyCompanion) {
          onOpenAgencyCompanion(newAgencyId, 'agency');
        }
      }, 1200);

    } catch (err) {
      console.error('Registration error:', err);
      setRegError('Could not complete registration. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Agency Sign In
  const handleAgencyLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginMode === 'email') {
      if (!loginEmail || !loginPassword) {
        setLoginError('Please enter your email and password');
        return;
      }
      setIsLoggingIn(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword
        });
        if (error) throw error;
        const aid = data.user?.id ? `a_${data.user.id.slice(0, 8)}` : `a_${Date.now()}`;
        sessionStorage.setItem('vt_partner_id', aid);
        sessionStorage.setItem('vt_partner_role', 'agency');
        setIsLoggingIn(false);
        if (onOpenAgencyCompanion) {
          onOpenAgencyCompanion(aid, 'agency');
        }
      } catch (err) {
        setLoginError(err.message || 'Login failed. Please check your credentials.');
        setIsLoggingIn(false);
      }
      return;
    }

    const phoneVal = validatePhoneNumber(loginPhone);
    if (!phoneVal.isValid) {
      setLoginError(phoneVal.message || 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoggingIn(true);
    const cleanNumber = phoneVal.clean.replace(/\D/g, '').slice(-10);
    const agencyId = `agency_${cleanNumber}`;
    sessionStorage.setItem('vt_partner_id', agencyId);
    sessionStorage.setItem('vt_partner_role', 'agency');
    setIsLoggingIn(false);
    if (onOpenAgencyCompanion) {
      onOpenAgencyCompanion(agencyId, 'agency');
    }
  };

  return (
    <div className="dmd-root">
      
      {/* 0. AUTO-CONTINUOUS TICKER / ANNOUNCEMENT BAR */}
      <div className="dmd-announcement-bar">
        <div className="dmd-announcement-track-wrap">
          <div className="dmd-announcement-track">
            {/* Copy 1 */}
            <div className="dmd-announcement-list">
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🚩 <strong>84 Kos Parikrama Season Open:</strong> 320+ devotee family &amp; group tour inquiries active this week</span>
                <span className="highlight-green">● High Inquiries</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🚌 <strong>0% Agency Commission:</strong> Direct pilgrim connections for tempo travelers, buses &amp; guides</span>
                <span className="dmd-announcement-action">Direct Leads</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🛕 <strong>Custom Temple Circuits:</strong> Feature your Banke Bihari, Barsana, Nandgaon &amp; Govardhan packages</span>
                <span className="highlight-gold">Direct Connect</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>📞 <strong>Instant WhatsApp Leads:</strong> High-intent devotee group inquiries delivered straight to your booking desk</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🤝 <strong>Empowering Local Operators:</strong> Partner with Vrinda Sacred Dham Seva with ₹0 registration fee</span>
                <span className="dmd-announcement-action">Register Agency →</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
            </div>

            {/* Copy 2 (Identical for seamless infinite loop) */}
            <div className="dmd-announcement-list" aria-hidden="true">
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🚩 <strong>84 Kos Parikrama Season Open:</strong> 320+ devotee family &amp; group tour inquiries active this week</span>
                <span className="highlight-green">● High Inquiries</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🚌 <strong>0% Agency Commission:</strong> Direct pilgrim connections for tempo travelers, buses &amp; guides</span>
                <span className="dmd-announcement-action">Direct Leads</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🛕 <strong>Custom Temple Circuits:</strong> Feature your Banke Bihari, Barsana, Nandgaon &amp; Govardhan packages</span>
                <span className="highlight-gold">Direct Connect</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>📞 <strong>Instant WhatsApp Leads:</strong> High-intent devotee group inquiries delivered straight to your booking desk</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🤝 <strong>Empowering Local Operators:</strong> Partner with Vrinda Sacred Dham Seva with ₹0 registration fee</span>
                <span className="dmd-announcement-action">Register Agency →</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="dmd-top-nav">
        <div className="dmd-nav-container">
          
          {/* Left: Brand + Category Dropdown Switcher */}
          <div className="dmd-brand-block" ref={portalDropdownRef}>
            <button 
              type="button" 
              className="dmd-brand-pill-btn"
              onClick={() => setPortalDropdownOpen(prev => !prev)}
              aria-expanded={portalDropdownOpen}
              title="Switch Partner Portal"
            >
              <div className="dmd-brand-mark">
                <Compass size={15} strokeWidth={2.2} />
              </div>
              <div className="dmd-brand-info">
                <span className="dmd-brand-company">Vrinda</span>
                <span className="dmd-brand-category">Yatra</span>
              </div>
              <ChevronDown size={14} className={`dmd-brand-chevron ${portalDropdownOpen ? 'open' : ''}`} />
            </button>

            {portalDropdownOpen && (
              <div className="dmd-portal-popover">
                <div className="dmd-popover-head">Switch Partner Portal</div>
                <div className="dmd-popover-list">
                  <button 
                    type="button" 
                    className="dmd-popover-item" 
                    onClick={() => { setPortalDropdownOpen(false); if (onOpenDriverPage) onOpenDriverPage(); }}
                  >
                    <div className="dmd-popover-icon-box">
                      <Car size={16} />
                    </div>
                    <div className="dmd-popover-text">
                      <strong>Drivers &amp; Cabs</strong>
                      <span>0% commission pilgrim rides</span>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    className="dmd-popover-item"
                    onClick={() => { setPortalDropdownOpen(false); if (onOpenHotelPage) onOpenHotelPage(); }}
                  >
                    <div className="dmd-popover-icon-box">
                      <Building2 size={16} />
                    </div>
                    <div className="dmd-popover-text">
                      <strong>Hotels &amp; Ashrams</strong>
                      <span>Direct devotee room &amp; stay bookings</span>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    className="dmd-popover-item"
                    onClick={() => { setPortalDropdownOpen(false); if (onOpenRestaurantPage) onOpenRestaurantPage(); }}
                  >
                    <div className="dmd-popover-icon-box">
                      <UtensilsCrossed size={16} />
                    </div>
                    <div className="dmd-popover-text">
                      <strong>Dining &amp; Bhojnalaya</strong>
                      <span>Pure sattvic food &amp; prasad orders</span>
                    </div>
                  </button>

                  <button type="button" className="dmd-popover-item active" onClick={() => setPortalDropdownOpen(false)}>
                    <div className="dmd-popover-icon-box">
                      <Compass size={16} />
                    </div>
                    <div className="dmd-popover-text">
                      <strong>Travel Agencies &amp; Guides</strong>
                      <span>84 Kos Parikrama &amp; group yatras</span>
                    </div>
                    <Check size={14} className="dmd-popover-check" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center: Clean Editorial Navigation Links */}
          <nav className="dmd-nav-center">
            <button 
              type="button" 
              className={`dmd-nav-link ${activeView === 'landing' ? 'active' : ''}`}
              onClick={() => setActiveView('landing')}
            >
              Overview
            </button>
            <a 
              href="#tours" 
              className="dmd-nav-link"
              onClick={() => setActiveView('landing')}
            >
              Yatra Segments
            </a>
            <a 
              href="#benefits" 
              className="dmd-nav-link"
              onClick={() => setActiveView('landing')}
            >
              Benefits
            </a>
            <a 
              href="#territories" 
              className="dmd-nav-link"
              onClick={() => setActiveView('landing')}
            >
              Territories
            </a>
            <a 
              href="#faq" 
              className="dmd-nav-link"
              onClick={() => setActiveView('landing')}
            >
              FAQ
            </a>
            <button 
              type="button" 
              className={`dmd-nav-link-pill ${activeView === 'wizard' ? 'active' : ''}`}
              onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}
            >
              <Zap size={13} fill="#facc15" color="#facc15" />
              <span>Stepped Register</span>
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="dmd-nav-right">
            <button 
              type="button" 
              className="dmd-btn-user-link" 
              onClick={onClose}
              title="Go to Devotee / User Landing Page"
            >
              <Compass size={14} />
              <span>User App</span>
            </button>
            <button 
              type="button" 
              className="dmd-btn-secondary"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className="dmd-btn-primary"
              onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}
            >
              Pre-Register Free →
            </button>
          </div>

        </div>
      </header>

      {/* MAIN BODY */}
      <main className="dmd-main-body" ref={mainBodyRef} onScroll={handleBodyScroll}>
        
        {/* VIEW 1: FULL-WIDTH RESPONSIVE STEPPED WIZARD */}
        {activeView === 'wizard' ? (
          <section className="dmd-wizard-section">
            <div className="dmd-wizard-container">
              
              {/* Stepper Progress Header */}
              <div className="dmd-stepper-header">
                <div className="dmd-stepper-steps">
                  <div className={`dmd-step-node ${currentStep >= 1 ? 'active' : ''}`}>
                    <span className="dmd-step-idx">01</span>
                    <span className="dmd-step-name">Account</span>
                  </div>
                  <div className={`dmd-step-connector ${currentStep >= 2 ? 'active' : ''}`} />
                  <div className={`dmd-step-node ${currentStep >= 2 ? 'active' : ''}`}>
                    <span className="dmd-step-idx">02</span>
                    <span className="dmd-step-name">Yatra</span>
                  </div>
                  <div className={`dmd-step-connector ${currentStep >= 3 ? 'active' : ''}`} />
                  <div className={`dmd-step-node ${currentStep >= 3 ? 'active' : ''}`}>
                    <span className="dmd-step-idx">03</span>
                    <span className="dmd-step-name">Zone</span>
                  </div>
                </div>
              </div>

              {/* Wizard Multi-Column Layout */}
              <div className="dmd-wizard-grid">
                
                {/* Left Dynamic WOW Summary Card */}
                <div className="dmd-wizard-summary-col">
                  <div className="dmd-summary-card dmd-wow-card">
                    
                    {/* Live Agency ID Hologram */}
                    <div className="dmd-id-card-live">
                      <div className="dmd-id-card-top">
                        <span className="dmd-id-pill">PRE-APPROVED AGENCY</span>
                        <span className="dmd-id-num">#VT-842</span>
                      </div>
                      <div className="dmd-id-card-body">
                        <div className="dmd-id-avatar">
                          <AgencyGraphic type={regForm.agencyType} size={28} />
                        </div>
                        <div className="dmd-id-meta">
                          <strong>{regForm.name || 'Your Agency Name'}</strong>
                          <span>{regForm.phone ? `+91 ${regForm.phone}` : '+91 Mobile Active'}</span>
                          <span className="dmd-id-vehicle-tag">{regForm.agencyType} • {regForm.fleetSize}</span>
                        </div>
                      </div>
                    </div>

                    <div className="dmd-earning-projection-box">
                      <span className="dmd-proj-title">ESTIMATED REVENUE</span>
                      <div className="dmd-proj-amount">{selectedAgencyObj.earningEst}</div>
                      <div className="dmd-proj-sub">{selectedAgencyObj.tripRate}</div>
                    </div>

                    <div className="dmd-summary-checklist">
                      <div className="dmd-check-item">
                        <CheckCircle2 size={16} className="dmd-check-icon" />
                        <span>0% Commission Forever</span>
                      </div>
                      <div className="dmd-check-item">
                        <CheckCircle2 size={16} className="dmd-check-icon" />
                        <span>Direct Yatra Group Bookings</span>
                      </div>
                      <div className="dmd-check-item">
                        <CheckCircle2 size={16} className="dmd-check-icon" />
                        <span>Certified Partner Badge</span>
                      </div>
                    </div>

                    <div className="dmd-partner-hotline">
                      <Phone size={14} />
                      <span>Helpline: +91 98765 43210</span>
                    </div>

                  </div>
                </div>

                {/* Right Interactive Form Column */}
                <div className="dmd-wizard-form-col">
                  
                  {/* STEP 1: PERSONAL / AUTH PROFILE */}
                  {currentStep === 1 && (
                    <div className="dmd-step-card dmd-fade-in">
                      <div className="dmd-card-header">
                        <span className="dmd-card-eyebrow">STEP 1 OF 3</span>
                        <h2 className="dmd-step-title">Create Account</h2>
                        <p className="dmd-step-subtitle">1-Tap sign in or fill details to start.</p>
                      </div>

                      {regError && (
                        <div className="dmd-alert-banner error">
                          <AlertCircle size={18} />
                          <span>{regError}</span>
                        </div>
                      )}

                      {/* Upfront 1-Tap Google Login */}
                      <button
                        type="button"
                        className="dmd-google-auth-btn"
                        onClick={handleGoogleSignInStep1}
                        disabled={isSubmitting}
                      >
                        <svg className="dmd-google-icon" viewBox="0 0 24 24" width="18" height="18">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Continue with Google</span>
                        <span className="dmd-google-badge">1-Tap</span>
                      </button>

                      <div className="dmd-auth-divider">
                        <span>OR DIRECT</span>
                      </div>

                      <form onSubmit={handleStep1Next} className="dmd-step-form">
                        <div className="dmd-form-group">
                          <label className="dmd-label">Agency / Contact Name</label>
                          <div className="dmd-input-wrap">
                            <Compass size={18} className="dmd-input-icon" />
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Shri Braj 84 Kos Yatra Tours" 
                              className="dmd-input dmd-input-large"
                              value={regForm.name}
                              onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="dmd-form-group">
                          <label className="dmd-label">Email Address</label>
                          <div className="dmd-input-wrap">
                            <Mail size={18} className="dmd-input-icon" />
                            <input 
                              type="email" 
                              required 
                              placeholder="yatra@brajtours.com" 
                              className="dmd-input dmd-input-large"
                              value={regForm.email}
                              onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                            />
                          </div>
                        </div>

                        {!regForm.googleVerified && (
                          <div className="dmd-form-group">
                            <label className="dmd-label">Password</label>
                            <div className="dmd-input-wrap">
                              <Lock size={18} className="dmd-input-icon" />
                              <input 
                                type={showPassword ? 'text' : 'password'} 
                                required 
                                placeholder="Min. 6 characters" 
                                className="dmd-input dmd-input-large"
                                value={regForm.password}
                                onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                              />
                              <button 
                                type="button" 
                                className="dmd-eye-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="dmd-form-group">
                          <label className="dmd-label">Inquiry Mobile / WhatsApp</label>
                          <div className="dmd-input-wrap dmd-phone-input-wrap">
                            <span className="dmd-phone-prefix">+91</span>
                            <input 
                              type="tel" 
                              required 
                              placeholder="98765 43210" 
                              className="dmd-input dmd-input-large dmd-input-phone"
                              value={regForm.phone}
                              maxLength={12}
                              onChange={e => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '') })}
                            />
                          </div>
                          <span className="dmd-input-hint">For group yatra leads</span>
                        </div>

                        <div className="dmd-form-actions">
                          <button 
                            type="submit" 
                            className="dmd-btn-primary dmd-btn-large dmd-btn-full"
                            disabled={isSubmitting}
                          >
                            <span>Continue</span>
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* STEP 2: AGENCY & PACKAGES */}
                  {currentStep === 2 && (
                    <div className="dmd-step-card dmd-fade-in">
                      <div className="dmd-card-header">
                        <span className="dmd-card-eyebrow">STEP 2 OF 3</span>
                        <h2 className="dmd-step-title">Yatra Details</h2>
                        <p className="dmd-step-subtitle">Select agency category and circuits.</p>
                      </div>

                      <form onSubmit={handleStep2Next} className="dmd-step-form">
                        
                        <div className="dmd-form-group">
                          <label className="dmd-label">Agency Category</label>
                          <div className="dmd-catalog-card-selector">
                            {AGENCY_TYPES.map(a => (
                              <div 
                                key={a.id} 
                                className={`dmd-catalog-option-card ${regForm.agencyType === a.id ? 'active' : ''}`}
                                onClick={() => setRegForm({ ...regForm, agencyType: a.id })}
                              >
                                <div className="dmd-v-card-top-row">
                                  <div className="dmd-v-card-icon">
                                    <AgencyGraphic type={a.id} size={22} />
                                  </div>
                                  <span className="dmd-v-card-cat">{a.category}</span>
                                </div>
                                <div className="dmd-v-card-title">{a.label}</div>
                                <div className="dmd-v-card-desc">{a.desc}</div>
                                <div className="dmd-v-card-earning">{a.earningEst}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="dmd-form-group">
                          <label className="dmd-label">Fleet / Guide Capacity</label>
                          <div className="dmd-chip-group">
                            {FLEET_SIZES.map(fs => (
                              <button 
                                type="button" 
                                key={fs} 
                                className={`dmd-select-chip ${regForm.fleetSize === fs ? 'active' : ''}`}
                                onClick={() => setRegForm({ ...regForm, fleetSize: fs })}
                              >
                                {fs}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="dmd-form-group">
                          <label className="dmd-label">Yatra Packages</label>
                          <div className="dmd-multi-chip-group">
                            {AGENCY_TOURS.map(tour => {
                              const isSelected = (regForm.agencyTours || []).includes(tour);
                              return (
                                <button
                                  type="button"
                                  key={tour}
                                  className={`dmd-multi-chip ${isSelected ? 'selected' : ''}`}
                                  onClick={() => toggleTour(tour)}
                                >
                                  {isSelected ? <Check size={14} className="dmd-multi-chip-check" /> : <span>+</span>}
                                  <span>{tour}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="dmd-form-actions dmd-btn-row">
                          <button 
                            type="button" 
                            className="dmd-btn-secondary dmd-btn-large"
                            onClick={() => setCurrentStep(1)}
                          >
                            <ArrowLeft size={18} />
                            <span>Back</span>
                          </button>
                          <button 
                            type="submit" 
                            className="dmd-btn-primary dmd-btn-large"
                          >
                            <span>Continue</span>
                            <ArrowRight size={18} />
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                  {/* STEP 3: OPERATING ZONE & FINAL CONFIRMATION */}
                  {currentStep === 3 && (
                    <div className="dmd-step-card dmd-fade-in">
                      <div className="dmd-card-header">
                        <span className="dmd-card-eyebrow">STEP 3 OF 3</span>
                        <h2 className="dmd-step-title">Territory &amp; Confirm</h2>
                        <p className="dmd-step-subtitle">Pick primary yatra territory.</p>
                      </div>

                      {regError && (
                        <div className="dmd-alert-banner error">
                          <AlertCircle size={18} />
                          <span>{regError}</span>
                        </div>
                      )}

                      <form onSubmit={handleFinalSubmit} className="dmd-step-form">
                        
                        <div className="dmd-form-group">
                          <label className="dmd-label">Select Territory</label>
                          <div className="dmd-zone-card-list">
                            {OPERATING_ZONES.map(z => (
                              <div 
                                key={z.id}
                                className={`dmd-zone-item-card ${regForm.zone === z.name ? 'active' : ''}`}
                                onClick={() => setRegForm({ ...regForm, zone: z.name })}
                              >
                                <div className="dmd-zone-item-left">
                                  <div className="dmd-zone-radio-circle">
                                    {regForm.zone === z.name && <div className="dmd-zone-radio-dot" />}
                                  </div>
                                  <div className="dmd-zone-text-group">
                                    <div className="dmd-zone-primary-row">
                                      <strong className="dmd-zone-eng">{z.simpleName}</strong>
                                      <span className="dmd-zone-hindi-badge">{z.hindi}</span>
                                    </div>
                                    <span className="dmd-zone-hotspots">{z.hotspots}</span>
                                  </div>
                                </div>
                                <MapPin size={18} className="dmd-zone-pin-icon" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 0% Commission Guarantee Callout */}
                        <div className="dmd-zero-comm-callout">
                          <div className="dmd-callout-icon">
                            <ShieldCheck size={24} />
                          </div>
                          <div className="dmd-callout-text">
                            <strong>0% Commission Guaranteed</strong>
                            <p>Keep 100% of all yatra and group package bookings directly. ₹0 fee.</p>
                          </div>
                        </div>

                        <div className="dmd-form-actions dmd-btn-row">
                          <button 
                            type="button" 
                            className="dmd-btn-secondary dmd-btn-large"
                            onClick={() => setCurrentStep(2)}
                          >
                            <ArrowLeft size={18} />
                            <span>Back</span>
                          </button>
                          <button 
                            type="submit" 
                            className="dmd-btn-primary dmd-btn-large dmd-btn-submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <span>Activating Profile...</span>
                            ) : (
                              <>
                                <Zap size={18} fill="#facc15" color="#facc15" />
                                <span>Complete Registration</span>
                              </>
                            )}
                          </button>
                        </div>

                      </form>
                    </div>
                  )}

                </div>

              </div>

            </div>
          </section>
        ) : (
          /* VIEW 2: EDITORIAL OVERVIEW LANDING PAGE */
          <>
            {/* HERO SECTION */}
            <section className="dmd-hero-section">
              <div className="dmd-container">
                <div className="dmd-hero-grid">
                  
                  {/* Left Hero Content */}
                  <div className="dmd-hero-content">
                    <span className="dmd-eyebrow">
                      श्री धाम ब्रज सेवा • YATRA PACKAGES
                    </span>

                    <h1 className="dmd-display-lg">
                      Guide Devotees Through Sacred Braj. <br className="dmd-desktop-br" />Grow Your Yatra Business.
                    </h1>

                    <p className="dmd-lead-text">
                      Organize 84 Kos Parikramas, Temple Darshans, and bus tours. Receive high-intent devotee groups with zero platform cut.
                    </p>

                    {/* Metrics Strip */}
                    <div className="dmd-metrics-strip">
                      <div className="dmd-metric-box">
                        <span className="dmd-metric-num">0%</span>
                        <span className="dmd-metric-sub">Tour Cut</span>
                      </div>
                      <div className="dmd-metric-box">
                        <span className="dmd-metric-num">100%</span>
                        <span className="dmd-metric-sub">Direct Inquiries</span>
                      </div>
                      <div className="dmd-metric-box">
                        <span className="dmd-metric-num">250+</span>
                        <span className="dmd-metric-sub">Group Yatras</span>
                      </div>
                    </div>

                    <div className="dmd-hero-actions">
                      <button 
                        type="button" 
                        className="dmd-btn-primary dmd-btn-large"
                        onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}
                      >
                        <span>Pre-Register Free</span>
                        <ArrowRight size={18} />
                      </button>
                      <button 
                        type="button" 
                        className="dmd-btn-secondary dmd-btn-large"
                        onClick={() => setShowLoginModal(true)}
                      >
                        <LogIn size={17} />
                        <span>Agency Sign In</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Visual Card with Fog & Coming Soon Tape */}
                  <div className="dmd-hero-card-col">
                    <div className="dmd-card dmd-interactive-preview">
                      <div className="dmd-preview-header">
                        <span className="dmd-card-eyebrow">YATRA NETWORK</span>
                        <span className="dmd-coming-soon-pill">
                          COMING SOON
                        </span>
                      </div>

                      <h2 className="dmd-card-title">84 Kos &amp; Group Tour Bookings</h2>
                      <p className="dmd-card-desc">Receive devotee group inquiries for Braj Darshan &amp; Parikrama yatras.</p>

                      {/* Fogged / Blurred Yatra Ticket */}
                      <div className="dmd-ticket-wrap-fog">
                        
                        <div className="dmd-dispatch-ticket dmd-fogged-ticket">
                          {/* Tour Details */}
                          <div className="dmd-route-stop">
                            <div className="dmd-stop-marker origin">
                              <div className="dmd-marker-circle" />
                            </div>
                            <div className="dmd-stop-details">
                              <div className="dmd-stop-name">Shri Braj 84 Kos Yatra Package</div>
                              <div className="dmd-stop-sub">7-Day Complete Parikrama • Stay, AC Bus &amp; Guide Included</div>
                            </div>
                          </div>

                          {/* Tour Track Line */}
                          <div className="dmd-route-track">
                            <div className="dmd-track-line" />
                            <div className="dmd-track-pill">
                              <span>Certified Yatra Dispatch • Direct Inquiries</span>
                            </div>
                          </div>

                          {/* Devotee Group Details */}
                          <div className="dmd-route-stop">
                            <div className="dmd-stop-marker destination">
                              <div className="dmd-marker-square" />
                            </div>
                            <div className="dmd-stop-details">
                              <div className="dmd-stop-name">Devotee Group (12 Pilgrims)</div>
                              <div className="dmd-stop-sub">Advance Group Booking • Direct Payment to Agency</div>
                            </div>
                          </div>

                          {/* Package Fare Preview */}
                          <div className="dmd-ticket-fare-row">
                            <div className="dmd-fare-col">
                              <span className="dmd-fare-label">PACKAGE FARE</span>
                              <span className="dmd-fare-amount">₹24,000</span>
                            </div>
                            <div className="dmd-commission-badge">
                              <ShieldCheck size={14} />
                              <span>100% Agency Keeps</span>
                            </div>
                          </div>
                        </div>

                        {/* Editorial Coming Soon Tape Badge */}
                        <div className="dmd-tape-overlay">
                          <div className="dmd-tape-strip">
                            <span>🚧 LAUNCHING SOON • 100% FREE</span>
                          </div>
                        </div>

                      </div>

                      <button 
                        type="button" 
                        className="dmd-btn-primary dmd-btn-full dmd-btn-large dmd-btn-bouncing-cta dmd-btn-exciting-row"
                        onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}
                      >
                        <div className="dmd-btn-exciting-left">
                          <Zap size={18} fill="#facc15" color="#facc15" />
                          <strong>Pre-Register (30s)</strong>
                        </div>
                        <div className="dmd-btn-exciting-right">
                          <span className="dmd-btn-free-tag">100% FREE</span>
                          <ArrowRight size={18} />
                        </div>
                      </button>
                      
                      <div className="dmd-zero-cost-note">
                        <CheckCircle2 size={14} />
                        <span>₹0 Fee • No Payment Needed</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* SECTION 2: SUPPORTED YATRA SERVICES */}
            <section className="dmd-section" id="tours">
              <div className="dmd-container">
                <div className="dmd-section-intro">
                  <span className="dmd-eyebrow">YATRA PACKAGES</span>
                  <h2 className="dmd-display-md">Supported Yatra &amp; Tour Segments</h2>
                  <p className="dmd-body">Whether you organize full 84 Kos Parikramas or operate tempo travellers and guide services, all partners are welcome.</p>
                </div>

                <div className="dmd-fleet-grid">
                  {AGENCY_TYPES.map(a => (
                    <div 
                      key={a.id} 
                      className="dmd-fleet-card dmd-fleet-spring"
                      onClick={() => {
                        setRegForm(prev => ({ ...prev, agencyType: a.id }));
                        setActiveView('wizard');
                        setCurrentStep(2);
                      }}
                    >
                      <div className="dmd-fleet-header">
                        <div className="dmd-fleet-icon-box">
                          <AgencyGraphic type={a.id} size={24} />
                        </div>
                        <span className="dmd-category-badge">{a.category}</span>
                      </div>
                      <h3 className="dmd-fleet-title">{a.label}</h3>
                      <p className="dmd-fleet-desc">{a.desc}</p>
                      <div className="dmd-fleet-earning-pill">{a.earningEst}</div>
                      <div className="dmd-fleet-footer">
                        <span>Register this agency</span>
                        <ArrowUpRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 3: COLOR-BLOCK SECTION */}
            <section className="dmd-section" id="benefits">
              <div className="dmd-container">
                <div className="dmd-color-block-cream">
                  <span className="dmd-eyebrow">AGENCY BENEFITS</span>
                  <h2 className="dmd-display-md">Built for Sacred Braj Yatra Seva</h2>
                  <p className="dmd-body">Empowering local yatra planners and guides with direct devotee group inquiries and zero percentage deductions.</p>

                  <div className="dmd-pillars-grid">
                    <div className="dmd-pillar-card">
                      <div className="dmd-pillar-icon">
                        <ShieldCheck size={28} />
                      </div>
                      <h3 className="dmd-pillar-title">0% Tour Commission Forever</h3>
                      <p className="dmd-pillar-desc">
                        No middleman fees on high-value yatra packages. 100% of the passenger package payments go straight to your agency.
                      </p>
                    </div>

                    <div className="dmd-pillar-card">
                      <div className="dmd-pillar-icon">
                        <HeartHandshake size={28} />
                      </div>
                      <h3 className="dmd-pillar-title">Direct Devotee Groups</h3>
                      <p className="dmd-pillar-desc">
                        Connect directly with families and yatra groups seeking authentic 84 Kos guides, tempo traveler charters, and custom itineraries.
                      </p>
                    </div>

                    <div className="dmd-pillar-card">
                      <div className="dmd-pillar-icon">
                        <Zap size={28} />
                      </div>
                      <h3 className="dmd-pillar-title">Verified Braj Tour Partner</h3>
                      <p className="dmd-pillar-desc">
                        Get verified on the Vrinda.Tours pilgrim portal with an official trust badge for spiritual credibility and safety.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: SACRED BRAJ OPERATING ZONES */}
            <section className="dmd-section" id="territories">
              <div className="dmd-container">
                <div className="dmd-section-intro">
                  <span className="dmd-eyebrow">TERRITORY COVERAGE</span>
                  <h2 className="dmd-display-md">Sacred Braj Operating Territories</h2>
                  <p className="dmd-body">Select where your agency operates or organizes yatra tours in Braj Dham.</p>
                </div>

                <div className="dmd-territories-grid">
                  {OPERATING_ZONES.map(z => (
                    <div 
                      key={z.id} 
                      className="dmd-territory-card"
                      onClick={() => {
                        setRegForm(prev => ({ ...prev, zone: z.name }));
                        setActiveView('wizard');
                        setCurrentStep(3);
                      }}
                    >
                      <div className="dmd-territory-main">
                        <div className="dmd-territory-header">
                          <span className="dmd-territory-name">{z.simpleName}</span>
                          <span className="dmd-territory-hindi-badge">{z.hindi}</span>
                        </div>
                        <div className="dmd-territory-hotspots">
                          <MapPin size={13} strokeWidth={2.2} />
                          <span>{z.hotspots}</span>
                        </div>
                      </div>
                      <div className="dmd-territory-action">
                        <span>Select Zone</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 5: FAQ ACCORDION */}
            <section className="dmd-section" id="faq">
              <div className="dmd-container">
                <div className="dmd-section-intro">
                  <span className="dmd-eyebrow">FREQUENTLY ASKED QUESTIONS</span>
                  <h2 className="dmd-display-md">Clear Answers for Yatra Agencies</h2>
                </div>

                <div className="dmd-faq-list">
                  {[
                    {
                      q: "Can individual certified guides register?",
                      a: "Yes. Individual spiritual guides, local historians, and tour operators are all eligible for free registration."
                    },
                    {
                      q: "How do devotees contact our agency?",
                      a: "Devotees inquire directly through your verified WhatsApp and direct mobile number with full package details."
                    },
                    {
                      q: "Are 84 Kos Parikramas supported during Adhik Maas / Kartika?",
                      a: "Yes. Special festival dispatches and seasonal yatra groups are given high priority visibility on the platform."
                    }
                  ].map((faq, idx) => (
                    <div 
                      key={idx} 
                      className={`dmd-faq-item ${openFaqIndex === idx ? 'open' : ''}`}
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                    >
                      <div className="dmd-faq-q-bar">
                        <h3 className="dmd-faq-q">{faq.q}</h3>
                        <ChevronDown size={18} className={`dmd-faq-chevron ${openFaqIndex === idx ? 'rotated' : ''}`} />
                      </div>
                      {openFaqIndex === idx && (
                        <p className="dmd-faq-a">{faq.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="dmd-footer">
              <div className="dmd-container dmd-footer-inner">
                <div className="dmd-footer-brand-section">
                  <div className="dmd-footer-brand-header">
                    <div className="dmd-brand-mark">
                      <Compass size={16} strokeWidth={2.2} />
                    </div>
                    <span className="dmd-brand-title">Vrinda. Yatra</span>
                  </div>
                  <p className="dmd-footer-copy">© 2026 Vrinda Vihar &amp; Sacred Braj Dham Seva · 100% Commission-Free Seva.</p>
                </div>
                <div className="dmd-footer-right">
                  <button 
                    type="button" 
                    className="dmd-btn-user-link" 
                    onClick={onClose}
                  >
                    <Compass size={14} />
                    <span>Return to User App</span>
                  </button>
                  <button 
                    type="button" 
                    className="dmd-btn-primary"
                    onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}
                  >
                    Register Free Now →
                  </button>
                </div>
              </div>
            </footer>
          </>
        )}

      </main>

      {/* REGISTRATION SUCCESS MODAL */}
      {regSuccess && (
        <div className="dmd-modal-backdrop">
          <div className="dmd-modal-dialog success">
            <div className="dmd-modal-icon-wrap success">
              <Sparkles size={36} color="#16a34a" />
            </div>
            <h2 className="dmd-modal-title">Jai Shri Radhe! Registration Complete</h2>
            <p className="dmd-modal-desc">
              Your travel agency profile has been registered with <strong>0% Commission Guaranteed</strong>.
            </p>
            <div className="dmd-id-card-success">
              <span className="dmd-id-pill">VERIFIED BRIJ AGENCY</span>
              <div className="dmd-id-name">{regForm.name}</div>
              <div className="dmd-id-phone">+91 {regForm.phone}</div>
              <div className="dmd-id-role">{regForm.agencyType} • {regForm.zone}</div>
            </div>
            <button 
              type="button" 
              className="dmd-btn-primary dmd-btn-large dmd-btn-full"
              onClick={() => {
                setRegSuccess(false);
                if (onOpenAgencyCompanion) {
                  onOpenAgencyCompanion(sessionStorage.getItem('vt_partner_id'), 'agency');
                }
              }}
            >
              Open Agency Companion Portal
            </button>
          </div>
        </div>
      )}

      {/* AGENCY SIGN IN MODAL */}
      {showLoginModal && (
        <div className="dmd-modal-backdrop">
          <div className="dmd-modal-dialog">
            <button 
              type="button" 
              className="dmd-modal-close-btn"
              onClick={() => setShowLoginModal(false)}
            >
              <X size={18} />
            </button>

            <div className="dmd-modal-header">
              <span className="dmd-card-eyebrow">AGENCY &amp; GUIDE ACCESS</span>
              <h2 className="dmd-modal-title">Sign In to Agency Portal</h2>
              <p className="dmd-modal-desc">Access your yatra bookings, devotee group inquiries, and tour itineraries.</p>
            </div>

            {loginError && (
              <div className="dmd-alert-banner error">
                <AlertCircle size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="dmd-login-mode-tabs">
              <button 
                type="button" 
                className={`dmd-login-tab-btn ${loginMode === 'phone' ? 'active' : ''}`}
                onClick={() => setLoginMode('phone')}
              >
                Mobile / OTP
              </button>
              <button 
                type="button" 
                className={`dmd-login-tab-btn ${loginMode === 'email' ? 'active' : ''}`}
                onClick={() => setLoginMode('email')}
              >
                Email &amp; Password
              </button>
            </div>

            <form onSubmit={handleAgencyLogin} className="dmd-step-form">
              {loginMode === 'phone' ? (
                <div className="dmd-form-group">
                  <label className="dmd-label">Registered 10-Digit Mobile Number</label>
                  <div className="dmd-input-wrap dmd-phone-input-wrap">
                    <span className="dmd-phone-prefix">+91</span>
                    <input 
                      type="tel" 
                      required 
                      placeholder="98765 43210" 
                      className="dmd-input dmd-input-large dmd-input-phone"
                      value={loginPhone}
                      maxLength={12}
                      onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="dmd-form-group">
                    <label className="dmd-label">Registered Email</label>
                    <div className="dmd-input-wrap">
                      <Mail size={18} className="dmd-input-icon" />
                      <input 
                        type="email" 
                        required 
                        placeholder="agency@example.com" 
                        className="dmd-input dmd-input-large"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="dmd-form-group">
                    <label className="dmd-label">Password</label>
                    <div className="dmd-input-wrap">
                      <Lock size={18} className="dmd-input-icon" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        placeholder="Enter password" 
                        className="dmd-input dmd-input-large"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="dmd-eye-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="dmd-btn-primary dmd-btn-large dmd-btn-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Verifying...' : 'Sign In to Agency Portal'}
              </button>
            </form>

            <div className="dmd-modal-footer-note">
              <span>New to Vrinda Yatra? </span>
              <button 
                type="button" 
                className="dmd-link-btn"
                onClick={() => {
                  setShowLoginModal(false);
                  setActiveView('wizard');
                  setCurrentStep(1);
                }}
              >
                Register Free in 30 Seconds →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUTE FLOATING "REGISTER NOW" PILL ON SCROLL */}
      <div className={`dmd-floating-pill-wrap ${showFloatingPill ? 'visible' : ''}`}>
        <button
          type="button"
          className="dmd-floating-pill-btn"
          onClick={() => {
            setActiveView('wizard');
            setCurrentStep(1);
          }}
          aria-label="Register Free Now"
        >
          <div className="dmd-floating-pill-icon">
            <Zap size={17} fill="#facc15" color="#facc15" />
          </div>
          <span className="dmd-floating-pill-text">Register Free Now</span>
          <span className="dmd-floating-free-tag">₹0 FEE</span>
          <ArrowRight size={17} className="dmd-floating-arrow" />
        </button>
      </div>

    </div>
  );
}
