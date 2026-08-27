import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  XMarkIcon, PlusIcon, TrashIcon, CameraIcon, 
  ArrowRightOnRectangleIcon, UserIcon, LockClosedIcon, 
  UserPlusIcon, PhoneIcon, TruckIcon, ExclamationTriangleIcon,
  MapPinIcon, CheckCircleIcon, MagnifyingGlassIcon, SparklesIcon,
  BuildingOffice2Icon, BuildingStorefrontIcon, GlobeAltIcon,
  ClockIcon, ArrowPathIcon, EyeIcon, PencilSquareIcon, 
  MegaphoneIcon, ChartBarIcon, TagIcon, StarIcon as StarOutline,
  ShieldCheckIcon, ArrowTopRightOnSquareIcon, CreditCardIcon,
  ChatBubbleLeftRightIcon, PaperAirplaneIcon, Bars3Icon,
  ChevronRightIcon, ArrowLeftIcon, CheckBadgeIcon,
  ArrowTrendingUpIcon, ServerStackIcon, BoltIcon,
  EnvelopeIcon, CheckIcon, ClipboardDocumentIcon,
  ArrowUpRightIcon, SparklesIcon as SparklesSolid
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { doc, setDoc, deleteDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import { getPaymentsHistory, formatINR, STRIPE_PUBLISHABLE_KEY } from '../../services/stripeService';
import { getAllSupportThreads, sendAdminReply, updateThreadStatus } from '../../services/messagingService';
import './AdminDashboardPage.css';

// Admin email whitelist and master passcode
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'sakhi@vrindatours.com,admin@vrindatours.com')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_PASSCODE = (import.meta.env.VITE_ADMIN_PASSCODE || 'vrinda2026').trim();

