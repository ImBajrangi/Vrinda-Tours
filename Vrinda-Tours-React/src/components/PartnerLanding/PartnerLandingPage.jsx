import React, { useState, useEffect, useRef } from 'react';
import {
  Compass, Calendar, Users, MapPin, Search, Star,
  ArrowRight, ArrowLeft, CheckCircle2, Play, SlidersHorizontal,
  X, Plane, Building2, Bus, Car, Mail, Send, ChevronRight, ChevronDown,
  Sparkles, ShieldCheck, Heart, Share2, Phone, Twitter, Facebook, Instagram, Youtube, Github, Globe,
  CreditCard, LayoutGrid, Ticket, Leaf, Sprout, Waves, Linkedin,
  LogIn, LogOut, User, Lock, UserCheck, Eye, EyeOff
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
  getCachedData,
  setCachedData
} from '../../data/landingData';
import { auth } from '../../config/firebase';
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import './PartnerLandingPage.css';

// Validates phone number (supports Indian 10-digit mobile, +91, 0, and international 7-15 digits) without OTP verification needed
export const validatePhoneNumber = (rawPhone) => {
  if (!rawPhone || !rawPhone.trim()) {
    return { isValid: false, message: 'Please enter your mobile or WhatsApp number.' };
  }

  const cleaned = rawPhone.trim().replace(/[\s\-\(\)]/g, '');
  const digitsOnly = cleaned.replace(/\D/g, '');

  let localDigits = digitsOnly;
  if (cleaned.startsWith('+91')) {
    localDigits = cleaned.slice(3).replace(/\D/g, '');
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    localDigits = digitsOnly.slice(2);
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    localDigits = digitsOnly.slice(1);
  }

  // 10-digit Indian Mobile Number
  if (localDigits.length === 10) {
    if (/^[6-9]\d{9}$/.test(localDigits)) {
      return {
        isValid: true,
        formatted: `+91 ${localDigits.slice(0, 5)} ${localDigits.slice(5)}`,
        clean: `+91${localDigits}`
      };
    }
    return { isValid: false, message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.' };
  }

  // International phone numbers (7 to 15 digits)
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return {
      isValid: true,
      formatted: cleaned.startsWith('+') ? cleaned : `+${digitsOnly}`,
      clean: cleaned.startsWith('+') ? cleaned : `+${digitsOnly}`
    };
  }

  return { isValid: false, message: 'Please enter a valid 10-digit mobile number.' };
};

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
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState(15000);
  const [minRatingFilter, setMinRatingFilter] = useState(4.5);

  // Real-time Authentication & Firebase State Synchronization
  const [currentUser, setCurrentUser] = useState(() => {
    const cached = getCachedData('traveler_user', null);
    // Purge mock dummy accounts from previous versions
    if (cached && (cached.email === 'traveler@gmail.com' || cached.name === 'Google Traveler' || cached.tier === 'Google VIP Member')) {
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
  const profileMenuRef = useRef(null);

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

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sync Firebase Auth state changes in real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const name = fbUser.displayName || fbUser.email?.split('@')[0] || (fbUser.isAnonymous ? 'Guest Traveler' : 'Traveler');
        const email = fbUser.email || '';
        const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
        const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'TR';

        const cached = getCachedData('traveler_user', null);
        const existingPhone = (cached && (cached.uid === fbUser.uid || cached.email === email) && cached.phone) ? cached.phone : (fbUser.phoneNumber || '');

        const userObj = {
          uid: fbUser.uid,
          name,
          email,
          phone: existingPhone,
          avatar,
          initials,
          authProvider: fbUser.providerData?.[0]?.providerId || (fbUser.isAnonymous ? 'anonymous' : 'password'),
          memberId: `VRD-${fbUser.uid.slice(0, 5).toUpperCase()}`,
          isAnonymous: fbUser.isAnonymous
        };

        setCurrentUser(userObj);
        setCachedData('traveler_user', userObj);
        if (userObj.name && userObj.name !== 'Guest Traveler') setBookingName(userObj.name);
        if (userObj.email) setBookingEmail(userObj.email);
        if (userObj.phone) setBookingPhone(userObj.phone);
      } else {
        const cached = getCachedData('traveler_user', null);
        if (cached && (cached.email === 'traveler@gmail.com' || cached.name === 'Google Traveler' || cached.tier === 'Google VIP Member')) {
          setCachedData('traveler_user', null);
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
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
          title: 'Unlock 15% VIP Member Discount',
          desc: 'Sign in or register your profile for instant booking vouchers & live GPS navigation.',
          ctaText: 'Sign In / Register',
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

  // Step 3: Complete registration in Firebase Auth
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, authPasswordInput);
      const fbUser = userCredential.user;
      await updateProfile(fbUser, { displayName: name });

      const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'TR';
      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
      const newUser = {
        uid: fbUser.uid,
        name,
        email,
        phone,
        avatar,
        initials,
        authProvider: 'password',
        memberId: `VRD-${fbUser.uid.slice(0, 5).toUpperCase()}`,
        createdAt: new Date().toISOString()
      };

      setCurrentUser(newUser);
      setCachedData('traveler_user', newUser);
      setBookingName(newUser.name);
      setBookingEmail(newUser.email);
      if (phone) setBookingPhone(phone);
      setAuthSuccessMsg('Account created & signed in successfully!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthSuccessMsg('');
        setSignupStep(1);
      }, 500);
    } catch (err) {
      console.error("Firebase Signup Error:", err);
      let errorMsg = err.message?.replace('Firebase: ', '');
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email already exists. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      }
      setAuthError(errorMsg);
    }
  };

  // Real-time Firebase Login Handler
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
      const userCredential = await signInWithEmailAndPassword(auth, email, authPasswordInput);
      const fbUser = userCredential.user;
      const name = fbUser.displayName || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
      const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'TR';

      const loggedUser = {
        uid: fbUser.uid,
        name,
        email,
        phone: fbUser.phoneNumber || '',
        avatar,
        initials,
        authProvider: 'password',
        memberId: `VRD-${fbUser.uid.slice(0, 5).toUpperCase()}`,
        createdAt: new Date().toISOString()
      };

      setCurrentUser(loggedUser);
      setCachedData('traveler_user', loggedUser);
      setBookingName(name);
      setBookingEmail(email);
      setAuthSuccessMsg(`Welcome back, ${name}!`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthSuccessMsg('');
      }, 500);
    } catch (err) {
      console.error("Firebase Login Error:", err);
      let errorMsg = err.message?.replace('Firebase: ', '');
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMsg = 'Invalid email or password. Please verify and try again.';
      }
      setAuthError(errorMsg);
    }
  };

  // Real Firebase Google OAuth Authentication Handler
  const handleGoogleAuth = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Traveler';
      const email = fbUser.email || '';
      const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
      const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'TR';

      // Check if this user already has a saved phone number
      const cached = getCachedData('traveler_user', null);
      const existingPhone = (cached && (cached.uid === fbUser.uid || cached.email === email) && cached.phone)
        ? cached.phone
        : (fbUser.phoneNumber || '');

      const googleUser = {
        uid: fbUser.uid,
        name,
        email,
        phone: existingPhone,
        avatar,
        initials,
        authProvider: 'google',
        memberId: `VRD-${fbUser.uid.slice(0, 5).toUpperCase()}`,
        createdAt: new Date().toISOString()
      };

      if (existingPhone) {
        // User already has phone number -> Login successful immediately!
        setCurrentUser(googleUser);
        setCachedData('traveler_user', googleUser);
        setBookingName(name);
        setBookingEmail(email);
        setBookingPhone(existingPhone);
        setAuthSuccessMsg(`Welcome back, ${name}!`);
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setAuthSuccessMsg('');
          setPendingGoogleUser(null);
        }, 500);
      } else {
        // We don't have user's phone number -> Prompt as part of sign-in process
        setPendingGoogleUser(googleUser);
        setAuthMode('phone_prompt');
        setAuthPhoneInput('');
        setBookingName(name);
        setBookingEmail(email);
      }
    } catch (err) {
      console.error("Google Auth error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message?.replace('Firebase: ', '') || 'Failed to sign in with Google.');
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

  // Real Firebase Apple Authentication Handler (with graceful fallback)
  const handleAppleAuth = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const name = fbUser.displayName || 'Apple Traveler';
      const email = fbUser.email || '';
      const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0b0f19&textColor=ffffff`;
      const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AT';

      const appleUser = {
        uid: fbUser.uid,
        name,
        email,
        phone: '',
        avatar,
        initials,
        authProvider: 'apple',
        memberId: `VRD-${fbUser.uid.slice(0, 5).toUpperCase()}`,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(appleUser);
      setCachedData('traveler_user', appleUser);
      setBookingName(name);
      setBookingEmail(email);
      setAuthSuccessMsg(`Signed in with Apple!`);
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthSuccessMsg('');
      }, 500);
    } catch (err) {
      console.error("Apple Auth error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError('Apple Sign-In is Coming Soon...');
      }
    }
  };

  // Real Firebase Anonymous Guest Authentication
  const handleGuestAuth = async () => {
    setAuthError('');
    setAuthSuccessMsg('');
    try {
      const result = await signInAnonymously(auth);
      const fbUser = result.user;
      const guestUser = {
        uid: fbUser.uid,
        name: 'Guest Traveler',
        email: '',
        phone: '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Guest&backgroundColor=0b0f19&textColor=ffffff`,
        initials: 'GT',
        authProvider: 'anonymous',
        memberId: `VRD-${fbUser.uid.slice(0, 5).toUpperCase()}`,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(guestUser);
      setCachedData('traveler_user', guestUser);
      setAuthSuccessMsg('Continuing as Guest Traveler!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setAuthSuccessMsg('');
      }, 450);
    } catch (err) {
      console.error("Guest Auth error:", err);
      setAuthError('Could not start guest session.');
    }
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
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
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
    if (bookingPhone) {
      const validation = validatePhoneNumber(bookingPhone);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }
    }
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
            <a href="#explore" className="tp-nav-item uppercase">BRIJ PACKAGES</a>
            <a href="#footer" className="tp-nav-item uppercase">CONTACT</a>
          </nav>

          {/* Action CTAs */}
          <div className="tp-nav-actions">
            {/* User Profile / Auth Action */}
            {currentUser ? (
              <div className="tp-nav-user-wrapper" ref={profileMenuRef}>
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
                          Add WhatsApp for booking vouchers & live driver GPS.
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
                          <span>Add WhatsApp Number</span>
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
                className="tp-btn-nav-signin"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                title="Sign In / Register Profile"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}

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
              <h2 className="tp-section-title">Popular Brij Yatra Spots</h2>
              <p className="tp-section-tagline">Sacred Brij Vibes & Highlights</p>
            </div>
            <div className="tp-header-right">
              <p className="tp-header-desc">
                Sacred Dhams and divine leela sthalis with authentic darshans and spiritual bliss.
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
                    decoding="async"
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

              {/* Floating Close Button */}
              <div className="tp-modal-hero-top-bar">
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

              {/* Trip Highlights Info Bar: Unified Segmented Summary Deck */}
              <div className="tp-modal-trip-meta-bar">
                <div className="tp-meta-segment">
                  <span className="tp-meta-lbl"><Calendar size={12} /> Dates</span>
                  <strong className="tp-meta-val">{formatTripDates(checkInDate, checkOutDate)}</strong>
                </div>

                <div className="tp-meta-divider" />

                <div className="tp-meta-segment">
                  <span className="tp-meta-lbl"><Users size={12} /> Guests</span>
                  <strong className="tp-meta-val">{roomsGuests ? roomsGuests.replace('1 Room, ', '') : '2 Guests'}</strong>
                </div>

                <div className="tp-meta-divider" />

                <div className="tp-meta-segment tp-meta-segment-price">
                  <span className="tp-meta-lbl"><Sparkles size={12} /> Starting Rate</span>
                  <strong className="tp-meta-val tp-meta-val-highlight">
                    {selectedItem.price} <small>{selectedItem.priceUnit || '/pax'}</small>
                  </strong>
                </div>
              </div>

              {/* Login / Auto-fill Status Banner */}
              {/* Member Auto-fill / Sign In Bar */}
              {currentUser ? (
                <div className="tp-modal-autofill-banner">
                  <div className="tp-autofill-left">
                    <div className="tp-autofill-avatar-wrap">
                      <img src={currentUser.avatar} alt={currentUser.name} className="tp-autofill-avatar" />
                      <span className="tp-autofill-status-dot" />
                    </div>
                    <div className="tp-autofill-info">
                      <span className="tp-autofill-title">Autofilled for <strong>{currentUser.name}</strong></span>
                      <span className="tp-autofill-sub">{currentUser.email || 'Guest Traveler'} • {currentUser.isAnonymous ? 'Guest' : 'Verified Traveler'}</span>
                    </div>
                  </div>
                  <button type="button" className="tp-autofill-switch-btn" onClick={handleLogout} title="Switch Profile / Sign Out">
                    <span>Switch</span>
                  </button>
                </div>
              ) : (
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
                    <span>Have a profile? <strong className="tp-prompt-highlight">Sign in for 1-click autofill</strong></span>
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
                        onChange={(e) => handleBookingNameChange(e.target.value)}
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
                          onChange={(e) => handleBookingEmailChange(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="tp-input-group">
                      <label>WhatsApp / Mobile Number</label>
                      <div className="tp-input-icon-wrap">
                        <Phone size={15} className="tp-field-icon" />
                        <input
                          type="tel"
                          placeholder="10-digit Mobile (e.g. 9876543210)"
                          value={bookingPhone}
                          onChange={(e) => handleBookingPhoneChange(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="tp-btn-luxury-reserve">
                    <span>Reserve Itinerary on WhatsApp</span>
                    <ArrowRight size={16} />
                  </button>

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

      {/* 11. iOS STYLE LUXURY VIP AUTH & PROFILE LOGIN MODAL */}
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
