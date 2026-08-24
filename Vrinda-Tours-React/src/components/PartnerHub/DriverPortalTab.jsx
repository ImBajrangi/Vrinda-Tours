import { useState, useEffect } from 'react';
import { 
  Zap, Star, Navigation, Phone, CheckCircle2, 
  MapPin, Clock, ShieldCheck, Compass, LogOut 
} from 'lucide-react';

export default function DriverPortalTab({ partner, onLogout }) {
  const [isOnline, setIsOnline] = useState(true);
  const [onlineHours, setOnlineHours] = useState('2.4h');
  const [ridesCount, setRidesCount] = useState(4);
  const [rating, setRating] = useState('4.9');

  // Simulated live ride requests for field preview
  const [incomingRides, setIncomingRides] = useState([
    {
      id: 'ride_1',
      passenger: 'Amit Sharma',
      pickup: 'Barsana Shri Radharani Mandir Gate 1',
      drop: 'Prem Sarovar Sacred Kund',
      distance: '1.2 km',
      eta: '3 mins',
      fare: '₹80',
      status: 'pending'
    },
    {
      id: 'ride_2',
      passenger: 'Meera Das',
      pickup: 'Uchagram Lalita Sakhi Mandir',
      drop: 'Brijwasin Dining',
      distance: '2.1 km',
      eta: '6 mins',
      fare: '₹120',
      status: 'pending'
    }
  ]);

  const toggleOnline = () => {
    setIsOnline(prev => !prev);
  };

  const acceptRide = (id) => {
    setIncomingRides(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    setRidesCount(c => c + 1);
  };

  return (
    <>
      {/* Profile Bar */}
      <div className="ph-profile-card">
        <div className="ph-avatar-box">
          <img 
            src={partner?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.name || 'Radhe'}&backgroundColor=f1f5f9`} 
            alt={partner?.name || 'Driver'} 
          />
          <span className="ph-avatar-badge">🛺</span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || 'Radhe Driver'}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}</span>
          </div>
          <div className="ph-sub-line">
            <span>{partner?.vehicleType || 'E-Rickshaw'} • {partner?.vehicleNo || 'UP-85 VT 2026'}</span>
          </div>
        </div>
        <button className="ph-btn-logout" onClick={onLogout} title="Sign Out">
          <LogOut size={15} />
        </button>
      </div>

      {/* Online Status Beacon */}
      <div className={`ph-status-hero ${isOnline ? '' : 'closed'}`}>
        <div className="ph-status-left">
          <div className="ph-status-icon-box">
            <Zap size={20} />
          </div>
          <div className="ph-status-text">
            <h4>{isOnline ? 'Online & Available' : 'Offline'}</h4>
            <span>{isOnline ? 'Broadcasting live GPS to nearby pilgrims' : 'Go online to receive ride dispatches'}</span>
          </div>
        </div>
        <button className="ph-btn-toggle" onClick={toggleOnline}>
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* 3 Metrics Grid */}
      <div className="ph-stats-grid">
        <div className="ph-stat-card">
          <span className="ph-stat-val">{ridesCount}</span>
          <span className="ph-stat-lbl">Rides Today</span>
        </div>
        <div className="ph-stat-card">
          <span className="ph-stat-val">{onlineHours}</span>
          <span className="ph-stat-lbl">Online</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-val">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{rating}</span>
          </div>
          <span className="ph-stat-lbl">Rating</span>
        </div>
      </div>

      {/* Live Dispatch Queue */}
      <div className="ph-section-header">
        <h4>Incoming Pilgrim Requests</h4>
        <span className="ph-badge-count">{incomingRides.filter(r => r.status === 'pending').length} Active</span>
      </div>

      <div className="ph-cards-list">
        {incomingRides.map(ride => (
          <div key={ride.id} className="ph-order-card">
            <div className="ph-order-top">
              <span className="ph-order-guest">{ride.passenger}</span>
              <span className={`ph-order-status ${ride.status === 'accepted' ? 'confirmed' : ''}`}>
                {ride.status === 'accepted' ? '● En Route' : '● New Request'}
              </span>
            </div>

            <div className="ph-order-meta">
              <span><MapPin size={12} /> {ride.pickup}</span>
            </div>
            <div className="ph-order-meta">
              <span><Navigation size={12} /> {ride.drop}</span>
              <span><Clock size={12} /> {ride.eta}</span>
              <span style={{ fontWeight: 800, color: '#09090b' }}>{ride.fare}</span>
            </div>

            <div className="ph-order-actions">
              {ride.status === 'accepted' ? (
                <button className="ph-btn-action primary" onClick={() => window.open(`tel:+919876543210`)}>
                  <Phone size={14} /> Call Passenger
                </button>
              ) : (
                <>
                  <button className="ph-btn-action primary" onClick={() => acceptRide(ride.id)}>
                    <CheckCircle2 size={14} /> Accept Ride
                  </button>
                  <button className="ph-btn-action outline" onClick={() => setIncomingRides(prev => prev.filter(r => r.id !== ride.id))}>
                    Decline
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
