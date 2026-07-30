import { useState } from 'react';
import { X, Plus, Trash2, Camera, LogIn, User, Lock, UserPlus, Phone, Car, ShieldAlert } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import './AdminPanel.css';

export default function AdminPanel({ drivers, onClose, userPosition }) {
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('vt_admin') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('E-Rickshaw');
  const [newVehicleNo, setNewVehicleNo] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'vrinda2026') {
      setIsLoggedIn(true);
      sessionStorage.setItem('vt_admin', 'true');
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    const id = `driver_${Date.now()}`;
    try {
      await setDoc(doc(firestore, 'drivers', id), {
        name: newName,
        phone: newPhone,
        vehicleType: newVehicleType,
        vehicleNo: newVehicleNo || 'UP-85 VT 2026',
        rating: '4.9',
        photo: newPhoto,
        status: 'available',
        location: userPosition || { lat: 27.646, lng: 77.377 },
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setNewName(''); setNewPhone(''); setNewVehicleNo(''); setNewPhoto('');
    } catch (err) {
      alert('Failed to register driver');
    }
  };

  const confirmDeleteDriver = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(firestore, 'drivers', deletingId));
      setDeletingId(null);
    } catch (err) {
      alert('Failed to delete driver');
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

  if (!isLoggedIn) {
    return (
      <>
        <div className="adm-overlay" onClick={onClose}></div>
        <div className="adm-card-centered">
          <button className="adm-btn-close" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }} onClick={onClose}><X size={20} /></button>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '60px', height: '60px', background: '#212128', borderRadius: '18px', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              <LogIn size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>Fleet Admin Access</h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Vrinda Tours Control Panel</span>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="adm-form-group">
              <label>Username</label>
              <div className="adm-input-wrapper">
                <User size={18} />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required />
              </div>
            </div>
            <div className="adm-form-group">
              <label>Password</label>
              <div className="adm-input-wrapper">
                <Lock size={18} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" className="adm-btn-primary">Login to Fleet Manager</button>
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>{error}</p>}
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="adm-overlay" onClick={onClose}></div>
      <div className="adm-panel-centered">
        <div className="adm-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserPlus size={20} color="#22c55e" />
            <h3 style={{ fontWeight: 800, margin: 0 }}>Fleet Management</h3>
          </div>
          <button className="adm-btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="adm-body">
          <button className="adm-btn-primary" style={{ marginBottom: '1.5rem' }} onClick={() => setShowAddForm(true)}>
            <Plus size={18} /> Register New Driver & Vehicle
          </button>
          <div className="adm-list">
            {drivers.map(d => (
              <div key={d.id} className="adm-driver-item">
                <div className="adm-avatar">
                  {d.photo ? <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : d.name[0].toUpperCase()}
                </div>
                <div className="adm-info">
                  <h4>{d.name}</h4>
                  <span>{d.vehicleType || 'E-Rickshaw'} • {d.phone}</span>
                </div>
                <button className="adm-btn-delete" onClick={() => setDeletingId(d.id)} title="Delete Driver">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {showAddForm && (
          <>
            <div className="adm-overlay" style={{ zIndex: 11000 }} onClick={() => setShowAddForm(false)}></div>
            <div className="adm-card-centered" style={{ zIndex: 12000, maxWidth: '440px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>Register Fleet Partner</h4>
                <button className="adm-btn-close" onClick={() => setShowAddForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleAddDriver} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div className="adm-photo-circle" onClick={() => document.getElementById('driver-photo-input').click()}>
                  <input id="driver-photo-input" type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                  {newPhoto ? <img src={newPhoto} alt="Preview" /> : <Camera size={28} color="#94a3b8" />}
                </div>

                <div className="adm-form-group">
                  <label>Full Name *</label>
                  <div className="adm-input-wrapper">
                    <User size={18} />
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Radhe Shyam" required />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label>Mobile Phone Number *</label>
                  <div className="adm-input-wrapper">
                    <Phone size={18} />
                    <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+91 98765 43210" required />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label>Vehicle Type *</label>
                  <div className="adm-input-wrapper">
                    <Car size={18} />
                    <select 
                      value={newVehicleType} 
                      onChange={e => setNewVehicleType(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                    >
                      <option value="E-Rickshaw" style={{ background: '#1e293b' }}>🛺 E-Rickshaw</option>
                      <option value="Auto" style={{ background: '#1e293b' }}>🛺 Auto</option>
                      <option value="Taxi" style={{ background: '#1e293b' }}>🚗 Taxi / Cab</option>
                      <option value="Bike" style={{ background: '#1e293b' }}>🛵 Bike Taxi</option>
                      <option value="Bus" style={{ background: '#1e293b' }}>🚌 Pilgrim Bus</option>
                    </select>
                  </div>
                </div>

                <div className="adm-form-group">
                  <label>Vehicle Number</label>
                  <div className="adm-input-wrapper">
                    <Car size={18} />
                    <input type="text" value={newVehicleNo} onChange={e => setNewVehicleNo(e.target.value)} placeholder="UP-85 AB 1234" />
                  </div>
                </div>

                <button type="submit" className="adm-btn-submit">Register Driver Partner</button>
              </form>
            </div>
          </>
        )}

        {/* Custom Confirmation Modal */}
        {deletingId && (
          <div className="adm-overlay" style={{ zIndex: 13000 }} onClick={() => setDeletingId(null)}>
            <div className="adm-card-centered" style={{ zIndex: 14000, maxWidth: '320px', textAlign: 'center' }}>
              <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>Delete Driver?</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.25rem' }}>This driver will be removed from fleet records.</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="adm-btn-close" style={{ flex: 1, borderRadius: '10px', height: '40px', width: 'auto', background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setDeletingId(null)}>Cancel</button>
                <button className="adm-btn-submit" style={{ flex: 1, background: '#ef4444', height: '40px', padding: 0 }} onClick={confirmDeleteDriver}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
