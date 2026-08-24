import { useState } from 'react';
import { 
  Building2, Star, Phone, MessageCircle, CheckCircle2, 
  Calendar, Users, Sparkles, LogOut, Bed, Navigation, Plus, Minus 
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';

export default function HotelPortalTab({ partner, onLogout }) {
  const [shuttleSummoned, setShuttleSummoned] = useState(false);
  const [rooms, setRooms] = useState({
    standard: { available: 4, total: 8 },
    deluxe: { available: 2, total: 4 },
    suite: { available: 1, total: 2 }
  });

  const [bookings, setBookings] = useState([
    {
      id: 'bk_1',
      guest: 'Sunil Verma & Family',
      phone: '+919876543210',
      dates: 'Aug 25 - Aug 27 (2 Nights)',
      roomType: 'Deluxe AC Room',
      guests: '3 Pilgrims',
      notes: 'Ground Floor Preferred • Senior Citizens',
      status: 'pending'
    },
    {
      id: 'bk_2',
      guest: 'Ananya Deshmukh',
      phone: '+919876543211',
      dates: 'Aug 26 - Aug 28 (2 Nights)',
      roomType: 'Heritage Suite',
      guests: '2 Pilgrims',
      notes: 'Early Check-In at 10 AM',
      status: 'confirmed'
    }
  ]);

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
      alert('🛺 E-Rickshaw shuttle dispatched to Radha Krishna Dham front porch! ETA: 3 mins.');
    }, 400);
  };

  const totalAvail = rooms.standard.available + rooms.deluxe.available + rooms.suite.available;
  const totalRooms = rooms.standard.total + rooms.deluxe.total + rooms.suite.total;

  return (
    <>
      {/* Profile Bar */}
      <div className="ph-profile-card">
        <div className="ph-avatar-box">
          <img 
            src={partner?.photo || "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=120&auto=format&fit=crop&q=80"} 
            alt={partner?.name || 'Hotel'} 
          />
          <span className="ph-avatar-badge">🏨</span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || 'Radha Krishna Dham'}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> 4.9</span>
          </div>
          <div className="ph-sub-line">
            <span>Temple Guesthouse & Ashram • Near Barsana Mandir</span>
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
        {bookings.map(bk => (
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
