import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheckIcon, PlusIcon, TrashIcon, PhoneIcon, 
  MapPinIcon, CheckCircleIcon, MagnifyingGlassIcon, 
  XMarkIcon, LockClosedIcon, ClockIcon, ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { supabase, safeRemoveChannel } from '../../config/supabase';

// Simple debounce helper to prevent rapid-fire mutation clicks
function useDebounce() {
  const pendingRef = useRef(new Set());
  const debounce = useCallback((key, fn, delay = 800) => {
    if (pendingRef.current.has(key)) return;
    pendingRef.current.add(key);
    fn();
    setTimeout(() => pendingRef.current.delete(key), delay);
  }, []);
  return debounce;
}

const DEFAULT_INITIAL_PARTNERS = [
  {
    id: 'partner_driver_01',
    name: 'Radhe Shyam Sharma',
    phone: '+91 98765 43210',
    category: 'driver',
    role_details: 'E-Rickshaw Fleet • UP-85-AB-1008',
    verified: true,
    category_locked: true,
    rating: '4.9',
    status: 'Verified Sarathi Driver'
  },
  {
    id: 'partner_driver_02',
    name: 'Gopal Das',
    phone: '+91 98234 56789',
    category: 'driver',
    role_details: 'Auto Rickshaw • UP-85-CD-2024',
    verified: false,
    category_locked: false,
    rating: '5.0',
    status: 'Pending Admin Verification'
  },
  {
    id: 'partner_stay_01',
    name: 'MVT Ashram & Guesthouse',
    phone: '+91 98111 22334',
    category: 'hotel',
    role_details: 'Vrindavan Raman Reti • 42 AC Rooms',
    verified: true,
    category_locked: true,
    rating: '4.9',
    status: 'Verified Stay Desk'
  },
  {
    id: 'partner_stay_02',
    name: 'Brij Heritage Guest House',
    phone: '+91 98333 44556',
    category: 'hotel',
    role_details: 'Govardhan Parikrama Marg • 18 Rooms',
    verified: false,
    category_locked: false,
    rating: '4.8',
    status: 'Pending Admin Verification'
  },
  {
    id: 'partner_dining_01',
    name: "Govinda's Sattvic Bhojnalaya",
    phone: '+91 98444 55667',
    category: 'restaurant',
    role_details: 'Pure Sattvic Dining • Iskcon Temple Road',
    verified: true,
    category_locked: true,
    rating: '4.95',
    status: 'Verified Dining Desk'
  },
  {
    id: 'partner_agency_01',
    name: 'Brij 84 Kos Sacred Yatra Tours',
    phone: '+91 98555 66778',
    category: 'agency',
    role_details: 'Govardhan, Barsana & Nandgaon Guided Tours',
    verified: true,
    category_locked: true,
    rating: '5.0',
    status: 'Verified Yatra Desk'
  }
];

