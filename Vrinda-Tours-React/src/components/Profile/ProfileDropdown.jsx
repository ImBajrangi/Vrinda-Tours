import { useRef, useEffect } from 'react';
import { 
  User, Heart, BedDouble, Utensils, Car, 
  Smartphone, ShieldCheck, ChevronRight, Sparkles, ExternalLink, Award 
} from 'lucide-react';
import './ProfileDropdown.css';

export default function ProfileDropdown({
  isOpen,
  onClose,
  activeRole = 'user',
  savedCount = 0,
  bookingsCount = 0,
  onOpenFullProfile,
  onOpenInstallApp,
  onOpenDriverPortal,
  onOpenAdmin,
  isAdmin = false
}) {
  const dropdownRef = useRef(null);

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
    <div className="vt-pdd-container" ref={dropdownRef}>
      {/* User Quick Info */}
      <div className="vt-pdd-user-banner" onClick={() => { onClose(); onOpenFullProfile(); }}>
        <div className="vt-pdd-avatar">
          <User size={18} />
          <span className="vt-pdd-online-dot" />
        </div>
        <div className="vt-pdd-user-meta">
          <div className="vt-pdd-name-row">
            <strong>Braj Yatri</strong>
            <span className="vt-pdd-role-tag">
              {activeRole === 'user' ? 'Pilgrim' : activeRole === 'driver' ? 'Driver' : activeRole === 'hotel' ? 'Stay Partner' : 'Partner'}
            </span>
          </div>
          <span className="vt-pdd-phone">View profile & settings</span>
        </div>
        <ChevronRight size={15} className="vt-pdd-arrow" />
      </div>

      <div className="vt-pdd-divider" />

      {/* Primary Items List */}
      <div className="vt-pdd-items-list">
        <button 
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenFullProfile('bookings'); }}
        >
          <div className="vt-pdd-item-icon blue">
            <BedDouble size={15} />
          </div>
          <span className="vt-pdd-item-title">My Booking Requests</span>
          {bookingsCount > 0 && <span className="vt-pdd-count-badge">{bookingsCount}</span>}
        </button>

        <button 
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenFullProfile('favorites'); }}
        >
          <div className="vt-pdd-item-icon red">
            <Heart size={15} />
          </div>
          <span className="vt-pdd-item-title">Saved Sacred Places</span>
          {savedCount > 0 && <span className="vt-pdd-count-badge">{savedCount}</span>}
        </button>

        <button 
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenInstallApp(); }}
        >
          <div className="vt-pdd-item-icon emerald">
            <Smartphone size={15} />
          </div>
          <span className="vt-pdd-item-title">Install Mobile App</span>
          <span className="vt-pdd-new-badge">PWA</span>
        </button>

        <button 
          className="vt-pdd-item" 
          onClick={() => { onClose(); onOpenDriverPortal(); }}
        >
          <div className="vt-pdd-item-icon gold">
            <Car size={15} />
          </div>
          <span className="vt-pdd-item-title">Partner & Driver Desk</span>
        </button>

        {isAdmin && (
          <button 
            className="vt-pdd-item" 
            onClick={() => { onClose(); onOpenAdmin(); }}
          >
            <div className="vt-pdd-item-icon purple">
              <ShieldCheck size={15} />
            </div>
            <span className="vt-pdd-item-title">Admin Operations Console</span>
          </button>
        )}
      </div>

      <div className="vt-pdd-divider" />

      {/* Footer helpline */}
      <div className="vt-pdd-footer">
        <a 
          href="https://wa.me/919876543210?text=Radhe%20Radhe!"
          target="_blank"
          rel="noopener noreferrer"
          className="vt-pdd-help-link"
        >
          <span>24x7 Vrinda WhatsApp Helpline</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
