import { useState, useEffect } from 'react';
import { 
  XMarkIcon, BriefcaseIcon, TruckIcon, BuildingStorefrontIcon, 
  BuildingOffice2Icon, ShieldCheckIcon, InformationCircleIcon, 
  LockClosedIcon, GlobeAltIcon, ArrowRightOnRectangleIcon, 
  UserPlusIcon, MagnifyingGlassIcon, PhoneIcon
} from '@heroicons/react/24/outline';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import DriverPortalTab from './DriverPortalTab';
import RestaurantPortalTab from './RestaurantPortalTab';
import HotelPortalTab from './HotelPortalTab';
import AgencyPortalTab from './AgencyPortalTab';
import OperationsAdminTab from './OperationsAdminTab';
import { supabase, safeRemoveChannel } from '../../config/supabase';
import './PartnerHubModal.css';

// Admin email whitelist with robust fallbacks
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'sakhi@vrindavihar.in,sakhi@vrindatours.com,admin@vrindatours.com,admin@vrinda.tours,admin@vrindavihar.in')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

const ROLE_THEMES = {
  restaurant: {
    iconComponent: BuildingStorefrontIcon,
    title: 'Dining Partner Desk',
    subtitle: 'Brij Dham Restaurant Operations & Tables',
    authorityTitle: 'Dining Partner',
    color: '#ea580c',
    accentBg: '#fff7ed',
    borderColor: '#ffedd5',
  },
  driver: {
    iconComponent: TruckIcon,
    title: 'Sarathi Driver Companion',
    subtitle: 'Live GPS Ride Dispatch & Earnings',
    authorityTitle: 'Sarathi Driver Partner',
    color: '#0f172a',
    accentBg: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  hotel: {
    iconComponent: BuildingOffice2Icon,
    title: 'Ashram & Hotel Stay Desk',
    subtitle: 'Room Inventory & Pilgrim Check-Ins',
    authorityTitle: 'Stay & Ashram Partner',
    color: '#2563eb',
    accentBg: '#eff6ff',
    borderColor: '#dbeafe',
  },
  agency: {
    iconComponent: GlobeAltIcon,
    title: 'Tour Agency & Yatra Desk',
    subtitle: '84 Kos Parikrama & Group Bookings',
    authorityTitle: 'Tour Agency Partner',
    color: '#7c3aed',
    accentBg: '#f5f3ff',
    borderColor: '#ede9fe',
  },
  admin: {
    iconComponent: ShieldCheckIcon,
    title: 'Super Admin Operations',
    subtitle: 'Platform Audit, Settlements & Verifications',
    authorityTitle: 'Platform Super Admin',
    color: '#d97706',
    accentBg: '#fffbeb',
    borderColor: '#fef3c7',
  },
  pilgrim: {
    iconComponent: BriefcaseIcon,
    title: 'Partner Services Explorer',
    subtitle: 'Brij Dham Partner Workspaces Preview',
    authorityTitle: 'Devotee Pilgrim',
    color: '#475569',
    accentBg: '#f8fafc',
    borderColor: '#e2e8f0',
  }
};

const normalizeRole = (r) => {
  if (r === 'restaurant_staff') return 'restaurant';
  if (r === 'hotel_staff') return 'hotel';
  return r || 'driver';
};

export default function PartnerHubModal({ 
  onClose, 
  onOpenLanding, 
  drivers = [], 
  partnerId: propPartnerId, 
  initialRole = 'driver',
  authorizedRole = null
}) {
  const { isDragging, isClosing, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);
  
  const [partnerId, setPartnerId] = useState(() => {
    return propPartnerId || sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_driver_id');
  });

  // Helper to verify admin authorization from props or storage
  const isSuperAdminAuthorized = () => {
    try {
      return (
        authorizedRole === 'admin' ||
        initialRole === 'admin' ||
        propPartnerId === 'admin' ||
        sessionStorage.getItem('vt_is_admin') === 'true' ||
        localStorage.getItem('vt_admin_session') === 'true' ||
        localStorage.getItem('vt_user_role') === 'admin'
      );
    } catch {
      return false;
    }
  };

  // Check admin on mount from storage or props
  const [isAdminUser, setIsAdminUser] = useState(isSuperAdminAuthorized);

  const [activeRole, setActiveRole] = useState(() => {
    // If admin is active or authorized as admin, default directly to admin dashboard
    if (isSuperAdminAuthorized()) {
      return 'admin';
    }
    const passed = authorizedRole || initialRole || sessionStorage.getItem('vt_partner_role') || 'driver';
    return normalizeRole(passed);
  });

  const [partnerData, setPartnerData] = useState(null);
  const [lockNotice, setLockNotice] = useState('');
  const [isSignedOutMode, setIsSignedOutMode] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneLoginError, setPhoneLoginError] = useState('');
  const [isSearchingPartner, setIsSearchingPartner] = useState(false);

  // Check Supabase Auth session for admin access
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const isStorageAdmin = isSuperAdminAuthorized();
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email?.toLowerCase();
        const isEmailAdmin = email ? (ADMIN_EMAILS.includes(email) || email.endsWith('@vrindatours.com') || email.endsWith('@vrindavihar.in') || email.endsWith('@vrinda.tours')) : false;
        const isAdm = isEmailAdmin || isStorageAdmin;
        
        setIsAdminUser(isAdm);
        if (isAdm) {
          sessionStorage.setItem('vt_is_admin', 'true');
        }
        
        // If user is Admin and not inspecting a specific partner account, default to admin operations tab
        if (isAdm && (!propPartnerId || propPartnerId === 'admin') && (!sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_partner_id') === 'admin')) {
          if (!authorizedRole || authorizedRole === 'admin') {
            setActiveRole('admin');
          }
        }
      } catch {
        // preserve storage admin
      }
    };
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isStorageAdmin = isSuperAdminAuthorized();
      const email = session?.user?.email?.toLowerCase();
      const isEmailAdmin = email ? (ADMIN_EMAILS.includes(email) || email.endsWith('@vrindatours.com') || email.endsWith('@vrindavihar.in') || email.endsWith('@vrinda.tours')) : false;
      const isAdm = isEmailAdmin || isStorageAdmin;
      setIsAdminUser(isAdm);
      if (isAdm) {
        sessionStorage.setItem('vt_is_admin', 'true');
      }
      if (isAdm && (!propPartnerId || propPartnerId === 'admin') && (!sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_partner_id') === 'admin')) {
        if (!authorizedRole || authorizedRole === 'admin') {
          setActiveRole('admin');
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, [propPartnerId, authorizedRole, initialRole]);

  // Update activeRole if authorizedRole prop updates
  useEffect(() => {
    if (authorizedRole) {
      const norm = normalizeRole(authorizedRole);
      setActiveRole(norm);
      sessionStorage.setItem('vt_partner_role', norm);
    }
  }, [authorizedRole]);

  // 1. Fetch & Real-time Subscribe to Partner Profile in Supabase
  useEffect(() => {
    const currentId = partnerId || propPartnerId || (activeRole !== 'admin' ? sessionStorage.getItem('vt_partner_id') : null);
    if (!currentId || currentId === 'admin') return;

    let isMounted = true;

    const fetchPartnerProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('id', currentId)
          .maybeSingle();

        if (error) return;

        if (data && isMounted) {
          setPartnerData(data);
          if (data.category && !isAdminUser && activeRole !== 'admin') {
            const norm = normalizeRole(data.category);
            setActiveRole(norm);
            sessionStorage.setItem('vt_partner_role', norm);
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
            if (payload.new.category && !isAdminUser) {
              const norm = normalizeRole(payload.new.category);
              setActiveRole(norm);
              sessionStorage.setItem('vt_partner_role', norm);
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      safeRemoveChannel(channel);
    };
  }, [partnerId, propPartnerId, isAdminUser]);

  // Category Lock Rule: If verified by Admin and NOT super admin, lock category
  const isVerified = Boolean(partnerData?.verified);
  const isCategoryLocked = Boolean((partnerData?.verified || partnerData?.category_locked) && !isAdminUser);

  const isFullAdmin = Boolean(isAdminUser || activeRole === 'admin' || authorizedRole === 'admin' || isSuperAdminAuthorized());

  // Authenticated Partner Session: Only active if a real partner profile is loaded matching active desk
  const hasAuthenticatedPartnerSession = Boolean(
    partnerData?.id && 
    normalizeRole(partnerData?.category) === activeRole && 
    !isSignedOutMode
  );

  // Dedicated single partner view (locks role switcher ONLY when genuinely signed into their own verified desk)
  const isDedicatedPartner = hasAuthenticatedPartnerSession && !isFullAdmin;
  const currentTheme = ROLE_THEMES[activeRole] || ROLE_THEMES.driver;

  const handleRoleSelect = (role) => {
    setLockNotice('');
    // Operations admin — only accessible to whitelisted admin emails / authorized sessions
    if (role === 'admin') {
      if (!isAdminUser && !isFullAdmin) {
        setLockNotice('Admin access is restricted. Sign in with an authorized admin account.');
        setTimeout(() => setLockNotice(''), 4000);
        return;
      }
      setActiveRole('admin');
      setLockNotice('');
      return;
    }

    if (isCategoryLocked && partnerData?.category && role !== normalizeRole(partnerData.category) && !isFullAdmin) {
      setLockNotice(`Category is locked. This account is verified by Admin as a ${partnerData.category.toUpperCase()}. Sign out to switch desks.`);
      setTimeout(() => setLockNotice(''), 4000);
      return;
    }

    setActiveRole(role);
    sessionStorage.setItem('vt_partner_role', role);
    setLockNotice('');
    setPhoneLoginError('');
  };

  // Sign out handler: Clears session and reveals account switcher without closing the modal
  const handlePartnerLogout = async () => {
    sessionStorage.removeItem('vt_partner_id');
    sessionStorage.removeItem('vt_driver_id');
    sessionStorage.removeItem('vt_partner_role');
    sessionStorage.removeItem('vt_is_admin');
    
    setPartnerData(null);
    setPartnerId(null);
    
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    
    setIsAdminUser(false);
    setIsSignedOutMode(true);
    setPhoneInput('');
    setPhoneLoginError('');
  };

  // Handle phone lookup for quick partner sign-in
  const handlePhoneLookup = async (e) => {
    e.preventDefault();
    setPhoneLoginError('');
    const clean = phoneInput.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      setPhoneLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSearchingPartner(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .or(`phone.ilike.%${clean}%,phone.eq.+91${clean}`)
        .limit(1);

      if (error || !data || data.length === 0) {
        setPhoneLoginError('No partner account found with this number. Register below.');
      } else {
        const found = data[0];
        setPartnerData(found);
        setPartnerId(found.id);
        sessionStorage.setItem('vt_partner_id', found.id);
        if (found.category) {
          const norm = normalizeRole(found.category);
          setActiveRole(norm);
          sessionStorage.setItem('vt_partner_role', norm);
        }
        setIsSignedOutMode(false);
      }
    } catch (err) {
      setPhoneLoginError('Connection error. Please try again.');
    } finally {
      setIsSearchingPartner(false);
    }
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
            <div 
              className="ph-brand-icon-box"
              style={{
                background: currentTheme.accentBg,
                borderColor: currentTheme.borderColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {(() => {
                const IconComp = currentTheme.iconComponent || TruckIcon;
                return <IconComp style={{ width: 18, height: 18, color: currentTheme.color }} />;
              })()}
            </div>
            <div className="ph-brand-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3>{currentTheme.title}</h3>
                {isCategoryLocked && (
                  <span className="ph-verified-badge" title="Verified &amp; Category Locked by Admin">
                    <LockClosedIcon style={{ width: 10, height: 10 }} /> Verified &amp; Locked
                  </span>
                )}
                {isFullAdmin && (
                  <span className="ph-verified-badge" style={{ background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }}>
                    <ShieldCheckIcon style={{ width: 10, height: 10 }} /> Super Admin
                  </span>
                )}
              </div>
              <span className="ph-brand-sub">
                {hasAuthenticatedPartnerSession ? partnerData?.name : (isFullAdmin ? 'Platform Management & Operations Console' : currentTheme.subtitle)}
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

        {/* Authority Scope Strip for Dedicated Single Partner */}
        {isDedicatedPartner ? (
          <div 
            className="ph-authority-scoped-strip"
            style={{ 
              '--role-accent': currentTheme.color,
              '--role-bg': currentTheme.accentBg,
              '--role-border': currentTheme.borderColor
            }}
          >
            <div className="ph-authority-meta-group">
              <div className="ph-authority-pill">
                <ShieldCheckIcon className="ph-auth-shield-icon" />
                <span className="ph-auth-scope-label">Verified Desk</span>
                <span className="ph-auth-sep">•</span>
                <span className="ph-auth-role-name">{currentTheme.authorityTitle}</span>
              </div>
            </div>
            
            <div className="ph-authority-status-badge">
              <span className="ph-live-pulse-dot" />
              <span className="ph-live-status-text">Live Workspace</span>
            </div>
          </div>
        ) : (
          /* Multi-Role Segmented Switcher for Admin / Desk Explorers */
          <div className="ph-role-bar">
            {isFullAdmin && (
              <button 
                className={`ph-role-chip ${activeRole === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleSelect('admin')}
                title="Admin Operations Verification Console"
              >
                <ShieldCheckIcon style={{ width: 13, height: 13 }} /> Admin Verify
              </button>
            )}
            <button 
              className={`ph-role-chip ${activeRole === 'driver' ? 'active' : ''} ${isCategoryLocked && normalizeRole(partnerData?.category) !== 'driver' ? 'locked-other' : ''}`}
              onClick={() => handleRoleSelect('driver')}
              title="Driver Companion Desk"
            >
              <TruckIcon style={{ width: 13, height: 13 }} /> Drivers
            </button>
            <button 
              className={`ph-role-chip ${activeRole === 'hotel' ? 'active' : ''} ${isCategoryLocked && normalizeRole(partnerData?.category) !== 'hotel' ? 'locked-other' : ''}`}
              onClick={() => handleRoleSelect('hotel')}
              title="Ashram & Stay Desk"
            >
              <BuildingOffice2Icon style={{ width: 13, height: 13 }} /> Stays
            </button>
            <button 
              className={`ph-role-chip ${activeRole === 'restaurant' ? 'active' : ''} ${isCategoryLocked && normalizeRole(partnerData?.category) !== 'restaurant' ? 'locked-other' : ''}`}
              onClick={() => handleRoleSelect('restaurant')}
              title="Dining Desk"
            >
              <BuildingStorefrontIcon style={{ width: 13, height: 13 }} /> Dining
            </button>
            <button 
              className={`ph-role-chip ${activeRole === 'agency' ? 'active' : ''} ${isCategoryLocked && normalizeRole(partnerData?.category) !== 'agency' ? 'locked-other' : ''}`}
              onClick={() => handleRoleSelect('agency')}
              title="Tour Agency & Yatra Desk"
            >
              <GlobeAltIcon style={{ width: 13, height: 13 }} /> Agencies
            </button>
          </div>
        )}

        {/* Dynamic Category Profile Body */}
        <div className="ph-body">
          {/* If Super Admin on Admin Tab */}
          {activeRole === 'admin' ? (
            isFullAdmin ? (
              <OperationsAdminTab 
                drivers={drivers}
                isAdmin={isFullAdmin}
              />
            ) : (
              <div className="ph-signed-out-card">
                <div className="ph-signed-out-icon-box" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                  <ShieldCheckIcon style={{ width: 28, height: 28, color: '#d97706' }} />
                </div>
                <h4>Super Admin Operations</h4>
                <p>Administrative console is restricted to authorized platform administrators.</p>
                <div className="ph-quick-workspace-links">
                  <button type="button" className="ph-workspace-chip" onClick={() => handleRoleSelect('driver')}>
                    <TruckIcon style={{ width: 14, height: 14, color: '#0f172a' }} />
                    <span>Sarathi Driver</span>
                  </button>
                  <button type="button" className="ph-workspace-chip" onClick={() => handleRoleSelect('hotel')}>
                    <BuildingOffice2Icon style={{ width: 14, height: 14, color: '#2563eb' }} />
                    <span>Stay Desk</span>
                  </button>
                  <button type="button" className="ph-workspace-chip" onClick={() => handleRoleSelect('restaurant')}>
                    <BuildingStorefrontIcon style={{ width: 14, height: 14, color: '#ea580c' }} />
                    <span>Dining Desk</span>
                  </button>
                  <button type="button" className="ph-workspace-chip" onClick={() => handleRoleSelect('agency')}>
                    <GlobeAltIcon style={{ width: 14, height: 14, color: '#7c3aed' }} />
                    <span>Yatra Agency</span>
                  </button>
                </div>
              </div>
            )
          ) : hasAuthenticatedPartnerSession || isFullAdmin ? (
            /* Active Authenticated Partner Workspace (or Admin Preview) */
            <>
              {isFullAdmin && (
                <div className="ph-admin-preview-banner">
                  <ShieldCheckIcon style={{ width: 14, height: 14, color: '#b45309' }} />
                  <span>Super Admin Oversight Mode: Previewing {currentTheme.title}</span>
                </div>
              )}

              {activeRole === 'driver' && (
                <DriverPortalTab 
                  partner={partnerData || { 
                    id: isFullAdmin ? 'admin_preview_driver' : 'driver_preview',
                    name: isFullAdmin ? 'Super Admin (Sarathi Preview)' : 'Driver Companion Desk', 
                    vehicleType: 'E-Rickshaw Fleet', 
                    vehicleNo: 'Braj Pilot UP-85', 
                    verified: isFullAdmin, 
                    status: isFullAdmin ? 'Admin Preview' : 'Pending Verification' 
                  }}
                  onLogout={handlePartnerLogout}
                />
              )}

              {activeRole === 'hotel' && (
                <HotelPortalTab 
                  partner={partnerData || { 
                    id: isFullAdmin ? 'admin_preview_hotel' : 'hotel_preview',
                    name: isFullAdmin ? 'Super Admin (Stay Desk Preview)' : 'Ashram & Stay Desk', 
                    type: 'Temple Ashram & Guesthouse', 
                    verified: isFullAdmin, 
                    status: isFullAdmin ? 'Admin Preview' : 'Pending Verification' 
                  }}
                  onLogout={handlePartnerLogout}
                />
              )}

              {activeRole === 'restaurant' && (
                <RestaurantPortalTab 
                  partner={partnerData || { 
                    id: isFullAdmin ? 'admin_preview_restaurant' : 'restaurant_preview',
                    name: isFullAdmin ? 'Super Admin (Dining Desk Preview)' : 'Sattvic Dining Desk', 
                    type: 'Sattvic Bhojnalaya', 
                    verified: isFullAdmin, 
                    status: isFullAdmin ? 'Admin Preview' : 'Pending Verification' 
                  }}
                  onLogout={handlePartnerLogout}
                />
              )}

              {activeRole === 'agency' && (
                <AgencyPortalTab 
                  partner={partnerData || { 
                    id: isFullAdmin ? 'admin_preview_agency' : 'agency_preview',
                    name: isFullAdmin ? 'Super Admin (Yatra Desk Preview)' : 'Tour Agency Desk', 
                    type: '84 Kos Parikrama & Group Fleet', 
                    verified: isFullAdmin, 
                    status: isFullAdmin ? 'Admin Preview' : 'Pending Verification' 
                  }}
                  onLogout={handlePartnerLogout}
                />
              )}
            </>
          ) : (
            /* Category Desk Sign-In & Onboarding View */
            <div className="ph-signed-out-card">
              <div 
                className="ph-signed-out-icon-box"
                style={{ 
                  background: currentTheme.accentBg, 
                  borderColor: currentTheme.borderColor 
                }}
              >
                {(() => {
                  const IconComp = currentTheme.iconComponent || BriefcaseIcon;
                  return <IconComp style={{ width: 28, height: 28, color: currentTheme.color }} />;
                })()}
              </div>
              <h4>{currentTheme.title}</h4>
              <p>Sign in with your registered phone number to manage your {currentTheme.authorityTitle} workspace.</p>

              <form onSubmit={handlePhoneLookup} className="ph-phone-login-form">
                {phoneLoginError && <div className="ph-login-error-pill">{phoneLoginError}</div>}
                
                <div className="ph-phone-input-wrap">
                  <span className="ph-phone-prefix">+91</span>
                  <input 
                    type="tel"
                    placeholder="Enter registered mobile number"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    maxLength={10}
                    required
                    className="ph-phone-input"
                  />
                  <button 
                    type="submit" 
                    disabled={isSearchingPartner}
                    className="ph-phone-submit-btn"
                  >
                    {isSearchingPartner ? 'Looking up...' : 'Sign In'}
                  </button>
                </div>
              </form>

              <div className="ph-desk-perks-row">
                <div className="ph-perk-pill">
                  <ShieldCheckIcon style={{ width: 13, height: 13, color: '#475569' }} />
                  <span>Verified Brij Partner</span>
                </div>
                <div className="ph-perk-pill">
                  <span style={{ color: '#0f172a', fontWeight: 800 }}>0%</span>
                  <span>Direct Devotee Payments</span>
                </div>
              </div>

              <div className="ph-switch-divider">
                <span>or explore workspaces</span>
              </div>

              <div className="ph-quick-workspace-links">
                <button 
                  type="button" 
                  className={`ph-workspace-chip ${activeRole === 'driver' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('driver')}
                >
                  <TruckIcon style={{ width: 14, height: 14, color: '#0f172a' }} />
                  <span>Sarathi Driver</span>
                </button>
                <button 
                  type="button" 
                  className={`ph-workspace-chip ${activeRole === 'hotel' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('hotel')}
                >
                  <BuildingOffice2Icon style={{ width: 14, height: 14, color: '#2563eb' }} />
                  <span>Stay Desk</span>
                </button>
                <button 
                  type="button" 
                  className={`ph-workspace-chip ${activeRole === 'restaurant' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('restaurant')}
                >
                  <BuildingStorefrontIcon style={{ width: 14, height: 14, color: '#ea580c' }} />
                  <span>Dining Desk</span>
                </button>
                <button 
                  type="button" 
                  className={`ph-workspace-chip ${activeRole === 'agency' ? 'active' : ''}`}
                  onClick={() => handleRoleSelect('agency')}
                >
                  <GlobeAltIcon style={{ width: 14, height: 14, color: '#7c3aed' }} />
                  <span>Yatra Agency</span>
                </button>
              </div>

              {onOpenLanding && (
                <button 
                  type="button" 
                  className="ph-register-new-btn"
                  onClick={() => {
                    triggerClose();
                    onOpenLanding(activeRole);
                  }}
                >
                  <UserPlusIcon style={{ width: 15, height: 15 }} />
                  <span>+ Register as a {currentTheme.authorityTitle}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
