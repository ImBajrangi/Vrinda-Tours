import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  XMarkIcon, PlusIcon, TrashIcon, CameraIcon, 
  ArrowRightOnRectangleIcon, UserIcon, LockClosedIcon, 
  UserPlusIcon, PhoneIcon, TruckIcon, ExclamationTriangleIcon,
  MapPinIcon, CheckCircleIcon, MagnifyingGlassIcon, SparklesIcon,
  BuildingOffice2Icon, BuildingStorefrontIcon, GlobeAltIcon,
  ClockIcon, ArrowPathIcon, EyeIcon, PencilSquareIcon, 
  MegaphoneIcon, ChartBarIcon, TagIcon, StarIcon as StarOutline,
  ShieldCheckIcon, ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { doc, setDoc, deleteDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { supabase } from '../../config/supabase';
import './AdminPanel.css';

// Admin email whitelist from environment
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPanel({ 
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

  // Main Dashboard Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'locations' | 'partners' | 'bookings' | 'registrations' | 'broadcast'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Auto-check Supabase Auth session for admin privileges
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email?.toLowerCase();
        if (email && ADMIN_EMAILS.includes(email)) {
          setIsLoggedIn(true);
          setAdminUserEmail(email);
        }
      } catch {}
      setIsChecking(false);
    };
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.toLowerCase();
      if (email && ADMIN_EMAILS.includes(email)) {
        setIsLoggedIn(true);
        setAdminUserEmail(email);
      } else {
        setIsLoggedIn(false);
        setAdminUserEmail('');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // -------------------------------------------------------------
  // 2. Data State: Partners, Bookings, Registrations, Broadcasts
  // -------------------------------------------------------------
  const [partners, setPartners] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [roomBookings, setRoomBookings] = useState([]);
  const [tableReservations, setTableReservations] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Modals & CRUD Form States
  const [showAddPoiModal, setShowAddPoiModal] = useState(false);
  const [editingPoi, setEditingPoi] = useState(null);
  const [deletingPoi, setDeletingPoi] = useState(null);

  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [deletingPartnerId, setDeletingPartnerId] = useState(null);

  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 3200);
  };

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

      // 5. Driver / Hotel / Restaurant / Agency Stepped Registrations
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
    } catch (err) {
      console.warn('Admin fetch data warning:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn, fetchAllData]);

  // -------------------------------------------------------------
  // 3. Auth Actions
  // -------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (authErr) {
        setError(authErr.message || 'Authentication failed');
        return;
      }
      const email = data?.user?.email?.toLowerCase();
      if (email && ADMIN_EMAILS.includes(email)) {
        setIsLoggedIn(true);
        setAdminUserEmail(email);
      } else {
        setError('This account does not have administrator privileges.');
        await supabase.auth.signOut();
      }
    } catch (err) {
      setError('Login failed. Please verify credentials.');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setIsLoggedIn(false);
    setAdminUserEmail('');
  };

  // -------------------------------------------------------------
  // 4. POI / Locations Control (Firestore CRUD)
  // -------------------------------------------------------------
  const [poiCategoryFilter, setPoiCategoryFilter] = useState('all');
  const [poiName, setPoiName] = useState('');
  const [poiCategory, setPoiCategory] = useState('Temple');
  const [poiLat, setPoiLat] = useState('');
  const [poiLng, setPoiLng] = useState('');
  const [poiRating, setPoiRating] = useState('4.9');
  const [poiPoints, setPoiPoints] = useState('100');
  const [poiDescription, setPoiDescription] = useState('');
  const [poiImageUrl, setPoiImageUrl] = useState('');

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesCat = poiCategoryFilter === 'all' || loc.category === poiCategoryFilter;
      const matchesSearch = !searchQuery.trim() || 
        loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [locations, poiCategoryFilter, searchQuery]);

  const handleCreatePoi = async (e) => {
    e.preventDefault();
    const lat = parseFloat(poiLat) || 27.6461;
    const lng = parseFloat(poiLng) || 77.3777;

    const newLoc = {
      name: poiName.trim(),
      category: poiCategory,
      lat,
      lng,
      rating: poiRating || '4.9',
      points: parseInt(poiPoints, 10) || 100,
      description: poiDescription.trim(),
      imageUrl: poiImageUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const colRef = collection(firestore, 'locations');
      await addDoc(colRef, newLoc);
      showToast(`Added sacred site "${newLoc.name}" to live map!`);
      setShowAddPoiModal(false);
      setPoiName(''); setPoiLat(''); setPoiLng(''); setPoiDescription(''); setPoiImageUrl('');
    } catch (err) {
      showToast('Error saving location to Firestore', 'error');
    }
  };

  const handleOpenEditPoi = (loc) => {
    setEditingPoi(loc);
    setPoiName(loc.name || '');
    setPoiCategory(loc.category || 'Temple');
    setPoiLat(loc.lat ? String(loc.lat) : '');
    setPoiLng(loc.lng ? String(loc.lng) : '');
    setPoiRating(loc.rating ? String(loc.rating) : '4.9');
    setPoiPoints(loc.points ? String(loc.points) : '100');
    setPoiDescription(loc.description || '');
    setPoiImageUrl(loc.imageUrl || '');
  };

  const handleUpdatePoi = async (e) => {
    e.preventDefault();
    if (!editingPoi?.id) {
      showToast('Cannot update non-persisted POI document', 'error');
      return;
    }

    try {
      const docRef = doc(firestore, 'locations', editingPoi.id);
      await updateDoc(docRef, {
        name: poiName.trim(),
        category: poiCategory,
        lat: parseFloat(poiLat) || editingPoi.lat,
        lng: parseFloat(poiLng) || editingPoi.lng,
        rating: poiRating,
        points: parseInt(poiPoints, 10) || 100,
        description: poiDescription.trim(),
        imageUrl: poiImageUrl.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Updated "${poiName}" successfully!`);
      setEditingPoi(null);
    } catch (err) {
      showToast('Failed to update POI in Firestore', 'error');
    }
  };

  const confirmDeletePoi = async () => {
    if (!deletingPoi?.id) return;
    try {
      await deleteDoc(doc(firestore, 'locations', deletingPoi.id));
      showToast(`Deleted "${deletingPoi.name}" from database.`);
      setDeletingPoi(null);
    } catch (err) {
      showToast('Failed to delete location document.', 'error');
    }
  };

  // -------------------------------------------------------------
  // 5. Partner & Verifications Control
  // -------------------------------------------------------------
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState('driver');
  const [newPartnerRole, setNewPartnerRole] = useState('');

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      let matchesCategory = true;
      if (partnerFilter === 'pending') matchesCategory = !p.verified;
      else if (partnerFilter !== 'all') matchesCategory = p.category === partnerFilter;

      const matchesSearch = !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.includes(searchQuery) ||
        p.role_details?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [partners, partnerFilter, searchQuery]);

  const handleTogglePartnerVerify = async (partner) => {
    const nextVerified = !partner.verified;
    const nextStatus = nextVerified ? 'Active' : 'Pending Admin Verification';
    const nextLock = nextVerified;

    setPartners(prev => prev.map(p => p.id === partner.id ? { 
      ...p, 
      verified: nextVerified, 
      category_locked: nextLock, 
      status: nextStatus 
    } : p));

    try {
      const { error: err } = await supabase
        .from('partners')
        .update({
          verified: nextVerified,
          category_locked: nextLock,
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (err) {
        fetchAllData();
        showToast('Database update notice', 'error');
      } else {
        showToast(nextVerified ? `Verified & locked ${partner.name}!` : `Revoked verification for ${partner.name}`);
      }
    } catch {
      fetchAllData();
    }
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    const newId = `partner_${Date.now()}`;
    const roleDetails = newPartnerRole || (newPartnerCategory === 'driver' ? '🛺 E-Rickshaw Driver' : `${newPartnerCategory.toUpperCase()} Partner`);

    const newPartnerObj = {
      id: newId,
      name: newPartnerName,
      phone: newPartnerPhone,
      category: newPartnerCategory,
      role_details: roleDetails,
      rating: 5.0,
      verified: true,
      category_locked: true,
      status: 'Active',
      created_at: new Date().toISOString()
    };

    setPartners(prev => [newPartnerObj, ...prev]);
    setShowAddPartnerModal(false);
    setNewPartnerName(''); setNewPartnerPhone(''); setNewPartnerRole('');

    try {
      await supabase.from('partners').insert([newPartnerObj]);
      showToast(`Registered and verified partner "${newPartnerName}"!`);
    } catch {
      showToast('Error inserting partner into Supabase', 'error');
    }
  };

  const confirmDeletePartner = async () => {
    if (!deletingPartnerId) return;
    const id = deletingPartnerId;
    setPartners(prev => prev.filter(p => p.id !== id));
    setDeletingPartnerId(null);

    try {
      await supabase.from('partners').delete().eq('id', id);
      showToast('Partner record deleted.');
    } catch {
      showToast('Failed to delete partner from database', 'error');
      fetchAllData();
    }
  };

  // -------------------------------------------------------------
  // 6. Bookings & Rides Status Update
  // -------------------------------------------------------------
  const [bookingTypeFilter, setBookingTypeFilter] = useState('rides'); // 'rides' | 'rooms' | 'tables'

  const handleUpdateRideStatus = async (rideId, newStatus) => {
    setRideRequests(prev => prev.map(r => r.id === rideId ? { ...r, status: newStatus } : r));
    try {
      await supabase.from('ride_requests').update({ status: newStatus }).eq('id', rideId);
      showToast(`Ride marked as ${newStatus}`);
    } catch {}
  };

  const handleUpdateRoomStatus = async (bookingId, newStatus) => {
    setRoomBookings(prev => prev.map(r => r.id === bookingId ? { ...r, status: newStatus } : r));
    try {
      await supabase.from('room_bookings').update({ status: newStatus }).eq('id', bookingId);
      showToast(`Room booking marked as ${newStatus}`);
    } catch {}
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    setTableReservations(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    try {
      await supabase.from('table_reservations').update({ status: newStatus }).eq('id', tableId);
      showToast(`Table reservation marked as ${newStatus}`);
    } catch {}
  };

  // -------------------------------------------------------------
  // 7. Stepped Registrations: Promote to Partner
  // -------------------------------------------------------------
  const handleApproveRegistration = async (reg) => {
    const partnerId = `p_${Date.now()}`;
    const name = reg.name || reg.property_name || reg.outlet_name || reg.agency_name || 'Applicant';
    const phone = reg.phone || '+910000000000';
    const category = reg.regType || 'driver';
    const roleDetails = reg.vehicle_no ? `🛺 ${reg.vehicle_type || 'E-Rickshaw'} • ${reg.vehicle_no}` : (reg.property_type || reg.cuisine_type || 'Verified Partner');

    try {
      // 1. Insert into partners
      await supabase.from('partners').insert([{
        id: partnerId,
        name,
        phone,
        category,
        role_details: roleDetails,
        rating: 5.0,
        verified: true,
        category_locked: true,
        status: 'Active',
        created_at: new Date().toISOString()
      }]);

      // 2. Mark registration as completed
      const tableName = `${category}_registrations`;
      await supabase.from(tableName).update({ status: 'approved', completed: true }).eq('id', reg.id);

      showToast(`Approved registration for ${name}! Promoted to verified partner.`);
      fetchAllData();
    } catch {
      showToast('Error approving registration.', 'error');
    }
  };

  // -------------------------------------------------------------
  // 8. Site Announcements & Marquee Broadcast
  // -------------------------------------------------------------
  const [broadcastItems, setBroadcastItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vrinda_announcement_items');
      return saved ? JSON.parse(saved) : [
        { text: '✨ Electric Rickshaw & E-Auto Rides in Vrindavan & Barsana' },
        { text: '🏨 Verified Pilgrim Stays & Pure Sattvic Dining' },
        { text: '📍 Mathura • Vrindavan • Barsana • Nandgaon • Govardhan • Gokul' },
        { text: '🚩 Vrinda Vihar — Authentic Brij Mandal Pilgrimage Companion' }
      ];
    } catch {
      return [];
    }
  });
  const [broadcastEnabled, setBroadcastEnabled] = useState(() => localStorage.getItem('vrinda_announcement_enabled') !== 'false');
  const [newBroadcastText, setNewBroadcastText] = useState('');

  const handleSaveBroadcast = () => {
    try {
      localStorage.setItem('vrinda_announcement_items', JSON.stringify(broadcastItems));
      localStorage.setItem('vrinda_announcement_enabled', String(broadcastEnabled));
      window.dispatchEvent(new Event('vrinda_announcement_update'));
      showToast('Site announcement marquee updated live!');
    } catch {
      showToast('Error saving announcement', 'error');
    }
  };

  const handleAddBroadcastItem = (e) => {
    e.preventDefault();
    if (!newBroadcastText.trim()) return;
    setBroadcastItems(prev => [...prev, { text: newBroadcastText.trim() }]);
    setNewBroadcastText('');
  };

  const handleRemoveBroadcastItem = (index) => {
    setBroadcastItems(prev => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------
  // Auth Screen if not logged in
  // -------------------------------------------------------------
  if (isChecking) {
    return (
      <>
        <div className="adm-overlay" onClick={onClose} />
        <div className="adm-card-centered" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <ArrowPathIcon style={{ width: 32, height: 32, margin: '0 auto 12px', animation: 'spin 1s linear infinite', color: '#18181b' }} />
          <div style={{ fontSize: '0.9rem', color: '#71717a', fontWeight: 600 }}>Verifying Administrator Session...</div>
        </div>
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <div className="adm-overlay" onClick={onClose} />
        <div className="adm-card-centered">
          <button className="adm-btn-close" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }} onClick={onClose}>
            <XMarkIcon style={{ width: 18, height: 18 }} />
          </button>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '56px', height: '56px', background: '#09090b', borderRadius: '16px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <ShieldCheckIcon style={{ width: 26, height: 26 }} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#09090b', margin: '0 0 0.25rem 0' }}>Master Platform Control</h3>
            <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Vrinda Vihar SaaS Admin Suite</span>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div className="adm-form-group">
              <label>Admin Email</label>
              <div className="adm-input-wrapper">
                <UserIcon style={{ width: 18, height: 18 }} />
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  placeholder="admin@vrindatours.com" 
                  required 
                />
              </div>
            </div>
            <div className="adm-form-group">
              <label>Password</label>
              <div className="adm-input-wrapper">
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
            <button type="submit" className="adm-btn-primary">
              <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
              Sign In to Admin Dashboard
            </button>
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', margin: 0, fontWeight: 600 }}>{error}</p>}
          </form>
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // Main Master Admin Dashboard Screen
  // -------------------------------------------------------------
  return (
    <>
      <div className="adm-overlay" onClick={onClose} />
      <div className="adm-master-panel">
        
        {/* Top Header & Admin Profile Info */}
        <div className="adm-master-header">
          <div className="adm-header-brand">
            <div className="adm-brand-badge">
              <ShieldCheckIcon style={{ width: 20, height: 20, color: '#16a34a' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="adm-master-title">SaaS Platform Command Center</h3>
                <span className="adm-live-badge">● LIVE SYNC</span>
              </div>
              <span className="adm-admin-email">{adminUserEmail || 'Administrator'} • Vrinda Vihar</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="adm-header-action-btn" 
              onClick={fetchAllData} 
              title="Refresh Data Sync"
            >
              <ArrowPathIcon style={{ width: 15, height: 15, animation: isLoadingData ? 'spin 1s linear infinite' : 'none' }} />
              <span className="hide-mobile">Refresh</span>
            </button>
            <button 
              className="adm-header-action-btn logout" 
              onClick={handleLogout} 
              title="Sign Out of Admin"
            >
              <ArrowRightOnRectangleIcon style={{ width: 15, height: 15 }} />
              <span className="hide-mobile">Logout</span>
            </button>
            <button className="adm-btn-close" onClick={onClose} title="Close Admin Dashboard">
              <XMarkIcon style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Segmented Master Navigation Bar */}
        <div className="adm-nav-tabs">
          <button 
            className={`adm-tab-chip ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <ChartBarIcon style={{ width: 14, height: 14 }} /> Overview
          </button>
          <button 
            className={`adm-tab-chip ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            <MapPinIcon style={{ width: 14, height: 14 }} /> Sacred POIs ({locations.length})
          </button>
          <button 
            className={`adm-tab-chip ${activeTab === 'partners' ? 'active' : ''}`}
            onClick={() => setActiveTab('partners')}
          >
            <UserPlusIcon style={{ width: 14, height: 14 }} /> Partners & Verifications ({partners.length})
          </button>
          <button 
            className={`adm-tab-chip ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <ClockIcon style={{ width: 14, height: 14 }} /> Live Bookings ({rideRequests.length + roomBookings.length + tableReservations.length})
          </button>
          <button 
            className={`adm-tab-chip ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <SparklesIcon style={{ width: 14, height: 14 }} /> Registration Queue ({registrations.length})
          </button>
          <button 
            className={`adm-tab-chip ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            <MegaphoneIcon style={{ width: 14, height: 14 }} /> Site Announcements
          </button>
        </div>

        {/* Notification Micro-Toast */}
        {toastMsg && (
          <div className={`adm-toast-banner ${toastMsg.type}`}>
            <CheckCircleIcon style={{ width: 16, height: 16 }} />
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Master Dashboard Content Body */}
        <div className="adm-master-body">
          
          {/* TAB 1: OVERVIEW & SYSTEM KPIS */}
          {activeTab === 'overview' && (
            <div className="adm-overview-section">
              <div className="adm-kpi-grid">
                <div className="adm-kpi-card">
                  <div className="adm-kpi-top">
                    <span className="adm-kpi-title">Total Sacred POIs</span>
                    <MapPinIcon style={{ width: 18, height: 18, color: '#2563eb' }} />
                  </div>
                  <h2 className="adm-kpi-val">{locations.length}</h2>
                  <span className="adm-kpi-sub">Temples, Holy Sites, Stays & Food</span>
                </div>

                <div className="adm-kpi-card">
                  <div className="adm-kpi-top">
                    <span className="adm-kpi-title">Verified Partners</span>
                    <CheckBadgeIcon style={{ width: 18, height: 18, color: '#16a34a' }} />
                  </div>
                  <h2 className="adm-kpi-val">{partners.filter(p => p.verified).length}</h2>
                  <span className="adm-kpi-sub">{partners.filter(p => !p.verified).length} pending verification</span>
                </div>

                <div className="adm-kpi-card">
                  <div className="adm-kpi-top">
                    <span className="adm-kpi-title">Active Fleet Drivers</span>
                    <TruckIcon style={{ width: 18, height: 18, color: '#ea580c' }} />
                  </div>
                  <h2 className="adm-kpi-val">{drivers.length}</h2>
                  <span className="adm-kpi-sub">E-Rickshaws & Cabs in Brij Mandal</span>
                </div>

                <div className="adm-kpi-card">
                  <div className="adm-kpi-top">
                    <span className="adm-kpi-title">Live Dispatches</span>
                    <ClockIcon style={{ width: 18, height: 18, color: '#9333ea' }} />
                  </div>
                  <h2 className="adm-kpi-val">{rideRequests.length + roomBookings.length + tableReservations.length}</h2>
                  <span className="adm-kpi-sub">Rides, stays & table orders</span>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="adm-quick-actions-bar">
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: '#18181b' }}>Platform Fast Controls</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="adm-action-pill" onClick={() => { setActiveTab('locations'); setShowAddPoiModal(true); }}>
                    <PlusIcon style={{ width: 15, height: 15 }} /> Add Sacred Location
                  </button>
                  <button className="adm-action-pill" onClick={() => { setActiveTab('partners'); setShowAddPartnerModal(true); }}>
                    <UserPlusIcon style={{ width: 15, height: 15 }} /> Register Partner
                  </button>
                  <button className="adm-action-pill" onClick={() => setActiveTab('broadcast')}>
                    <MegaphoneIcon style={{ width: 15, height: 15 }} /> Edit Top Ticker
                  </button>
                  <button className="adm-action-pill" onClick={fetchAllData}>
                    <ArrowPathIcon style={{ width: 15, height: 15 }} /> Full DB Sync
                  </button>
                </div>
              </div>

              {/* Database & Infrastructure Status */}
              <div className="adm-system-health-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#18181b' }}>Infrastructure Health</strong>
                  <span className="adm-health-ok">● Systems Operational</span>
                </div>
                <div className="adm-health-grid">
                  <div className="adm-health-item">
                    <span>Database Engine</span>
                    <strong>Supabase PostgreSQL (Active)</strong>
                  </div>
                  <div className="adm-health-item">
                    <span>POIs & Fleet Realtime</span>
                    <strong>Cloud Firestore (Active)</strong>
                  </div>
                  <div className="adm-health-item">
                    <span>Base Tile Mapping</span>
                    <strong>CARTO Voyager (Budget Protected)</strong>
                  </div>
                  <div className="adm-health-item">
                    <span>Routing Engine</span>
                    <strong>OSRM In-App Turn-By-Turn</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SACRED LOCATIONS & POI CRUD CONTROL */}
          {activeTab === 'locations' && (
            <div className="adm-tab-pane">
              <div className="adm-pane-toolbar">
                <div className="adm-search-input-box">
                  <MagnifyingGlassIcon style={{ width: 16, height: 16, color: '#71717a' }} />
                  <input 
                    type="text" 
                    placeholder="Search locations by name, category, or description..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <XMarkIcon style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </div>

                <button className="adm-btn-create" onClick={() => setShowAddPoiModal(true)}>
                  <PlusIcon style={{ width: 16, height: 16 }} /> Add New Sacred POI
                </button>
              </div>

              {/* Category Pills Filter */}
              <div className="adm-sub-filter-row">
                {['all', 'Temple', 'Holy Site', 'Hotel', 'Dining', 'Town'].map(cat => (
                  <button 
                    key={cat} 
                    className={`adm-filter-btn ${poiCategoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setPoiCategoryFilter(cat)}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              {/* Locations Data Table */}
              <div className="adm-data-table-container">
                <table className="adm-data-table">
                  <thead>
                    <tr>
                      <th>Location / Sacred Site</th>
                      <th>Category</th>
                      <th>Coordinates</th>
                      <th>Rating & Pts</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLocations.map(loc => (
                      <tr key={loc.name}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#09090b', fontSize: '0.88rem' }}>{loc.name}</strong>
                            <span style={{ fontSize: '0.74rem', color: '#71717a', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {loc.description || 'Sacred pilgrimage landmark in Brij'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`adm-category-chip ${loc.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {loc.category}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#52525b' }}>
                          {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <StarSolid style={{ width: 13, height: 13, color: '#f59e0b' }} />
                            <span>{loc.rating || '4.9'}</span>
                            <span style={{ color: '#a1a1aa', fontWeight: 500, fontSize: '0.72rem' }}>({loc.points || 100} pts)</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            {onSelectLocation && (
                              <button 
                                className="adm-table-btn" 
                                onClick={() => { onSelectLocation(loc); onClose(); }} 
                                title="View on map"
                              >
                                <EyeIcon style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                            <button 
                              className="adm-table-btn" 
                              onClick={() => handleOpenEditPoi(loc)} 
                              title="Edit details"
                            >
                              <PencilSquareIcon style={{ width: 14, height: 14 }} />
                            </button>
                            <button 
                              className="adm-table-btn danger" 
                              onClick={() => setDeletingPoi(loc)} 
                              title="Delete location"
                            >
                              <TrashIcon style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PARTNERS & VERIFICATIONS CONTROL */}
          {activeTab === 'partners' && (
            <div className="adm-tab-pane">
              <div className="adm-pane-toolbar">
                <div className="adm-search-input-box">
                  <MagnifyingGlassIcon style={{ width: 16, height: 16, color: '#71717a' }} />
                  <input 
                    type="text" 
                    placeholder="Search partners, phone numbers, vehicle numbers..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <XMarkIcon style={{ width: 14, height: 14 }} />
                    </button>
                  )}
                </div>

                <button className="adm-btn-create" onClick={() => setShowAddPartnerModal(true)}>
                  <UserPlusIcon style={{ width: 16, height: 16 }} /> Register Partner
                </button>
              </div>

              {/* Category Filter */}
              <div className="adm-sub-filter-row">
                {[
                  { key: 'all', label: 'All Partners' },
                  { key: 'pending', label: `⏳ Pending (${partners.filter(p => !p.verified).length})` },
                  { key: 'driver', label: '🛺 Drivers' },
                  { key: 'hotel', label: '🏨 Stays' },
                  { key: 'restaurant', label: '🍽️ Dining' },
                  { key: 'agency', label: '🚩 Agencies' }
                ].map(chip => (
                  <button 
                    key={chip.key} 
                    className={`adm-filter-btn ${partnerFilter === chip.key ? 'active' : ''}`}
                    onClick={() => setPartnerFilter(chip.key)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Partner Cards Grid */}
              <div className="adm-partner-cards-grid">
                {filteredPartners.map(p => (
                  <div key={p.id} className={`adm-partner-card ${!p.verified ? 'unverified' : ''}`}>
                    <div className="adm-partner-card-top">
                      <div>
                        <strong className="adm-partner-name">{p.name}</strong>
                        <span className="adm-partner-role">{p.role_details || `${p.category?.toUpperCase()} Partner`}</span>
                      </div>
                      <span className="adm-partner-rating">
                        <StarSolid style={{ width: 12, height: 12, color: '#f59e0b' }} /> {p.rating || '5.0'}
                      </span>
                    </div>

                    <div className="adm-partner-meta-row">
                      <span className="adm-partner-phone">{p.phone}</span>
                      <span className={`adm-verify-tag ${p.verified ? 'verified' : 'pending'}`}>
                        {p.verified ? '✓ Verified & Locked' : '⏳ Review Pending'}
                      </span>
                    </div>

                    <div className="adm-partner-card-actions">
                      <button 
                        className={`adm-card-action-btn ${p.verified ? 'outline' : 'primary'}`}
                        onClick={() => handleTogglePartnerVerify(p)}
                      >
                        {p.verified ? 'Revoke' : '✓ Verify & Lock'}
                      </button>
                      <button 
                        className="adm-card-action-btn outline"
                        onClick={() => window.open(`tel:${p.phone}`)}
                      >
                        <PhoneIcon style={{ width: 13, height: 13 }} /> Call
                      </button>
                      <button 
                        className="adm-card-action-btn danger"
                        onClick={() => setDeletingPartnerId(p.id)}
                        title="Remove Partner"
                      >
                        <TrashIcon style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE BOOKINGS & DISPATCHES */}
          {activeTab === 'bookings' && (
            <div className="adm-tab-pane">
              <div className="adm-sub-filter-row" style={{ marginBottom: '16px' }}>
                <button className={`adm-filter-btn ${bookingTypeFilter === 'rides' ? 'active' : ''}`} onClick={() => setBookingTypeFilter('rides')}>
                  🛺 Ride Requests ({rideRequests.length})
                </button>
                <button className={`adm-filter-btn ${bookingTypeFilter === 'rooms' ? 'active' : ''}`} onClick={() => setBookingTypeFilter('rooms')}>
                  🏨 Room Bookings ({roomBookings.length})
                </button>
                <button className={`adm-filter-btn ${bookingTypeFilter === 'tables' ? 'active' : ''}`} onClick={() => setBookingTypeFilter('tables')}>
                  🍽️ Table Reservations ({tableReservations.length})
                </button>
              </div>

              {bookingTypeFilter === 'rides' && (
                <div className="adm-data-table-container">
                  <table className="adm-data-table">
                    <thead>
                      <tr>
                        <th>Passenger</th>
                        <th>Pickup ➔ Drop</th>
                        <th>Fare / Distance</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rideRequests.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No ride requests yet</td></tr>
                      ) : (
                        rideRequests.map(r => (
                          <tr key={r.id}>
                            <td>
                              <strong>{r.passenger_name}</strong>
                              <span style={{ fontSize: '0.74rem', color: '#71717a', display: 'block' }}>{r.passenger_phone}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.8rem' }}>{r.pickup_location} ➔ {r.drop_location}</span>
                            </td>
                            <td>{r.fare || 'Standard'} • {r.distance || 'In Brij'}</td>
                            <td>
                              <span className={`adm-status-badge ${r.status || 'pending'}`}>
                                {r.status || 'pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <select 
                                value={r.status || 'pending'} 
                                onChange={e => handleUpdateRideStatus(r.id, e.target.value)}
                                className="adm-status-select"
                              >
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {bookingTypeFilter === 'rooms' && (
                <div className="adm-data-table-container">
                  <table className="adm-data-table">
                    <thead>
                      <tr>
                        <th>Guest Name</th>
                        <th>Dates & Room</th>
                        <th>Guests Count</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomBookings.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No room bookings yet</td></tr>
                      ) : (
                        roomBookings.map(b => (
                          <tr key={b.id}>
                            <td>
                              <strong>{b.guest_name}</strong>
                              <span style={{ fontSize: '0.74rem', color: '#71717a', display: 'block' }}>{b.guest_phone}</span>
                            </td>
                            <td>
                              <span>{b.room_type || 'Pilgrim Room'} ({b.dates})</span>
                            </td>
                            <td>{b.guests_count || '1 Guest'}</td>
                            <td>
                              <span className={`adm-status-badge ${b.status || 'pending'}`}>
                                {b.status || 'pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <select 
                                value={b.status || 'pending'} 
                                onChange={e => handleUpdateRoomStatus(b.id, e.target.value)}
                                className="adm-status-select"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="checked_in">Checked In</option>
                                <option value="checked_out">Checked Out</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {bookingTypeFilter === 'tables' && (
                <div className="adm-data-table-container">
                  <table className="adm-data-table">
                    <thead>
                      <tr>
                        <th>Guest Name</th>
                        <th>Time Slot</th>
                        <th>Party Size</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableReservations.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No table reservations yet</td></tr>
                      ) : (
                        tableReservations.map(t => (
                          <tr key={t.id}>
                            <td>
                              <strong>{t.guest_name}</strong>
                              <span style={{ fontSize: '0.74rem', color: '#71717a', display: 'block' }}>{t.guest_phone}</span>
                            </td>
                            <td>{t.time_slot}</td>
                            <td>{t.guests_count} Guests</td>
                            <td>
                              <span className={`adm-status-badge ${t.status || 'pending'}`}>
                                {t.status || 'pending'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <select 
                                value={t.status || 'pending'} 
                                onChange={e => handleUpdateTableStatus(t.id, e.target.value)}
                                className="adm-status-select"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="seated">Seated</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STEPPED REGISTRATIONS QUEUE */}
          {activeTab === 'registrations' && (
            <div className="adm-tab-pane">
              <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#71717a' }}>
                Review live multi-step onboarding submissions from drivers, stays, dining, and travel agencies. 1-click promotion creates verified partner profiles.
              </p>

              <div className="adm-data-table-container">
                <table className="adm-data-table">
                  <thead>
                    <tr>
                      <th>Applicant / Property</th>
                      <th>Category</th>
                      <th>Phone / Contact</th>
                      <th>F当地 Step Progress</th>
                      <th style={{ textAlign: 'right' }}>Approval Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No stepped registrations in queue</td></tr>
                    ) : (
                      registrations.map(reg => (
                        <tr key={reg.id}>
                          <td>
                            <strong>{reg.title}</strong>
                            <span style={{ fontSize: '0.74rem', color: '#71717a', display: 'block' }}>
                              {reg.vehicle_no || reg.property_type || reg.cuisine_type || 'Registration applicant'}
                            </span>
                          </td>
                          <td>
                            <span className={`adm-category-chip ${reg.regType}`}>
                              {reg.regType}
                            </span>
                          </td>
                          <td>{reg.phone || 'Not provided'}</td>
                          <td>
                            <span style={{ fontWeight: 700, fontSize: '0.8rem', color: reg.completed ? '#16a34a' : '#d97706' }}>
                              {reg.completed ? '✓ Form Complete' : `Step ${reg.step || 1} of 3`}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              className="adm-btn-approve" 
                              onClick={() => handleApproveRegistration(reg)}
                            >
                              ✓ Approve & Promote
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

          {/* TAB 6: SITE ANNOUNCEMENT & BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="adm-tab-pane">
              <div className="adm-broadcast-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#18181b' }}>Live Site Marquee Broadcast</h4>
                    <span style={{ fontSize: '0.78rem', color: '#71717a' }}>Controls the announcement ticker at the top of the map across all users.</span>
                  </div>
                  <label className="adm-switch-label">
                    <input 
                      type="checkbox" 
                      checked={broadcastEnabled} 
                      onChange={e => setBroadcastEnabled(e.target.checked)} 
                    />
                    <span>{broadcastEnabled ? 'Active' : 'Disabled'}</span>
                  </label>
                </div>

                <form onSubmit={handleAddBroadcastItem} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    value={newBroadcastText} 
                    onChange={e => setNewBroadcastText(e.target.value)} 
                    placeholder="Enter new marquee ticker announcement..."
                    className="adm-broadcast-input"
                  />
                  <button type="submit" className="adm-btn-create">
                    <PlusIcon style={{ width: 16, height: 16 }} /> Add
                  </button>
                </form>

                <div className="adm-broadcast-list">
                  {broadcastItems.map((item, idx) => (
                    <div key={idx} className="adm-broadcast-item">
                      <span>{item.text}</span>
                      <button onClick={() => handleRemoveBroadcastItem(idx)} className="adm-table-btn danger">
                        <TrashIcon style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  className="adm-btn-primary" 
                  style={{ marginTop: '16px', maxWidth: '220px' }} 
                  onClick={handleSaveBroadcast}
                >
                  Save Live Changes
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUB-MODAL: ADD NEW SACRED POI / LOCATION */}
        {/* ------------------------------------------------------------- */}
        {showAddPoiModal && (
          <div className="adm-sub-overlay" onClick={() => setShowAddPoiModal(false)}>
            <div className="adm-sub-card" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Add Sacred Location to Live Map</h4>
                <button className="adm-btn-close" onClick={() => setShowAddPoiModal(false)}>
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <form onSubmit={handleCreatePoi} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="adm-form-group">
                  <label>Location / Mandir Name *</label>
                  <input 
                    type="text" 
                    value={poiName} 
                    onChange={e => setPoiName(e.target.value)} 
                    placeholder="e.g. Shri Radha Vallabh Mandir" 
                    required 
                    className="adm-input"
                  />
                </div>

                <div className="adm-form-grid-2">
                  <div className="adm-form-group">
                    <label>Category *</label>
                    <select 
                      value={poiCategory} 
                      onChange={e => setPoiCategory(e.target.value)} 
                      className="adm-input"
                    >
                      <option value="Temple">Temple (Mandir)</option>
                      <option value="Holy Site">Holy Site (Kund / Ashram)</option>
                      <option value="Hotel">Hotel / Ashram Stay</option>
                      <option value="Dining">Dining / Sattvic Restaurant</option>
                      <option value="Town">Town / Parikrama Gate</option>
                    </select>
                  </div>

                  <div className="adm-form-group">
                    <label>Rating (1.0 - 5.0)</label>
                    <input 
                      type="text" 
                      value={poiRating} 
                      onChange={e => setPoiRating(e.target.value)} 
                      placeholder="4.9" 
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-grid-2">
                  <div className="adm-form-group">
                    <label>Latitude (GPS) *</label>
                    <input 
                      type="text" 
                      value={poiLat} 
                      onChange={e => setPoiLat(e.target.value)} 
                      placeholder="27.6461" 
                      required 
                      className="adm-input"
                    />
                  </div>

                  <div className="adm-form-group">
                    <label>Longitude (GPS) *</label>
                    <input 
                      type="text" 
                      value={poiLng} 
                      onChange={e => setPoiLng(e.target.value)} 
                      placeholder="77.3777" 
                      required 
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label>Spiritual Significance / Description</label>
                  <textarea 
                    value={poiDescription} 
                    onChange={e => setPoiDescription(e.target.value)} 
                    placeholder="Describe darshan timings, history, and spiritual importance..."
                    rows={3}
                    className="adm-input"
                  />
                </div>

                <div className="adm-form-group">
                  <label>Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={poiImageUrl} 
                    onChange={e => setPoiImageUrl(e.target.value)} 
                    placeholder="https://images.unsplash.com/..." 
                    className="adm-input"
                  />
                </div>

                <button type="submit" className="adm-btn-primary" style={{ marginTop: '8px' }}>
                  Save Location to Live Database
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-MODAL: EDIT POI / LOCATION */}
        {/* ------------------------------------------------------------- */}
        {editingPoi && (
          <div className="adm-sub-overlay" onClick={() => setEditingPoi(null)}>
            <div className="adm-sub-card" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Edit Sacred Location</h4>
                <button className="adm-btn-close" onClick={() => setEditingPoi(null)}>
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <form onSubmit={handleUpdatePoi} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="adm-form-group">
                  <label>Location Name</label>
                  <input 
                    type="text" 
                    value={poiName} 
                    onChange={e => setPoiName(e.target.value)} 
                    required 
                    className="adm-input"
                  />
                </div>

                <div className="adm-form-grid-2">
                  <div className="adm-form-group">
                    <label>Category</label>
                    <select 
                      value={poiCategory} 
                      onChange={e => setPoiCategory(e.target.value)} 
                      className="adm-input"
                    >
                      <option value="Temple">Temple</option>
                      <option value="Holy Site">Holy Site</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Dining">Dining</option>
                      <option value="Town">Town</option>
                    </select>
                  </div>
                  <div className="adm-form-group">
                    <label>Rating</label>
                    <input 
                      type="text" 
                      value={poiRating} 
                      onChange={e => setPoiRating(e.target.value)} 
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-grid-2">
                  <div className="adm-form-group">
                    <label>Latitude</label>
                    <input 
                      type="text" 
                      value={poiLat} 
                      onChange={e => setPoiLat(e.target.value)} 
                      className="adm-input"
                    />
                  </div>
                  <div className="adm-form-group">
                    <label>Longitude</label>
                    <input 
                      type="text" 
                      value={poiLng} 
                      onChange={e => setPoiLng(e.target.value)} 
                      className="adm-input"
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label>Description</label>
                  <textarea 
                    value={poiDescription} 
                    onChange={e => setPoiDescription(e.target.value)} 
                    rows={3}
                    className="adm-input"
                  />
                </div>

                <button type="submit" className="adm-btn-primary" style={{ marginTop: '8px' }}>
                  Update Live Location Data
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-MODAL: DELETE POI CONFIRMATION */}
        {/* ------------------------------------------------------------- */}
        {deletingPoi && (
          <div className="adm-sub-overlay" onClick={() => setDeletingPoi(null)}>
            <div className="adm-sub-card" style={{ maxWidth: '360px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <ExclamationTriangleIcon style={{ width: 40, height: 40, color: '#ef4444', margin: '0 auto 8px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800 }}>Delete Location?</h4>
              <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#71717a', lineHeight: 1.45 }}>
                Are you sure you want to delete &ldquo;<strong>{deletingPoi.name}</strong>&rdquo; from live map records?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="adm-btn-close" style={{ flex: 1, height: '40px', width: 'auto', borderRadius: '999px', fontWeight: 700 }} onClick={() => setDeletingPoi(null)}>
                  Cancel
                </button>
                <button className="adm-btn-primary" style={{ flex: 1, height: '40px', background: '#ef4444' }} onClick={confirmDeletePoi}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-MODAL: ADD NEW PARTNER */}
        {/* ------------------------------------------------------------- */}
        {showAddPartnerModal && (
          <div className="adm-sub-overlay" onClick={() => setShowAddPartnerModal(false)}>
            <div className="adm-sub-card" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Register Verified Partner</h4>
                <button className="adm-btn-close" onClick={() => setShowAddPartnerModal(false)}>
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <form onSubmit={handleCreatePartner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="adm-form-group">
                  <label>Partner / Owner Name *</label>
                  <input 
                    type="text" 
                    value={newPartnerName} 
                    onChange={e => setNewPartnerName(e.target.value)} 
                    placeholder="e.g. Radhe Shyam" 
                    required 
                    className="adm-input"
                  />
                </div>

                <div className="adm-form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    value={newPartnerPhone} 
                    onChange={e => setNewPartnerPhone(e.target.value)} 
                    placeholder="+91 98765 43210" 
                    required 
                    className="adm-input"
                  />
                </div>

                <div className="adm-form-group">
                  <label>Category *</label>
                  <select 
                    value={newPartnerCategory} 
                    onChange={e => setNewPartnerCategory(e.target.value)} 
                    className="adm-input"
                  >
                    <option value="driver">🛺 Driver Partner (E-Rickshaw/Cab)</option>
                    <option value="hotel">🏨 Hotel & Ashram Stay</option>
                    <option value="restaurant">🍽️ Restaurant & Dining</option>
                    <option value="agency">🚩 84 Kos Yatra Agency</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label>Vehicle / Property Details</label>
                  <input 
                    type="text" 
                    value={newPartnerRole} 
                    onChange={e => setNewPartnerRole(e.target.value)} 
                    placeholder="e.g. UP-85 VT 2026 or Temple Guesthouse" 
                    className="adm-input"
                  />
                </div>

                <button type="submit" className="adm-btn-primary" style={{ marginTop: '8px' }}>
                  Register & Verify Partner
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUB-MODAL: DELETE PARTNER CONFIRMATION */}
        {/* ------------------------------------------------------------- */}
        {deletingPartnerId && (
          <div className="adm-sub-overlay" onClick={() => setDeletingPartnerId(null)}>
            <div className="adm-sub-card" style={{ maxWidth: '360px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <ExclamationTriangleIcon style={{ width: 40, height: 40, color: '#ef4444', margin: '0 auto 8px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800 }}>Delete Partner?</h4>
              <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#71717a', lineHeight: 1.45 }}>
                This partner will be permanently removed from database records.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="adm-btn-close" style={{ flex: 1, height: '40px', width: 'auto', borderRadius: '999px', fontWeight: 700 }} onClick={() => setDeletingPartnerId(null)}>
                  Cancel
                </button>
                <button className="adm-btn-primary" style={{ flex: 1, height: '40px', background: '#ef4444' }} onClick={confirmDeletePartner}>
                  Delete Partner
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
