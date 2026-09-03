import { useState, useMemo } from 'react';
import { X, Phone, Trash2, LogIn, Star, ShieldAlert, Shield, Search } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { VehicleGraphic } from '../Driver/DriverLandingPage';
import './DriversPanel.css';

export default function DriversPanel({ 
  drivers, 
  onClose, 
  onOpenAdmin,
  onOpenDriverPortal,
  onOpenDriverLanding
}) {
  const [isAdmin] = useState(sessionStorage.getItem('vt_admin') === 'true');
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { isDragging, isClosing, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return drivers;
    const q = searchQuery.toLowerCase();
    return drivers.filter(d => 
      d.name?.toLowerCase().includes(q) || 
      d.phone?.includes(q) || 
      d.vehicleNo?.toLowerCase().includes(q) ||
      d.vehicleType?.toLowerCase().includes(q)
    );
  }, [drivers, searchQuery]);

  const confirmDeleteDriver = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(firestore, 'drivers', deletingId));
    } catch {
      // Graceful fail
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className={`drivers-overlay visible ${isClosing ? 'closing' : ''}`} onClick={triggerClose} />
      <div 
        className={`drivers-panel visible ${isDragging ? 'dragging' : ''} ${isClosing ? 'closing' : ''}`}
        style={sheetStyle}
      >
        <div className="drivers-panel-handle-wrapper" {...handleProps} title="Drag down to close">
          <div className="drivers-panel-handle" />
        </div>

        <div className="drivers-panel-header">
          <div className="dp-header-left">
            <div className="dp-header-icon-box">
              <Shield size={18} color="#09090b" />
            </div>
            <div className="dp-header-text">
              <h3>Local Drivers</h3>
              <span className="dp-count">{drivers.length} Verified Drivers</span>
            </div>
          </div>
          <div className="dp-actions">
            {!isAdmin && (
              <button className="btn-admin-login" onClick={onOpenAdmin} title="Admin Login">
                <LogIn size={13} />
                <span>Admin</span>
              </button>
            )}
            <button className="drivers-panel-close" onClick={triggerClose} title="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Driver Partner Callout Banner */}
        <div className="dp-partner-callout-banner">
          <div className="dp-callout-text">
            <strong>Drive with Vrinda Vihar</strong>
            <span>0% Commission • 100% Direct Cash/UPI</span>
          </div>
          <button 
            type="button" 
            className="dp-callout-action-btn"
            onClick={() => {
              if (onOpenDriverLanding) {
                onClose();
                onOpenDriverLanding();
              } else if (onOpenDriverPortal) {
                onClose();
                onOpenDriverPortal();
              }
            }}
          >
            Register Free →
          </button>
        </div>

        {drivers.length > 2 && (
          <div className="drivers-search-container">
            <div className="drivers-search-bar">
              <Search size={15} color="#71717a" />
              <input 
                type="text" 
                placeholder="Search by driver name, phone, or vehicle..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="drivers-search-clear" onClick={() => setSearchQuery('')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="drivers-panel-body">
          <div className="drivers-list">
            {filtered.length === 0 ? (
              <div className="dp-empty-state-card">
                <div className="dp-empty-icon-circle">
                  <Shield size={24} color="#94a3b8" />
                </div>
                <h4>{searchQuery ? `No drivers matching "${searchQuery}"` : 'No Registered Drivers Yet'}</h4>
                <p>Be the first driver partner in your area to receive live devotee ride requests directly.</p>
                <button 
                  type="button" 
                  className="dp-empty-register-btn"
                  onClick={() => {
                    if (onOpenDriverLanding) {
                      onClose();
                      onOpenDriverLanding();
                    } else if (onOpenDriverPortal) {
                      onClose();
                      onOpenDriverPortal();
                    }
                  }}
                >
                  Join as Driver Partner →
                </button>
              </div>
            ) : (
              filtered.map((d) => {
                const status = d.status || 'offline';
                return (
                  <div key={d.id} className="driver-item">
                    <div className="di-avatar">
                      <img 
                        src={d.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.name}&backgroundColor=f1f5f9`} 
                        alt={d.name} 
                      />
                      <div className="di-vehicle-badge">
                        <VehicleGraphic type={d.vehicleType} size={11} />
                      </div>
                    </div>
                    <div className="di-info">
                      <div className="di-name-row">
                        <div className="di-name-left">
                          <h4>{d.name}</h4>
                        </div>
                        <span className="di-rating"><Star size={11} fill="#f59e0b" color="#f59e0b" /> {d.rating || '4.9'}</span>
                      </div>
                      <div className="di-sub-info">
                        <span>{d.vehicleType || 'E-Rickshaw'} • {d.vehicleNo || 'UP-85'}</span>
                        <span className="di-sub-dot">•</span>
                        <span className={`di-status-dot-label ${status}`}>
                          <span className={`di-dot-indicator ${status}`} />
                          {status === 'available' ? 'Available' : (status === 'busy' ? 'Busy' : 'Offline')}
                        </span>
                        {d.commissionDue > 0 && (
                          <span style={{ marginLeft: '4px', fontSize: '0.68rem', fontWeight: 800, color: '#e11d48', background: '#ffe4e6', padding: '1px 6px', borderRadius: '4px' }}>
                            Due: ₹{d.commissionDue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="di-actions">
                      <button className="btn-call" onClick={() => window.open(`tel:${d.phone}`)} title="Call Driver">
                        <Phone size={16} />
                      </button>
                      {isAdmin && (
                        <button className="btn-delete" onClick={() => setDeletingId(d.id)} title="Delete Driver">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Delete Modal Confirmation */}
        {deletingId && (
          <div className="confirm-delete-overlay">
            <div className="confirm-delete-card">
              <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 0.5rem' }} />
              <h4>Delete Driver Partner?</h4>
              <p>Are you sure you want to remove this driver from fleet records?</p>
              <div className="confirm-delete-actions">
                <button className="btn-cancel" onClick={() => setDeletingId(null)}>Cancel</button>
                <button className="btn-confirm-del" onClick={confirmDeleteDriver}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
