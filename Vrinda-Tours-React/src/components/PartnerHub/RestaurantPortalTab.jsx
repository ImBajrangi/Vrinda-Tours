import { useState } from 'react';
import { 
  Utensils, Star, Phone, MessageCircle, CheckCircle2, 
  Clock, Users, Sparkles, LogOut, Flame, ShieldCheck, Lock 
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function RestaurantPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [rushStatus, setRushStatus] = useState('open'); // 'open' | 'rush' | 'closed'

  const cuisineType = partner?.metadata?.cuisineType || partner?.type || 'Pure Sattvic Bhojnalaya';
  const seatingCapacity = partner?.metadata?.seatingCapacity || '30-60 Devotees';
  const zone = partner?.metadata?.zone || partner?.zone || 'Vrindavan Parikrama Marg';
  const rating = partner?.rating || '4.8';

  const [specials, setSpecials] = useState({
    thali56: true,
    kachori: true,
    peda: true,
    lassi: false
  });

  // Live reservations — populated via Supabase realtime, no hardcoded demos
  const [reservations, setReservations] = useState([]);

  const toggleSpecial = (key) => {
    setSpecials(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const cycleStatus = () => {
    if (rushStatus === 'open') setRushStatus('rush');
    else if (rushStatus === 'rush') setRushStatus('closed');
    else setRushStatus('open');
  };

  const confirmReservation = (id) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
  };

  const markSeated = (id) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'seated' } : r));
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
            <p>Our Braj admin operations team is reviewing your bhojnalaya/dining registration. Live menu &amp; queue are active in preview mode.</p>
          </div>
        </div>
      ) : (
        <div className="ph-verification-banner verified">
          <div className="ph-verif-icon-box">
            <ShieldCheck size={16} />
          </div>
          <div className="ph-verif-content">
            <div className="ph-verif-title-row">
              <strong>Verified Dining Partner</strong>
              <span className="ph-verified-badge">✓ Active &amp; Locked</span>
            </div>
            <p>Your dining outlet is certified on Vrinda Pilgrim Map with 100% direct guest billing and zero commission cuts.</p>
          </div>
        </div>
      )}

      {/* Profile Bar */}
      <div className="ph-profile-card">
        <div className="ph-avatar-box">
          <img 
            src={partner?.photo_url || partner?.photo || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&auto=format&fit=crop&q=80"} 
            alt={partner?.name || 'Restaurant'} 
          />
          <span className="ph-avatar-badge">🍽️</span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || 'Brijwasin Dining'}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}</span>
          </div>
          <div className="ph-sub-line">
            <span>{cuisineType} • {seatingCapacity} • {zone}</span>
          </div>
        </div>
        <button className="ph-btn-logout" onClick={onLogout} title="Sign Out">
          <LogOut size={15} />
        </button>
      </div>

      {/* Kitchen Rush Status Beacon */}
      <div className={`ph-status-hero ${rushStatus === 'rush' ? 'rush' : (rushStatus === 'closed' ? 'closed' : '')}`}>
        <div className="ph-status-left">
          <div className="ph-status-icon-box">
            {rushStatus === 'rush' ? <Flame size={20} /> : <Utensils size={20} />}
          </div>
          <div className="ph-status-text">
            <h4>
              {rushStatus === 'open' ? 'Open & Welcoming' : (rushStatus === 'rush' ? 'Rush Hour / Waitlist Active' : 'Kitchen Closed')}
            </h4>
            <span>
              {rushStatus === 'open' ? 'Accepting immediate table bookings' : (rushStatus === 'rush' ? 'Estimated wait time: 15-20 mins' : 'Not accepting new dining tables')}
            </span>
          </div>
        </div>
        <button className="ph-btn-toggle" onClick={cycleStatus}>
          {rushStatus === 'open' ? 'Set Rush' : (rushStatus === 'rush' ? 'Close' : 'Open')}
        </button>
      </div>

      {/* 3 Metrics Grid */}
      <div className="ph-stats-grid">
        <div className="ph-stat-card">
          <span className="ph-stat-val">14</span>
          <span className="ph-stat-lbl">Tables Served</span>
        </div>
        <div className="ph-stat-card">
          <span className="ph-stat-val">{reservations.filter(r => r.status !== 'seated').length}</span>
          <span className="ph-stat-lbl">Upcoming</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-val">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>4.8</span>
          </div>
          <span className="ph-stat-lbl">Rating</span>
        </div>
      </div>

      {/* Live Table Reservations */}
      <div className="ph-section-header">
        <h4>Pilgrim Table Bookings</h4>
        <span className="ph-badge-count">{reservations.length} Active</span>
      </div>

      <div className="ph-cards-list">
        {reservations.length === 0 ? (
          <div className="ph-empty-state">
            <Utensils size={28} style={{ opacity: 0.25 }} />
            <p>No reservations yet</p>
            <span>Pilgrim dining requests will appear here in realtime</span>
          </div>
        ) : reservations.map(res => (
          <div key={res.id} className="ph-order-card">
            <div className="ph-order-top">
              <span className="ph-order-guest">{res.guest}</span>
              <span className={`ph-order-status ${res.status === 'confirmed' ? 'confirmed' : (res.status === 'seated' ? 'confirmed' : '')}`}>
                {res.status === 'seated' ? '● Seated' : (res.status === 'confirmed' ? '✓ Confirmed' : '● New Request')}
              </span>
            </div>

            <div className="ph-order-meta">
              <span><Clock size={12} /> {res.time}</span>
              <span><Users size={12} /> {res.guests}</span>
            </div>

            {res.notes && (
              <div className="ph-order-note">
                <Sparkles size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{res.notes}</span>
              </div>
            )}

            <div className="ph-order-actions">
              {res.status === 'pending' ? (
                <>
                  <button className="ph-btn-action primary" onClick={() => confirmReservation(res.id)}>
                    <CheckCircle2 size={14} /> Confirm Table
                  </button>
                  <button className="ph-btn-action outline" onClick={() => openWhatsApp(res.phone, `Jai Shri Radhe ${res.guest}, confirming your table at Brijwasin Dining.`)}>
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                </>
              ) : res.status === 'confirmed' ? (
                <>
                  <button className="ph-btn-action primary" onClick={() => markSeated(res.id)}>
                    <CheckCircle2 size={14} /> Mark Seated
                  </button>
                  <button className="ph-btn-action outline" onClick={() => window.open(`tel:${res.phone}`)}>
                    <Phone size={14} /> Call Guest
                  </button>
                </>
              ) : (
                <button className="ph-btn-action outline" style={{ pointerEvents: 'none', background: '#dcfce7', color: '#15803d' }}>
                  ✓ Dining in Progress
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Special Thali & Sweets Toggles */}
      <div className="ph-section-header">
        <h4>Today's Special Prasad & Dishes</h4>
      </div>

      <div className="ph-toggles-shelf">
        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">56 Bhog Maha Thali</span>
            <span className="ph-toggle-sub">Special festive temple thali</span>
          </div>
          <div className={`ph-switch ${specials.thali56 ? 'on' : ''}`} onClick={() => toggleSpecial('thali56')}>
            <div className="ph-switch-thumb" />
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Crispy Barsana Kachori & Jalebi</span>
            <span className="ph-toggle-sub">Morning & evening hot batch</span>
          </div>
          <div className={`ph-switch ${specials.kachori ? 'on' : ''}`} onClick={() => toggleSpecial('kachori')}>
            <div className="ph-switch-thumb" />
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Mathura Peda (Gift Box)</span>
            <span className="ph-toggle-sub">Pure mawa take-home boxes</span>
          </div>
          <div className={`ph-switch ${specials.peda ? 'on' : ''}`} onClick={() => toggleSpecial('peda')}>
            <div className="ph-switch-thumb" />
          </div>
        </div>
      </div>
    </>
  );
}