export default function OperationsAdminTab({ drivers = [], isAdmin = false }) {
  // Auth guard — if not admin, show unauthorized message
  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#71717a' }}>
        <ExclamationTriangleIcon style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.5, color: '#f59e0b' }} />
        <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '14px', color: '#18181b' }}>Admin Access Required</p>
        <span style={{ fontSize: '12px', lineHeight: 1.5 }}>
          Sign in with an authorized admin account to access partner verification, management, and fleet operations.
        </span>
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // For custom confirmation modal

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('driver');
  const [vehicleType, setVehicleType] = useState('E-Rickshaw');
  const [vehicleNo, setVehicleNo] = useState('');

  const debounce = useDebounce();

  // Multi-Category Partners with local cache & Supabase sync
  const [allPartners, setAllPartners] = useState(() => {
    try {
      const cached = localStorage.getItem('vrinda_admin_partners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_INITIAL_PARTNERS;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Realtime Supabase Fetch & Subscription with unique channel name
  useEffect(() => {
    let isMounted = true;
    const fetchAllPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0 && isMounted) {
          setAllPartners(data);
          try {
            localStorage.setItem('vrinda_admin_partners', JSON.stringify(data));
          } catch {}
        }
      } catch (err) {
        console.warn('[OperationsAdminTab] Partners fetch warning:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAllPartners();

    // Unique channel name with timestamp to prevent cross-tab collisions
    const channelName = `admin_partners_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partners' },
        (payload) => {
          if (payload.eventType === 'INSERT' && isMounted) {
            setAllPartners(prev => {
              const updated = [payload.new, ...prev.filter(p => p.id !== payload.new.id)];
              try { localStorage.setItem('vrinda_admin_partners', JSON.stringify(updated)); } catch {}
              return updated;
            });
          } else if (payload.eventType === 'UPDATE' && isMounted) {
            setAllPartners(prev => {
              const updated = prev.map(p => p.id === payload.new.id ? payload.new : p);
              try { localStorage.setItem('vrinda_admin_partners', JSON.stringify(updated)); } catch {}
              return updated;
            });
          } else if (payload.eventType === 'DELETE' && isMounted) {
            setAllPartners(prev => {
              const updated = prev.filter(p => p.id !== payload.old.id);
              try { localStorage.setItem('vrinda_admin_partners', JSON.stringify(updated)); } catch {}
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      safeRemoveChannel(channel);
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const newId = `partner_${Date.now()}`;
    const roleDetails = category === 'driver' 
      ? `${vehicleType} • ${vehicleNo || 'UP-85'}` 
      : (category === 'restaurant' ? 'Sattvic Restaurant' : (category === 'agency' ? '84 Kos Yatra Tours' : 'Hotel Partner'));

    const newEntry = {
      id: newId,
      name,
      phone,
      category,
      role_details: roleDetails,
      verified: false,          // FIX: New partners must be reviewed by admin first
      category_locked: false,   // FIX: Not locked until admin verifies
      rating: '5.0',
      status: 'Pending Admin Verification'
    };

    // Optimistic local state
    const previousPartners = [...allPartners];
    setAllPartners(prev => [newEntry, ...prev]);

    // Save to Supabase with rollback on failure
    try {
      const { error } = await supabase.from('partners').insert([
        {
          id: newId,
          name,
          phone,
          category,
          role_details: roleDetails,
          rating: 5.0,
          verified: false,
          category_locked: false,
          status: 'Pending Admin Verification',
          created_at: new Date().toISOString()
        }
      ]);

      if (error) {
        // Rollback on failure
        setAllPartners(previousPartners);
      }
    } catch (err) {
      // Rollback on network error
      setAllPartners(previousPartners);
    }

    setShowAddModal(false);
    setName('');
    setPhone('');
    setVehicleNo('');
  };

  const handleVerifyToggle = async (partner) => {
    debounce(`verify_${partner.id}`, async () => {
      const nextVerified = !partner.verified;
      const nextStatus = nextVerified ? 'Active' : 'Pending Admin Verification';
      const nextLock = nextVerified;

      // Optimistic UI update with rollback reference
      const previousPartners = [...allPartners];
      setAllPartners(prev => prev.map(p => p.id === partner.id ? { 
        ...p, 
        verified: nextVerified, 
        category_locked: nextLock,
        status: nextStatus 
      } : p));

      // Save to Supabase
      try {
        const { error } = await supabase
          .from('partners')
          .update({
            verified: nextVerified,
            category_locked: nextLock,
            status: nextStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', partner.id);

        if (error) {
          setAllPartners(previousPartners);
        }
      } catch (err) {
        setAllPartners(previousPartners);
      }
    });
  };

  // Custom confirmation modal handler — replaces window.confirm
  const confirmRemovePartner = async () => {
    if (!deletingId) return;
    const previousPartners = [...allPartners];
    setAllPartners(prev => prev.filter(p => p.id !== deletingId));
    setDeletingId(null);

    try {
      const { error } = await supabase.from('partners').delete().eq('id', deletingId);
      if (error) {
        setAllPartners(previousPartners);
      }
    } catch (err) {
      setAllPartners(previousPartners);
    }
  };

  const pendingCount = allPartners.filter(p => !p.verified).length;

  const filtered = allPartners.filter(p => {
    let matchesTab = true;
    if (activeSubTab === 'pending') {
      matchesTab = !p.verified;
    } else if (activeSubTab !== 'all') {
      matchesTab = p.category === activeSubTab;
    }

    const matchesSearch = !searchQuery.trim() || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.phone?.includes(searchQuery) ||
      p.role_details?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  return (
    <>
      {/* Expandable Search & Add Action Bar */}
      <div className="ph-search-action-bar">
        <div className={`ph-search-box ${isFocused || searchQuery ? 'expanded' : ''}`}>
          <MagnifyingGlassIcon style={{ width: 15, height: 15 }} className="ph-search-icon" />
          <input 
            type="text" 
            placeholder="Search partners, phones, plates..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="ph-search-input"
          />
          {(isFocused || searchQuery) && (
            <button 
              className="ph-search-clear" 
              onClick={() => {
                setSearchQuery('');
                setIsFocused(false);
              }}
              title="Close search"
              onMouseDown={(e) => {
                e.preventDefault();
                setSearchQuery('');
                setIsFocused(false);
              }}
            >
              <XMarkIcon style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>

        <button 
          className={`ph-btn-add-partner ${isFocused || searchQuery ? 'icon-only' : ''}`}
          onClick={() => setShowAddModal(true)}
          title="Register New Partner"
        >
          <span className="ph-btn-add-partner-icon">
            <PlusIcon style={{ width: 16, height: 16 }} />
          </span>
          <span className="ph-btn-add-partner-text">Add Partner</span>
        </button>
      </div>

      {/* Category Filter Chips with Pending Counter */}
      <div className="ph-sub-filter-bar">
        {[
          { key: 'all', label: 'All Partners' },
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'driver', label: 'Drivers' },
          { key: 'hotel', label: 'Stays' },
          { key: 'restaurant', label: 'Dining' },
          { key: 'agency', label: 'Agencies' }
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setActiveSubTab(chip.key)}
            className={`ph-sub-filter-chip ${activeSubTab === chip.key ? 'active' : ''}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Partner Cards List */}
      <div className="ph-cards-list">
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#71717a' }}>
            <ExclamationTriangleIcon style={{ width: 32, height: 32, margin: '0 auto 8px', opacity: 0.5, color: '#f59e0b' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '13px' }}>No partners found</p>
            <span style={{ fontSize: '11px' }}>Try switching filter or register new partner above.</span>
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} className="ph-order-card" style={!p.verified ? { borderLeft: '3px solid #f59e0b', background: '#fffdf5' } : {}}>
            <div className="ph-order-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <span className="ph-order-guest">{p.name}</span>
                {p.verified ? (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    color: '#15803d',
                    background: '#dcfce7',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <CheckCircleIcon style={{ width: 10, height: 10 }} /> Verified • Locked
                  </span>
                ) : (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    color: '#b45309',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    <ClockIcon style={{ width: 10, height: 10 }} /> Review Pending
                  </span>
                )}
              </div>
              <span className="ph-tag-gold"><StarSolid style={{ width: 11, height: 11, color: '#f59e0b' }} /> {p.rating || '5.0'}</span>
            </div>

            <div className="ph-order-meta">
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.role_details || p.role || `${p.category?.toUpperCase()} Partner`}
              </span>
              <span style={{ 
                color: p.status === 'Available' || p.status === 'Open' || p.status === 'Active' ? '#15803d' : (p.verified ? '#71717a' : '#d97706'), 
                fontWeight: 800, 
                flexShrink: 0,
                marginLeft: 'auto'
              }}>
                ● {p.status || (p.verified ? 'Active' : 'Pending Review')}
              </span>
            </div>

            <div className="ph-order-actions">
              <button 
                className={`ph-btn-action ${p.verified ? 'outline' : 'primary'}`} 
                onClick={() => handleVerifyToggle(p)}
                style={{ 
                  fontSize: '0.74rem', 
                  padding: '7px 10px', 
                  fontWeight: 800,
                  background: !p.verified ? '#16a34a' : 'transparent',
                  borderColor: !p.verified ? '#16a34a' : 'rgba(0,0,0,0.12)',
                  color: !p.verified ? '#ffffff' : '#52525b'
                }}
                title={p.verified ? 'Revoke verification' : 'Verify & Lock category'}
              >
                <CheckCircleIcon style={{ width: 13, height: 13 }} /> {p.verified ? 'Verified (Revoke)' : '✓ Verify & Lock Category'}
              </button>
              <button 
                className="ph-btn-action outline" 
                onClick={() => window.open(`tel:${p.phone}`)}
                style={{ fontSize: '0.74rem', padding: '7px 10px' }}
              >
                <PhoneIcon style={{ width: 13, height: 13 }} /> Call
              </button>
              <button 
                className="ph-btn-action outline" 
                style={{ color: '#ef4444', borderColor: '#fecaca', flex: 'none', width: '34px', height: '34px', padding: 0 }}
                onClick={() => setDeletingId(p.id)}
                title="Remove Partner"
              >
                <TrashIcon style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Partner Form Modal */}
      {showAddModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="ph-sub-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="ph-sub-modal-card"
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '22px',
              borderRadius: '22px',
              background: '#ffffff',
              boxShadow: '0 24px 55px -10px rgba(0, 0, 0, 0.35)',
              boxSizing: 'border-box'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Register Brij Partner</h4>
              <button 
                className="ph-close-btn" 
                onClick={() => setShowAddModal(false)}
              >
                <XMarkIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label className="ph-modal-label">Partner Type</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="ph-modal-select"
                >
                  <option value="driver">Driver Partner (E-Rickshaw/Taxi)</option>
                  <option value="restaurant">Restaurant &amp; Dining Staff</option>
                  <option value="hotel">Hotel, Ashram &amp; Stay Staff</option>
                  <option value="agency">Tour Agency &amp; Yatra Staff</option>
                </select>
              </div>

              <div>
                <label className="ph-modal-label">Full Name / Business Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Radhe Shyam" 
                  required 
                  className="ph-modal-input"
                />
              </div>

              <div>
                <label className="ph-modal-label">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+91 98765 43210" 
                  required 
                  className="ph-modal-input"
                />
              </div>

              {category === 'driver' && (
                <div>
                  <label className="ph-modal-label">Vehicle Number Plate</label>
                  <input 
                    type="text" 
                    value={vehicleNo} 
                    onChange={e => setVehicleNo(e.target.value)} 
                    placeholder="UP-85 VT 2026" 
                    className="ph-modal-input"
                  />
                </div>
              )}

              <button type="submit" className="ph-modal-submit-btn">
                Complete Partner Registration
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Confirmation Modal — replaces native window.confirm */}
      {deletingId && typeof document !== 'undefined' && createPortal(
        <div 
          className="ph-sub-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => setDeletingId(null)}
        >
          <div 
            className="ph-sub-modal-card"
            onClick={e => e.stopPropagation()}
            style={{ textAlign: 'center', maxWidth: '340px', padding: '22px', borderRadius: '22px', background: '#ffffff', boxShadow: '0 24px 55px -10px rgba(0, 0, 0, 0.35)', boxSizing: 'border-box' }}
          >
            <ExclamationTriangleIcon style={{ width: 36, height: 36, color: '#ef4444', margin: '0 auto 8px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800 }}>Remove Partner?</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#71717a', lineHeight: 1.45 }}>
              This partner will be permanently removed from the platform. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className="ph-btn-action outline" 
                style={{ flex: 1, height: '38px', fontWeight: 700, borderRadius: '999px' }}
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button 
                className="ph-modal-submit-btn" 
                style={{ flex: 1, height: '38px', background: '#ef4444', margin: 0, fontWeight: 700 }}
                onClick={confirmRemovePartner}
              >
                Remove
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
