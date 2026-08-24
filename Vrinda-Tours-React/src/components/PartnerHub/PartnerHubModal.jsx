import { useState } from 'react';
import { X, Briefcase, Car, Utensils, Building2, Shield, Sparkles, Info } from 'lucide-react';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import DriverPortalTab from './DriverPortalTab';
import RestaurantPortalTab from './RestaurantPortalTab';
import HotelPortalTab from './HotelPortalTab';
import OperationsAdminTab from './OperationsAdminTab';
import './PartnerHubModal.css';

export default function PartnerHubModal({ onClose, onOpenLanding, drivers = [], initialRole = 'driver' }) {
  const { isDragging, isClosing, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);
  const [activeRole, setActiveRole] = useState(() => {
    return sessionStorage.getItem('vt_partner_role') || initialRole;
  });

  const handleRoleSelect = (role) => {
    setActiveRole(role);
    sessionStorage.setItem('vt_partner_role', role);
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
              <Briefcase size={18} color="#09090b" />
            </div>
            <div className="ph-brand-text">
              <h3>Partner Hub</h3>
              <span className="ph-brand-sub">Brij Staff & Merchant Platform</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onOpenLanding && (
              <button 
                className="ph-close-btn" 
                onClick={onOpenLanding} 
                title="Partner Program Info & Benefits"
                style={{ background: '#f4f4f5', color: '#52525b' }}
              >
                <Info size={15} />
              </button>
            )}
            <button className="ph-close-btn" onClick={triggerClose} title="Close Portal">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Role Segmented Switcher */}
        <div className="ph-role-bar">
          <button 
            className={`ph-role-chip ${activeRole === 'driver' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('driver')}
          >
            <Car size={13} /> Driver Mode
          </button>
          <button 
            className={`ph-role-chip ${activeRole === 'restaurant' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('restaurant')}
          >
            <Utensils size={13} /> Dining Desk
          </button>
          <button 
            className={`ph-role-chip ${activeRole === 'hotel' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('hotel')}
          >
            <Building2 size={13} /> Stay Desk
          </button>
          <button 
            className={`ph-role-chip ${activeRole === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('admin')}
          >
            <Shield size={13} /> Operations
          </button>
        </div>

        {/* Dynamic Candidate Body */}
        <div className="ph-body">
          {activeRole === 'driver' && (
            <DriverPortalTab 
              partner={drivers[0] || { name: 'Radhe', vehicleType: 'E-Rickshaw', vehicleNo: 'UP-85 VT 2026' }}
              onLogout={triggerClose}
            />
          )}

          {activeRole === 'restaurant' && (
            <RestaurantPortalTab 
              partner={{ name: 'Brijwasin Dining', type: 'Sattvic Bhojanalaya' }}
              onLogout={triggerClose}
            />
          )}

          {activeRole === 'hotel' && (
            <HotelPortalTab 
              partner={{ name: 'Radha Krishna Dham', type: 'Temple Ashram & Guesthouse' }}
              onLogout={triggerClose}
            />
          )}

          {activeRole === 'admin' && (
            <OperationsAdminTab 
              drivers={drivers}
            />
          )}
        </div>
      </div>
    </>
  );
}
