import { useState } from 'react';
import { X, Plus, Trash2, Camera, LogIn, User, Lock, ArrowRight, AlertCircle, UserPlus, Phone } from 'lucide-react';
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
  const [newEmail, setNewEmail] = useState('');
  const [newPhoto, setNewPhoto] = useState('');

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
        email: newEmail,
        photo: newPhoto,
        status: 'available',
        location: userPosition || { lat: 27.646, lng: 77.377 },
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setNewName(''); setNewPhone(''); setNewEmail(''); setNewPhoto('');
    } catch (err) {
      alert('Failed to add driver');
    }
  };

  const handleDeleteDriver = async (id) => {
    if (window.confirm('Delete this driver?')) {
      try {
        await deleteDoc(doc(firestore, 'drivers', id));
      } catch (err) {
        alert('Failed to delete driver');
      }
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
            <div style={{ width: '60px', height: '60px', background: '#212128', borderRadius: '18px', margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <LogIn size={24} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Admin Access</h3>
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
            <button type="submit" className="adm-btn-primary">Login</button>
            {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}
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
            <UserPlus size={20} />
            <h3 style={{ fontWeight: 800 }}>Fleet Management</h3>
          </div>
          <button className="adm-btn-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="adm-body">
          <button className="adm-btn-primary" style={{ marginBottom: '2rem' }} onClick={() => setShowAddForm(true)}>
            <Plus size={18} /> Register New Driver
          </button>
          <div className="adm-list">
            {drivers.map(d => (
              <div key={d.id} className="adm-driver-item">
                <div className="adm-avatar">
                  {d.photo ? <img src={d.photo} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : d.name[0].toUpperCase()}
                </div>
                <div className="adm-info">
                  <h4>{d.name}</h4>
                  <span>{d.phone}</span>
                </div>
                <button className="adm-btn-delete" onClick={() => handleDeleteDriver(d.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {showAddForm && (
          <>
            <div className="adm-overlay" style={{ zIndex: 11000 }} onClick={() => setShowAddForm(false)}></div>
            <div className="adm-card-centered" style={{ zIndex: 12000, maxWidth: '420px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800 }}>New Driver</h4>
                <button className="adm-btn-close" onClick={() => setShowAddForm(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleAddDriver} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="adm-photo-circle" onClick={() => document.getElementById('driver-photo-input').click()}>
                  <input id="driver-photo-input" type="file" accept="image/*" onChange={handlePhotoChange} hidden />
                  {newPhoto ? <img src={newPhoto} alt="Preview" /> : <Camera size={32} color="#94a3b8" />}
                </div>
                <div className="adm-form-group">
                  <label>Full Name *</label>
                  <div className="adm-input-wrapper">
                    <User size={18} />
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Radhe" required />
                  </div>
                </div>
                <div className="adm-form-group">
                  <label>Phone Number *</label>
                  <div className="adm-input-wrapper">
                    <Phone size={18} />
                    <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
                  </div>
                </div>
                <button type="submit" className="adm-btn-submit">Register Driver</button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
