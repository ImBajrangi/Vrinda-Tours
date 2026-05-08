import { useState, useMemo } from 'react';
import { X, UserPlus, Phone, Trash2, Camera, LogIn } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import './DriversPanel.css';

export default function DriversPanel({ drivers, onClose, onOpenAdmin }) {
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem('vt_admin') === 'true');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhoto, setNewPhoto] = useState('');

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Delete this driver?')) {
      try {
        await deleteDoc(doc(firestore, 'drivers', id));
      } catch (err) {
        alert('Failed to delete driver');
      }
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    const id = `driver_${Date.now()}`;
    try {
      await setDoc(doc(firestore, 'drivers', id), {
        name: newName,
        phone: newPhone,
        email: newEmail,
        photo: newPhoto,
        status: 'available',
        location: { lat: 27.646, lng: 77.377 },
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setNewName(''); setNewPhone(''); setNewEmail(''); setNewPhoto('');
    } catch (err) {
      alert('Failed to add driver');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className={`drivers-overlay ${drivers.length > 0 ? 'visible' : ''}`} onClick={onClose} />
      <div className={`drivers-panel ${drivers.length > 0 ? 'visible' : ''}`}>
        <div className="drivers-panel-header">
          <div className="dp-title">
            <h3>Nearby Drivers</h3>
            <span className="dp-count">{drivers.length} registered</span>
          </div>
          <div className="dp-actions">
            {!isAdmin && (
              <button className="btn-admin-login" onClick={onOpenAdmin} title="Admin Login">
                <LogIn size={18} />
              </button>
            )}
            <button className="drivers-panel-close" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        <div className="drivers-panel-body">
          {isAdmin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <button className="add-driver-btn" onClick={onOpenAdmin} style={{ background: '#212128' }}>
                <UserPlus size={18} /> Open Fleet Manager
              </button>
            </div>
          )}

          <div className="drivers-list">
            {drivers.map((d) => {
              const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={d.id} className="driver-item">
                  <div className="di-avatar">
                    {d.photo ? <img src={d.photo} alt={d.name} /> : initials}
                    <div className={`status-dot ${d.status || 'offline'}`} />
                  </div>
                  <div className="di-info">
                    <h4>{d.name}</h4>
                    <p>{d.status === 'available' ? 'Available now' : (d.status === 'busy' ? 'On a ride' : 'Offline')}</p>
                  </div>
                  <div className="di-actions">
                    <button className="btn-call" onClick={() => window.open(`tel:${d.phone}`)}>
                      <Phone size={16} />
                    </button>
                    {isAdmin && (
                      <button className="btn-delete" onClick={() => handleDeleteDriver(d.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
