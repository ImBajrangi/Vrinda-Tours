import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Car, Shield, CheckCircle2, ChevronRight, ChevronDown, Phone, User, 
  MapPin, Navigation, ArrowRight, X, Sparkles, 
  Clock, TrendingUp, Check, ShieldCheck, AlertCircle, LogIn, HeartHandshake,
  Zap, ArrowUpRight, ArrowLeft, CheckSquare, Award, BadgePercent, Sparkle,
  Mail, Lock, Eye, EyeOff, Compass, Building2, UtensilsCrossed, Share2, Copy
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { validatePhoneNumber } from '../../utils/phoneValidator';
import './DriverLandingPage.css';

export const VehicleGraphic = ({ type, size = 22 }) => {
  switch ((type || '').toLowerCase()) {
    case 'e-rickshaw':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M4 15.5V10a2 2 0 0 1 2-2h8l3 4v3.5" />
          <path d="M9 8V5a1 1 0 0 1 1-1h4" />
          <path d="M12 4v4" />
          <path d="M14 11h3" />
        </svg>
      );
    case 'taxi':
    case 'cab':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H8c-.7 0-1.3.3-1.8.7L4 10s-2.7.6-3.5 1.1C-.2 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M10 5h4" />
        </svg>
      );
    case 'auto':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="17.5" r="2.5" />
          <circle cx="18" cy="17.5" r="2.5" />
          <path d="M5 15V8.5a2 2 0 0 1 2-2h6l4 4.5v4" />
          <path d="M9 6.5V4h4" />
          <path d="M13 11h4" />
        </svg>
      );
    case 'suv':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="10" width="20" height="7" rx="2" />
          <path d="M5 10l2-5h10l2 5" />
          <circle cx="7" cy="17" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="M10 7h4" />
        </svg>
      );
    case 'tempo':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="7" cy="18" r="2.5" />
          <circle cx="17" cy="18" r="2.5" />
          <path d="M6 10h4v3H6z" />
          <path d="M14 10h4v3h-4z" />
          <path d="M2 13.5h20" />
        </svg>
      );
    default:
      return <Car size={size} />;
  }
};

const VEHICLE_TYPES = [
  { 
    id: 'E-Rickshaw', 
    label: 'E-Rickshaw', 
    desc: 'Dham Parikrama & Mandir Routes', 
    category: 'LOCAL DHAM',
    earningEst: '₹1,400–₹2,600 / day',
    tripRate: '15–22 Devotee Trips / Day'
  },
  { 
    id: 'Taxi', 
    label: 'Cab / Taxi', 
    desc: 'Sedan, Dzire, Etios & Hatchback', 
    category: 'CITY & INTERCITY',
    earningEst: '₹2,500–₹5,000 / day',
    tripRate: '4–7 Outstation & City Runs'
  },
  { 
    id: 'Auto', 
    label: 'Auto Rickshaw', 
    desc: 'Station Transfer & Town Runs', 
    category: 'QUICK RUNS',
    earningEst: '₹1,800–₹3,200 / day',
    tripRate: '12–18 Town & Station Transfers'
  },
  { 
    id: 'SUV', 
    label: 'SUV / Luxury', 
    desc: 'Innova, Ertiga, Crysta & Scorpio', 
    category: 'FAMILY YATRA',
    earningEst: '₹4,000–₹7,500 / day',
    tripRate: '2–4 Full Dham Yatra Tours'
  },
  { 
    id: 'Tempo', 
    label: 'Tempo Traveler', 
    desc: '9–26 Seater 84 Kos Pilgrimage', 
    category: 'GROUP TOURS',
    earningEst: '₹6,000–₹12,000 / day',
    tripRate: 'Group Pilgrimage Charters'
  },
];

const EXPERIENCE_OPTIONS = ['1–2 Years', '3–5 Years', '5–10 Years', '10+ Years'];

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