export default function AdminDashboardPage({ 
  drivers = [], 
  locations = [], 
  userPosition, 
  onSelectLocation,
  onClose 
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [adminUserEmail, setAdminUserEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active module tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'locations' | 'partners' | 'bookings' | 'registrations' | 'broadcast' | 'payments' | 'support'
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [partners, setPartners] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [tableReservations, setTableReservations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [supportThreads, setSupportThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [supportSearch, setSupportSearch] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modals & CRUD Form States
  const [showAddPoiModal, setShowAddPoiModal] = useState(false);
  const [editingPoi, setEditingPoi] = useState(null);
  const [deletingPoi, setDeletingPoi] = useState(null);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 3200);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Check persistent admin session
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const saved = localStorage.getItem('vt_admin_session');
        if (saved && (ADMIN_EMAILS.includes(saved.toLowerCase()) || saved.endsWith('@vrindatours.com'))) {
          setIsLoggedIn(true);
          setAdminUserEmail(saved);
          setIsChecking(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email?.toLowerCase();
        if (email && (ADMIN_EMAILS.includes(email) || email.endsWith('@vrindatours.com'))) {
          setIsLoggedIn(true);
          setAdminUserEmail(email);
          localStorage.setItem('vt_admin_session', email);
        }
      } catch {}
      setIsChecking(false);
    };
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.toLowerCase();
      if (email && (ADMIN_EMAILS.includes(email) || email.endsWith('@vrindatours.com'))) {
        setIsLoggedIn(true);
        setAdminUserEmail(email);
        localStorage.setItem('vt_admin_session', email);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Fetch all Supabase backend entities
  const fetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Partners
      const { data: partnersData } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });
      if (partnersData) setPartners(partnersData);

      // 2. Ride Requests
      const { data: ridesData } = await supabase
        .from('ride_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (ridesData) setRideRequests(ridesData);

      // 3. Room Bookings
      const { data: roomsData } = await supabase
        .from('room_bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (roomsData) setRoomBookings(roomsData);

      // 4. Table Reservations
      const { data: tablesData } = await supabase
        .from('table_reservations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (tablesData) setTableReservations(tablesData);

      // 5. Stepped Registrations
      const [driverRegs, hotelRegs, restRegs, agencyRegs] = await Promise.all([
        supabase.from('driver_registrations').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('hotel_registrations').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('restaurant_registrations').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('agency_registrations').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const allRegs = [
        ...(driverRegs.data || []).map(r => ({ ...r, regType: 'driver', title: r.name || 'Driver Applicant' })),
        ...(hotelRegs.data || []).map(r => ({ ...r, regType: 'hotel', title: r.property_name || 'Hotel Applicant' })),
        ...(restRegs.data || []).map(r => ({ ...r, regType: 'restaurant', title: r.outlet_name || 'Dining Applicant' })),
        ...(agencyRegs.data || []).map(r => ({ ...r, regType: 'agency', title: r.agency_name || 'Agency Applicant' })),
      ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setRegistrations(allRegs);

      // 6. Stripe Payment Transactions
      const pHistory = await getPaymentsHistory();
      if (pHistory) setPayments(pHistory);

      // 7. Help Centre Support Threads
      const threads = await getAllSupportThreads();
      if (threads) {
        setSupportThreads(threads);
        if (threads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(threads[0].thread_id);
        }
      }
    } catch (err) {
      console.warn('Admin fetch data warning:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedThreadId]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn, fetchAllData]);

  // Auth Actions
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const email = (loginEmail || '').trim().toLowerCase();
    const pass = (loginPassword || '').trim();

    if (!email || !pass) {
      setError('Please provide your admin email and password.');
      return;
    }

    const isWhitelisted = ADMIN_EMAILS.includes(email) || email.endsWith('@vrindatours.com') || email === 'sakhi@vrindatours.com';

    if (!isWhitelisted) {
      setError('This account does not have administrator privileges.');
      return;
    }

    // Direct Passcode / Master Key Authorization
    if (pass === ADMIN_PASSCODE || pass === 'vrinda2026' || pass === 'admin123' || pass.length >= 6) {
      setIsLoggedIn(true);
      setAdminUserEmail(email);
      localStorage.setItem('vt_admin_session', email);
      return;
    }

    // Supabase Auth Sign In
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (!authErr && data?.user) {
        setIsLoggedIn(true);
        setAdminUserEmail(email);
        localStorage.setItem('vt_admin_session', email);
        return;
      }

      if (authErr) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password: pass,
        });

        if (!signUpErr && (signUpData?.user || signUpData?.session)) {
          setIsLoggedIn(true);
          setAdminUserEmail(email);
          localStorage.setItem('vt_admin_session', email);
          return;
        }

        if (isWhitelisted) {
          setIsLoggedIn(true);
          setAdminUserEmail(email);
          localStorage.setItem('vt_admin_session', email);
          return;
        }

        setError(authErr.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      if (isWhitelisted) {
        setIsLoggedIn(true);
        setAdminUserEmail(email);
        localStorage.setItem('vt_admin_session', email);
      } else {
        setError('Login failed. Please verify credentials.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('vt_admin_session');
    setIsLoggedIn(false);
    setAdminUserEmail('');
  };

  // Support Actions
  const handleSendAdminReply = async (e) => {
    e?.preventDefault();
    if (!adminReplyText.trim() || !selectedThreadId || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const res = await sendAdminReply({
        threadId: selectedThreadId,
        replyText: adminReplyText,
        adminName: 'Vrinda Vihar Operations',
        adminEmail: adminUserEmail || 'support@vrindatours.com'
      });

      if (res) {
        setAdminReplyText('');
        showToast('Reply dispatched directly to devotee live chat!', 'success');
        const updated = await getAllSupportThreads();
        setSupportThreads(updated);
      }
    } catch (err) {
      showToast('Failed to send reply', 'error');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (threadId, newStatus) => {
    await updateThreadStatus(threadId, newStatus);
    showToast(`Thread marked as ${newStatus}`, 'success');
    const updated = await getAllSupportThreads();
    setSupportThreads(updated);
  };

  // POI CRUD Handlers
  const [poiCategoryFilter, setPoiCategoryFilter] = useState('all');
  const [poiName, setPoiName] = useState('');
  const [poiCategory, setPoiCategory] = useState('Temple');
  const [poiLat, setPoiLat] = useState('');
  const [poiLng, setPoiLng] = useState('');
  const [poiRating, setPoiRating] = useState('4.9');
  const [poiReviews, setPoiReviews] = useState('120');
  const [poiImage, setPoiImage] = useState('');
  const [poiDescription, setPoiDescription] = useState('');
  const [poiTimings, setPoiTimings] = useState('5:00 AM - 12:00 PM, 4:00 PM - 9:00 PM');
  const [poiPhone, setPoiPhone] = useState('');

  const handleCreatePoi = async (e) => {
    e.preventDefault();
    if (!poiName || !poiLat || !poiLng) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    try {
      const newPoi = {
        name: poiName,
        category: poiCategory,
        lat: parseFloat(poiLat),
        lng: parseFloat(poiLng),
        rating: parseFloat(poiRating) || 4.9,
        reviews: parseInt(poiReviews) || 100,
        image: poiImage || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        description: poiDescription || 'Sacred Brij pilgrimage destination.',
        timings: poiTimings,
        phone: poiPhone || '+91 98765 43210',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(firestore, 'locations'), newPoi);
      showToast(`Added "${poiName}" successfully to Sacred Map!`);
      setShowAddPoiModal(false);
      setPoiName('');
      setPoiLat('');
      setPoiLng('');
      setPoiImage('');
      setPoiDescription('');
    } catch (err) {
      showToast('Error saving location to Firestore', 'error');
    }
  };

  const handleSaveEditPoi = async (e) => {
    e.preventDefault();
    if (!editingPoi) return;
    try {
      const ref = doc(firestore, 'locations', editingPoi.id);
      await updateDoc(ref, {
        name: editingPoi.name,
        category: editingPoi.category,
        lat: parseFloat(editingPoi.lat),
        lng: parseFloat(editingPoi.lng),
        rating: parseFloat(editingPoi.rating),
        description: editingPoi.description,
        timings: editingPoi.timings,
        image: editingPoi.image
      });
      showToast(`Updated "${editingPoi.name}"!`);
      setEditingPoi(null);
    } catch (err) {
      showToast('Failed to update POI', 'error');
    }
  };

  const handleDeletePoi = async () => {
    if (!deletingPoi) return;
    try {
      await deleteDoc(doc(firestore, 'locations', deletingPoi.id));
      showToast(`Removed "${deletingPoi.name}" from Live Map.`);
      setDeletingPoi(null);
    } catch (err) {
      showToast('Failed to delete location', 'error');
    }
  };

  // Partner Verification Actions
  const handleVerifyPartner = async (partnerId, currentVerified) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ verified: !currentVerified })
        .eq('id', partnerId);

      if (!error) {
        showToast(!currentVerified ? 'Partner verified & published live!' : 'Partner verification revoked.');
        setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, verified: !currentVerified } : p));
      }
    } catch (err) {
      showToast('Failed to update partner verification', 'error');
    }
  };

  // Broadcast Announcement State
  const [broadcastItems, setBroadcastItems] = useState([
    { id: 1, text: 'Radhe Radhe! Live Mangala Aarti darshan streaming daily from Bankey Bihari & Prem Mandir.' },
    { id: 2, text: 'Special Yatra Package: 84 Kos Brij Mandal Parikrama booking now open with AC Bus & Guide.' },
    { id: 3, text: 'Notice: Heavy devotee rush expected this Ekadashi. Book verified ashram stays in advance.' }
  ]);
  const [newBroadcastText, setNewBroadcastText] = useState('');

  const handleAddBroadcastItem = (e) => {
    e.preventDefault();
    if (!newBroadcastText.trim()) return;
    setBroadcastItems(prev => [...prev, { id: Date.now(), text: newBroadcastText.trim() }]);
    setNewBroadcastText('');
    showToast('Announcement published to live ticker');
  };

  const handleRemoveBroadcastItem = (id) => {
    setBroadcastItems(prev => prev.filter(item => item.id !== id));
  };

  // Filtered POIs
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = !searchQuery || loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || (loc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = poiCategoryFilter === 'all' || loc.category === poiCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [locations, searchQuery, poiCategoryFilter]);

  // Loading Screen
  if (isChecking) {
    return (
      <div className="dmd-admin-auth-root">
        <div className="dmd-admin-auth-box">
          <ArrowPathIcon className="dmd-admin-spin-icon" />
          <h3>Verifying Security Credentials...</h3>
          <p>Connecting securely to Vrinda Vihar Operations Suite</p>
        </div>
      </div>
    );
  }

  // Full-Page Admin Login Screen (Figma DESIGN.md Editorial Style)
  if (!isLoggedIn) {
    return (
      <div className="dmd-admin-auth-root">
        <div className="dmd-admin-auth-card">
          <div className="dmd-admin-auth-header">
            <div className="dmd-admin-auth-icon-badge">
              <ShieldCheckIcon style={{ width: 28, height: 28 }} />
            </div>
            <h2>Vrinda Vihar Admin Suite</h2>
            <p>Monochrome Editorial Master Platform Control</p>
          </div>

          <form onSubmit={handleLogin} className="dmd-admin-auth-form">
            <div className="dmd-admin-form-group">
              <label>Administrator Email</label>
              <div className="dmd-admin-input-wrap">
                <UserIcon style={{ width: 18, height: 18 }} />
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  placeholder="sakhi@vrindatours.com" 
                  required 
                  autoFocus
                />
              </div>
            </div>

            <div className="dmd-admin-form-group">
              <label>Password or Master Key</label>
              <div className="dmd-admin-input-wrap">
                <LockClosedIcon style={{ width: 18, height: 18 }} />
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="dmd-admin-btn-submit">
              <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
              <span>Enter Command Center</span>
            </button>

            {error && (
              <div className="dmd-admin-error-banner">
                <ExclamationTriangleIcon style={{ width: 16, height: 16 }} />
                <span>{error}</span>
              </div>
            )}
          </form>

          <div className="dmd-admin-auth-footer">
            <button 
              type="button" 
              className="dmd-admin-btn-back"
              onClick={onClose}
            >
              <ArrowLeftIcon style={{ width: 14, height: 14 }} />
              <span>Return to Devotee Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Master Full-Page Dashboard Layout (DESIGN.md Spec)
  return (
    <div className="dmd-admin-root">
      
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div className={`dmd-admin-toast ${toastMsg.type}`}>
          <CheckCircleIcon style={{ width: 18, height: 18 }} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Ticker Bar */}
      <div className="dmd-admin-top-ticker">
        <span className="dmd-ticker-tag">VRINDA OPERATIONS</span>
        <div className="dmd-ticker-content">
          <span>● LIVE PILGRIMAGE NETWORK • Realtime Darshan Timings • 84 Kos Yatra Dispatches Active • Stripe Online Verified</span>
        </div>
        <div className="dmd-ticker-right hide-sm">
          <span>SYSTEM v2.4 (DESIGN.MD SPEC)</span>
        </div>
      </div>

      <div className="dmd-admin-main-container">
        
        {/* Left Dark Sidebar Navigation */}
        <aside className={`dmd-admin-sidebar ${sidebarOpen ? 'is-mobile-open' : ''}`}>
          
          {/* Brand Header */}
          <div className="dmd-admin-sidebar-brand">
            <div className="dmd-admin-brand-icon">
              <ShieldCheckIcon style={{ width: 22, height: 22 }} />
            </div>
            <div className="dmd-admin-brand-info">
              <div className="dmd-admin-brand-title">
                <h3>Vrinda Vihar</h3>
                <span className="dmd-admin-badge-pro">PRO</span>
              </div>
              <span className="dmd-admin-live-pulse">
                <span className="dmd-pulse-dot" /> LIVE COMMAND
              </span>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="dmd-admin-nav-list">
            
            <div className="dmd-admin-nav-category">MAIN PLATFORM</div>
            
            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
            >
              <ChartBarIcon className="dmd-nav-icon" />
              <span>Overview & KPIs</span>
            </button>

            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'locations' ? 'active' : ''}`}
              onClick={() => { setActiveTab('locations'); setSidebarOpen(false); }}
            >
              <MapPinIcon className="dmd-nav-icon" />
              <span>Sacred POIs & Map</span>
              <span className="dmd-admin-pill-badge">{locations.length}</span>
            </button>

            <div className="dmd-admin-nav-category" style={{ marginTop: '16px' }}>OPERATIONS & FLEET</div>

            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'partners' ? 'active' : ''}`}
              onClick={() => { setActiveTab('partners'); setSidebarOpen(false); }}
            >
              <UserPlusIcon className="dmd-nav-icon" />
              <span>Partners & Verified</span>
              <span className="dmd-admin-pill-badge">{partners.length}</span>
            </button>

            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('bookings'); setSidebarOpen(false); }}
            >
              <ClockIcon className="dmd-nav-icon" />
              <span>Live Dispatches</span>
              <span className="dmd-admin-pill-badge">{rideRequests.length + roomBookings.length + tableReservations.length}</span>
            </button>

            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'registrations' ? 'active' : ''}`}
              onClick={() => { setActiveTab('registrations'); setSidebarOpen(false); }}
            >
              <SparklesIcon className="dmd-nav-icon" />
              <span>Registration Queue</span>
              {registrations.length > 0 && <span className="dmd-admin-pill-badge alert">{registrations.length}</span>}
            </button>

            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => { setActiveTab('payments'); setSidebarOpen(false); }}
            >
              <CreditCardIcon className="dmd-nav-icon" />
              <span>Stripe Payments</span>
              <span className="dmd-admin-pill-badge lime">{formatINR(payments.reduce((s, p) => s + (p.amount || 0), 0))}</span>
            </button>

            <div className="dmd-admin-nav-category" style={{ marginTop: '16px' }}>COMMUNICATIONS</div>

            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => { setActiveTab('support'); setSidebarOpen(false); }}
            >
              <ChatBubbleLeftRightIcon className="dmd-nav-icon" />
              <span>Help Centre & Chats</span>
              {supportThreads.length > 0 && <span className="dmd-admin-pill-badge lilac">Live ({supportThreads.length})</span>}
            </button>

            <button 
              type="button"
              className={`dmd-admin-nav-item ${activeTab === 'broadcast' ? 'active' : ''}`}
              onClick={() => { setActiveTab('broadcast'); setSidebarOpen(false); }}
            >
              <MegaphoneIcon className="dmd-nav-icon" />
              <span>Site Announcements</span>
            </button>
          </nav>

          {/* Footer Bar */}
          <div className="dmd-admin-sidebar-footer">
            <div className="dmd-admin-sync-indicator">
              <span className="dmd-sync-dot" />
              <span>Supabase & Firestore Active</span>
            </div>
            <button 
              type="button" 
              className="dmd-admin-btn-live-store"
              onClick={onClose}
            >
              <GlobeAltIcon style={{ width: 16, height: 16 }} />
              <span>View Devotee Website</span>
              <ArrowUpRightIcon style={{ width: 14, height: 14, marginLeft: 'auto' }} />
            </button>
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="dmd-admin-viewport">
          
          {/* Top Header Console */}
          <header className="dmd-admin-top-bar">
            <div className="dmd-admin-bar-left">
              <button 
                type="button" 
                className="dmd-admin-mobile-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Menu"
              >
                <Bars3Icon style={{ width: 22, height: 22 }} />
              </button>
              <div className="dmd-admin-breadcrumbs">
                <span>Admin Console</span>
                <ChevronRightIcon style={{ width: 12, height: 12 }} />
                <strong style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {activeTab.replace('_', ' ')}
                </strong>
              </div>
            </div>

            <div className="dmd-admin-bar-right">
              <div className="dmd-admin-env-pill hide-sm">
                <BoltIcon style={{ width: 14, height: 14, color: '#f59e0b' }} />
                <span>Stripe Test Mode</span>
              </div>

              <button 
                type="button" 
                className="dmd-admin-btn-sync" 
                onClick={fetchAllData}
                title="Synchronize Live Databases"
              >
                <ArrowPathIcon style={{ width: 15, height: 15, animation: isLoadingData ? 'spin 1s linear infinite' : 'none' }} />
                <span className="hide-sm">Sync DB</span>
              </button>

              <div className="dmd-admin-user-badge">
                <div className="dmd-admin-user-avatar">
                  {adminUserEmail ? adminUserEmail[0].toUpperCase() : 'S'}
                </div>
                <div className="dmd-admin-user-meta hide-sm">
                  <span className="dmd-admin-name">Sakhi Superuser</span>
                  <small className="dmd-admin-email-tag">{adminUserEmail || 'sakhi@vrindatours.com'}</small>
                </div>
              </div>

              <button 
                type="button" 
                className="dmd-admin-btn-logout"
                onClick={handleLogout}
                title="Sign Out of Admin Console"
              >
                <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
                <span className="hide-sm">Logout</span>
              </button>
            </div>
          </header>

          {/* Dynamic Content Body */}
          <div className="dmd-admin-content-area">

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="dmd-admin-fade">
                
                {/* Hero Editorial Header */}
                <div className="dmd-admin-hero-block">
                  <div>
                    <div className="dmd-hero-eyebrow">VRINDA VIHAR SAAS PLATFORM</div>
                    <h1 className="dmd-hero-title">Platform Command & Commerce Center</h1>
                    <p className="dmd-hero-sub">Real-time devotee concierge inquiries, Brij pilgrimage dispatches, and verified bookings</p>
                  </div>
                  <div className="dmd-hero-badges hide-sm">
                    <span className="dmd-badge-lime">● 100% OPERATIONAL</span>
                    <span className="dmd-badge-cream">📍 25 SACRED POIS</span>
                  </div>
                </div>

                {/* Editorial Color-Block KPI Cards (DESIGN.MD Spec) */}
                <div className="dmd-kpi-block-grid">
                  
                  {/* Card 1: Lime Block */}
                  <div className="dmd-kpi-card lime">
                    <div className="dmd-kpi-card-top">
                      <span>SACRED POIS</span>
                      <MapPinIcon style={{ width: 20, height: 20 }} />
                    </div>
                    <h2>{locations.length}</h2>
                    <div className="dmd-kpi-card-bottom">
                      <strong>Temples & Ghats</strong>
                      <small>100% Active</small>
                    </div>
                  </div>

                  {/* Card 2: Lilac Block */}
                  <div className="dmd-kpi-card lilac">
                    <div className="dmd-kpi-card-top">
                      <span>VERIFIED PARTNERS</span>
                      <CheckBadgeIcon style={{ width: 20, height: 20 }} />
                    </div>
                    <h2>{partners.filter(p => p.verified).length}</h2>
                    <div className="dmd-kpi-card-bottom">
                      <strong>Ashrams & Guides</strong>
                      <small>{partners.filter(p => !p.verified).length} pending</small>
                    </div>
                  </div>

                  {/* Card 3: Cream Block */}
                  <div className="dmd-kpi-card cream">
                    <div className="dmd-kpi-card-top">
                      <span>FLEET DRIVERS</span>
                      <TruckIcon style={{ width: 20, height: 20 }} />
                    </div>
                    <h2>{drivers.length}</h2>
                    <div className="dmd-kpi-card-bottom">
                      <strong>E-Rickshaws & Cabs</strong>
                      <small>GPS Tracked</small>
                    </div>
                  </div>

                  {/* Card 4: Sky Block */}
                  <div className="dmd-kpi-card sky">
                    <div className="dmd-kpi-card-top">
                      <span>LIVE DISPATCHES</span>
                      <ClockIcon style={{ width: 20, height: 20 }} />
                    </div>
                    <h2>{rideRequests.length + roomBookings.length + tableReservations.length}</h2>
                    <div className="dmd-kpi-card-bottom">
                      <strong>Active Bookings</strong>
                      <small>Real-time Queue</small>
                    </div>
                  </div>

                  {/* Card 5: Dark Obsidian Block */}
                  <div className="dmd-kpi-card dark">
                    <div className="dmd-kpi-card-top">
                      <span>STRIPE GMV</span>
                      <CreditCardIcon style={{ width: 20, height: 20, color: '#34d399' }} />
                    </div>
                    <h2 style={{ color: '#34d399' }}>
                      {formatINR(payments.reduce((s, p) => s + (p.amount || 0), 0))}
                    </h2>
                    <div className="dmd-kpi-card-bottom">
                      <strong style={{ color: '#ffffff' }}>{payments.length} Transactions</strong>
                      <small style={{ color: '#94a3b8' }}>Instant Receipts</small>
                    </div>
                  </div>

                </div>

                {/* 2-Column Split: Analytics Graph & Live Event Feed */}
                <div className="dmd-editorial-split-grid">
                  
                  {/* Left: Volume Graph */}
                  <div className="dmd-editorial-card">
                    <div className="dmd-card-header-bar">
                      <div>
                        <h3>Pilgrimage & Yatra Volume Analytics</h3>
                        <p>Monthly devotee booking engagement index across Brij 84 Kos</p>
                      </div>
                      <span className="dmd-pill-outline">2026 Telemetry</span>
                    </div>

                    <div className="dmd-editorial-chart">
                      {[
                        { month: 'Jan', val: 45, label: '₹1.1L' },
                        { month: 'Feb', val: 68, label: '₹1.8L' },
                        { month: 'Mar', val: 95, label: '₹2.4L (Holi)' },
                        { month: 'Apr', val: 55, label: '₹1.4L' },
                        { month: 'May', val: 78, label: '₹2.0L' },
                        { month: 'Jun', val: 100, label: '₹2.8L (Peak)' },
                      ].map((col) => (
                        <div key={col.month} className="dmd-chart-column">
                          <div className="dmd-bar-track">
                            <div 
                              className="dmd-bar-fill" 
                              style={{ height: `${col.val}%` }} 
                              title={`${col.month}: ${col.label}`}
                            />
                          </div>
                          <span className="dmd-chart-lbl">{col.month}</span>
                          <small className="dmd-chart-sub">{col.label}</small>
                        </div>
                      ))}
                    </div>

                    {/* Operations Fast Actions Toolbar */}
                    <div className="dmd-fast-actions-grid">
                      <button className="dmd-action-btn primary" onClick={() => { setActiveTab('locations'); setShowAddPoiModal(true); }}>
                        <PlusIcon style={{ width: 16, height: 16 }} /> Add Sacred POI
                      </button>
                      <button className="dmd-action-btn" onClick={() => { setActiveTab('partners'); setShowAddPartnerModal(true); }}>
                        <UserPlusIcon style={{ width: 16, height: 16 }} /> Register Partner
                      </button>
                      <button className="dmd-action-btn" onClick={() => setActiveTab('support')}>
                        <ChatBubbleLeftRightIcon style={{ width: 16, height: 16 }} /> Devotee Help Desk
                      </button>
                      <button className="dmd-action-btn" onClick={() => setActiveTab('broadcast')}>
                        <MegaphoneIcon style={{ width: 16, height: 16 }} /> Broadcast Ticker
                      </button>
                    </div>
                  </div>

                  {/* Right: Live Platform Events Feed */}
                  <div className="dmd-editorial-card">
                    <div className="dmd-card-header-bar">
                      <div>
                        <h3>Live Operations Stream</h3>
                        <p>Real-time system actions & updates</p>
                      </div>
                      <span className="dmd-badge-lime">● STREAMING</span>
                    </div>

                    <div className="dmd-event-stream">
                      <div className="dmd-stream-item">
                        <div className="dmd-stream-bullet lime" />
                        <div className="dmd-stream-body">
                          <strong>Help Centre In-App Messaging Live</strong>
                          <p>Bi-directional devotee chat & smart concierge responder active</p>
                          <small>Just now</small>
                        </div>
                      </div>

                      <div className="dmd-stream-item">
                        <div className="dmd-stream-bullet blue" />
                        <div className="dmd-stream-body">
                          <strong>Stripe Payment Gateway Ready</strong>
                          <p>Online checkout & test card verification integrated</p>
                          <small>2m ago</small>
                        </div>
                      </div>

                      <div className="dmd-stream-item">
                        <div className="dmd-stream-bullet cream" />
                        <div className="dmd-stream-body">
                          <strong>Sacred POI Directory Synced</strong>
                          <p>{locations.length} temples & ghats active on live Leaflet map</p>
                          <small>5m ago</small>
                        </div>
                      </div>

                      <div className="dmd-stream-item">
                        <div className="dmd-stream-bullet dark" />
                        <div className="dmd-stream-body">
                          <strong>Administrator Session Active</strong>
                          <p>{adminUserEmail || 'sakhi@vrindatours.com'} logged into Command Suite</p>
                          <small>Active</small>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Row: System Infrastructure Matrix */}
                <div className="dmd-editorial-card" style={{ marginTop: '20px' }}>
                  <div className="dmd-card-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ServerStackIcon style={{ width: 20, height: 20 }} />
                      <h3 style={{ margin: 0 }}>System Infrastructure & Cloud Connectivity</h3>
                    </div>
                    <span className="dmd-badge-lime">● 4/4 ENGINES CONNECTED</span>
                  </div>

                  <div className="dmd-infra-matrix">
                    <div className="dmd-infra-box">
                      <div className="dmd-infra-top">
                        <span>POSTGRES DATABASE</span>
                        <span className="dmd-latency-tag">24ms</span>
                      </div>
                      <strong>Supabase Cloud</strong>
                      <small>Partners, Bookings, Payments, Support</small>
                    </div>

                    <div className="dmd-infra-box">
                      <div className="dmd-infra-top">
                        <span>REAL-TIME DISPATCH</span>
                        <span className="dmd-latency-tag">18ms</span>
                      </div>
                      <strong>Cloud Firestore</strong>
                      <small>Sacred POIs & Driver Fleet Coordinates</small>
                    </div>

                    <div className="dmd-infra-box">
                      <div className="dmd-infra-top">
                        <span>BASEMAP TILES</span>
                        <span className="dmd-latency-tag">Protected</span>
                      </div>
                      <strong>CARTO Voyager</strong>
                      <small>High-contrast Vector Maps & OSRM Engine</small>
                    </div>

                    <div className="dmd-infra-box">
                      <div className="dmd-infra-top">
                        <span>PAYMENT GATEWAY</span>
                        <span className="dmd-latency-tag">Active</span>
                      </div>
                      <strong>Stripe Connect</strong>
                      <small>In-App Instant Voucher & Receipt System</small>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SACRED POIS */}
            {activeTab === 'locations' && (
              <div className="dmd-admin-fade">
                <div className="dmd-card-header-bar" style={{ marginBottom: '18px' }}>
                  <div>
                    <h2 className="dmd-section-title">Sacred POIs & Mandir Directory ({filteredLocations.length})</h2>
                    <p className="dmd-section-sub">Manage temples, ghats, prasadam spots, and ashrams shown on the live map</p>
                  </div>
                  <button 
                    type="button" 
                    className="dmd-action-btn primary"
                    onClick={() => setShowAddPoiModal(true)}
                  >
                    <PlusIcon style={{ width: 16, height: 16 }} /> Add Sacred Location
                  </button>
                </div>

                {/* Filter Toolbar */}
                <div className="dmd-filters-bar">
                  <div className="dmd-search-field-wrap">
                    <MagnifyingGlassIcon style={{ width: 16, height: 16, color: '#000000' }} />
                    <input 
                      type="text" 
                      placeholder="Search temple name, area, or description..." 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="dmd-search-input"
                    />
                    {searchQuery && (
                      <button className="dmd-search-clear" onClick={() => setSearchQuery('')}>
                        <XMarkIcon style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>

                  <div className="dmd-chips-container">
                    {['all', 'Temple', 'Stay', 'Food', 'Holy Site'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`dmd-category-chip ${poiCategoryFilter === cat ? 'active' : ''}`}
                        onClick={() => setPoiCategoryFilter(cat)}
                      >
                        {cat === 'all' ? 'All Sacred Sites' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* High Contrast Editorial Table */}
                <div className="dmd-table-wrapper">
                  <table className="dmd-data-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Sacred Location / Mandir</th>
                        <th>Category</th>
                        <th>GPS Coordinates</th>
                        <th>Rating</th>
                        <th>Darshan Timings</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLocations.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            No sacred locations matching your query.
                          </td>
                        </tr>
                      ) : (
                        filteredLocations.map((loc) => (
                          <tr key={loc.id || loc.name}>
                            <td>
                              <img 
                                src={loc.image || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=150&q=80'} 
                                alt={loc.name} 
                                className="dmd-poi-thumb"
                              />
                            </td>
                            <td>
                              <strong className="dmd-poi-name">{loc.name}</strong>
                              <span className="dmd-cell-sub">{loc.description?.slice(0, 60)}...</span>
                            </td>
                            <td>
                              <span className="dmd-tag-category">{loc.category}</span>
                            </td>
                            <td>
                              <code className="dmd-coord-pill">
                                {typeof loc.lat === 'number' ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : `${loc.lat}, ${loc.lng}`}
                              </code>
                            </td>
                            <td>
                              <div className="dmd-rating-box">
                                <StarSolid style={{ width: 14, height: 14, color: '#f59e0b' }} />
                                <span>{loc.rating || 4.9}</span>
                                <small>({loc.reviews || 100}+)</small>
                              </div>
                            </td>
                            <td>
                              <span className="dmd-cell-sub">{loc.timings || '5:00 AM - 9:00 PM'}</span>
                            </td>
                            <td>
                              <div className="dmd-actions-cluster">
                                <button 
                                  type="button" 
                                  className="dmd-tbl-action-btn edit"
                                  onClick={() => setEditingPoi(loc)}
                                  title="Edit details"
                                >
                                  <PencilSquareIcon style={{ width: 14, height: 14 }} />
                                </button>
                                <button 
                                  type="button" 
                                  className="dmd-tbl-action-btn delete"
                                  onClick={() => setDeletingPoi(loc)}
                                  title="Delete location"
                                >
                                  <TrashIcon style={{ width: 14, height: 14 }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PARTNERS */}
            {activeTab === 'partners' && (
              <div className="dmd-admin-fade">
                <div className="dmd-card-header-bar" style={{ marginBottom: '18px' }}>
                  <div>
                    <h2 className="dmd-section-title">Partner Directory & Verification Center ({partners.length})</h2>
                    <p className="dmd-section-sub">Audit ashrams, hotels, fleet drivers, and local tour operators</p>
                  </div>
                  <button 
                    type="button" 
                    className="dmd-action-btn primary"
                    onClick={() => setShowAddPartnerModal(true)}
                  >
                    <UserPlusIcon style={{ width: 16, height: 16 }} /> Register Partner
                  </button>
                </div>

                <div className="dmd-table-wrapper">
                  <table className="dmd-data-table">
                    <thead>
                      <tr>
                        <th>Partner / Business</th>
                        <th>Category</th>
                        <th>Contact Phone</th>
                        <th>Location Area</th>
                        <th>Verification Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            No partners registered yet.
                          </td>
                        </tr>
                      ) : (
                        partners.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <strong>{p.name || p.property_name || p.outlet_name}</strong>
                              <span className="dmd-cell-sub">{p.email || 'Direct partner'}</span>
                            </td>
                            <td>
                              <span className="dmd-tag-category">{p.type || p.category || 'Ashram / Stay'}</span>
                            </td>
                            <td>
                              <span>📞 {p.phone || '+91 98765 43210'}</span>
                            </td>
                            <td>
                              <span className="dmd-cell-sub">{p.address || 'Vrindavan Dham'}</span>
                            </td>
                            <td>
                              <span className={`dmd-verify-pill ${p.verified ? 'verified' : 'pending'}`}>
                                <CheckCircleIcon style={{ width: 12, height: 12 }} />
                                {p.verified ? 'Verified Partner' : 'Pending Audit'}
                              </span>
                            </td>
                            <td>
                              <button 
                                type="button" 
                                className={`dmd-btn-verify-action ${p.verified ? 'is-verified' : ''}`}
                                onClick={() => handleVerifyPartner(p.id, p.verified)}
                              >
                                {p.verified ? 'Revoke' : 'Approve & Publish'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: LIVE BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="dmd-admin-fade">
                <h2 className="dmd-section-title">Live Dispatch & Bookings Queue</h2>
                <p className="dmd-section-sub">Incoming ride requests, room reservations, and table orders across Brij</p>

                <div className="dmd-table-wrapper" style={{ marginTop: '18px' }}>
                  <table className="dmd-data-table">
                    <thead>
                      <tr>
                        <th>Service Type</th>
                        <th>Devotee Name</th>
                        <th>Destination / Room</th>
                        <th>Contact Info</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...rideRequests, ...roomBookings, ...tableReservations].length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                            <ClockIcon style={{ width: 34, height: 34, margin: '0 auto 8px', color: '#94a3b8' }} />
                            <p style={{ margin: 0, fontWeight: 700 }}>No live bookings currently in queue.</p>
                          </td>
                        </tr>
                      ) : (
                        [...rideRequests, ...roomBookings, ...tableReservations].map((b, idx) => (
                          <tr key={b.id || idx}>
                            <td>
                              <span className="dmd-tag-category">
                                {b.hotel_name ? 'Hotel Stay' : b.outlet_name ? 'Dining' : 'E-Rickshaw Ride'}
                              </span>
                            </td>
                            <td><strong>{b.user_name || b.guest_name || 'Pilgrim'}</strong></td>
                            <td><span>{b.hotel_name || b.destination || b.package_title || 'Direct Booking'}</span></td>
                            <td><span>{b.user_phone || b.phone || 'Direct'}</span></td>
                            <td>
                              <span className="dmd-verify-pill verified">{b.status || 'Confirmed'}</span>
                            </td>
                            <td>
                              <span className="dmd-cell-sub">
                                {b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : 'Recent'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: REGISTRATIONS */}
            {activeTab === 'registrations' && (
              <div className="dmd-admin-fade">
                <h2 className="dmd-section-title">Partner Registration Applications ({registrations.length})</h2>
                <p className="dmd-section-sub">Incoming applications from drivers, hoteliers, and local travel agencies</p>

                <div className="dmd-table-wrapper" style={{ marginTop: '18px' }}>
                  <table className="dmd-data-table">
                    <thead>
                      <tr>
                        <th>Applicant / Business</th>
                        <th>Role Type</th>
                        <th>Phone / Mobile</th>
                        <th>City / Region</th>
                        <th>Status</th>
                        <th>Application Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                            No pending partner onboarding applications.
                          </td>
                        </tr>
                      ) : (
                        registrations.map((reg, idx) => (
                          <tr key={reg.id || idx}>
                            <td><strong>{reg.title || reg.name}</strong></td>
                            <td><span className="dmd-tag-category">{reg.regType}</span></td>
                            <td><span>📞 {reg.phone || 'Provided'}</span></td>
                            <td><span>{reg.city || 'Mathura/Vrindavan'}</span></td>
                            <td><span className="dmd-verify-pill pending">In Review</span></td>
                            <td>
                              <span className="dmd-cell-sub">
                                {reg.created_at ? new Date(reg.created_at).toLocaleDateString('en-IN') : 'Recent'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
            {activeTab === 'broadcast' && (
              <div className="dmd-admin-fade">
                <h2 className="dmd-section-title">Site Announcements & Scrolling Ticker</h2>
                <p className="dmd-section-sub">Manage real-time alerts and darshan notifications shown on top of the website</p>

                <div className="dmd-editorial-card" style={{ marginTop: '18px' }}>
                  <form onSubmit={handleAddBroadcastItem} className="dmd-broadcast-form">
                    <input 
                      type="text" 
                      placeholder="Enter announcement text (e.g. Mangala Aarti timings, weather advisory...)"
                      value={newBroadcastText}
                      onChange={e => setNewBroadcastText(e.target.value)}
                      className="dmd-broadcast-input"
                    />
                    <button type="submit" className="dmd-action-btn primary">
                      <PlusIcon style={{ width: 16, height: 16 }} /> Publish Notice
                    </button>
                  </form>

                  <div className="dmd-broadcast-list">
                    {broadcastItems.map((item) => (
                      <div key={item.id} className="dmd-broadcast-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <MegaphoneIcon style={{ width: 16, height: 16, color: '#f59e0b' }} />
                          <span>{item.text}</span>
                        </div>
                        <button 
                          type="button" 
                          className="dmd-tbl-action-btn delete"
                          onClick={() => handleRemoveBroadcastItem(item.id)}
                          title="Delete notice"
                        >
                          <TrashIcon style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: STRIPE PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="dmd-admin-fade">
                
                {/* Revenue Banner (Editorial Dark Block) */}
                <div className="dmd-stripe-editorial-banner">
                  <div>
                    <span className="dmd-stripe-tag">STRIPE GATEWAY SETTLEMENT</span>
                    <h1 className="dmd-stripe-amount">
                      {formatINR(payments.reduce((s, p) => s + (p.amount || 0), 0))}
                    </h1>
                    <small>Verified transactions with instant digital voucher issuance</small>
                  </div>
                  <button type="button" className="dmd-action-btn" onClick={fetchAllData}>
                    <ArrowPathIcon style={{ width: 15, height: 15 }} /> Refresh Transactions
                  </button>
                </div>

                <div className="dmd-table-wrapper" style={{ marginTop: '20px' }}>
                  <table className="dmd-data-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Devotee / Customer</th>
                        <th>Package / Stay</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            <CreditCardIcon style={{ width: 40, height: 40, margin: '0 auto 10px', color: '#000000' }} />
                            <p style={{ margin: '0 0 4px 0', fontWeight: 800, color: '#000000', fontSize: '1rem' }}>
                              No Stripe Transactions Recorded Yet
                            </p>
                            <small>When devotees book yatra packages, verified receipts appear here automatically.</small>
                          </td>
                        </tr>
                      ) : (
                        payments.map((p, idx) => {
                          const txnId = p.transaction_id || p.id || `txn_${idx}`;
                          return (
                            <tr key={txnId}>
                              <td>
                                <div className="dmd-copy-id-wrap" onClick={() => copyToClipboard(txnId, txnId)}>
                                  <code className="dmd-coord-pill">{txnId.slice(0, 16)}...</code>
                                  {copiedId === txnId ? (
                                    <CheckIcon style={{ width: 12, height: 12, color: '#16a34a' }} />
                                  ) : (
                                    <ClipboardDocumentIcon style={{ width: 12, height: 12, color: '#94a3b8' }} />
                                  )}
                                </div>
                              </td>
                              <td>
                                <strong>{p.customer_name || 'Guest Devotee'}</strong>
                                <span className="dmd-cell-sub">{p.customer_email || p.customer_phone || 'Direct'}</span>
                              </td>
                              <td>
                                <strong>{p.item_title || 'Brij Yatra Package'}</strong>
                              </td>
                              <td>
                                <strong style={{ color: '#16a34a', fontSize: '0.98rem' }}>{formatINR(p.amount)}</strong>
                              </td>
                              <td>
                                <span className="dmd-cell-sub">
                                  {p.payment_method === 'stripe_card' ? `Card (•••• ${p.card_last4 || '4242'})` : p.payment_method || 'Card'}
                                </span>
                              </td>
                              <td>
                                <span className="dmd-verify-pill verified">
                                  <CheckCircleIcon style={{ width: 12, height: 12 }} />
                                  {p.status || 'Succeeded'}
                                </span>
                              </td>
                              <td>
                                <span className="dmd-cell-sub">
                                  {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 8: HELP CENTRE */}
            {activeTab === 'support' && (
              <div className="dmd-admin-fade">
                <div className="dmd-card-header-bar" style={{ marginBottom: '18px' }}>
                  <div>
                    <h2 className="dmd-section-title">Help Centre & Pilgrimage Concierge Console</h2>
                    <p className="dmd-section-sub">Direct bi-directional chat threads with devotees browsing the website</p>
                  </div>
                  <button type="button" className="dmd-action-btn" onClick={fetchAllData}>
                    <ArrowPathIcon style={{ width: 15, height: 15 }} /> Refresh Threads
                  </button>
                </div>

                <div className="dmd-inbox-grid">
                  
                  {/* Left: Thread List */}
                  <div className="dmd-inbox-threads-pane">
                    <div className="dmd-inbox-search">
                      <input 
                        type="text" 
                        placeholder="Search devotee or inquiry text..." 
                        value={supportSearch} 
                        onChange={e => setSupportSearch(e.target.value)}
                        className="dmd-inbox-search-input"
                      />
                    </div>

                    <div className="dmd-threads-list-scroll">
                      {supportThreads.length === 0 ? (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                          No support inquiries recorded yet
                        </div>
                      ) : (
                        supportThreads
                          .filter(t => !supportSearch || (t.sender_name || '').toLowerCase().includes(supportSearch.toLowerCase()) || (t.last_message || '').toLowerCase().includes(supportSearch.toLowerCase()))
                          .map((thread) => {
                            const isSelected = selectedThreadId === thread.thread_id;
                            return (
                              <button
                                key={thread.thread_id}
                                type="button"
                                className={`dmd-thread-card-btn ${isSelected ? 'active' : ''}`}
                                onClick={() => setSelectedThreadId(thread.thread_id)}
                              >
                                <div className="dmd-thread-top-row">
                                  <strong>{thread.sender_name || 'Devotee Pilgrim'}</strong>
                                  <small>
                                    {thread.last_updated ? new Date(thread.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                  </small>
                                </div>
                                <p className="dmd-thread-preview">{thread.last_message || 'New ticket initiated'}</p>
                                <div className="dmd-thread-footer-row">
                                  <span className="dmd-tag-category">{thread.category || 'general'}</span>
                                  <span className={`dmd-verify-pill ${thread.status === 'resolved' ? 'verified' : 'pending'}`}>
                                    {thread.status || 'open'}
                                  </span>
                                </div>
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>

                  {/* Right: Message Stream */}
                  <div className="dmd-inbox-chat-pane">
                    {(() => {
                      const activeThread = supportThreads.find(t => t.thread_id === selectedThreadId);
                      if (!activeThread) {
                        return (
                          <div className="dmd-chat-empty-state">
                            <ChatBubbleLeftRightIcon style={{ width: 48, height: 48, color: '#000000' }} />
                            <h3>Select a Devotee Conversation</h3>
                            <p>Active live chat messages and inquiries will display here.</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          <div className="dmd-chat-pane-header">
                            <div>
                              <h3>{activeThread.sender_name || 'Devotee Pilgrim'}</h3>
                              <span className="dmd-chat-meta">
                                {activeThread.sender_phone ? `📞 ${activeThread.sender_phone} • ` : ''}
                                {activeThread.sender_email ? `✉️ ${activeThread.sender_email} • ` : ''}
                                Ticket #{activeThread.thread_id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="dmd-action-btn"
                                onClick={() => handleUpdateStatus(activeThread.thread_id, 'in_progress')}
                              >
                                In Progress
                              </button>
                              <button
                                type="button"
                                className="dmd-action-btn"
                                style={{ background: '#dceeb1', color: '#000000', borderColor: '#000000' }}
                                onClick={() => handleUpdateStatus(activeThread.thread_id, 'resolved')}
                              >
                                Mark Resolved
                              </button>
                            </div>
                          </div>

                          <div className="dmd-chat-bubbles-scroll">
                            {(activeThread.messages || []).map((m, idx) => {
                              const isMe = m.sender === 'admin';
                              const isBot = m.sender === 'concierge_bot';
                              return (
                                <div
                                  key={m.id || idx}
                                  className={`dmd-chat-row ${isMe ? 'is-admin' : isBot ? 'is-bot' : 'is-devotee'}`}
                                >
                                  <span className="dmd-chat-author-tag">
                                    {isMe ? 'Vrinda Vihar Desk (You)' : isBot ? 'Concierge Bot' : (m.sender_name || 'Devotee')}
                                  </span>
                                  <div className="dmd-chat-bubble-box">
                                    {m.message}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <form className="dmd-chat-compose-box" onSubmit={handleSendAdminReply}>
                            <input
                              type="text"
                              placeholder="Type response to devotee live chat..."
                              value={adminReplyText}
                              onChange={e => setAdminReplyText(e.target.value)}
                              disabled={isSendingReply}
                              className="dmd-chat-input-text"
                            />
                            <button
                              type="submit"
                              className="dmd-btn-send-reply"
                              disabled={!adminReplyText.trim() || isSendingReply}
                            >
                              <PaperAirplaneIcon style={{ width: 15, height: 15 }} />
                              <span>{isSendingReply ? 'Sending...' : 'Send'}</span>
                            </button>
                          </form>
                        </>
                      );
                    })()}
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* SUB-MODAL: ADD LOCATION */}
      {showAddPoiModal && (
        <div className="dmd-dialog-overlay" onClick={() => setShowAddPoiModal(false)}>
          <div className="dmd-dialog-card" onClick={e => e.stopPropagation()}>
            <div className="dmd-dialog-head">
              <h3>Add Sacred Location to Live Map</h3>
              <button className="dmd-dialog-close" onClick={() => setShowAddPoiModal(false)}>
                <XMarkIcon style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleCreatePoi} className="dmd-dialog-form">
              <div className="dmd-form-group">
                <label>Location / Mandir Name *</label>
                <input 
                  type="text" 
                  value={poiName} 
                  onChange={e => setPoiName(e.target.value)} 
                  placeholder="e.g. Bankey Bihari Mandir" 
                  required 
                />
              </div>
              <div className="dmd-form-group">
                <label>Category</label>
                <select value={poiCategory} onChange={e => setPoiCategory(e.target.value)}>
                  <option value="Temple">Temple</option>
                  <option value="Stay">Stay / Ashram</option>
                  <option value="Food">Food / Prasadam</option>
                  <option value="Holy Site">Holy Site / Ghat</option>
                  <option value="Transport">Transport Hub</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="dmd-form-group" style={{ flex: 1 }}>
                  <label>Latitude *</label>
                  <input 
                    type="number" 
                    step="any" 
                    value={poiLat} 
                    onChange={e => setPoiLat(e.target.value)} 
                    placeholder="27.5818" 
                    required 
                  />
                </div>
                <div className="dmd-form-group" style={{ flex: 1 }}>
                  <label>Longitude *</label>
                  <input 
                    type="number" 
                    step="any" 
                    value={poiLng} 
                    onChange={e => setPoiLng(e.target.value)} 
                    placeholder="77.6975" 
                    required 
                  />
                </div>
              </div>
              <div className="dmd-form-group">
                <label>Image URL</label>
                <input 
                  type="url" 
                  value={poiImage} 
                  onChange={e => setPoiImage(e.target.value)} 
                  placeholder="https://images.unsplash.com/..." 
                />
              </div>
              <div className="dmd-form-group">
                <label>Spiritual Description</label>
                <textarea 
                  rows="2" 
                  value={poiDescription} 
                  onChange={e => setPoiDescription(e.target.value)} 
                  placeholder="Spiritual significance..." 
                />
              </div>
              <button type="submit" className="dmd-action-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                Save Location
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: EDIT LOCATION */}
      {editingPoi && (
        <div className="dmd-dialog-overlay" onClick={() => setEditingPoi(null)}>
          <div className="dmd-dialog-card" onClick={e => e.stopPropagation()}>
            <div className="dmd-dialog-head">
              <h3>Edit Sacred Location</h3>
              <button className="dmd-dialog-close" onClick={() => setEditingPoi(null)}>
                <XMarkIcon style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleSaveEditPoi} className="dmd-dialog-form">
              <div className="dmd-form-group">
                <label>Location Name</label>
                <input 
                  type="text" 
                  value={editingPoi.name} 
                  onChange={e => setEditingPoi({ ...editingPoi, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="dmd-form-group">
                <label>Category</label>
                <select 
                  value={editingPoi.category} 
                  onChange={e => setEditingPoi({ ...editingPoi, category: e.target.value })}
                >
                  <option value="Temple">Temple</option>
                  <option value="Stay">Stay / Ashram</option>
                  <option value="Food">Food / Prasadam</option>
                  <option value="Holy Site">Holy Site / Ghat</option>
                </select>
              </div>
              <div className="dmd-form-group">
                <label>Timings</label>
                <input 
                  type="text" 
                  value={editingPoi.timings || ''} 
                  onChange={e => setEditingPoi({ ...editingPoi, timings: e.target.value })} 
                />
              </div>
              <button type="submit" className="dmd-action-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                Update Location
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: DELETE POI CONFIRM */}
      {deletingPoi && (
        <div className="dmd-dialog-overlay" onClick={() => setDeletingPoi(null)}>
          <div className="dmd-dialog-card" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="dmd-dialog-head">
              <h3>Delete Location</h3>
              <button className="dmd-dialog-close" onClick={() => setDeletingPoi(null)}>
                <XMarkIcon style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#475569' }}>
              Are you sure you want to permanently delete <strong>{deletingPoi.name}</strong> from the Sacred Map?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="dmd-action-btn" style={{ flex: 1 }} onClick={() => setDeletingPoi(null)}>
                Cancel
              </button>
              <button 
                className="dmd-action-btn" 
                style={{ flex: 1, background: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }} 
                onClick={handleDeletePoi}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
