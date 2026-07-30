import { useState } from 'react';
import { X, UserPlus, Phone, Trash2, LogIn, Car, Star, ShieldAlert } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import './DriversPanel.css';

export default function DriversPanel({ drivers, onClose, onOpenAdmin, onOpenDriverPortal }) {
  const [isAdmin] = useState(sessionStorage.getItem('vt_admin') === 'true');
  const [deletingId, setDeletingId] = useState(null);

  const confirmDeleteDriver = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(firestore, 'drivers', deletingId));
      setDeletingId(null);
    } catch (err) {
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
      <div className="drivers-overlay visible" onClick={onClose} />
      <div className="drivers-panel visible">
        <div className="drivers-panel-header">
          <div className="dp-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Car size={22} color="#22c55e" />
              <h3 style={{ margin: 0 }}>Registered Fleet Drivers</h3>
            </div>
            <span className="dp-count">{drivers.length} drivers registered</span>
          </div>
          <div className="dp-actions">
            {!isAdmin && (
              <button className="btn-admin-login" onClick={onOpenAdmin} title="Admin Login">
                <LogIn size={18} /> Admin
              </button>
            )}
            <button className="drivers-panel-close" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="drivers-panel-body">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <button className="add-driver-btn" onClick={onOpenDriverPortal} style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
              <Car size={18} /> Driver Companion Portal
            </button>
            {isAdmin && (
              <button className="add-driver-btn" onClick={onOpenAdmin} style={{ background: '#1e293b' }}>
                <UserPlus size={18} /> Fleet Admin
              </button>
            )}
          </div>

          <div className="drivers-list">
            {drivers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
                <p>No registered drivers found.</p>
              </div>
            ) : (
              drivers.map((d) => {
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
              <p>Are you sure you want to remove this driver from Vrinda Tours fleet?</p>
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
