import { useState, useEffect } from 'react';
import { 
  Building2, Star, Phone, MessageCircle, CheckCircle2, 
  Calendar, Users, Sparkles, LogOut, Bed, Navigation, Plus, Minus,
  Clock, ShieldCheck, Lock, Check, QrCode, RefreshCw
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { supabase, TABLES, safeRemoveChannel } from '../../config/supabase';

export default function HotelPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [shuttleSummoned, setShuttleSummoned] = useState(false);

  const hotelType = partner?.metadata?.hotelType || partner?.type || 'Ashram & Stay Partner';
  const roomCount = partner?.metadata?.roomCount || 'Inventory Ready';
  const zone = partner?.metadata?.zone || partner?.zone || 'Vrindavan Dham';
  const rating = partner?.rating || '5.0';

  const [rooms, setRooms] = useState({
    standard: { available: 4, total: 8 },
    deluxe: { available: 2, total: 4 },
    suite: { available: 1, total: 2 }
  });

  // Dynamic live bookings from Supabase (Zero hardcoded mock records)
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveBookings = async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.ROOM_BOOKINGS || 'room_bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && isMounted) {
          const mapped = data.map(b => ({
            id: b.id,
            guest: b.guest_name || b.guest || 'Pilgrim Devotee',
            phone: b.guest_phone || b.phone || '',
            dates: b.dates || b.check_in_date ? `${b.check_in_date || 'Today'} - ${b.nights || '2'} Nights` : 'Today - 1 Night',
            roomType: b.room_type || 'Standard Pilgrim Room',
            notes: b.special_requests || b.notes || '',
            status: b.status || 'pending',
            amount: b.amount ? (String(b.amount).startsWith('₹') ? b.amount : `₹${b.amount}`) : '₹2,400'
          }));
          setBookings(mapped);
        }
      } catch (err) {
        console.warn('[HotelPortalTab] Bookings fetch warning:', err);
      } finally {
        if (isMounted) setIsLoadingBookings(false);
      }
    };

    fetchLiveBookings();

    // Realtime Supabase Subscription
    const channelName = `hotel_bookings_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.ROOM_BOOKINGS || 'room_bookings' }, () => {
        fetchLiveBookings();
      })
      .subscribe();

    return () => {
      isMounted = false;
      safeRemoveChannel(channel);
    };
  }, [partner?.id]);

  const confirmBooking = async (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    try {
      await supabase.from(TABLES.ROOM_BOOKINGS || 'room_bookings').update({ status: 'confirmed' }).eq('id', id);
    } catch (e) {}
  };

  const checkInGuest = async (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'checked_in' } : b));
    try {
      await supabase.from(TABLES.ROOM_BOOKINGS || 'room_bookings').update({ status: 'checked_in' }).eq('id', id);
    } catch (e) {}
  };

  const checkOutGuest = async (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    try {
      await supabase.from(TABLES.ROOM_BOOKINGS || 'room_bookings').update({ status: 'completed' }).eq('id', id);
    } catch (e) {}
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
            <p>Our Braj admin team is verifying your property registration. You can adjust room inventory and manage live guest bookings.</p>
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
          <span className="ph-avatar-badge" title="Stay Partner">
            <Building2 size={11} color="#2563eb" />
          </span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || (isVerified ? 'Hotel & Stay Partner' : 'Ashram & Stay Desk')}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}</span>
          </div>
          <div className="ph-sub-line">
            <span>{hotelType} • {roomCount} • {zone}</span>
          </div>
        </div>
        <button className="ph-btn-logout" onClick={onLogout} title="Switch Partner Account / Sign Out">
          <LogOut size={12} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Quick Action Tools Bar */}
      <div className="ph-quick-tools-shelf">
        <button 
          type="button" 
          className="ph-tool-btn"
          onClick={handleSummonShuttle}
          title="Summon verified E-Rickshaw for temple transfer"
        >
          <Navigation size={12} color="#059669" />
          <span>{shuttleSummoned ? '✓ E-Rickshaw Dispatched' : 'Summon Temple Shuttle'}</span>
        </button>
        <button 
          type="button" 
          className="ph-tool-btn"
          onClick={() => openWhatsApp(partner?.phone || '+919876543211', `Jai Shri Radhe! Room reservation at ${partner?.name || 'Radha Krishna Dham'} is confirmed.`)}
          title="Send WhatsApp confirmation voucher"
        >
          <MessageCircle size={12} color="#25D366" />
          <span>Send Guest Voucher</span>
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
          {shuttleSummoned ? '✓ Dispatched' : 'Shuttle'}
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
          <span className="ph-stat-lbl">Pending Arrivals</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-val">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{rating}</span>
          </div>
          <span className="ph-stat-lbl">Guest Rating</span>
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
            <p>No Active Booking Requests</p>
            <span>Live room reservation requests from pilgrims on Vrinda Stay Map will appear here in real-time.</span>
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
              {bk.amount && <span><strong>{bk.amount}</strong></span>}
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
                  {bk.phone && (
                    <button className="ph-btn-action outline" onClick={() => openWhatsApp(bk.phone, `Jai Shri Radhe ${bk.guest}, confirming your room at ${partner?.name || 'Radha Krishna Dham'}.`)}>
                      <MessageCircle size={14} color="#25D366" /> WhatsApp
                    </button>
                  )}
                </>
              ) : bk.status === 'confirmed' ? (
                <>
                  <button className="ph-btn-action primary" onClick={() => checkInGuest(bk.id)}>
                    <CheckCircle2 size={14} /> Check In Guest
                  </button>
                  {bk.phone && (
                    <button className="ph-btn-action outline" onClick={() => window.open(`tel:${bk.phone}`)}>
                      <Phone size={14} /> Call Guest
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button className="ph-btn-action primary" onClick={() => checkOutGuest(bk.id)} style={{ background: '#059669' }}>
                    <Check size={14} /> Check Out &amp; Settle
                  </button>
                  <button className="ph-btn-action outline" style={{ pointerEvents: 'none', background: '#dcfce7', color: '#15803d' }}>
                    ✓ Guest in Room
                  </button>
                </>
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
          <div className="ph-stepper-cluster">
            <button 
              type="button"
              className="ph-stepper-btn" 
              onClick={() => adjustRoom('standard', -1)}
              disabled={rooms.standard.available <= 0}
              title="Decrease standard room inventory"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="ph-stepper-value">
              {rooms.standard.available}
            </span>
            <button 
              type="button"
              className="ph-stepper-btn" 
              onClick={() => adjustRoom('standard', 1)}
              disabled={rooms.standard.available >= rooms.standard.total}
              title="Increase standard room inventory"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Deluxe AC Room</span>
            <span className="ph-toggle-sub">{rooms.deluxe.available} of {rooms.deluxe.total} Vacant</span>
          </div>
          <div className="ph-stepper-cluster">
            <button 
              type="button"
              className="ph-stepper-btn" 
              onClick={() => adjustRoom('deluxe', -1)}
              disabled={rooms.deluxe.available <= 0}
              title="Decrease deluxe room inventory"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="ph-stepper-value">
              {rooms.deluxe.available}
            </span>
            <button 
              type="button"
              className="ph-stepper-btn" 
              onClick={() => adjustRoom('deluxe', 1)}
              disabled={rooms.deluxe.available >= rooms.deluxe.total}
              title="Increase deluxe room inventory"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="ph-toggle-row">
          <div className="ph-toggle-info">
            <span className="ph-toggle-title">Heritage Haveli Suite</span>
            <span className="ph-toggle-sub">{rooms.suite.available} of {rooms.suite.total} Vacant</span>
          </div>
          <div className="ph-stepper-cluster">
            <button 
              type="button"
              className="ph-stepper-btn" 
              onClick={() => adjustRoom('suite', -1)}
              disabled={rooms.suite.available <= 0}
              title="Decrease suite inventory"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="ph-stepper-value">
              {rooms.suite.available}
            </span>
            <button 
              type="button"
              className="ph-stepper-btn" 
              onClick={() => adjustRoom('suite', 1)}
              disabled={rooms.suite.available >= rooms.suite.total}
              title="Increase suite inventory"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
