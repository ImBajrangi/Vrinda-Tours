import { useState } from 'react';
import { 
  Zap, Star, Navigation, Phone, CheckCircle2, 
  MapPin, Clock, ShieldCheck, Compass, LogOut, Users, Bus, Calendar, Lock 
} from 'lucide-react';

export default function AgencyPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [isOpen, setIsOpen] = useState(isVerified);
  const [activeYatrasCount, setActiveYatrasCount] = useState(isVerified ? 3 : 1);
  const rating = partner?.rating || '4.9';

  const agencyType = partner?.metadata?.agencyType || partner?.type || '84 Kos Parikrama & Group Fleet';
  const fleetSize = partner?.metadata?.fleetSize || '5-10 Buses / Vans';
  const zone = partner?.metadata?.zone || partner?.zone || 'Braj Region Wide';

  const [inquiries, setInquiries] = useState([
    {
      id: 'yatra_1',
      groupLeader: 'Rameshwar Ji (Jaipur)',
      pilgrims: '14 Devotees',
      package: '84 Kos Complete Parikrama (7 Days)',
      dates: 'Next Ekadashi • 12–19 Nov',
      totalFare: '₹32,000',
      status: 'pending'
    },
    {
      id: 'yatra_2',
      groupLeader: 'Sunita Agarwal (Delhi)',
      pilgrims: '8 Devotees',
      package: 'Vrindavan 7 Main Mandir VIP Darshan',
      dates: 'This Weekend (Sat–Sun)',
      totalFare: '₹14,500',
      status: 'confirmed'
    }
  ]);

  const confirmInquiry = (id) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'confirmed' } : inq));
    setActiveYatrasCount(c => c + 1);
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
            <p>Our Braj admin operations team is verifying your travel agency credentials. Yatra packages &amp; fleet roster are active in preview mode.</p>
          </div>
        </div>
      ) : (
        <div className="ph-verification-banner verified">
          <div className="ph-verif-icon-box">
            <ShieldCheck size={16} />
          </div>
          <div className="ph-verif-content">
            <div className="ph-verif-title-row">
              <strong>Verified Yatra Agency Partner</strong>
              <span className="ph-verified-badge">✓ Active &amp; Locked</span>
            </div>
            <p>Your agency is certified for direct group parikramas with 0% commission cuts and direct devotee booking inquiries.</p>
          </div>
        </div>
      )}

      {/* Profile Bar */}
      <div className="ph-profile-card">
        <div className="ph-avatar-box">
          <img 
            src={partner?.photo_url || partner?.photo || `https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400`} 
            alt={partner?.name || 'Agency'} 
          />
          <span className="ph-avatar-badge">🚩</span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || 'Shri Braj 84 Kos Yatra Tours'}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}</span>
          </div>
          <div className="ph-details-sub">
            <span>{agencyType} • {fleetSize} • {zone}</span>
          </div>
        </div>
        <button className="ph-logout-action" onClick={onLogout} title="Sign Out">
          <LogOut size={16} />
        </button>
      </div>

      {/* Agency Status Quick Control */}
      <div className="ph-status-banner">
        <div className="ph-status-left">
          <span className={`ph-pulse-dot ${isOpen ? 'online' : 'offline'}`} />
          <span className="ph-status-text">
            {isOpen ? 'Agency Open for Devotee Group Inquiries' : 'Currently Offline (Not Taking Bookings)'}
          </span>
        </div>
        <button 
          className={`ph-toggle-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Close' : 'Go Open'}
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="ph-stats-grid">
        <div className="ph-stat-box">
          <span className="ph-stat-num">{activeYatrasCount}</span>
          <span className="ph-stat-label">Active Yatras</span>
        </div>
        <div className="ph-stat-box">
          <span className="ph-stat-num">46</span>
          <span className="ph-stat-label">Pilgrims Guided</span>
        </div>
        <div className="ph-stat-box">
          <span className="ph-stat-num">₹0</span>
          <span className="ph-stat-label">0% Platform Cut</span>
        </div>
      </div>

      {/* Live Inquiries List */}
      <div className="ph-section-header">
        <h5>Live Devotee Group Inquiries</h5>
        <span className="ph-badge-count">{inquiries.length} Active</span>
      </div>

      <div className="ph-cards-list">
        {inquiries.map(inq => (
          <div key={inq.id} className="ph-order-card">
            <div className="ph-order-header">
              <div className="ph-order-guest">
                <span className="ph-guest-name">{inq.groupLeader}</span>
                <span className="ph-order-slot"><Users size={12} /> {inq.pilgrims}</span>
              </div>
              <span className={`ph-status-tag ${inq.status}`}>{inq.status.toUpperCase()}</span>
            </div>

            <div className="ph-order-body">
              <div className="ph-party-size">
                <Compass size={14} />
                <span>{inq.package}</span>
              </div>
              <div className="ph-dates-line" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                <Calendar size={13} />
                <span>{inq.dates}</span>
              </div>
              <div className="ph-notes-line" style={{ fontSize: '13.5px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
                <span>Package Fare: {inq.totalFare}</span>
              </div>
            </div>

            <div className="ph-order-actions">
              {inq.status === 'pending' ? (
                <button 
                  className="ph-btn-accept"
                  onClick={() => confirmInquiry(inq.id)}
                >
                  Confirm Yatra Inquiry
                </button>
              ) : (
                <a 
                  href="tel:+919876543210" 
                  className="ph-btn-call"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Phone size={14} /> Call Group Leader
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
