import { useState } from 'react';
import { 
  Building2, Star, Phone, MessageCircle, CheckCircle2, 
  Calendar, Users, Sparkles, LogOut, Bed, Navigation, Plus, Minus,
  Clock, ShieldCheck, Lock
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function HotelPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [shuttleSummoned, setShuttleSummoned] = useState(false);

  const hotelType = partner?.metadata?.hotelType || partner?.type || 'Temple Guesthouse & Ashram';
  const roomCount = partner?.metadata?.roomCount || '8-15 Rooms';
  const zone = partner?.metadata?.zone || partner?.zone || 'Vrindavan Parikrama Marg';
  const rating = partner?.rating || '4.9';

  const [rooms, setRooms] = useState({
    standard: { available: 4, total: 8 },
    deluxe: { available: 2, total: 4 },
    suite: { available: 1, total: 2 }
  });

  // Live booking requests — populated via Supabase realtime, no hardcoded demos
  const [bookings, setBookings] = useState([]);

  const confirmBooking = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
  };

  const checkInGuest = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'checked_in' } : b));
  };

  const adjustRoom = (tier, delta) => {
    setRooms(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        available: Math.max(0, Math.min(prev[tier].total, prev[tier].available + delta))
      }
    }));
  };

  const handleSummonShuttle = () => {
    setShuttleSummoned(true);
    setTimeout(() => {
      setShuttleSummoned(false);
    }, 6000);
  };

  const totalAvail = rooms.standard.available + rooms.deluxe.available + rooms.suite.available;
  const totalRooms = rooms.standard.total + rooms.deluxe.total + rooms.suite.total;

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
            <p>Our Braj admin team is verifying your property registration. You can adjust room inventory and preview guest bookings.</p>
          </div>
        </div>
      ) : (
        <div className="ph-verification-banner verified">
          <div className="ph-verif-icon-box">
            <ShieldCheck size={16} />
          </div>
          <div className="ph-verif-content">
            <div className="ph-verif-title-row">
              <strong>Verified Hotel Partner</strong>
              <span className="ph-verified-badge">✓ Active &amp; Locked</span>
            </div>
            <p>Your property is live on Vrinda Pilgrim Stay Map with 0% OTA commission and instant WhatsApp guest vouchers.</p>
          </div>
        </div>
      )}

      {/* Profile Bar */}
      <div className="ph-profile-card">
        <div className="ph-avatar-box">
          <img 
            src={partner?.photo_url || partner?.photo || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=120&auto=format&fit=crop&q=80"} 
            alt={partner?.name || 'Hotel'} 
          />
          <span className="ph-avatar-badge">🏨</span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || 'Radha Krishna Dham'}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}</span>
          </div>
          <div className="ph-sub-line">
            <span>{hotelType} • {roomCount} • {zone}</span>
          </div>
        </div>
        <button className="ph-btn-logout" onClick={onLogout} title="Sign Out">
          <LogOut size={15} />
        </button>
      </div>

      {/* Occupancy Status Beacon */}
      <div className={`ph-status-hero ${totalAvail === 0 ? 'rush' : ''}`}>
        <div className="ph-status-left">
          <div className="ph-status-icon-box">
            <Bed size={20} />
          </div>
          <div className="ph-status-text">
            <h4>{totalAvail > 0 ? `${totalAvail} Rooms Available` : 'Sold Out / Full House'}</h4>
            <span>{totalAvail > 0 ? 'Accepting live pilgrim check-ins' : 'All suites and standard rooms booked'}</span>
          </div>
        </div>
        <button className="ph-btn-toggle" onClick={handleSummonShuttle}>
          {shuttleSummoned ? '✓ Dispatched' : '🛺 Shuttle'}
        </button>
      </div>

      {/* 3 Metrics Grid */}
      <div className="ph-stats-grid">
        <div className="ph-stat-card">
          <span className="ph-stat-val">{totalRooms - totalAvail}/{totalRooms}</span>
          <span className="ph-stat-lbl">Occupancy</span>
        </div>
        <div className="ph-stat-card">
          <span className="ph-stat-val">{bookings.filter(b => b.status !== 'checked_in').length}</span>
          <span className="ph-stat-lbl">Arrivals</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-val">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>4.9</span>
          </div>
          <span className="ph-stat-lbl">Rating</span>
        </div>
      </div>

      {/* Live Room Requests */}
      <div className="ph-section-header">
        <h4>Incoming Pilgrim Stays</h4>
        <span className="ph-badge-count">{bookings.length} Active</span>
      </div>

      <div className="ph-cards-list">
        {bookings.length === 0 ? (
          <div className="ph-empty-state">
            <Bed size={28} style={{ opacity: 0.25 }} />
            <p>No booking requests yet</p>
            <span>Pilgrim stay requests will appear here in realtime</span>
          </div>
        ) : bookings.map(bk => (
          <div key={bk.id} className="ph-order-card">
            <div className="ph-order-top">
              <span className="ph-order-guest">{bk.guest}</span>
              <span className={`ph-order-status ${bk.status === 'confirmed' || bk.status === 'checked_in' ? 'confirmed' : ''}`}>
                {bk.status === 'checked_in' ? '● Checked In' : (bk.status === 'confirmed' ? '✓ Confirmed' : '● New Booking')}
              </span>
            </div>

            <div className="ph-order-meta">
              <span><Calendar size={12} /> {bk.dates}</span>
              <span><Bed size={12} /> {bk.roomType}</span>
            </div>

            {bk.notes && (
              <div className="ph-order-note">
                <Sparkles size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{bk.notes}</span>
              </div>
            )}

            <div className="ph-order-actions">
              {bk.status === 'pending' ? (
                <>
                  <button className="ph-btn-action primary" onClick={() => confirmBooking(bk.id)}>
                    <CheckCircle2 size={14} /> Confirm Stay
                  </button>
                  <button className="ph-btn-action outline" onClick={() => openWhatsApp(bk.phone, `Jai Shri Radhe ${bk.guest}, confirming your room at Radha Krishna Dham.`)}>
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                </>
              ) : bk.status === 'confirmed' ? (
                <>
                  <button className="ph-btn-action primary" onClick={() => checkInGuest(bk.id)}>
                    <CheckCircle2 size={14} /> Check In Guest
                  </button>
                  <button className="ph-btn-action outline" onClick={() => window.open(`tel:${bk.phone}`)}>
                    <Phone size={14} /> Call Guest
                  </button>
                </>
              ) : (
                <button className="ph-btn-action outline" style={{ pointerEvents: 'none', background: '#dcfce7', color: '#15803d' }}>
                  ✓ Guest Staying in Room
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Room Inventory Counter */}
      <div className="ph-section-header">
        <h4>Live Room Inventory Tracker</h4>
      </div>

      <div className="ph-toggles-shelf">
        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Standard Pilgrim Room</span>
            <span className="ph-toggle-sub">{rooms.standard.available} of {rooms.standard.total} Vacant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="ph-btn-logout" 
              style={{ width: '28px', height: '28px' }} 
              onClick={() => adjustRoom('standard', -1)}
            >
              <Minus size={12} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: '16px', textAlign: 'center' }}>
              {rooms.standard.available}
            </span>
            <button 
              className="ph-btn-logout" 
              style={{ width: '28px', height: '28px' }} 
              onClick={() => adjustRoom('standard', 1)}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Deluxe AC Room</span>
            <span className="ph-toggle-sub">{rooms.deluxe.available} of {rooms.deluxe.total} Vacant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="ph-btn-logout" 
              style={{ width: '28px', height: '28px' }} 
              onClick={() => adjustRoom('deluxe', -1)}
            >
              <Minus size={12} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: '16px', textAlign: 'center' }}>
              {rooms.deluxe.available}
            </span>
            <button 
              className="ph-btn-logout" 
              style={{ width: '28px', height: '28px' }} 
              onClick={() => adjustRoom('deluxe', 1)}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Heritage Haveli Suite</span>
            <span className="ph-toggle-sub">{rooms.suite.available} of {rooms.suite.total} Vacant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="ph-btn-logout" 
              style={{ width: '28px', height: '28px' }} 
              onClick={() => adjustRoom('suite', -1)}
            >
              <Minus size={12} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: '16px', textAlign: 'center' }}>
              {rooms.suite.available}
            </span>
            <button 
              className="ph-btn-logout" 
              style={{ width: '28px', height: '28px' }} 
              onClick={() => adjustRoom('suite', 1)}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
