import { useState, useMemo } from 'react';
import { X, Phone, Trash2, LogIn, Star, ShieldAlert, Shield, Search } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import './DriversPanel.css';

export default function DriversPanel({ drivers, onClose, onOpenAdmin }) {
  const [isAdmin] = useState(sessionStorage.getItem('vt_admin') === 'true');
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

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
      setDeletingId(null);
    } catch {
      alert('Failed to delete driver');
    }
  };

  const getVehicleEmoji = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'e-rickshaw': return '🛺';
      case 'auto': return '🛺';
      case 'taxi': return '🚗';
      case 'bike': return '🛵';
      case 'bus': return '🚌';
      default: return '🛺';
    }
  };

  return (
    <>
      <div className="drivers-overlay visible" onClick={triggerClose} />
      <div 
        className={`drivers-panel visible ${isDragging ? 'dragging' : ''}`}
        style={sheetStyle}
      >
        <div className="drivers-panel-handle-wrapper" {...handleProps} title="Drag down to close">
          <div className="drivers-panel-handle" />
        </div>

        <div className="drivers-panel-header">
          <div className="dp-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="#18181b" />
              <h3 style={{ margin: 0 }}>Fleet Partners</h3>
            </div>
            <span className="dp-count">{drivers.length} verified drivers</span>
          </div>
          <div className="dp-actions">
            {!isAdmin && (
              <button className="btn-admin-login" onClick={onOpenAdmin} title="Admin Login">
                <LogIn size={15} /> Admin
              </button>
            )}
            <button className="drivers-panel-close" onClick={triggerClose} title="Close"><X size={18} /></button>
          </div>
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
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#71717a' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {searchQuery ? `No drivers matching "${searchQuery}"` : 'No registered drivers found.'}
                </p>
              </div>
            ) : (
              filtered.map((d) => {
                const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const emoji = getVehicleEmoji(d.vehicleType);
                const status = d.status || 'offline';
                return (
                  <div key={d.id} className="driver-item">
                    <div className="di-avatar">
                      {d.photo ? <img src={d.photo} alt={d.name} /> : initials}
                      <span className="di-emoji-badge">{emoji}</span>
                    </div>
                    <div className="di-info">
                      <h4>{d.name}</h4>
                      <div className="di-sub-info">
                        <span>{d.vehicleType || 'E-Rickshaw'} • {d.phone}</span>
                        <span className="di-rating"><Star size={11} fill="#f59e0b" color="#f59e0b" /> {d.rating || '4.9'}</span>
                      </div>
                      <div className="di-status-wrapper">
                        <span className={`di-status-badge ${status}`}>
                          {status === 'available' ? 'Available now' : (status === 'busy' ? 'On a ride' : 'Offline')}
                        </span>
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
