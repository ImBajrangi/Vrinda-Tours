import { useState, useEffect, useRef } from 'react';
import { 
  Zap, Star, Navigation, Phone, CheckCircle2, 
  MapPin, Clock, ShieldCheck, Compass, LogOut, Lock, Car,
  Wallet, ArrowUpRight, Copy, Check, AlertCircle, AlertTriangle,
  UploadCloud, X, ChevronDown, ChevronUp, Sparkles, RefreshCw, Radio
} from 'lucide-react';
import { 
  ADMIN_PAYMENT_CONFIG, 
  submitDriverSettlement, 
  subscribeToDriverSettlements,
  subscribeToDriverDue,
  getUpiQrCodeUrl 
} from '../../services/commissionService';
import {
  subscribeToAvailableRides,
  acceptRideByDriver,
  skipRideByDriver,
  completeRide
} from '../../services/rideService';

export default function DriverPortalTab({ partner, onLogout }) {
  const isVerified = Boolean(partner?.verified);
  const driverId = partner?.id || sessionStorage.getItem('vt_driver_id') || 'driver_partner';
  const vehicleType = partner?.metadata?.vehicleType || partner?.vehicleType || 'Pilgrim E-Rickshaw';
  const vehicleNo = partner?.metadata?.vehicleNo || partner?.vehicleNo || (partner?.id ? 'UP-85 VT' : 'Vehicle Reg. Pending');
  const zone = partner?.metadata?.zone || partner?.zone || 'Vrindavan Dham';
  const rating = partner?.rating || '5.0';

  // Online / Offline State with Live Duration Tracking
  const [isOnline, setIsOnline] = useState(false);
  const [onlineStartTime, setOnlineStartTime] = useState(null);
  const [onlineHours, setOnlineHours] = useState('0.0h');

  // Dynamic Dues & Earnings State
  const [driverMetrics, setDriverMetrics] = useState({
    commissionDue: partner?.commissionDue || 0,
    totalCashCollected: partner?.totalCashCollected || 0,
    ridesCount: partner?.ridesCount || partner?.ridesCompletedCount || 0
  });

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

  // Live incoming ride requests (Subscribed dynamically, NO hardcoded items)
  const [incomingRides, setIncomingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  // 1. Subscribe to driver settlements & dues in real-time
  useEffect(() => {
    if (!driverId) return;

    const unsubSettlements = subscribeToDriverSettlements(driverId, (list) => {
      setSettlements(list);
    });

    const unsubDues = subscribeToDriverDue(driverId, (dueState) => {
      setDriverMetrics({
        commissionDue: dueState.commissionDue ?? (partner?.commissionDue || 0),
        totalCashCollected: dueState.totalCashCollected ?? (partner?.totalCashCollected || 0),
        ridesCount: dueState.ridesCount ?? (partner?.ridesCount || 0)
      });
    });

    return () => {
      unsubSettlements();
      unsubDues();
    };
  }, [driverId, partner]);

  // 2. Real-time timer when Online
  useEffect(() => {
    if (!isOnline) {
      setOnlineStartTime(null);
      setOnlineHours('0.0h');
      return;
    }

    const start = Date.now();
    setOnlineStartTime(start);

    const interval = setInterval(() => {
      const elapsedHours = (Date.now() - start) / (1000 * 60 * 60);
      setOnlineHours(`${elapsedHours.toFixed(1)}h`);
    }, 60000);

    return () => clearInterval(interval);
  }, [isOnline]);

  // 3. Subscribe to live nearby ride requests from Supabase / Firestore
  useEffect(() => {
    if (!isOnline) {
      setIncomingRides([]);
      return;
    }

    const driverPosition = partner?.location || { lat: 27.5804, lng: 77.7011 };
    const unsubRides = subscribeToAvailableRides(driverPosition, (ridesList) => {
      // Map live rides from rideService
      const formatted = (ridesList || []).map(r => ({
        id: r.id,
        passenger: r.riderName || r.passenger_name || r.passenger || 'Pilgrim Devotee',
        phone: r.riderPhone || r.passenger_phone || r.phone || '',
        pickup: r.pickupName || r.pickup_location || 'Current GPS Location',
        drop: r.destName || r.drop_location || 'Shri Bankey Bihari Mandir',
        eta: r._distText || 'Nearby (1.2 km)',
        fare: typeof r.fare === 'number' ? `₹${r.fare}` : (r.fare?.startsWith('₹') ? r.fare : `₹${r.fare || 50}`),
        fareNumeric: typeof r.fare === 'number' ? r.fare : parseInt(String(r.fare || '').replace(/\D/g, '')) || 50,
        status: r.status || 'pending',
        raw: r
      }));
      setIncomingRides(formatted);
    });

    return () => unsubRides();
  }, [isOnline, partner?.location]);

  const toggleOnline = () => {
    setIsOnline(prev => !prev);
  };

  const handleAcceptRide = async (rideId) => {
    const target = incomingRides.find(r => r.id === rideId);
    try {
      await acceptRideByDriver(rideId, {
        id: driverId,
        name: partner?.name || 'Sarathi Driver',
        phone: partner?.phone || '',
        vehicleNo,
        vehicleType,
        rating,
        photo: partner?.photo_url || partner?.photo || ''
      });
      if (target) {
        setActiveRide({ ...target, status: 'accepted' });
      }
      setIncomingRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'accepted' } : r));
    } catch (err) {
      console.warn('[DriverPortalTab] Error accepting ride:', err);
    }
  };

  const handleCompleteRide = async (rideId, fareNum = 50) => {
    try {
      await completeRide(rideId, driverId);
      setActiveRide(null);
      setIncomingRides(prev => prev.filter(r => r.id !== rideId));
      setDriverMetrics(prev => ({
        ...prev,
        ridesCount: prev.ridesCount + 1,
        totalCashCollected: prev.totalCashCollected + fareNum,
        commissionDue: prev.commissionDue + Math.round(fareNum * 0.1)
      }));
    } catch (err) {
      console.warn('[DriverPortalTab] Error completing ride:', err);
    }
  };

  const handleDeclineRide = (rideId) => {
    skipRideByDriver(rideId);
    setIncomingRides(prev => prev.filter(r => r.id !== rideId));
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
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
            <Clock size={18} />
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
            <ShieldCheck size={18} />
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
            src={partner?.photo_url || partner?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(partner?.name || 'Sarathi')}&backgroundColor=f1f5f9`} 
            alt={partner?.name || 'Driver'} 
          />
          <span className="ph-avatar-badge" title="Driver Partner">
            <Car size={11} color="#0f172a" />
          </span>
        </div>
        <div className="ph-profile-info">
          <div className="ph-name-line">
            <h4>{partner?.name || (isVerified ? 'Driver Partner' : 'Sarathi Driver Partner')}</h4>
            <span className="ph-tag-gold"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}</span>
          </div>
          <div className="ph-sub-line">
            <span>{vehicleType} • {vehicleNo} • {zone}</span>
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
          className="ph-tool-btn primary-accent"
          onClick={() => {
            setPayAmount(String(driverMetrics.commissionDue || 100));
            setShowPayModal(true);
          }}
          title="Pay platform commission via UPI QR"
        >
          <Wallet size={13} color="#0f172a" />
          <span>Pay Commission</span>
        </button>
        <button 
          type="button" 
          className="ph-tool-btn"
          onClick={() => setShowHistory(prev => !prev)}
          title="View submitted settlement UTRs"
        >
          <Clock size={13} />
          <span>UTR History ({settlements.length})</span>
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
            <span>{isOnline ? 'Broadcasting live GPS to nearby pilgrims in Vrindavan' : 'Go online to receive live pilgrim ride dispatches'}</span>
          </div>
        </div>
        <button className="ph-btn-toggle" onClick={toggleOnline}>
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* 3 Metrics Grid */}
      <div className="ph-stats-grid">
        <div className="ph-stat-card">
          <div className="ph-stat-icon-micro"><Car size={13} color="#0f172a" /></div>
          <span className="ph-stat-val">{driverMetrics.ridesCount}</span>
          <span className="ph-stat-lbl">Rides Today</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-icon-micro"><Clock size={13} color="#3b82f6" /></div>
          <span className="ph-stat-val">{onlineHours}</span>
          <span className="ph-stat-lbl">Online Time</span>
        </div>
        <div className="ph-stat-card">
          <div className="ph-stat-icon-micro"><Wallet size={13} color="#d97706" /></div>
          <div className="ph-stat-val">
            <span>₹{driverMetrics.totalCashCollected}</span>
          </div>
          <span className="ph-stat-lbl">Cash Collected</span>
        </div>
      </div>

      {/* Commission Due Card */}
      <div className="ph-commission-card">
        <div className="ph-comm-top">
          <div className="ph-comm-left">
            <div className="ph-comm-icon-box">
              <Wallet size={16} />
            </div>
            <div>
              <strong className="ph-comm-title">Platform Commission</strong>
              <small className="ph-comm-sub">10% Platform Fee on Cash Rides</small>
            </div>
          </div>
          <span className={`ph-comm-status-badge ${driverMetrics.commissionDue > 0 ? 'pending' : 'settled'}`}>
            {driverMetrics.commissionDue > 0 ? '● Outstanding Due' : '✓ All Settled'}
          </span>
        </div>

        <div className="ph-comm-body">
          <div className="ph-comm-amount-group">
            <span className="ph-comm-amount">₹{driverMetrics.commissionDue}</span>
            <small className="ph-comm-amount-sub">Pending Settlement Balance</small>
          </div>
          <button
            type="button"
            className="ph-comm-pay-btn"
            onClick={() => {
              setPayAmount(String(driverMetrics.commissionDue || 100));
              setShowPayModal(true);
            }}
          >
            <ArrowUpRight size={14} /> Pay via UPI QR
          </button>
        </div>

        {/* Toggle history */}
        <button
          type="button"
          className="ph-comm-history-toggle"
          onClick={() => setShowHistory(prev => !prev)}
        >
          <span>View Submitted UTRs ({settlements.length})</span>
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHistory && (
          <div className="ph-comm-history-list">
            {settlements.length === 0 ? (
              <small className="ph-comm-history-empty">No UTRs submitted yet.</small>
            ) : (
              settlements.map(s => (
                <div key={s.id} className="ph-comm-history-item">
                  <div className="ph-comm-history-item-top">
                    <code>{s.utrNumber}</code>
                    <strong>₹{s.amount}</strong>
                  </div>
                  <div className="ph-comm-history-item-bottom">
                    <span className={`ph-utr-badge ${s.status}`}>
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
        <div className="ph-pay-modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="ph-pay-modal-card" onClick={e => e.stopPropagation()}>
            <div className="ph-pay-modal-header">
              <strong>Pay Platform Commission Online</strong>
              <button type="button" className="ph-pay-modal-close" onClick={() => setShowPayModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="ph-pay-modal-body">
              <div className="ph-pay-upi-box">
                <div>
                  <small>UPI ID</small>
                  <strong>{ADMIN_PAYMENT_CONFIG.upiId}</strong>
                </div>
                <button 
                  type="button" 
                  className="ph-pay-copy-btn"
                  onClick={() => handleCopy(ADMIN_PAYMENT_CONFIG.upiId, 'upi')}
                >
                  {copiedKey === 'upi' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="ph-pay-qr-box">
                <img src={getUpiQrCodeUrl(payAmount || driverMetrics.commissionDue)} alt="UPI QR Code" />
                <small>Scan with GPay, PhonePe, or Paytm</small>
              </div>

              <form onSubmit={handleSubmitUtr} className="ph-pay-form">
                {submitSuccess && <div className="ph-pay-success">{submitSuccess}</div>}
                {submitError && <div className="ph-pay-error">{submitError}</div>}

                <div className="ph-pay-input-group">
                  <label>Amount Paid (₹)</label>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={e => setPayAmount(e.target.value)} 
                    required 
                  />
                </div>

                <div className="ph-pay-input-group">
                  <label>12-Digit UTR / Transaction Ref</label>
                  <input 
                    type="text" 
                    value={utrInput} 
                    onChange={e => setUtrInput(e.target.value.toUpperCase())} 
                    placeholder="e.g. 423589123456" 
                    required 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="ph-pay-submit-btn"
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
        <span className="ph-badge-count">{incomingRides.filter(r => r.status === 'pending' || r.status === 'searching').length} Active</span>
      </div>

      <div className="ph-cards-list">
        {incomingRides.length === 0 ? (
          <div className="ph-empty-state">
            {isOnline ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', margin: '0 auto 8px' }}>
                  <Radio size={22} className="animate-pulse" />
                </div>
                <p>Searching for Nearby Pilgrim Requests</p>
                <span>You are online. Incoming ride dispatches across Vrindavan will alert you in real-time.</span>
              </>
            ) : (
              <>
                <Car size={28} style={{ opacity: 0.25 }} />
                <p>You are Currently Offline</p>
                <span>Tap <strong>"Go Online"</strong> above to start receiving live pilgrim ride requests.</span>
              </>
            )}
          </div>
        ) : incomingRides.map(ride => (
          <div key={ride.id} className="ph-order-card ph-ride-card">
            <div className="ph-order-top">
              <div className="ph-ride-passenger-info">
                <span className="ph-order-guest">{ride.passenger}</span>
                <span className="ph-ride-fare-badge">{ride.fare}</span>
              </div>
              <span className={`ph-order-status ${ride.status === 'accepted' ? 'confirmed' : ''}`}>
                {ride.status === 'accepted' ? '● En Route' : '● New Request'}
              </span>
            </div>

            <div className="ph-route-track">
              <div className="ph-route-node pickup">
                <div className="ph-route-dot pickup" />
                <span className="ph-route-text">{ride.pickup}</span>
              </div>
              <div className="ph-route-line" />
              <div className="ph-route-node dropoff">
                <div className="ph-route-dot dropoff" />
                <span className="ph-route-text">{ride.drop}</span>
              </div>
            </div>

            <div className="ph-order-meta">
              <span><Clock size={12} /> {ride.eta}</span>
              <span><Wallet size={12} /> Direct Cash Fare</span>
            </div>

            <div className="ph-order-actions">
              {ride.status === 'accepted' ? (
                <>
                  <button className="ph-btn-action primary success" onClick={() => handleCompleteRide(ride.id, ride.fareNumeric)}>
                    <CheckCircle2 size={14} /> Complete &amp; Collect {ride.fare}
                  </button>
                  {ride.phone && (
                    <button className="ph-btn-action outline" onClick={() => window.open(`tel:${ride.phone}`)}>
                      <Phone size={14} /> Call Passenger
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button className="ph-btn-action primary" onClick={() => handleAcceptRide(ride.id)}>
                    <CheckCircle2 size={14} /> Accept Ride
                  </button>
                  <button className="ph-btn-action outline" onClick={() => handleDeclineRide(ride.id)}>
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
