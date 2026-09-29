import { useRef, useEffect } from 'react';
import { 
  Heart, BedDouble, Car, 
  Smartphone, ShieldCheck, ChevronRight, MessageCircle, ExternalLink,
  Sun, Moon, Laptop, User
} from 'lucide-react';
import './ProfileDropdown.css';

export default function ProfileDropdown({
  isOpen,
  onClose,
  activeRole = 'user',
  savedCount = 0,
  bookingsCount = 0,
  themePreference = 'system',
  onThemeChange,
  onOpenFullProfile,
  onOpenInstallApp,
  onOpenDriverPortal,
  onOpenAdmin,
  isAdmin = false
}) {
  const dropdownRef = useRef(null);

  // Retrieve stored user name if any
  const userName = typeof window !== 'undefined' 
    ? (localStorage.getItem('vt_user_name') || sessionStorage.getItem('vt_user_name') || 'Braj Yatri') 
    : 'Braj Yatri';

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vt-pdd-container" ref={dropdownRef} role="menu" aria-label="User account menu">
      {/* 1. Clean User Profile Header */}
      <div 
        className="vt-pdd-user-banner" 
        onClick={() => { onClose(); onOpenFullProfile?.('overview'); }}
        role="menuitem"
        tabIndex={0}
      >
        <div className="vt-pdd-avatar-wrap">
          <div className="vt-pdd-avatar-img">
            <span>🕉️</span>
          </div>
        </div>
        <div className="vt-pdd-user-meta">
          <div className="vt-pdd-name-row">
            <span className="vt-pdd-name">{userName}</span>
          </div>
          <span className="vt-pdd-sub">Pilgrim • Brij Dham</span>
        </div>
        <ChevronRight size={14} className="vt-pdd-arrow" />
      </div>

      <div className="vt-pdd-divider" />

      {/* 2. Essential Actions List */}
      <div className="vt-pdd-items-list" role="group">
        <button 
          type="button"
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenFullProfile?.('favorites'); }}
          role="menuitem"
        >
          <div className="vt-pdd-item-icon">
            <Heart size={15} />
          </div>
          <span className="vt-pdd-item-title">Saved Sacred Places</span>
          {savedCount > 0 && (
            <span className="vt-pdd-count-badge">{savedCount}</span>
          )}
        </button>

        <button 
          type="button"
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenFullProfile?.('bookings'); }}
          role="menuitem"
        >
          <div className="vt-pdd-item-icon">
            <BedDouble size={15} />
          </div>
          <span className="vt-pdd-item-title">My Booking Requests</span>
          {bookingsCount > 0 && (
            <span className="vt-pdd-count-badge">{bookingsCount}</span>
          )}
        </button>

        <button 
          type="button"
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenInstallApp?.(); }}
          role="menuitem"
        >
          <div className="vt-pdd-item-icon">
            <Smartphone size={15} />
          </div>
          <span className="vt-pdd-item-title">Install Mobile App</span>
        </button>

        <button 
          type="button"
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenDriverPortal?.(); }}
          role="menuitem"
        >
          <div className="vt-pdd-item-icon">
            <Car size={15} />
          </div>
          <span className="vt-pdd-item-title">Partner & Driver Desk</span>
        </button>

        {isAdmin && (
          <button 
            type="button"
            className="vt-pdd-item" 
            onClick={() => { onClose(); onOpenAdmin?.(); }}
            role="menuitem"
          >
            <div className="vt-pdd-item-icon">
              <ShieldCheck size={15} />
            </div>
            <span className="vt-pdd-item-title">Admin Operations</span>
          </button>
        )}
      </div>

      <div className="vt-pdd-divider" />

      {/* 3. Theme Controller */}
      {onThemeChange && (
        <div className="vt-pdd-theme-section">
          <div className="vt-pdd-theme-toggle">
            <button
              type="button"
              className={`vt-pdd-theme-btn ${themePreference === 'system' ? 'active' : ''}`}
              onClick={() => onThemeChange('system')}
              title="System Theme"
            >
              <Laptop size={13} />
              <span>System</span>
            </button>
            <button
              type="button"
              className={`vt-pdd-theme-btn ${themePreference === 'dark' ? 'active' : ''}`}
              onClick={() => onThemeChange('dark')}
              title="Dark Theme"
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
            <button
              type="button"
              className={`vt-pdd-theme-btn ${themePreference === 'light' ? 'active' : ''}`}
              onClick={() => onThemeChange('light')}
              title="Light Theme"
            >
              <Sun size={13} />
              <span>Light</span>
            </button>
          </div>
        </div>
      )}

      <div className="vt-pdd-divider" />

      {/* 4. Direct 24x7 WhatsApp Help */}
      <div className="vt-pdd-footer">
        <a 
          href="https://wa.me/919876543210?text=Radhe%20Radhe!%20I%20need%20assistance%20with%20Vrinda%20Travels"
          target="_blank"
          rel="noopener noreferrer"
          className="vt-pdd-help-link"
        >
          <div className="vt-pdd-help-left">
            <MessageCircle size={14} />
            <span>24x7 WhatsApp Help</span>
          </div>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
