import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, Phone, Navigation, Power, Shield, MapPin, 
  LogOut, ChevronRight, Zap, CheckCircle2, Clock, Search, Star,
  Wallet, ArrowUpRight, Copy, Check, AlertTriangle, QrCode,
  UploadCloud, FileText, AlertCircle, RefreshCw, ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, deleteField, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { calculateDistance } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { 
  subscribeToAvailableRides, 
  acceptRideByDriver, 
  skipRideByDriver, 
  markDriverArrived, 
  completeRide 
} from '../../services/rideService';
import { 
  ADMIN_PAYMENT_CONFIG, 
  submitDriverSettlement, 
  subscribeToDriverSettlements, 
  getUpiQrCodeUrl 
} from '../../services/commissionService';
import './DriverPortalModal.css';

export default function DriverPortalModal({ onClose, onOpenLanding, drivers = [] }) {
  const [driverId, setDriverId] = useState(() => sessionStorage.getItem('vt_driver_id'));
  const [driverData, setDriverData] = useState(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');

  const { isDragging, isClosing, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsText, setGpsText] = useState('GPS Ready');
  const [onlineStartTime, setOnlineStartTime] = useState(null);
  const [onlineHoursText, setOnlineHoursText] = useState('0.0h');
  const [ridesCompletedToday, setRidesCompletedToday] = useState(0);
  const [nearbyRequests, setNearbyRequests] = useState([]);

  // Commission & UTR Settlement State
  const [settlements, setSettlements] = useState([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [utrInput, setUtrInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [proofImage, setProofImage] = useState('');
  const [driverNotes, setDriverNotes] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showRideLedger, setShowRideLedger] = useState(false);

  // Subscribe to driver settlements in real-time
  useEffect(() => {
    if (!driverId) {
      setSettlements([]);
      return;
    }
    const unsub = subscribeToDriverSettlements(driverId, (list) => {
      setSettlements(list);
    });
    return () => unsub();
  }, [driverId]);

  // Subscribe to nearby available rides when driver is online
  useEffect(() => {
    if (!isOnline) {
      setNearbyRequests([]);
      return;
    }

    const unsub = subscribeToAvailableRides(
      driverData?.location || { lat: 27.5804, lng: 77.7011 },
      (rides) => {
        setNearbyRequests(rides);
      }
    );

    return () => unsub();
  }, [isOnline, driverData?.location]);

  const filteredDrivers = useMemo(() => {
    if (!driverSearch.trim()) return drivers;
    const q = driverSearch.toLowerCase();
    return drivers.filter(d => 
      d.name?.toLowerCase().includes(q) || 
      d.phone?.includes(q) || 
      d.vehicleNo?.toLowerCase().includes(q) ||
      d.vehicleType?.toLowerCase().includes(q)
    );
  }, [drivers, driverSearch]);
  
  // Timer for ride auto-decline
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef(null);

  // Throttled GPS tracking refs
  const gpsWatchRef = useRef(null);
  const lastLocationRef = useRef({ lat: 0, lng: 0, time: 0 });

  // 1. Fetch driver data if logged in
  useEffect(() => {
    if (!driverId) return;

    const driverRef = doc(firestore, 'drivers', driverId);
    const unsub = onSnapshot(driverRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDriverData({ id: docSnap.id, ...data });
        if (data.status === 'available' || data.status === 'busy') {
          setIsOnline(true);
        }
        if (data.currentRide) {
          setCurrentRide(data.currentRide);
        } else {
          setCurrentRide(null);
        }
      } else {
        sessionStorage.removeItem('vt_driver_id');
        setDriverId(null);
        setDriverData(null);
      }
    }, (err) => {
      console.error('Driver sync error:', err);
    });

    return () => unsub();
  }, [driverId]);

  // 2. Online duration ticker
  useEffect(() => {
    if (!isOnline || !onlineStartTime) return;
    const interval = setInterval(() => {
      const hrs = ((Date.now() - onlineStartTime) / (1000 * 60 * 60)).toFixed(1);
      setOnlineHoursText(`${hrs}h`);
    }, 30000);
    return () => clearInterval(interval);
  }, [isOnline, onlineStartTime]);

  // 3. Countdown timer for incoming ride request
  useEffect(() => {
    if (currentRide && currentRide.status === 'requested') {
      setCountdown(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleDeclineRide();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRide?.status]);

  // 4. Handle Throttled GPS Position Updates
  const updateDriverLocationInFirestore = useCallback(async (lat, lng, heading = 0) => {
    if (!driverId) return;

    const now = Date.now();
    const last = lastLocationRef.current;
    const timeElapsedMs = now - last.time;

    let distMeters = 0;
    if (last.lat && last.lng) {
      const distKm = calculateDistance(last.lat, last.lng, lat, lng);
      distMeters = distKm * 1000;
    }

    if (!last.time || distMeters >= 15 || timeElapsedMs >= 10000) {
      lastLocationRef.current = { lat, lng, time: now };
      setGpsText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      
      try {
        await updateDoc(doc(firestore, 'drivers', driverId), {
          location: {
            lat,
            lng,
            heading: heading || 0,
            timestamp: now
          }
        });
      } catch (err) {
        console.error('Failed to update driver location:', err);
      }
    }
  }, [driverId]);

  // 5. GPS Watch Manager
  const startGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsText('No GPS');
      return;
    }

    setGpsActive(true);
    setGpsText('Locating...');

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading } = pos.coords;
        updateDriverLocationInFirestore(latitude, longitude, heading);
      },
      () => {
        setGpsText('GPS Offline');
        setGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, [updateDriverLocationInFirestore]);

  const stopGPS = useCallback(() => {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
      gpsWatchRef.current = null;
    }
    setGpsActive(false);
    setGpsText('GPS Idle');
  }, []);

  // 6. Handle Online / Offline Switch
  const toggleOnline = async () => {
    if (!driverId) return;

    const nextState = !isOnline;
    setIsOnline(nextState);

    if (nextState) {
      setOnlineStartTime(Date.now());
      startGPS();
      await updateDoc(doc(firestore, 'drivers', driverId), {
        status: 'available'
      });
    } else {
      stopGPS();
      await updateDoc(doc(firestore, 'drivers', driverId), {
        status: 'offline',
        currentRide: deleteField()
      });
    }
  };

  // 7. Handle Phone Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const cleanPhone = loginPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setLoginError('Enter 10-digit number');
      return;
    }

    setIsLoggingIn(true);
    try {
      const snap = await getDocs(collection(firestore, 'drivers'));
      let match = null;

      snap.forEach((dDoc) => {
        const data = dDoc.data();
        const dPhone = (data.phone || '').replace(/\D/g, '');
        if (dPhone && (dPhone === cleanPhone || dPhone.endsWith(cleanPhone) || cleanPhone.endsWith(dPhone))) {
          match = { id: dDoc.id, ...data };
        }
      });

      if (match) {
        sessionStorage.setItem('vt_driver_id', match.id);
        setDriverId(match.id);
        setDriverData(match);
      } else {
        setLoginError('Unregistered number');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Connection error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 8. Direct 1-Tap Driver Select
  const handleSelectDriverDirect = (d) => {
    sessionStorage.setItem('vt_driver_id', d.id);
    setDriverId(d.id);
    setDriverData(d);
  };

  // 9. Ride Action Handlers
  const handleAcceptNearbyRide = async (rideReq) => {
    if (!driverData) return;
    try {
      const accepted = await acceptRideByDriver(rideReq.id, {
        id: driverId || driverData.id,
        name: driverData.name || 'Sarathi',
        phone: driverData.phone || '+91 98765 43210',
        vehicleNo: driverData.vehicleNo || 'UP-85-BV-1008',
        vehicleType: driverData.vehicleType || 'Pilgrim E-Rickshaw',
        rating: driverData.rating || '4.9',
        photo: driverData.photo || ''
      });
      setCurrentRide(accepted);
      setNearbyRequests(prev => prev.filter(r => r.id !== rideReq.id));
    } catch (err) {
      console.error('Error accepting nearby ride:', err);
    }
  };

  const handleSkipNearbyRide = (rideReq) => {
    skipRideByDriver(rideReq.id);
    setNearbyRequests(prev => prev.filter(r => r.id !== rideReq.id));
  };

  const handleAcceptRide = async () => {
    if (!driverId) return;
    try {
      await updateDoc(doc(firestore, 'drivers', driverId), {
        status: 'busy',
        'currentRide.status': 'accepted'
      });
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  };

  const handleDeclineRide = async () => {
    if (!driverId) return;
    try {
      await updateDoc(doc(firestore, 'drivers', driverId), {
        status: 'available',
        currentRide: deleteField()
      });
    } catch (err) {
      console.error('Error declining ride:', err);
    }
  };

  const handleMarkArrived = async () => {
    if (!driverId) return;
    try {
      if (currentRide?.id) {
        await markDriverArrived(currentRide.id, driverId);
      } else {
        await updateDoc(doc(firestore, 'drivers', driverId), {
          'currentRide.status': 'driver_arrived'
        });
      }
      setCurrentRide(prev => ({ ...prev, status: 'driver_arrived' }));
    } catch (err) {
      console.error('Error marking arrived:', err);
    }
  };

  const handleCompleteRide = async () => {
    if (!driverId) return;
    try {
      setRidesCompletedToday(prev => prev + 1);
      if (currentRide?.id) {
        await completeRide(currentRide.id, driverId);
      } else {
        await updateDoc(doc(firestore, 'drivers', driverId), {
          status: 'available',
          currentRide: deleteField()
        });
      }
      setCurrentRide(null);
    } catch (err) {
      console.error('Error completing ride:', err);
    }
  };

  const handleLogout = async () => {
    if (isOnline && driverId) {
      stopGPS();
      try {
        await updateDoc(doc(firestore, 'drivers', driverId), {
          status: 'offline',
          currentRide: deleteField()
        });
      } catch {}
    }
    sessionStorage.removeItem('vt_driver_id');
    setDriverId(null);
    setDriverData(null);
    setIsOnline(false);
  };

  // Commission & Settlement Handlers
  const handleOpenPayModal = (defaultAmt) => {
    const due = defaultAmt !== undefined ? defaultAmt : (driverData?.commissionDue || 0);
    setPayAmount(due > 0 ? String(due) : '100');
    setUtrInput('');
    setProofImage('');
    setDriverNotes('');
    setSubmitError('');
    setSubmitSuccess('');
    setShowPayModal(true);
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2200);
    }
  };

  const handleProofUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setSubmitError('File size too large (max 4MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofImage(event.target.result);
        setSubmitError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUtr = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const cleanUtr = utrInput.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setSubmitError('Please enter a valid 12-digit UTR or Transaction reference number');
      return;
    }
    const numAmount = parseInt(payAmount, 10);
    if (!numAmount || numAmount <= 0) {
      setSubmitError('Please enter a valid payment amount');
      return;
    }

    setIsSubmittingUtr(true);
    try {
      await submitDriverSettlement({
        driverId: driverId,
        driverName: driverData?.name || 'Driver Partner',
        driverPhone: driverData?.phone || '',
        vehicleNo: vehicleNo,
        vehicleType: vehicleType,
        amount: numAmount,
        utrNumber: cleanUtr,
        paymentMethod,
        proofImage,
        notes: driverNotes
      });

      setSubmitSuccess('Payment UTR submitted! Admin will verify and clear your due balance.');
      setUtrInput('');
      setProofImage('');
      setDriverNotes('');
      setTimeout(() => {
        setShowPayModal(false);
        setSubmitSuccess('');
        setShowHistory(true);
      }, 2000);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit UTR. Please try again.');
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  const vehicleType = driverData?.vehicleType || 'E-Rickshaw';
  const vehicleNo = driverData?.vehicleNo || 'UP-85 VT 2026';
  const rating = driverData?.rating || '4.9';

  const commissionDue = driverData?.commissionDue !== undefined ? driverData.commissionDue : 0;
  const totalCashCollected = driverData?.totalCashCollected || (ridesCompletedToday * 80);
  const totalCommissionPaid = driverData?.totalCommissionPaid || 0;
  const rideHistory = driverData?.commissionRideHistory || [];
  const pendingSettlements = settlements.filter(s => s.status === 'pending');

  return (
    <>
      <div className={`dp-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={triggerClose} />

      <div 
        className={`dp-modal-container ${isDragging ? 'dragging' : ''} ${isClosing ? 'closing' : ''}`}
        style={sheetStyle}
      >
        <div className="dp-modal-handle-wrapper" {...handleProps} title="Drag down to dismiss">
          <div className="dp-modal-handle" />
        </div>

        <div className="dp-modal-header">
          <div className="dp-brand">
            <div className="dp-brand-logo-wrapper">
              <img src="/official-logo.svg" alt="Vrindopnishad" className="dp-brand-img" />
            </div>
            <div>
              <h2>Driver Companion</h2>
              <span className="dp-brand-sub">Driver Partner</span>
            </div>
          </div>
          <button className="dp-close-btn" onClick={triggerClose} title="Close"><X size={18} /></button>
        </div>

        {!driverId ? (
          /* MINIMAL HIGH-IMPACT LOGIN VIEW */
          <div className="dp-login-body">
            {/* Quick 1-Tap Driver Select Cards with Smart Search Filter */}
            {drivers.length > 0 && (
              <div className="dp-quick-section">
                <div className="dp-section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={13} />
                    <span>ONE-TAP DRIVER SIGN IN</span>
                  </div>
                  <span className="dp-count-pill">{filteredDrivers.length} {filteredDrivers.length === 1 ? 'driver' : 'drivers'}</span>
                </div>

                {drivers.length > 2 && (
                  <div className="dp-search-bar">
                    <Search size={14} color="#71717a" />
                    <input 
                      type="text" 
                      placeholder="Filter by name, vehicle, or phone..." 
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                    />
                    {driverSearch && (
                      <button type="button" className="dp-search-clear" onClick={() => setDriverSearch('')}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}

                <div className="dp-driver-grid">
                  {filteredDrivers.length === 0 ? (
                    <div className="dp-no-drivers">No driver found matching "{driverSearch}"</div>
                  ) : (
                    filteredDrivers.map((d) => {
                      const emoji = (d.vehicleType || '').toLowerCase().includes('taxi') ? '🚗' : (d.vehicleType || '').toLowerCase().includes('bike') ? '🛵' : '🛺';
                      return (
                        <div 
                          key={d.id} 
                          className="dp-driver-card-compact"
                          onClick={() => handleSelectDriverDirect(d)}
                          title={`Sign in as ${d.name}`}
                        >
                          <div className="dp-driver-avatar">
                            <img 
                              src={d.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.name}&backgroundColor=f1f5f9`} 
                              alt={d.name} 
                            />
                            <span className="dp-driver-vehicle-badge">{emoji}</span>
                          </div>
                          <div className="dp-driver-meta">
                            <div className="dp-driver-name-line">
                              <strong className="dp-driver-title">{d.name}</strong>
                              <span className="dp-driver-verified-pill">✓ Verified</span>
                            </div>
                            <span>{d.vehicleType || 'E-Rickshaw'} • {d.vehicleNo || 'UP-85'}</span>
                          </div>
                          <div className="dp-driver-arrow">
                            <ChevronRight size={18} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div className="dp-or-divider">
              <span>or enter phone number</span>
            </div>

            <form onSubmit={handleLoginSubmit} className="dp-login-form">
              <div className="dp-input-box">
                <Phone size={18} color="#71717a" />
                <span className="dp-country-code">+91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <div className="dp-login-error">
                  {loginError}
                </div>
              )}

              <button type="submit" className="dp-login-submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'Verifying...' : 'Enter Dashboard'}
              </button>

              {onOpenLanding && (
                <div className="dp-register-cta-banner">
                  <span>Want to drive with us?</span>
                  <button 
                    type="button" 
                    className="dp-register-link-btn"
                    onClick={() => {
                      onClose();
                      onOpenLanding();
                    }}
                  >
                    Register as Driver Partner →
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (

          /* MINIMAL POWERFUL DRIVER DASHBOARD */
          <div className="dp-dash-body">
            {/* Driver Profile Bar */}
            <div className="dp-profile-card">
              <div className="dp-avatar">
                <img 
                  src={driverData?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${driverData?.name}&backgroundColor=f1f5f9`} 
                  alt={driverData?.name || 'Driver'} 
                />
                <span className={`dp-status-dot ${isOnline ? (currentRide ? 'busy' : 'online') : 'offline'}`} />
              </div>
              <div className="dp-profile-info">
                <div className="dp-profile-name-row">
                  <h4>{driverData?.name || 'Driver'}</h4>
                  <span className="dp-tag-rating">★ {rating}</span>
                </div>
                <div className="dp-profile-sub">
                  <span>🛺 {vehicleType || 'E-Rickshaw'} • {vehicleNo || 'UP-85 VT 2026'}</span>
                </div>
              </div>
              <button className="dp-logout-btn" onClick={handleLogout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>

            {/* Status Radar & Switch */}
            <div className={`dp-status-box ${isOnline ? (currentRide ? 'busy' : 'online') : 'offline'}`}>
              <div className="dp-status-hero">
                <div className="dp-status-beacon">
                  {isOnline ? <Zap size={22} /> : <Power size={22} />}
                </div>
                <div className="dp-status-text">
                  <h3>{isOnline ? (currentRide ? 'ON TRIP' : 'ONLINE') : 'OFFLINE'}</h3>
                  <span className="dp-status-sub">
                    {isOnline ? 'Available for rides' : 'Ready to accept trips'}
                  </span>
                </div>
              </div>

              <button 
                className={`dp-power-toggle ${isOnline ? 'active' : ''}`} 
                onClick={toggleOnline}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>

            {/* 3 Metrics */}
            <div className="dp-stats-grid">
              <div className="dp-stat-card">
                <span className="dp-stat-val">{ridesCompletedToday}</span>
                <span className="dp-stat-lbl">Rides</span>
              </div>
              <div className="dp-stat-card">
                <span className="dp-stat-val">{onlineHoursText}</span>
                <span className="dp-stat-lbl">Online</span>
              </div>
              <div className="dp-stat-card">
                <div className="dp-stat-val dp-stat-rating">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{rating}</span>
                </div>
                <span className="dp-stat-lbl">Rating</span>
              </div>
            </div>

            {/* Minimal GPS Pill */}
            <div className="dp-gps-bar">
              <div className={`dp-gps-pulse ${gpsActive ? 'active' : ''}`} />
              <Navigation size={13} />
              <span>{gpsText}</span>
            </div>

            {/* COMMISSION & COMPANY DUE CARD (बकाया कमीशन) */}
            <div className={`dp-commission-card ${commissionDue > 0 ? 'has-due' : 'cleared'}`}>
              <div className="dp-comm-header">
                <div className="dp-comm-title-wrap">
                  <div className="dp-comm-icon-box">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <h4 className="dp-comm-title">कंपनी का बकाया कमीशन</h4>
                    <span className="dp-comm-sub">10% Platform Fee on Cash Rides</span>
                  </div>
                </div>
                <span className={`dp-comm-status-pill ${commissionDue > 0 ? 'due' : 'cleared'}`}>
                  {commissionDue > 0 ? '🔴 भुगतान शेष' : '🟢 संपूर्ण चुकता'}
                </span>
              </div>

              <div className="dp-comm-body">
                <div className="dp-comm-main-val">
                  <span className="dp-comm-currency">₹</span>
                  <span className="dp-comm-num">{commissionDue}</span>
                  <span className="dp-comm-label">कुल बकाया (Outstanding Due)</span>
                </div>

                <div className="dp-comm-stats-mini">
                  <div className="dp-mini-stat">
                    <small>कुल नकद किराया</small>
                    <strong>₹{totalCashCollected}</strong>
                  </div>
                  <div className="dp-mini-stat">
                    <small>जमा किया कमीशन</small>
                    <strong style={{ color: '#16a34a' }}>₹{totalCommissionPaid}</strong>
                  </div>
                </div>
              </div>

              {pendingSettlements.length > 0 && (
                <div className="dp-comm-pending-alert">
                  <Clock size={14} color="#f59e0b" />
                  <span><strong>{pendingSettlements.length} UTR सत्यापन प्रक्रियाधीन है</strong> (Admin Reviewing)</span>
                </div>
              )}

              <div className="dp-comm-actions">
                <button 
                  type="button" 
                  className="dp-btn-pay-comm" 
                  onClick={() => handleOpenPayModal(commissionDue)}
                >
                  <ArrowUpRight size={15} /> 
                  <span>{commissionDue > 0 ? `कमीशन ऑनलाइन भरें (Pay ₹${commissionDue})` : 'एडवांस जमा करें / UTR दर्ज करें'}</span>
                </button>
              </div>

              {/* Toggles for Settlement History and Ride Ledger */}
              <div className="dp-comm-history-toggles">
                <button 
                  type="button" 
                  className={`dp-comm-toggle-btn ${showHistory ? 'active' : ''}`}
                  onClick={() => setShowHistory(prev => !prev)}
                >
                  <FileText size={13} />
                  <span>UTR भुगतान स्थिति ({settlements.length})</span>
                  {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {rideHistory.length > 0 && (
                  <button 
                    type="button" 
                    className={`dp-comm-toggle-btn ${showRideLedger ? 'active' : ''}`}
                    onClick={() => setShowRideLedger(prev => !prev)}
                  >
                    <RefreshCw size={13} />
                    <span>सवारी लेजर ({rideHistory.length})</span>
                    {showRideLedger ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>

              {/* SETTLEMENTS & UTR HISTORY ACCORDION */}
              {showHistory && (
                <div className="dp-settlements-history-box">
                  <div className="dp-sh-head">
                    <h5>Submitted UTR History (सत्यापन विवरण)</h5>
                    <button type="button" className="dp-sh-add-btn" onClick={() => handleOpenPayModal(commissionDue)}>
                      + नया UTR जोड़ें
                    </button>
                  </div>

                  {settlements.length === 0 ? (
                    <div className="dp-sh-empty">
                      <p>अभी तक कोई UTR सबमिट नहीं किया गया है।</p>
                      <small>जब आप कंपनी के नंबर पर भुगतान करके UTR सबमिट करेंगे तो स्थिति यहाँ दिखेगी।</small>
                    </div>
                  ) : (
                    <div className="dp-sh-list">
                      {settlements.map((s) => {
                        const isApproved = s.status === 'approved';
                        const isRejected = s.status === 'rejected';
                        const isPending = s.status === 'pending';

                        return (
                          <div key={s.id} className={`dp-sh-item status-${s.status}`}>
                            <div className="dp-sh-row-top">
                              <div className="dp-sh-utr-badge">
                                <code className="dp-sh-utr-code">{s.utrNumber}</code>
                                <span className="dp-sh-mode">{s.paymentMethod || 'UPI'}</span>
                              </div>
                              <strong className="dp-sh-amount">₹{s.amount}</strong>
                            </div>

                            <div className="dp-sh-status-row">
                              {isPending && (
                                <span className="dp-sh-pill pending">
                                  <Clock size={12} /> जांच जारी है (Pending Admin Approval)
                                </span>
                              )}
                              {isApproved && (
                                <span className="dp-sh-pill approved">
                                  <CheckCircle2 size={12} /> स्वीकृत (Approved &amp; Cleared)
                                </span>
                              )}
                              {isRejected && (
                                <span className="dp-sh-pill rejected">
                                  <AlertCircle size={12} /> अस्वीकृत (Payment Rejected)
                                </span>
                              )}

                              <span className="dp-sh-time">
                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                              </span>
                            </div>

                            {isRejected && s.rejectionReason && (
                              <div className="dp-sh-rejection-box">
                                <AlertTriangle size={13} color="#ef4444" />
                                <span><strong>कारण:</strong> {s.rejectionReason}</span>
                              </div>
                            )}

                            {isApproved && (
                              <div className="dp-sh-approved-note">
                                ✓ आपके बकाया बैलेंस से ₹{s.amount} घटा दिया गया है।
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* RIDES LEDGER ACCORDION */}
              {showRideLedger && rideHistory.length > 0 && (
                <div className="dp-settlements-history-box ledger">
                  <h5>Completed Rides &amp; Commission Ledger</h5>
                  <div className="dp-sh-list">
                    {rideHistory.map((r, idx) => (
                      <div key={r.rideId || idx} className="dp-sh-item ledger-item">
                        <div className="dp-sh-row-top">
                          <span>{r.pickupName} → {r.destName}</span>
                          <strong className="dp-sh-amount">₹{r.fare}</strong>
                        </div>
                        <div className="dp-sh-status-row">
                          <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                            Passenger: {r.passengerName || 'Pilgrim'} • Cash
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e11d48' }}>
                            कमीशन: ₹{r.commission || Math.round(r.fare * 0.10)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Ride Lifecycle Card */}
            {currentRide && (currentRide.status === 'accepted' || currentRide.status === 'arrived') && (
              <div className="dp-active-ride-card">
                <div className="dp-arc-header">
                  <span className="dp-arc-badge">
                    {currentRide.status === 'accepted' ? 'En Route' : 'Arrived'}
                  </span>
                  <span className="dp-arc-time"><Clock size={13} /> Live Trip</span>
                </div>

                <div className="dp-arc-route">
                  <div className="dp-arc-step">
                    <MapPin size={16} color="#ffffff" />
                    <strong>{currentRide.pickupName || 'Pickup Location'}</strong>
                  </div>
                  <div className="dp-arc-step">
                    <ChevronRight size={16} color="#a1a1aa" />
                    <strong>{currentRide.destName}</strong>
                  </div>
                </div>

                <div className="dp-arc-actions">
                  {currentRide.status === 'accepted' ? (
                    <button className="dp-btn-arrive" onClick={handleMarkArrived}>
                      <CheckCircle2 size={16} /> Arrived at Pickup
                    </button>
                  ) : (
                    <button className="dp-btn-complete" onClick={handleCompleteRide}>
                      <Zap size={16} /> Complete Trip
                    </button>
                  )}
                  <button className="dp-btn-cancel-ride" onClick={handleDeclineRide}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Live Nearby Pilgrim Ride Requests Feed */}
            {isOnline && !currentRide && (
              <div className="dp-nearby-feed-section">
                <div className="dp-feed-header">
                  <div className="dp-feed-title-row">
                    <span className="dp-live-pulse-dot" />
                    <h4>Nearby Pilgrim Requests</h4>
                  </div>
                  <span className="dp-feed-count-badge">
                    {nearbyRequests.length} {nearbyRequests.length === 1 ? 'request' : 'requests'}
                  </span>
                </div>

                {nearbyRequests.length === 0 ? (
                  <div className="dp-feed-empty-state">
                    <div className="dp-radar-scan-anim" />
                    <p>Radar scanning for pilgrims in Vrindavan...</p>
                    <span>Pilgrim ride requests will appear here with instant upfront fare</span>
                  </div>
                ) : (
                  <div className="dp-feed-cards-list">
                    {nearbyRequests.map((req) => (
                      <div key={req.id} className="dp-request-live-card">
                        <div className="dp-req-card-top">
                          <div className="dp-req-tier-pill">
                            <span>🛺 {req.tierName || 'Pilgrim E-Rickshaw'}</span>
                            <span className="dp-req-dist-tag">• {req._distText || '0.8 km'}</span>
                          </div>
                          <strong className="dp-req-fare-val">₹{req.fare}</strong>
                        </div>

                        <div className="dp-req-route-box">
                          <div className="dp-req-route-point">
                            <span className="dp-r-dot green" />
                            <div className="dp-r-text">
                              <small>PICKUP</small>
                              <strong>{req.pickupName}</strong>
                            </div>
                          </div>
                          <div className="dp-req-route-point">
                            <span className="dp-r-dot dark" />
                            <div className="dp-r-text">
                              <small>DROP</small>
                              <strong>{req.destName}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="dp-req-footer-meta">
                          <span className="dp-req-pay-mode">💵 {req.paymentMethod === 'cash_upi' ? 'Cash / UPI' : 'Online'}</span>
                          {req.landmarkNote && (
                            <span className="dp-req-landmark">📍 "{req.landmarkNote}"</span>
                          )}
                        </div>

                        <div className="dp-req-action-buttons">
                          <button 
                            type="button" 
                            className="dp-btn-skip-req" 
                            onClick={() => handleSkipNearbyRide(req)}
                            title="Skip this ride"
                          >
                            Skip
                          </button>
                          <button 
                            type="button" 
                            className="dp-btn-accept-req" 
                            onClick={() => handleAcceptNearbyRide(req)}
                            title="Accept & Start Yatra"
                          >
                            <Zap size={14} /> Accept Ride (₹{req.fare})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PAY COMMISSION & SUBMIT UTR MODAL / BOTTOM SHEET */}
        {showPayModal && (
          <div className="dp-pay-modal-overlay" onClick={() => setShowPayModal(false)}>
            <div className="dp-pay-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="dp-pay-modal-header">
                <div className="dp-pay-modal-title">
                  <Wallet size={20} color="#09090b" />
                  <div>
                    <h3>कमीशन ऑनलाइन भुगतान व UTR सबमिशन</h3>
                    <span>Official Vrinda Tours Platform Payment</span>
                  </div>
                </div>
                <button type="button" className="dp-pay-close-btn" onClick={() => setShowPayModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="dp-pay-modal-body">
                {/* Due Banner */}
                <div className="dp-pay-due-banner">
                  <div>
                    <span className="dp-pay-due-tag">देय बकाया कमीशन</span>
                    <h2 className="dp-pay-due-amount">₹{commissionDue}</h2>
                  </div>
                  <div className="dp-pay-due-tip">
                    <span>100% सुरक्षित • तत्काल सत्यापन</span>
                  </div>
                </div>

                {/* Step 1: Admin Payment Details & QR Code */}
                <div className="dp-pay-section">
                  <div className="dp-pay-section-title">
                    <span className="dp-step-badge">1</span>
                    <strong>कंपनी के UPI / QR पर भुगतान करें</strong>
                  </div>

                  <div className="dp-pay-channels-grid">
                    {/* QR Code Box */}
                    <div className="dp-qr-card">
                      <div className="dp-qr-wrapper">
                        <img 
                          src={getUpiQrCodeUrl(payAmount || commissionDue)} 
                          alt="Payment QR Code" 
                          className="dp-qr-img" 
                        />
                      </div>
                      <span className="dp-qr-caption">किसी भी UPI App से स्कैन करें</span>
                    </div>

                    {/* UPI & Phone Info */}
                    <div className="dp-pay-details-list">
                      <div className="dp-pay-detail-row">
                        <div className="dp-pdr-left">
                          <small>OFFICIAL UPI ID</small>
                          <strong>{ADMIN_PAYMENT_CONFIG.upiId}</strong>
                        </div>
                        <button 
                          type="button" 
                          className="dp-pdr-copy-btn" 
                          onClick={() => handleCopy(ADMIN_PAYMENT_CONFIG.upiId, 'upi')}
                        >
                          {copiedKey === 'upi' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          <span>{copiedKey === 'upi' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="dp-pay-detail-row">
                        <div className="dp-pdr-left">
                          <small>PHONEPE / GPAY / PAYTM</small>
                          <strong>{ADMIN_PAYMENT_CONFIG.phonePeNumber}</strong>
                        </div>
                        <button 
                          type="button" 
                          className="dp-pdr-copy-btn" 
                          onClick={() => handleCopy(ADMIN_PAYMENT_CONFIG.phonePeNumber, 'phone')}
                        >
                          {copiedKey === 'phone' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          <span>{copiedKey === 'phone' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="dp-pay-detail-row">
                        <div className="dp-pdr-left">
                          <small>BENEFICIARY NAME</small>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{ADMIN_PAYMENT_CONFIG.accountHolder}</span>
                        </div>
                      </div>

                      <a 
                        href={`upi://pay?pa=${encodeURIComponent(ADMIN_PAYMENT_CONFIG.upiId)}&pn=${encodeURIComponent(ADMIN_PAYMENT_CONFIG.accountHolder)}&am=${payAmount || commissionDue}&cu=INR&tn=DriverCommissionSettlement`}
                        className="dp-btn-launch-upi"
                      >
                        <Zap size={14} /> Open UPI App directly (PhonePe / GPay)
                      </a>
                    </div>
                  </div>
                </div>

                {/* Step 2: UTR / Reference Form */}
                <form onSubmit={handleSubmitUtr} className="dp-utr-form">
                  <div className="dp-pay-section-title">
                    <span className="dp-step-badge">2</span>
                    <strong>भुगतान के बाद UTR / Transaction No. भरें</strong>
                  </div>

                  {submitSuccess && (
                    <div className="dp-form-alert success">
                      <CheckCircle2 size={16} />
                      <span>{submitSuccess}</span>
                    </div>
                  )}

                  {submitError && (
                    <div className="dp-form-alert error">
                      <AlertCircle size={16} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="dp-form-grid">
                    <div className="dp-form-group">
                      <label>भुगतान राशि (Amount Paid in ₹) *</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={payAmount} 
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="₹ 100" 
                        required 
                      />
                    </div>

                    <div className="dp-form-group">
                      <label>12-अंकों का UTR / Transaction ID *</label>
                      <input 
                        type="text" 
                        value={utrInput} 
                        onChange={(e) => setUtrInput(e.target.value.toUpperCase())}
                        placeholder="e.g. 423589123456" 
                        required 
                      />
                      <small className="dp-field-tip">Payment App me UPI Ref No. / Transaction ID dekhein</small>
                    </div>
                  </div>

                  <div className="dp-form-group">
                    <label>भुगतान का माध्यम (Payment App / Mode)</label>
                    <div className="dp-mode-chips">
                      {['UPI', 'PhonePe', 'Google Pay', 'Paytm', 'Bank Transfer'].map((m) => (
                        <button 
                          key={m} 
                          type="button" 
                          className={`dp-mode-chip ${paymentMethod === m ? 'active' : ''}`}
                          onClick={() => setPaymentMethod(m)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot / Photo Proof */}
                  <div className="dp-form-group">
                    <label>Payment Screenshot (वैकल्पिक / Optional)</label>
                    <div className="dp-proof-upload-box">
                      {proofImage ? (
                        <div className="dp-proof-preview-wrap">
                          <img src={proofImage} alt="Payment Proof" className="dp-proof-preview-img" />
                          <button 
                            type="button" 
                            className="dp-proof-remove-btn" 
                            onClick={() => setProofImage('')}
                          >
                            <X size={14} /> Remove Photo
                          </button>
                        </div>
                      ) : (
                        <label className="dp-proof-label">
                          <UploadCloud size={20} color="#71717a" />
                          <span>रसीद की फोटो अपलोड करें (Upload Screenshot)</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleProofUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="dp-form-group">
                    <label>टिप्पणी / Note (वैकल्पिक)</label>
                    <input 
                      type="text" 
                      value={driverNotes} 
                      onChange={(e) => setDriverNotes(e.target.value)}
                      placeholder="e.g. Paid from Shyam Sharma PhonePe" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="dp-btn-submit-utr" 
                    disabled={isSubmittingUtr}
                  >
                    {isSubmittingUtr ? 'सत्यापन हेतु भेजा जा रहा है...' : '✓ UTR सबमिट करें (Submit Payment Proof)'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Incoming Ride Request Overlay */}
        {currentRide && currentRide.status === 'requested' && (
          <div className="dp-req-overlay">
            <div className="dp-req-card">
              <div className="dp-req-header">
                <div className="dp-req-badge">NEW RIDE</div>
                <h4>Pilgrim Request</h4>
              </div>

              <div className="dp-req-locations">
                <div className="dp-req-loc">
                  <div className="dp-dot pickup" />
                  <strong>{currentRide.pickupName || 'Current Location'}</strong>
                </div>
                <div className="dp-req-loc">
                  <div className="dp-dot dest" />
                  <strong>{currentRide.destName}</strong>
                </div>
              </div>

              <div className="dp-req-timer">
                Declines in <strong>{countdown}s</strong>
              </div>

              <div className="dp-req-actions">
                <button className="dp-btn-reject" onClick={handleDeclineRide}>
                  Decline
                </button>
                <button className="dp-btn-accept" onClick={handleAcceptRide}>
                  Accept Ride
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
