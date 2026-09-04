import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Utensils, Star, Phone, MessageCircle, CheckCircle2, 
  Clock, Users, Sparkles, LogOut, Flame, ShieldCheck, Lock,
  Plus, X, AlertCircle, QrCode, Check, RefreshCw
} from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsapp';
import { supabase, TABLES, safeRemoveChannel } from '../../config/supabase';

export default function RestaurantPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [rushStatus, setRushStatus] = useState('open'); // 'open' | 'rush' | 'closed'
  const [tablesServed, setTablesServed] = useState(partner?.tablesServed || 0);
  const [todayRevenue, setTodayRevenue] = useState(partner?.todayRevenue || 0);

  const cuisineType = partner?.metadata?.cuisineType || partner?.type || 'Sattvic Prasadam & Dining';
  const seatingCapacity = partner?.metadata?.seatingCapacity || 'Dining Tables Ready';
  const zone = partner?.metadata?.zone || partner?.zone || 'Vrindavan Dham';
  const rating = partner?.rating || '5.0';

  // Live specials list with dynamic add support
  const [menuItems, setMenuItems] = useState([
    { id: 'thali56', name: '56 Bhog Maha Thali', price: '₹350', sub: 'Special festive temple thali (Zero Onion/Garlic)', active: true },
    { id: 'kachori', name: 'Crispy Barsana Kachori & Jalebi', price: '₹80', sub: 'Morning & evening fresh hot batch with aloo jhol', active: true },
    { id: 'peda', name: 'Mathura Peda (500g Gift Box)', price: '₹240', sub: 'Pure roasted mawa take-home prasad boxes', active: true },
    { id: 'lassi', name: 'Kesar Badam Kulhad Lassi', price: '₹90', sub: 'Thick malai topped earthen cup lassi', active: true }
  ]);

  // Modal / popup states
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('');
  const [newDishSub, setNewDishSub] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Dynamic live reservations from Supabase (Zero hardcoded mock items)
  const [reservations, setReservations] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveReservations = async () => {
      try {
        const { data, error } = await supabase
          .from(TABLES.TABLE_RESERVATIONS || 'table_reservations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && isMounted) {
          const mapped = data.map(r => ({
            id: r.id,
            guest: r.guest_name || r.guest || 'Pilgrim Devotee',
            phone: r.guest_phone || r.phone || '',
            time: r.reservation_time || r.time || 'Today',
            guests: r.guests ? `${r.guests} Devotees` : '4 Devotees',
            notes: r.special_notes || r.notes || '',
            status: r.status || 'pending',
            billEst: r.estimated_bill ? `₹${r.estimated_bill}` : '₹1,200',
            billNumeric: r.estimated_bill || 1200
          }));
          setReservations(mapped);
        }
      } catch (err) {
        console.warn('[RestaurantPortalTab] Reservations fetch warning:', err);
      } finally {
        if (isMounted) setIsLoadingReservations(false);
      }
    };

    fetchLiveReservations();

    // Realtime Supabase Subscription
    const channelName = `dining_reservations_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLES.TABLE_RESERVATIONS || 'table_reservations' }, () => {
        fetchLiveReservations();
      })
      .subscribe();

    return () => {
      isMounted = false;
      safeRemoveChannel(channel);
    };
  }, [partner?.id]);

  const toggleSpecial = (id) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, active: !item.active } : item));
  };

  const cycleStatus = () => {
    if (rushStatus === 'open') setRushStatus('rush');
    else if (rushStatus === 'rush') setRushStatus('closed');
    else setRushStatus('open');
  };

  const confirmReservation = async (id) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
    try {
      await supabase.from(TABLES.TABLE_RESERVATIONS || 'table_reservations').update({ status: 'confirmed' }).eq('id', id);
    } catch (e) {}
  };

  const markSeated = async (id) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'seated' } : r));
    try {
      await supabase.from(TABLES.TABLE_RESERVATIONS || 'table_reservations').update({ status: 'seated' }).eq('id', id);
    } catch (e) {}
  };

  const completeReservation = async (id, billAmount = 700) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    setTablesServed(prev => prev + 1);
    setTodayRevenue(prev => prev + billAmount);
    try {
      await supabase.from(TABLES.TABLE_RESERVATIONS || 'table_reservations').update({ status: 'completed' }).eq('id', id);
    } catch (e) {}
  };

  const cancelReservation = async (id) => {
    setReservations(prev => prev.filter(r => r.id !== id));
    try {
      await supabase.from(TABLES.TABLE_RESERVATIONS || 'table_reservations').update({ status: 'cancelled' }).eq('id', id);
    } catch (e) {}
  };

  const handleAddDishSubmit = (e) => {
    e.preventDefault();
    if (!newDishName.trim()) return;
    const item = {
      id: `custom_dish_${Date.now()}`,
      name: newDishName.trim(),
      price: newDishPrice.trim() ? (newDishPrice.startsWith('₹') ? newDishPrice.trim() : `₹${newDishPrice.trim()}`) : '₹150',
      sub: newDishSub.trim() || 'Freshly prepared temple prasadam dish',
      active: true
    };
    setMenuItems(prev => [item, ...prev]);
    setNewDishName('');
    setNewDishPrice('');
    setNewDishSub('');
    setShowAddDishModal(false);
  };

  const activeReservationsCount = reservations.filter(r => r.status !== 'completed').length;

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
          <span className="ph-avatar-badge" title="Dining Partner">
            <Utensils size={11} color="#ea580c" />
          </span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || (isVerified ? 'Dining Partner' : 'Sattvic Dining Desk')}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}</span>
          </div>
          <div className="ph-sub-line">
            <span>{cuisineType} • {seatingCapacity} • {zone}</span>
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
          onClick={() => setShowAddDishModal(true)}
          title="Add a new Prasad or dish to daily specials"
        >
          <Plus size={12} />
          <span>Add Special Dish</span>
        </button>
        <button 
          type="button" 
          className="ph-tool-btn"
          onClick={() => setShowQrModal(true)}
          title="View direct UPI Payment Stand for dining tables"
        >
          <QrCode size={12} />
          <span>QR Stand</span>
        </button>
        <button 
          type="button" 
          className="ph-tool-btn"
          onClick={() => openWhatsApp(partner?.phone || '+919876543201', `Jai Shri Radhe! Today’s Special Prasad Menu is ready at ${partner?.name || 'Brijwasin Dining'}. Welcome devotees.`)}
          title="Broadcast daily menu on WhatsApp"
        >
          <MessageCircle size={12} color="#25D366" />
          <span>WhatsApp Broadcast</span>
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

      {/* 4 Metrics Grid */}
      <div className="ph-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="ph-stat-card">
          <span className="ph-stat-val">{tablesServed}</span>
          <span className="ph-stat-lbl">Tables Served</span>
        </div>
        <div className="ph-stat-card">
          <span className="ph-stat-val">{activeReservationsCount}</span>
          <span className="ph-stat-lbl">Live Queue</span>
        </div>
        <div className="ph-stat-card">
          <span className="ph-stat-val">₹{todayRevenue.toLocaleString()}</span>
          <span className="ph-stat-lbl">Today's Gross</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-val">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>{rating}</span>
          </div>
          <span className="ph-stat-lbl">Rating</span>
        </div>
      </div>

      {/* Live Table Reservations */}
      <div className="ph-section-header">
        <h4>Pilgrim Table Bookings &amp; Queue</h4>
        <span className="ph-badge-count">{activeReservationsCount} Active</span>
      </div>

      <div className="ph-cards-list">
        {reservations.length === 0 ? (
          <div className="ph-empty-state">
            <Utensils size={28} style={{ opacity: 0.25 }} />
            <p>No Active Table Reservations</p>
            <span>Devotee dining requests and prasad pre-orders from Vrinda Dining Guide will appear here in real-time.</span>
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
              {res.billEst && <span><strong>{res.billEst}</strong></span>}
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
                  {res.phone && (
                    <button className="ph-btn-action outline" onClick={() => openWhatsApp(res.phone, `Jai Shri Radhe ${res.guest}, your table reservation at ${partner?.name || 'Brijwasin Dining'} is confirmed.`)}>
                      <MessageCircle size={14} color="#25D366" /> WhatsApp
                    </button>
                  )}
                  <button className="ph-btn-action outline" onClick={() => cancelReservation(res.id)} style={{ color: '#ef4444' }}>
                    Decline
                  </button>
                </>
              ) : res.status === 'confirmed' ? (
                <>
                  <button className="ph-btn-action primary" onClick={() => markSeated(res.id)}>
                    <Utensils size={14} /> Mark Seated
                  </button>
                  {res.phone && (
                    <button className="ph-btn-action outline" onClick={() => window.open(`tel:${res.phone}`)}>
                      <Phone size={14} /> Call Guest
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button className="ph-btn-action primary" onClick={() => completeReservation(res.id, res.billNumeric || 850)} style={{ background: '#059669' }}>
                    <Check size={14} /> Complete &amp; Bill
                  </button>
                  <button className="ph-btn-action outline" style={{ pointerEvents: 'none', background: '#ecfdf5', color: '#047857' }}>
                    ● Dining in Progress
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live Special Thali & Sweets Toggles */}
      <div className="ph-section-header" style={{ marginTop: '14px' }}>
        <h4>Today's Special Prasad &amp; Dishes ({menuItems.filter(m => m.active).length} Active)</h4>
        <button 
          type="button" 
          onClick={() => setShowAddDishModal(true)}
          style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
        >
          + Add Dish
        </button>
      </div>

      <div className="ph-toggles-shelf">
        {menuItems.map((item) => (
          <div key={item.id} className="ph-toggle-row">
            <div className="ph-toggle-info">
              <span className="ph-toggle-title">
                {item.name} <strong style={{ color: '#ea580c', marginLeft: '4px', fontSize: '0.75rem' }}>{item.price}</strong>
              </span>
              <span className="ph-toggle-sub">{item.sub}</span>
            </div>
            <div className={`ph-switch ${item.active ? 'on' : ''}`} onClick={() => toggleSpecial(item.id)}>
              <div className="ph-switch-thumb" />
            </div>
          </div>
        ))}
      </div>

      {/* Add Dish Modal Dialog rendered cleanly to body */}
      {showAddDishModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="ph-sub-modal-backdrop" 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => setShowAddDishModal(false)}
        >
          <div 
            className="ph-sub-modal-card" 
            style={{ 
              width: '100%', 
              maxWidth: '380px', 
              padding: '22px', 
              borderRadius: '22px', 
              background: '#ffffff',
              boxShadow: '0 24px 55px -10px rgba(0, 0, 0, 0.35)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'phModalPop 0.28s cubic-bezier(0.34, 1.45, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <Utensils size={17} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Add Special Prasad Dish</h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Live on devotee dining menu</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddDishModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '999px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleAddDishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px', margin: 0 }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Dish Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Malpua with Rabri" 
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  required
                  autoFocus
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', color: '#0f172a' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Price (₹)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 150" 
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', color: '#0f172a' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pure desi ghee fresh preparation" 
                  value={newDishSub}
                  onChange={(e) => setNewDishSub(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', color: '#0f172a' }}
                />
              </div>
              <button 
                type="submit" 
                style={{ 
                  marginTop: '4px', 
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '12px', 
                  fontWeight: 800, 
                  fontSize: '0.88rem', 
                  cursor: 'pointer',
                  boxShadow: '0 8px 18px -4px rgba(234, 88, 12, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>+ Add to Live Menu</span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* QR Code Stand Modal rendered cleanly to body */}
      {showQrModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="ph-sub-modal-backdrop" 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div 
            className="ph-sub-modal-card" 
            style={{ 
              width: '100%', 
              maxWidth: '350px', 
              padding: '22px', 
              borderRadius: '24px', 
              background: '#ffffff', 
              textAlign: 'center',
              boxShadow: '0 24px 55px -10px rgba(0, 0, 0, 0.35)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              animation: 'phModalPop 0.28s cubic-bezier(0.34, 1.45, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                  <QrCode size={17} />
                </div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>Table Direct UPI Stand</h4>
              </div>
              <button 
                type="button" 
                onClick={() => setShowQrModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '999px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 6px', lineHeight: 1.45 }}>
              Pilgrims scan to pay 100% directly to your restaurant bank account with 0% platform fee.
            </p>
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '14px', display: 'inline-block' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${encodeURIComponent(partner?.metadata?.upiId || 'brijwasin.dining@upi')}%26pn=${encodeURIComponent(partner?.name || 'Brijwasin Dining')}%26cu=INR`} 
                alt="Direct UPI QR" 
                style={{ width: '160px', height: '160px', display: 'block', borderRadius: '8px' }}
              />
            </div>
            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', padding: '8px 14px', width: '100%', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '0.7rem', color: '#9a3412', fontWeight: 600, display: 'block' }}>UPI ID</span>
              <strong style={{ fontSize: '0.82rem', color: '#ea580c', wordBreak: 'break-all' }}>
                {partner?.metadata?.upiId || 'brijwasin.dining@upi'}
              </strong>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
