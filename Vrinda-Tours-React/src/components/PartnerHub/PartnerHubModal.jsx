import { useState, useEffect } from 'react';
import { 
  XMarkIcon, BriefcaseIcon, TruckIcon, BuildingStorefrontIcon, 
  BuildingOffice2Icon, ShieldCheckIcon, InformationCircleIcon, 
  LockClosedIcon, GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import DriverPortalTab from './DriverPortalTab';
import RestaurantPortalTab from './RestaurantPortalTab';
import HotelPortalTab from './HotelPortalTab';
import AgencyPortalTab from './AgencyPortalTab';
import OperationsAdminTab from './OperationsAdminTab';
import { supabase, safeRemoveChannel } from '../../config/supabase';
import './PartnerHubModal.css';

// Admin email whitelist from environment — only these emails get admin access
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export default function PartnerHubModal({ 
  onClose, 
  onOpenLanding, 
  drivers = [], 
  partnerId: propPartnerId, 
  initialRole = 'driver' 
}) {
  const { isDragging, isClosing, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);
  
  const [partnerId, setPartnerId] = useState(() => {
    return propPartnerId || sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_driver_id');
  });

  const [activeRole, setActiveRole] = useState(() => {
    return sessionStorage.getItem('vt_partner_role') || initialRole;
  });

  const [partnerData, setPartnerData] = useState(null);
  const [lockNotice, setLockNotice] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check Supabase Auth session for admin access
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email?.toLowerCase();
        setIsAdminUser(email ? ADMIN_EMAILS.includes(email) : false);
      } catch {
        setIsAdminUser(false);
      }
    };
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email?.toLowerCase();
      setIsAdminUser(email ? ADMIN_EMAILS.includes(email) : false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // 1. Fetch & Real-time Subscribe to Partner Profile in Supabase
  useEffect(() => {
    const currentId = partnerId || propPartnerId || sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_driver_id');
    if (!currentId) return;

    let isMounted = true;

    const fetchPartnerProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('id', currentId)
          .maybeSingle();

        if (error) {
          return;
        }

        if (data && isMounted) {
          setPartnerData(data);
          if (data.category) {
            setActiveRole(data.category);
            sessionStorage.setItem('vt_partner_role', data.category);
          }
        }
      } catch (err) {
        // Fallback silently
      }
    };

    fetchPartnerProfile();

    // 2. Realtime listener for live Admin verification events
    const channel = supabase
      .channel(`partner_realtime_${currentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partners',
          filter: `id=eq.${currentId}`
        },
        (payload) => {
          if (payload.new && isMounted) {
            setPartnerData(payload.new);
            if (payload.new.category) {
              setActiveRole(payload.new.category);
              sessionStorage.setItem('vt_partner_role', payload.new.category);
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      safeRemoveChannel(channel);
    };
  }, [partnerId, propPartnerId]);

  // Category Lock Rule: If verified by Admin, user CANNOT switch category!
  const isVerified = Boolean(partnerData?.verified);
  const isCategoryLocked = Boolean(partnerData?.verified || partnerData?.category_locked);

  const handleRoleSelect = (role) => {
    // Operations admin — only accessible to whitelisted admin emails
    if (role === 'admin') {
      if (!isAdminUser) {
        setLockNotice('Admin access is restricted. Sign in with an authorized admin account.');
        setTimeout(() => setLockNotice(''), 4000);
        return;
      }
      setActiveRole('admin');
      setLockNotice('');
      return;
    }

    if (isCategoryLocked && partnerData?.category && role !== partnerData.category) {
      setLockNotice(`Category is locked. This account is verified by Admin as a ${partnerData.category.toUpperCase()}. Categories cannot be changed after admin verification.`);
      setTimeout(() => setLockNotice(''), 4000);
      return;
    }

    setActiveRole(role);
    sessionStorage.setItem('vt_partner_role', role);
    setLockNotice('');
  };

  const handlePartnerLogout = () => {
    sessionStorage.removeItem('vt_partner_id');
    sessionStorage.removeItem('vt_driver_id');
    sessionStorage.removeItem('vt_partner_role');
    triggerClose();
  };

  return (
    <>
      <div 
        className={`ph-overlay ${isClosing ? 'closing' : ''}`} 
        onClick={triggerClose} 
      />

      <div 
        className={`ph-modal-container ${isDragging ? 'dragging' : ''} ${isClosing ? 'closing' : ''}`}
        style={sheetStyle}
      >
        {/* Drag Handle */}
        <div className="ph-handle-wrapper" {...handleProps} title="Drag down to dismiss">
          <div className="ph-handle" />
        </div>

        {/* Brand Header */}
        <div className="ph-header">
          <div className="ph-brand-left">
            <div className="ph-brand-icon-box">
              <BriefcaseIcon style={{ width: 18, height: 18, color: '#09090b' }} />
            </div>
            <div className="ph-brand-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3>Partner Dashboard</h3>
                {isCategoryLocked && (
                  <span className="ph-verified-badge" title="Verified &amp; Category Locked by Admin">
                    <LockClosedIcon style={{ width: 10, height: 10 }} /> Category Locked
                  </span>
                )}
              </div>
              <span className="ph-brand-sub">
                {partnerData?.name || 'Brij Dham Partner Profile'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onOpenLanding && (
              <button 
                className="ph-close-btn" 
                onClick={() => onOpenLanding(activeRole)} 
                title="Partner Program Info & Benefits"
                style={{ background: '#f4f4f5', color: '#52525b' }}
              >
                <InformationCircleIcon style={{ width: 15, height: 15 }} />
              </button>
            )}
            <button className="ph-close-btn" onClick={triggerClose} title="Close Portal">
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Category Lock Alert Banner (if user attempted illegal switch) */}
        {lockNotice && (
          <div className="ph-category-lock-alert">
            <LockClosedIcon style={{ width: 13, height: 13, color: '#b45309' }} />
            <span>{lockNotice}</span>
          </div>
        )}

        {/* Role Segmented Switcher (With Category Lock Enforcement) */}
        <div className="ph-role-bar">
          <button 
            className={`ph-role-chip ${activeRole === 'driver' ? 'active' : ''} ${isCategoryLocked && partnerData?.category !== 'driver' ? 'locked-other' : ''}`}
            onClick={() => handleRoleSelect('driver')}
            title={isCategoryLocked && partnerData?.category !== 'driver' ? 'Category locked by admin' : 'Driver Dashboard'}
          >
            <TruckIcon style={{ width: 13, height: 13 }} /> Driver Mode
            {isCategoryLocked && partnerData?.category === 'driver' && <LockClosedIcon style={{ width: 10, height: 10 }} />}
          </button>
          <button 
            className={`ph-role-chip ${activeRole === 'hotel' ? 'active' : ''} ${isCategoryLocked && partnerData?.category !== 'hotel' ? 'locked-other' : ''}`}
            onClick={() => handleRoleSelect('hotel')}
            title={isCategoryLocked && partnerData?.category !== 'hotel' ? 'Category locked by admin' : 'Stay Desk'}
          >
            <BuildingOffice2Icon style={{ width: 13, height: 13 }} /> Stay Desk
            {isCategoryLocked && partnerData?.category === 'hotel' && <LockClosedIcon style={{ width: 10, height: 10 }} />}
          </button>
          <button 
            className={`ph-role-chip ${activeRole === 'restaurant' ? 'active' : ''} ${isCategoryLocked && partnerData?.category !== 'restaurant' ? 'locked-other' : ''}`}
            onClick={() => handleRoleSelect('restaurant')}
            title={isCategoryLocked && partnerData?.category !== 'restaurant' ? 'Category locked by admin' : 'Dining Desk'}
          >
            <BuildingStorefrontIcon style={{ width: 13, height: 13 }} /> Dining Desk
            {isCategoryLocked && partnerData?.category === 'restaurant' && <LockClosedIcon style={{ width: 10, height: 10 }} />}
          </button>
          <button 
            className={`ph-role-chip ${activeRole === 'agency' ? 'active' : ''} ${isCategoryLocked && partnerData?.category !== 'agency' ? 'locked-other' : ''}`}
            onClick={() => handleRoleSelect('agency')}
            title={isCategoryLocked && partnerData?.category !== 'agency' ? 'Category locked by admin' : 'Yatra Desk'}
          >
            <GlobeAltIcon style={{ width: 13, height: 13 }} /> Yatra Desk
            {isCategoryLocked && partnerData?.category === 'agency' && <LockClosedIcon style={{ width: 10, height: 10 }} />}
          </button>
          {isAdminUser && (
            <button 
              className={`ph-role-chip ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleSelect('admin')}
              title="Admin Operations Verification Console"
            >
              <ShieldCheckIcon style={{ width: 13, height: 13 }} /> Admin Verify
            </button>
          )}
        </div>

        {/* Dynamic Category Profile Body */}
        <div className="ph-body">
          {activeRole === 'driver' && (
            <DriverPortalTab 
              partner={partnerData || drivers[0] || { name: 'Radhe', vehicleType: 'E-Rickshaw', vehicleNo: 'UP-85 VT 2026', verified: false, status: 'Pending Admin Verification' }}
              onLogout={handlePartnerLogout}
            />
          )}

          {activeRole === 'hotel' && (
            <HotelPortalTab 
              partner={partnerData || { name: 'Radha Krishna Dham', type: 'Temple Ashram & Guesthouse', verified: false, status: 'Pending Admin Verification' }}
              onLogout={handlePartnerLogout}
            />
          )}

          {activeRole === 'restaurant' && (
            <RestaurantPortalTab 
              partner={partnerData || { name: 'Brijwasin Dining', type: 'Sattvic Bhojnalaya', verified: false, status: 'Pending Admin Verification' }}
              onLogout={handlePartnerLogout}
            />
          )}

          {activeRole === 'agency' && (
            <AgencyPortalTab 
              partner={partnerData || { name: 'Shri Braj 84 Kos Yatra Tours', type: '84 Kos Parikrama & Group Fleet', verified: false, status: 'Pending Admin Verification' }}
              onLogout={handlePartnerLogout}
            />
          )}

          {activeRole === 'admin' && (
            <OperationsAdminTab 
              drivers={drivers}
              isAdmin={isAdminUser}
            />
          )}
        </div>
      </div>
    </>
  );
}
