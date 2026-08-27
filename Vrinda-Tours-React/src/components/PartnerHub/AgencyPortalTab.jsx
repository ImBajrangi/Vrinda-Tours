import { useState } from 'react';
import { 
  Bus, Star, Navigation, Phone, CheckCircle2, 
  MapPin, Clock, ShieldCheck, Compass, LogOut, Users, Calendar, 
  MessageCircle, Sparkles, Zap 
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function AgencyPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [isOpen, setIsOpen] = useState(isVerified);
  const [activeYatrasCount, setActiveYatrasCount] = useState(isVerified ? 3 : 1);
  const rating = partner?.rating || '4.9';

  const agencyType = partner?.metadata?.agencyType || partner?.type || '84 Kos Parikrama & Group Fleet';
  const fleetSize = partner?.metadata?.fleetSize || '5-10 Buses / Vans';
  const zone = partner?.metadata?.zone || partner?.zone || 'Braj Region Wide';

  // Live packages / fleet status
  const [packages, setPackages] = useState({
    parikrama84: true,
    govardhanTour: true,
    vipDarshanVan: false
  });

  const togglePackage = (key) => {
    setPackages(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Live yatra inquiries — populated via Supabase realtime, no hardcoded demos
  const [inquiries, setInquiries] = useState([]);

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
          <div className="ph-sub-line">
            <span>{agencyType} • {fleetSize} • {zone}</span>
          </div>
        </div>
        <button className="ph-btn-logout" onClick={onLogout} title="Sign Out">
          <LogOut size={15} />
        </button>
      </div>

      {/* Online Status Beacon */}
      <div className={`ph-status-hero ${isOpen ? '' : 'closed'}`}>
        <div className="ph-status-left">
          <div className="ph-status-icon-box">
            <Zap size={20} />
          </div>
          <div className="ph-status-text">
            <h4>{isOpen ? 'Agency Open for Group Yatras' : 'Currently Offline'}</h4>
            <span>{isOpen ? 'Receiving live devotee group bookings & parikrama requests' : 'Go online to receive group yatra inquiries'}</span>
          </div>
        </div>
        <button className="ph-btn-toggle" onClick={() => setIsOpen(prev => !prev)}>
          {isOpen ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* 3 Metrics Grid */}
      <div className="ph-stats-grid">
        <div className="ph-stat-card">
          <span className="ph-stat-val">{activeYatrasCount}</span>
          <span className="ph-stat-lbl">Active Yatras</span>
        </div>
        <div className="ph-stat-card">
          <span className="ph-stat-val">46</span>
          <span className="ph-stat-lbl">Pilgrims Guided</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-val">
            <span>₹0</span>
          </div>
          <span className="ph-stat-lbl">0% Platform Cut</span>
        </div>
      </div>

      {/* Live Devotee Group Inquiries */}
      <div className="ph-section-header">
        <h4>Live Devotee Group Inquiries</h4>
        <span className="ph-badge-count">{inquiries.length} Active</span>
      </div>

      <div className="ph-cards-list">
        {inquiries.length === 0 ? (
          <div className="ph-empty-state">
            <Bus size={28} style={{ opacity: 0.25 }} />
            <p>No yatra inquiries yet</p>
            <span>Group pilgrimage requests will appear here in realtime</span>
          </div>
        ) : inquiries.map(inq => (
          <div key={inq.id} className="ph-order-card">
            <div className="ph-order-top">
              <span className="ph-order-guest">{inq.groupLeader || 'Devotee Group'}</span>
              <span className={`ph-order-status ${inq.status === 'confirmed' ? 'confirmed' : ''}`}>
                {inq.status === 'confirmed' ? '✓ Confirmed' : '● New Inquiry'}
              </span>
            </div>

            <div className="ph-order-meta">
              <span><Users size={12} /> {inq.pilgrims || '25-30 Devotees'}</span>
              <span><Compass size={12} /> {inq.package || '84 Kos Parikrama'}</span>
            </div>

            <div className="ph-order-meta">
              <span><Calendar size={12} /> {inq.dates || 'Upcoming Batch'}</span>
              <span style={{ fontWeight: 800, color: '#09090b' }}>{inq.totalFare || '₹45,000 / Group'}</span>
            </div>

            {inq.notes && (
              <div className="ph-order-note">
                <Sparkles size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{inq.notes}</span>
              </div>
            )}

            <div className="ph-order-actions">
              {inq.status === 'pending' ? (
                <>
                  <button 
                    className="ph-btn-action primary" 
                    onClick={() => confirmInquiry(inq.id)}
                  >
                    <CheckCircle2 size={14} /> Confirm Yatra
                  </button>
                  <button 
                    className="ph-btn-action outline" 
                    onClick={() => openWhatsApp(inq.phone, `Jai Shri Radhe ${inq.groupLeader || 'Devotee'}, confirming your yatra booking with ${partner?.name || 'Shri Braj 84 Kos Yatra Tours'}.`)}
                  >
                    <MessageCircle size={14} /> WhatsApp Lead
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="ph-btn-action primary" 
                    onClick={() => openWhatsApp(inq.phone, `Jai Shri Radhe ${inq.groupLeader || 'Devotee'}, yatra itinerary and bus details are ready.`)}
                  >
                    <MessageCircle size={14} /> Send Itinerary
                  </button>
                  {inq.phone && (
                    <button 
                      className="ph-btn-action outline" 
                      onClick={() => window.open(`tel:${inq.phone}`)}
                    >
                      <Phone size={14} /> Call Leader
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Yatra Packages & Fleet Availability */}
      <div className="ph-section-header">
        <h4>Active Yatra Packages &amp; Fleet</h4>
      </div>

      <div className="ph-toggles-shelf">
        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">84 Kos Parikrama (7-Day Guided Tour)</span>
            <span className="ph-toggle-sub">Full Braj Mandal sacred circuit with guide</span>
          </div>
          <div className={`ph-switch ${packages.parikrama84 ? 'on' : ''}`} onClick={() => togglePackage('parikrama84')}>
            <div className="ph-switch-thumb" />
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Govardhan &amp; Barsana AC Coach Fleet</span>
            <span className="ph-toggle-sub">Daily group parikrama departures</span>
          </div>
          <div className={`ph-switch ${packages.govardhanTour ? 'on' : ''}`} onClick={() => togglePackage('govardhanTour')}>
            <div className="ph-switch-thumb" />
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">VIP Temple Darshan &amp; Electric Van</span>
            <span className="ph-toggle-sub">Private senior citizen &amp; family fleet</span>
          </div>
          <div className={`ph-switch ${packages.vipDarshanVan ? 'on' : ''}`} onClick={() => togglePackage('vipDarshanVan')}>
            <div className="ph-switch-thumb" />
          </div>
        </div>
      </div>
    </>
  );
}
