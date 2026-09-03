import { useState, useEffect } from 'react';
import { 
  Zap, Star, Navigation, Phone, CheckCircle2, 
  MapPin, Clock, ShieldCheck, Compass, LogOut, Lock, Car,
  Wallet, ArrowUpRight, Copy, Check, AlertCircle, AlertTriangle,
  UploadCloud, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  ADMIN_PAYMENT_CONFIG, 
  submitDriverSettlement, 
  subscribeToDriverSettlements, 
  getUpiQrCodeUrl 
} from '../../services/commissionService';

export default function DriverPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const [isOnline, setIsOnline] = useState(isVerified);
  const [onlineHours, setOnlineHours] = useState('1.8h');
  const [ridesCount, setRidesCount] = useState(isVerified ? 6 : 1);
  const rating = partner?.rating || '4.9';

  const driverId = partner?.id || 'partner_driver';
  const vehicleType = partner?.metadata?.vehicleType || partner?.vehicleType || 'E-Rickshaw';
  const vehicleNo = partner?.metadata?.vehicleNo || partner?.vehicleNo || 'UP-85 VT 2026';
  const zone = partner?.metadata?.zone || partner?.zone || 'Vrindavan Parikrama Marg';

  // Commission & Settlement State
  const [settlements, setSettlements] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [proofImage, setProofImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const commissionDue = partner?.commissionDue !== undefined ? partner.commissionDue : (ridesCount * 8);
  const totalCash = partner?.totalCashCollected || (ridesCount * 80);

  // Subscribe to settlements
  useEffect(() => {
    if (!driverId) return;
    const unsub = subscribeToDriverSettlements(driverId, (list) => {
      setSettlements(list);
    });
    return () => unsub();
  }, [driverId]);

  // Live ride requests
  const [incomingRides, setIncomingRides] = useState([]);

  const toggleOnline = () => {
    setIsOnline(prev => !prev);
  };

  const acceptRide = (id) => {
    setIncomingRides(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
    setRidesCount(c => c + 1);
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    }
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProofImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUtr = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    const cleanUtr = utrInput.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setSubmitError('Valid 12-digit UTR number required.');
      return;
    }
    const num = parseInt(payAmount, 10);
    if (!num || num <= 0) {
      setSubmitError('Valid amount required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDriverSettlement({
        driverId,
        driverName: partner?.name || 'Driver Partner',
        driverPhone: partner?.phone || '',
        vehicleNo,
        vehicleType,
        amount: num,
        utrNumber: cleanUtr,
        paymentMethod,
        proofImage
      });
      setSubmitSuccess('UTR Submitted! Admin will verify and deduct from your balance.');
      setTimeout(() => {
        setShowPayModal(false);
        setSubmitSuccess('');
        setShowHistory(true);
      }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
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
            <p>Your driver account is verified by Admin. Direct cash from pilgrims with transparent 10% platform commission.</p>
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
            <span>₹{totalCash}</span>
          </div>
          <span className="ph-stat-lbl">Cash Collected</span>
        </div>
      </div>

      {/* Commission Due Card */}
      <div style={{
        margin: '12px 0',
        padding: '14px',
        background: commissionDue > 0 ? '#fff1f2' : '#f0fdf4',
        border: `1.5px solid ${commissionDue > 0 ? '#fecdd3' : '#bbf7d0'}`,
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={15} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.88rem', color: '#09090b' }}>कंपनी का बकाया कमीशन</strong>
              <small style={{ fontSize: '0.7rem', color: '#64748b' }}>10% Platform Fee</small>
            </div>
          </div>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            background: commissionDue > 0 ? '#ffe4e6' : '#dcfce7',
            color: commissionDue > 0 ? '#be123c' : '#15803d'
          }}>
            {commissionDue > 0 ? '🔴 भुगतान शेष' : '🟢 संपूर्ण चुकता'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: commissionDue > 0 ? '#e11d48' : '#16a34a' }}>₹{commissionDue}</span>
            <small style={{ display: 'block', fontSize: '0.68rem', color: '#64748b' }}>कुल बकाया (Outstanding Due)</small>
          </div>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 14px',
              background: commissionDue > 0 ? '#e11d48' : '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            onClick={() => {
              setPayAmount(String(commissionDue || 100));
              setShowPayModal(true);
            }}
          >
            <ArrowUpRight size={14} /> Pay &amp; Submit UTR
          </button>
        </div>

        {/* Toggle history */}
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#2563eb',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 0'
          }}
          onClick={() => setShowHistory(prev => !prev)}
        >
          <span>View Submitted UTRs ({settlements.length})</span>
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHistory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            {settlements.length === 0 ? (
              <small style={{ color: '#64748b' }}>No UTRs submitted yet.</small>
            ) : (
              settlements.map(s => (
                <div key={s.id} style={{ padding: '8px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <code>{s.utrNumber}</code>
                    <strong>₹{s.amount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', color: '#64748b' }}>
                    <span style={{
                      fontWeight: 700,
                      color: s.status === 'approved' ? '#16a34a' : s.status === 'rejected' ? '#dc2626' : '#d97706'
                    }}>
                      ● {s.status === 'approved' ? 'Approved' : s.status === 'rejected' ? `Rejected: ${s.rejectionReason || ''}` : 'Pending Review'}
                    </span>
                    <small>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : ''}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pay Modal for PartnerHub */}
      {showPayModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setShowPayModal(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '1.25rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '1rem' }}>Pay Platform Commission Online</strong>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowPayModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <small style={{ color: '#64748b' }}>UPI ID</small>
                  <strong style={{ display: 'block' }}>{ADMIN_PAYMENT_CONFIG.upiId}</strong>
                </div>
                <button 
                  type="button" 
                  style={{ padding: '4px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.74rem', cursor: 'pointer' }}
                  onClick={() => handleCopy(ADMIN_PAYMENT_CONFIG.upiId, 'upi')}
                >
                  {copiedKey === 'upi' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <img src={getUpiQrCodeUrl(payAmount || commissionDue)} alt="QR" style={{ width: 110, height: 110, margin: '0 auto' }} />
                <small style={{ display: 'block', color: '#64748b', marginTop: 4 }}>Scan with GPay, PhonePe, Paytm</small>
              </div>

              <form onSubmit={handleSubmitUtr} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {submitSuccess && <div style={{ color: '#15803d', fontWeight: 700, fontSize: '0.8rem' }}>{submitSuccess}</div>}
                {submitError && <div style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.8rem' }}>{submitError}</div>}

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700 }}>Amount Paid (₹)</label>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={e => setPayAmount(e.target.value)} 
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                    required 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700 }}>12-Digit UTR / Ref No.</label>
                  <input 
                    type="text" 
                    value={utrInput} 
                    onChange={e => setUtrInput(e.target.value.toUpperCase())} 
                    placeholder="e.g. 423589123456" 
                    style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px' }} 
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  style={{
                    padding: '10px',
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit UTR Verification'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