export default function DriverLandingPage({ 
  onClose, 
  onOpenDriverCompanion, 
  onOpenHotelPage,
  onOpenRestaurantPage,
  onOpenAgencyPage,
  drivers = [] 
}) {
  const [activeView, setActiveView] = useState('landing'); // 'landing' | 'wizard'
  const [currentStep, setCurrentStep] = useState(1); // 1: Personal, 2: Vehicle, 3: Zone & Confirm
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [regSessionId] = useState(() => 'dreg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    experience: '3–5 Years',
    vehicleType: 'E-Rickshaw',
    vehicleNo: '',
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

  const [copiedPageShare, setCopiedPageShare] = useState(false);

  const handleShareCurrentPage = async () => {
    const refCode = localStorage.getItem('vrinda_referrer_code') || '';
    const shareUrl = `${window.location.origin}/?join=driver&mode=register${refCode ? `&ref=${refCode}` : ''}`;
    const shareText = `Radhe Radhe! 🛺 Join Vrinda Vihar as a Driver Partner (E-Rickshaw, Auto, Cab) with 0% Commission Forever:\n\n${shareUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Driver Partner Registration - Vrinda Vihar', text: shareText, url: shareUrl });
        setCopiedPageShare(true);
        setTimeout(() => setCopiedPageShare(false), 2000);
        return;
      } catch (e) {}
    }
    
    navigator.clipboard?.writeText(shareUrl);
    setCopiedPageShare(true);
    setTimeout(() => setCopiedPageShare(false), 2000);
  };

  const scrollToSection = useCallback((sectionId) => {
    setActiveView('landing');
    setShowLoginModal(false);
    setTimeout(() => {
      if (mainBodyRef.current) {
        const targetEl = mainBodyRef.current.querySelector(`#${sectionId}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 60);
  }, []);

  // URL Deep-Linking for direct Registration Wizard, Login Modal, or Section Anchor (#faq, #benefits, etc.)
  useEffect(() => {
    const handleUrlState = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = (window.location.hash || '').toLowerCase();
        const mode = (searchParams.get('mode') || searchParams.get('view') || searchParams.get('action') || '').toLowerCase();

        if (mode === 'register' || mode === 'wizard' || mode === 'join' || hash.includes('register') || hash.includes('wizard')) {
          setActiveView('wizard');
          setCurrentStep(1);
          setShowLoginModal(false);
          return;
        } 
        
        if (mode === 'login' || mode === 'signin' || hash.includes('login') || hash.includes('signin')) {
          setShowLoginModal(true);
          return;
        }

        const sectionId = hash.replace(/^#/, '');
        if (sectionId && sectionId !== 'driver' && sectionId !== 'drivers' && sectionId !== 'landing') {
          scrollToSection(sectionId);
        }
      } catch (e) {}
    };

    handleUrlState();
    window.addEventListener('hashchange', handleUrlState);
    window.addEventListener('popstate', handleUrlState);
    return () => {
      window.removeEventListener('hashchange', handleUrlState);
      window.removeEventListener('popstate', handleUrlState);
    };
  }, [scrollToSection]);

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

  const selectedVehicleObj = VEHICLE_TYPES.find(v => v.id === regForm.vehicleType) || VEHICLE_TYPES[0];

  // Check and process return from Google OAuth
  useEffect(() => {
    let isMounted = true;
    const checkGoogleAuthReturn = async () => {
      try {
        const rawPending = sessionStorage.getItem('vt_pending_driver_reg');
        if (!rawPending) return;

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          sessionStorage.removeItem('vt_pending_driver_reg');

          const user = session.user;
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name || 'Driver Partner';
          const googleEmail = user.email || '';
          
          let pendingData = {};
          try { pendingData = JSON.parse(rawPending); } catch (e) {}

          if (pendingData.intent === 'step1_google_login' || !pendingData.vehicleNo) {
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
              await supabase.from('driver_registrations').upsert({
                id: pendingData.regSessionId || ('dreg_' + Date.now()),
                step: 1,
                name: googleName,
                phone: pendingData.phone || '',
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
              console.warn('Driver registration Supabase sync fallback:', syncErr);
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
  }, [onOpenDriverCompanion]);

  // Helper to sync registration progress to Supabase continuously
  const syncProgressToSupabase = async (stepNumber, additionalData = {}) => {
    try {
      const phoneValidation = validatePhoneNumber(regForm.phone);
      const cleanPhone = phoneValidation.clean || regForm.phone;
      
      const payload = {
        id: regSessionId,
        step: stepNumber,
        name: regForm.name.trim() || null,
        phone: cleanPhone || null,
        experience: regForm.experience || null,
        vehicle_type: regForm.vehicleType || null,
        vehicle_no: regForm.vehicleNo.trim() || null,
        zone: regForm.zone || 'All Braj Region',
        status: stepNumber === 3 ? 'completed' : `step_${stepNumber}_completed`,
        completed: stepNumber === 3,
        metadata: {
          email: regForm.email || null,
          googleVerified: regForm.googleVerified || false,
          ...additionalData
        },
        updated_at: new Date().toISOString()
      };

      try {
        localStorage.setItem('vt_driver_reg_' + regSessionId, JSON.stringify(payload));
      } catch (e) {}

      const { error } = await supabase.from('driver_registrations').upsert(payload);
      if (error) {
        if (error.status !== 403 && error.code !== '42P01') {
          console.warn('driver_registrations sync step ' + stepNumber + ' notice:', error.message);
        }
      }
    } catch (err) {
      console.warn('driver_registrations sync fallback:', err?.message || err);
    }
  };

  // 1-Tap Google Sign In for Step 1
  const handleGoogleSignInStep1 = async () => {
    setRegError('');
    setIsSubmitting(true);
    try {
      sessionStorage.setItem('vt_pending_driver_reg', JSON.stringify({
        regSessionId,
        phone: regForm.phone,
        vehicleType: regForm.vehicleType,
        experience: regForm.experience,
        zone: regForm.zone,
        intent: 'step1_google_login'
      }));

      await syncProgressToSupabase(1, {
        vehicle_type: regForm.vehicleType,
        vehicle_no: regForm.vehicleNo.trim() || null,
        zone: regForm.zone,
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
      setRegError('Please enter your full legal name');
      return;
    }

    if (!regForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      setRegError('Please enter a valid email address for your portal account');
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
              role: 'driver'
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
      const formattedVehicleNo = regForm.vehicleNo.trim() 
        ? regForm.vehicleNo.toUpperCase().trim() 
        : `UP-85 ${Math.floor(1000 + Math.random() * 9000)}`;

      const newDriverId = 'd_' + Date.now();

      await syncProgressToSupabase(3, {
        vehicle_no: formattedVehicleNo,
        status: 'completed',
        completed: true
      });

      try {
        await supabase.from('partners').upsert({
          id: newDriverId,
          name: regForm.name.trim(),
          phone: cleanPhone,
          email: regForm.email.trim(),
          category: 'driver',
          role_details: `🛺 ${regForm.vehicleType} • ${formattedVehicleNo} • ${regForm.zone.split(' ')[0]}`,
          rating: 5.0,
          status: 'Pending Admin Verification',
          verified: false,
          category_locked: false,
          photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(regForm.name)}&backgroundColor=f1f5f9`,
          metadata: {
            vehicleType: regForm.vehicleType,
            vehicleNo: formattedVehicleNo,
            experience: regForm.experience,
            zone: regForm.zone,
            email: regForm.email.trim()
          },
          created_at: new Date().toISOString()
        });
      } catch (pErr) {
        console.warn('partners table notice:', pErr);
      }

      try {
        await addDoc(collection(firestore, 'drivers'), {
          name: regForm.name.trim(),
          phone: cleanPhone,
          email: regForm.email.trim(),
          experience: regForm.experience,
          vehicleType: regForm.vehicleType,
          vehicleNo: formattedVehicleNo,
          zone: regForm.zone,
          rating: 5.0,
          status: 'pending_verification',
          verified: false,
          createdAt: new Date().toISOString()
        });
      } catch (fbErr) {
        console.warn('Firestore backup notice:', fbErr);
      }

      sessionStorage.setItem('vt_partner_id', newDriverId);
      sessionStorage.setItem('vt_driver_id', newDriverId);
      sessionStorage.setItem('vt_partner_role', 'driver');
      
      setRegSuccess(true);
      setTimeout(() => {
        if (onOpenDriverCompanion) {
          onOpenDriverCompanion(newDriverId, 'driver');
        }
      }, 1200);

    } catch (err) {
      console.error('Registration error:', err);
      setRegError('Could not complete registration. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Driver Sign In
  const handleDriverLogin = async (e) => {
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
        const did = data.user?.id ? `d_${data.user.id.slice(0, 8)}` : `d_${Date.now()}`;
        sessionStorage.setItem('vt_driver_id', did);
        sessionStorage.setItem('vt_partner_role', 'driver');
        setIsLoggingIn(false);
        if (onOpenDriverCompanion) {
          onOpenDriverCompanion(did, 'driver');
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

    const matched = drivers.find(d => {
      const dDigits = (d.phone || '').replace(/\D/g, '');
      return dDigits.includes(cleanNumber);
    });

    const driverId = matched ? matched.id : `driver_${cleanNumber}`;
    sessionStorage.setItem('vt_driver_id', driverId);
    sessionStorage.setItem('vt_partner_role', 'driver');
    setIsLoggingIn(false);
    if (onOpenDriverCompanion) {
      onOpenDriverCompanion(driverId, 'driver');
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
                <span>🛺 <strong>420+ Pilgrim Rides Today:</strong> High devotee demand active across Vrindavan, Mathura &amp; Govardhan</span>
                <span className="highlight-green">● Live Dispatch</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>💰 <strong>0% Commission Policy:</strong> Keep 100% of every ride fare directly in your UPI or cash</span>
                <span className="dmd-announcement-action">100% Direct</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>📍 <strong>Peak Aarti Rush:</strong> Banke Bihari, Prem Mandir &amp; Raman Reti high demand</span>
                <span className="highlight-gold">Peak Hours</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>⚡ <strong>Instant WhatsApp Rides:</strong> Receive devotee trip alerts directly on your phone</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🪔 <strong>Free Seva Registration:</strong> 5,000+ local drivers registered with ₹0 fees</span>
                <span className="dmd-announcement-action">Join Free →</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
            </div>

            {/* Copy 2 (Identical for seamless infinite loop) */}
            <div className="dmd-announcement-list" aria-hidden="true">
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🛺 <strong>420+ Pilgrim Rides Today:</strong> High devotee demand active across Vrindavan, Mathura &amp; Govardhan</span>
                <span className="highlight-green">● Live Dispatch</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>💰 <strong>0% Commission Policy:</strong> Keep 100% of every ride fare directly in your UPI or cash</span>
                <span className="dmd-announcement-action">100% Direct</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>📍 <strong>Peak Aarti Rush:</strong> Banke Bihari, Prem Mandir &amp; Raman Reti high demand</span>
                <span className="highlight-gold">Peak Hours</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>⚡ <strong>Instant WhatsApp Rides:</strong> Receive devotee trip alerts directly on your phone</span>
              </div>
              <span className="dmd-announcement-sep">✦</span>
              <div className="dmd-announcement-item" onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}>
                <span>🪔 <strong>Free Seva Registration:</strong> 5,000+ local drivers registered with ₹0 fees</span>
                <span className="dmd-announcement-action">Join Free →</span>
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
                <Car size={15} strokeWidth={2.2} />
              </div>
              <div className="dmd-brand-info">
                <span className="dmd-brand-company">Vrinda</span>
                <span className="dmd-brand-category">Drivers</span>
              </div>
              <ChevronDown size={14} className={`dmd-brand-chevron ${portalDropdownOpen ? 'open' : ''}`} />
            </button>

            {portalDropdownOpen && (
              <div className="dmd-portal-popover">
                <div className="dmd-popover-head">Switch Partner Portal</div>
                <div className="dmd-popover-list">
                  <button type="button" className="dmd-popover-item active" onClick={() => setPortalDropdownOpen(false)}>
                    <div className="dmd-popover-icon-box">
                      <Car size={16} />
                    </div>
                    <div className="dmd-popover-text">
                      <strong>Drivers &amp; Cabs</strong>
                      <span>0% commission pilgrim rides</span>
                    </div>
                    <Check size={14} className="dmd-popover-check" />
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

                  <button 
                    type="button" 
                    className="dmd-popover-item"
                    onClick={() => { setPortalDropdownOpen(false); if (onOpenAgencyPage) onOpenAgencyPage(); }}
                  >
                    <div className="dmd-popover-icon-box">
                      <Compass size={16} />
                    </div>
                    <div className="dmd-popover-text">
                      <strong>Travel Agencies &amp; Guides</strong>
                      <span>84 Kos Parikrama &amp; group yatras</span>
                    </div>
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
              onClick={() => { setActiveView('landing'); if (mainBodyRef.current) mainBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Overview
            </button>
            <a 
              href="#vehicles" 
              className="dmd-nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('vehicles'); }}
            >
              Fleet &amp; Vehicles
            </a>
            <a 
              href="#benefits" 
              className="dmd-nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('benefits'); }}
            >
              Benefits
            </a>
            <a 
              href="#territories" 
              className="dmd-nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('territories'); }}
            >
              Territories
            </a>
            <a 
              href="#faq" 
              className="dmd-nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}
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
              className="dmd-nav-btn-icon" 
              onClick={handleShareCurrentPage}
              title="Share Driver Registration link"
              aria-label="Share Registration link"
              style={copiedPageShare ? { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' } : {}}
            >
              {copiedPageShare ? <Check size={15} /> : <Share2 size={15} />}
              <span className="dmd-btn-text-desktop">{copiedPageShare ? 'Copied!' : 'Share'}</span>
            </button>
            <button 
              type="button" 
              className="dmd-nav-btn-icon" 
              onClick={onClose}
              title="Go to Devotee / User Landing Page"
              aria-label="Pilgrim User App"
            >
              <Compass size={15} />
              <span className="dmd-btn-text-desktop">User App</span>
            </button>
            <button 
              type="button" 
              className="dmd-btn-signin"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className="dmd-btn-primary dmd-btn-register-cta"
              onClick={() => { setActiveView('wizard'); setCurrentStep(1); }}
            >
              <span>Pre-Register Free →</span>
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
                    <span className="dmd-step-name">Vehicle</span>
                  </div>
                  <div className={`dmd-step-connector ${currentStep >= 3 ? 'active' : ''}`} />
                  <div className={`dmd-step-node ${currentStep >= 3 ? 'active' : ''}`}>
                    <span className="dmd-step-idx">03</span>
                    <span className="dmd-step-name">Zone</span>
                  </div>
                </div>
              </div>

              {/* Wizard Multi-Column Layout (Left Summary / Right Step Form) */}
              <div className="dmd-wizard-grid">
                
                {/* Left Dynamic WOW Summary Card */}
                <div className="dmd-wizard-summary-col">
                  <div className="dmd-summary-card dmd-wow-card">
                    
                    {/* Live Driver ID Hologram */}
                    <div className="dmd-id-card-live">
                      <div className="dmd-id-card-top">
                        <span className="dmd-id-pill">PRE-APPROVED DRIVER</span>
                        <span className="dmd-id-num">#VT-842</span>
                      </div>
                      <div className="dmd-id-card-body">
                        <div className="dmd-id-avatar">
                          <VehicleGraphic type={regForm.vehicleType} size={28} />
                        </div>
                        <div className="dmd-id-meta">
                          <strong>{regForm.name || 'Your Driver Name'}</strong>
                          <span>{regForm.phone ? `+91 ${regForm.phone}` : '+91 Mobile Active'}</span>
                          <span className="dmd-id-vehicle-tag">{regForm.vehicleType} • {regForm.experience}</span>
                        </div>
                      </div>
                    </div>

                    <div className="dmd-earning-projection-box">
                      <span className="dmd-proj-title">ESTIMATED EARNINGS</span>
                      <div className="dmd-proj-amount">{selectedVehicleObj.earningEst}</div>
                      <div className="dmd-proj-sub">{selectedVehicleObj.tripRate}</div>
                    </div>

                    <div className="dmd-summary-checklist">
                      <div className="dmd-check-item">
                        <CheckCircle2 size={16} className="dmd-check-icon" />
                        <span>0% Commission Forever</span>
                      </div>
                      <div className="dmd-check-item">
                        <CheckCircle2 size={16} className="dmd-check-icon" />
                        <span>Direct UPI &amp; Cash Payouts</span>
                      </div>
                      <div className="dmd-check-item">
                        <CheckCircle2 size={16} className="dmd-check-icon" />
                        <span>Braj Dham Live Navigation</span>
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
                          <label className="dmd-label">Full Name</label>
                          <div className="dmd-input-wrap">
                            <User size={18} className="dmd-input-icon" />
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Radheshyam Sharma" 
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
                              placeholder="driver@gmail.com" 
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
                          <label className="dmd-label">Mobile / WhatsApp</label>
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
                          <span className="dmd-input-hint">For passenger ride alerts</span>
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

                  {/* STEP 2: VEHICLE & EXPERIENCE */}
                  {currentStep === 2 && (
                    <div className="dmd-step-card dmd-fade-in">
                      <div className="dmd-card-header">
                        <span className="dmd-card-eyebrow">STEP 2 OF 3</span>
                        <h2 className="dmd-step-title">Vehicle Details</h2>
                        <p className="dmd-step-subtitle">Choose vehicle type and plate number.</p>
                      </div>

                      <form onSubmit={handleStep2Next} className="dmd-step-form">
                        
                        <div className="dmd-form-group">
                          <label className="dmd-label">Vehicle Type</label>
                          <div className="dmd-vehicle-card-selector">
                            {VEHICLE_TYPES.map(v => (
                              <div 
                                key={v.id} 
                                className={`dmd-vehicle-option-card ${regForm.vehicleType === v.id ? 'active' : ''}`}
                                onClick={() => setRegForm({ ...regForm, vehicleType: v.id })}
                              >
                                <div className="dmd-v-card-top-row">
                                  <div className="dmd-v-card-icon">
                                    <VehicleGraphic type={v.id} size={22} />
                                  </div>
                                  <span className="dmd-v-card-cat">{v.category}</span>
                                </div>
                                <div className="dmd-v-card-title">{v.label}</div>
                                <div className="dmd-v-card-desc">{v.desc}</div>
                                <div className="dmd-v-card-earning">{v.earningEst}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="dmd-form-group">
                          <label className="dmd-label">Plate / Registration No.</label>
                          <div className="dmd-hsrp-plate-wrap">
                            <div className="dmd-hsrp-ind-strip">
                              <div className="dmd-hsrp-chakra" />
                              <span>IND</span>
                            </div>
                            <input 
                              type="text" 
                              placeholder="UP 85 AB 1234" 
                              className="dmd-input dmd-input-hsrp"
                              value={regForm.vehicleNo}
                              onChange={e => setRegForm({ ...regForm, vehicleNo: e.target.value.toUpperCase() })}
                            />
                          </div>
                          <span className="dmd-input-hint">Leave blank if new vehicle</span>
                        </div>

                        <div className="dmd-form-group">
                          <label className="dmd-label">Braj Experience</label>
                          <div className="dmd-chip-group">
                            {EXPERIENCE_OPTIONS.map(exp => (
                              <button 
                                type="button" 
                                key={exp} 
                                className={`dmd-select-chip ${regForm.experience === exp ? 'active' : ''}`}
                                onClick={() => setRegForm({ ...regForm, experience: exp })}
                              >
                                {exp}
                              </button>
                            ))}
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
                        <h2 className="dmd-step-title">Operating Zone</h2>
                        <p className="dmd-step-subtitle">Pick your primary operating area.</p>
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
                            <p>Keep 100% of all passenger fares directly via cash or UPI. ₹0 fee.</p>
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
                      श्री धाम ब्रज सेवा • PILGRIM DRIVES
                    </span>

                    <h1 className="dmd-display-lg">
                      Drive with Devotion. <br className="dmd-desktop-br" />Earn with Dignity.
                    </h1>

                    <p className="dmd-lead-text">
                      Direct pilgrim rides in Vrindavan, Mathura &amp; Govardhan. Keep 100% of every fare with zero commission.
                    </p>

                    {/* Metrics Strip */}
                    <div className="dmd-metrics-strip">
                      <div className="dmd-metric-box">
                        <span className="dmd-metric-num">₹0</span>
                        <span className="dmd-metric-sub">0% Cut</span>
                      </div>
                      <div className="dmd-metric-box">
                        <span className="dmd-metric-num">100%</span>
                        <span className="dmd-metric-sub">Direct Fares</span>
                      </div>
                      <div className="dmd-metric-box">
                        <span className="dmd-metric-num">50k+</span>
                        <span className="dmd-metric-sub">Devotees</span>
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
                        <span>Driver Sign In</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Visual Card with Fog & Coming Soon Tape */}
                  <div className="dmd-hero-card-col">
                    <div className="dmd-card dmd-interactive-preview">
                      <div className="dmd-preview-header">
                        <span className="dmd-card-eyebrow">PILGRIM DISPATCHES</span>
                        <span className="dmd-coming-soon-pill">
                          COMING SOON
                        </span>
                      </div>

                      <h2 className="dmd-card-title">Pre-Register for Live Rides</h2>
                      <p className="dmd-card-desc">Join early with 0% platform fee and direct pilgrim bookings.</p>

                      {/* Fogged / Blurred Route Ticket with Tape */}
                      <div className="dmd-ticket-wrap-fog">
                        
                        <div className="dmd-dispatch-ticket dmd-fogged-ticket">
                          {/* Origin */}
                          <div className="dmd-route-stop">
                            <div className="dmd-stop-marker origin">
                              <div className="dmd-marker-circle" />
                            </div>
                            <div className="dmd-stop-details">
                              <div className="dmd-stop-name">Shri Radha Rani Mandir</div>
                              <div className="dmd-stop-sub">Gate 1 VIP Entry • Devotee Pickup</div>
                            </div>
                          </div>

                          {/* Route Distance Line */}
                          <div className="dmd-route-track">
                            <div className="dmd-track-line" />
                            <div className="dmd-track-pill">
                              <span>1.8 km • ~6 mins</span>
                            </div>
                          </div>

                          {/* Destination */}
                          <div className="dmd-route-stop">
                            <div className="dmd-stop-marker destination">
                              <div className="dmd-marker-square" />
                            </div>
                            <div className="dmd-stop-details">
                              <div className="dmd-stop-name">Prem Sarovar Sacred Kund</div>
                              <div className="dmd-stop-sub">Barsana Parikrama Marg</div>
                            </div>
                          </div>

                          {/* Fare Preview */}
                          <div className="dmd-ticket-fare-row">
                            <div className="dmd-fare-col">
                              <span className="dmd-fare-label">PASSENGER FARE</span>
                              <span className="dmd-fare-amount">₹120</span>
                            </div>
                            <div className="dmd-commission-badge">
                              <ShieldCheck size={14} />
                              <span>100% Driver Keeps</span>
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

            {/* SECTION 2: VEHICLE FLEET */}
            <section className="dmd-section" id="vehicles">
              <div className="dmd-container">
                <div className="dmd-section-intro">
                  <span className="dmd-eyebrow">FLEET SELECTION</span>
                  <h2 className="dmd-display-md">Supported Vehicle Segments</h2>
                  <p className="dmd-body">Whether you drive an E-Rickshaw around the Dham or operate a Tourist Cab, all drivers are welcome.</p>
                </div>

                <div className="dmd-fleet-grid">
                  {VEHICLE_TYPES.map(v => (
                    <div 
                      key={v.id} 
                      className="dmd-fleet-card dmd-fleet-spring"
                      onClick={() => {
                        setRegForm(prev => ({ ...prev, vehicleType: v.id }));
                        setActiveView('wizard');
                        setCurrentStep(2);
                      }}
                    >
                      <div className="dmd-fleet-header">
                        <div className="dmd-fleet-icon-box">
                          <VehicleGraphic type={v.id} size={24} />
                        </div>
                        <span className="dmd-category-badge">{v.category}</span>
                      </div>
                      <h3 className="dmd-fleet-title">{v.label}</h3>
                      <p className="dmd-fleet-desc">{v.desc}</p>
                      <div className="dmd-fleet-earning-pill">{v.earningEst}</div>
                      <div className="dmd-fleet-footer">
                        <span>Register this vehicle</span>
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
                  <span className="dmd-eyebrow">DRIVER BENEFITS</span>
                  <h2 className="dmd-display-md">Built for Sacred Braj Dham Seva</h2>
                  <p className="dmd-body">Empowering local drivers with the highest quality technology and zero financial middlemen.</p>

                  <div className="dmd-pillars-grid">
                    <div className="dmd-pillar-card">
                      <div className="dmd-pillar-icon">
                        <ShieldCheck size={28} />
                      </div>
                      <h3 className="dmd-pillar-title">0% Commission Forever</h3>
                      <p className="dmd-pillar-desc">
                        No platform cuts, no hidden percentages, and no delays. 100% of every devotee fare goes straight into your hand.
                      </p>
                    </div>

                    <div className="dmd-pillar-card">
                      <div className="dmd-pillar-icon">
                        <HeartHandshake size={28} />
                      </div>
                      <h3 className="dmd-pillar-title">Pilgrim Priority Dispatches</h3>
                      <p className="dmd-pillar-desc">
                        Direct connection with genuine yatra pilgrims arriving from across India and the globe for authentic Braj darshan.
                      </p>
                    </div>

                    <div className="dmd-pillar-card">
                      <div className="dmd-pillar-icon">
                        <Zap size={28} />
                      </div>
                      <h3 className="dmd-pillar-title">Real-Time Dham Navigation</h3>
                      <p className="dmd-pillar-desc">
                        Turn-by-turn routing across all sacred parikrama routes, narrow gali routes, and temple entry gates with live updates.
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
                  <h2 className="dmd-display-md">Sacred Braj Operating Zones</h2>
                  <p className="dmd-body">Select where you drive most often, or choose All Braj Region for maximum pilgrim ride dispatches.</p>
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
                  <h2 className="dmd-display-md">Clear Answers for Drivers</h2>
                </div>

                <div className="dmd-faq-list">
                  {[
                    {
                      q: "Is there any fee to register as a driver?",
                      a: "No. Registration is 100% free. There are zero signup fees, no monthly software charges, and 0% commission on rides."
                    },
                    {
                      q: "How will I receive fares and payments?",
                      a: "Passengers pay you directly via Cash or your personal UPI QR code at the end of each ride. Vrinda.Tours does not touch your money."
                    },
                    {
                      q: "Can I register an E-Rickshaw without commercial plates?",
                      a: "Yes. Local E-Rickshaws, Autos, and commercial cabs operating respectfully in Braj Dham are eligible for registration."
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
                      <Car size={16} strokeWidth={2.2} />
                    </div>
                    <span className="dmd-brand-title">Vrinda. Drivers</span>
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
              Your driver profile has been registered with <strong>0% Commission Guaranteed</strong>.
            </p>
            <div className="dmd-id-card-success">
              <span className="dmd-id-pill">VERIFIED BRIJ DRIVER</span>
              <div className="dmd-id-name">{regForm.name}</div>
              <div className="dmd-id-phone">+91 {regForm.phone}</div>
              <div className="dmd-id-role">{regForm.vehicleType} • {regForm.zone}</div>
            </div>
            <button 
              type="button" 
              className="dmd-btn-primary dmd-btn-large dmd-btn-full"
              onClick={() => {
                setRegSuccess(false);
                if (onOpenDriverCompanion) {
                  onOpenDriverCompanion(sessionStorage.getItem('vt_driver_id'), 'driver');
                }
              }}
            >
              Open Driver Companion Portal
            </button>
          </div>
        </div>
      )}

      {/* DRIVER SIGN IN MODAL */}
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
              <span className="dmd-card-eyebrow">DRIVER ACCESS</span>
              <h2 className="dmd-modal-title">Sign In to Driver Portal</h2>
              <p className="dmd-modal-desc">Access your dispatches, ride requests, and live passenger routes.</p>
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

            <form onSubmit={handleDriverLogin} className="dmd-step-form">
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
                        placeholder="driver@example.com" 
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
                {isLoggingIn ? 'Verifying...' : 'Sign In to Driver Portal'}
              </button>
            </form>

            <div className="dmd-modal-footer-note">
              <span>New to Vrinda Drivers? </span>
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
