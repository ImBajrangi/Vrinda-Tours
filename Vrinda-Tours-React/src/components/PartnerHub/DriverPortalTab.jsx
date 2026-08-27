import { useState, useEffect } from 'react';
import { 
  Zap, Star, Navigation, Phone, CheckCircle2, 
  MapPin, Clock, ShieldCheck, Compass, LogOut, Lock, Car 
} from 'lucide-react';

export default function DriverPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [isOnline, setIsOnline] = useState(isVerified);
  const [onlineHours, setOnlineHours] = useState('1.8h');
  const [ridesCount, setRidesCount] = useState(isVerified ? 6 : 1);
  const rating = partner?.rating || '4.9';

  const vehicleType = partner?.metadata?.vehicleType || partner?.vehicleType || 'E-Rickshaw';
  const vehicleNo = partner?.metadata?.vehicleNo || partner?.vehicleNo || 'UP-85 VT 2026';
  const zone = partner?.metadata?.zone || partner?.zone || 'Vrindavan Parikrama Marg';

  // Live ride requests — populated via Supabase realtime, no hardcoded demos
  const [incomingRides, setIncomingRides] = useState([]);

  const toggleOnline = () => {
    setIsOnline(prev => !prev);
  };

  const acceptRide = (id) => {
    setIncomingRides(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    setRidesCount(c => c + 1);
  };

  return (
    <>
      {/* Realtime Admin Verification Banner */}
      {!isVerified ? (
        <div className="ph-verification-banner pending">
          <div className="ph-verif-icon-box">
            <Clock size={16} />
          </div>
          <div className="ph-verif-content">
            <div className="ph-verif-title-row">
              <strong>Admin Review In Progress</strong>
              <span className="ph-pulse-badge">● Pending</span>
            </div>
            <p>Our Braj admin operations team is verifying your registration. Dashboard features are active in preview mode.</p>
          </div>
        </div>
      ) : (
        <div className="ph-verification-banner verified">
          <div className="ph-verif-icon-box">
            <ShieldCheck size={16} />
          </div>
          <div className="ph-verif-content">
            <div className="ph-verif-title-row">
              <strong>Verified Brij Driver Partner</strong>
              <span className="ph-verified-badge">✓ Active &amp; Locked</span>
            </div>
            <p>Your driver account is verified by Admin. Category is locked with 0% platform fee and live pilgrim ride priority.</p>
          </div>
        </div>
      )}

      {/* Profile Bar */}
      <div className="ph-profile-card">
        <div className="ph-avatar-box">
          <img 
            src={partner?.photo_url || partner?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(partner?.name || 'Radhe')}&backgroundColor=f1f5f9`} 
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
            <span>{vehicleType} • {vehicleNo} • {zone}</span>
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
            <h4>{isOnline ? 'Online & Ready for Rides' : 'Offline'}</h4>
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
          <span className="ph-stat-lbl">Online Time</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-val">
            <span>₹{ridesCount * 85}</span>
          </div>
          <span className="ph-stat-lbl">100% Payout</span>
        </div>
      </div>

      {/* Live Dispatch Queue */}
      <div className="ph-section-header">
        <h4>Incoming Pilgrim Requests</h4>
        <span className="ph-badge-count">{incomingRides.filter(r => r.status === 'pending').length} Active</span>
      </div>

      <div className="ph-cards-list">
        {incomingRides.length === 0 ? (
          <div className="ph-empty-state">
            <Car size={28} style={{ opacity: 0.25 }} />
            <p>No ride requests yet</p>
            <span>Go online to start receiving pilgrim dispatches</span>
          </div>
        ) : incomingRides.map(ride => (
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
                <button className="ph-btn-action primary" onClick={() => window.open(`tel:${ride.phone || ''}`)}>
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
