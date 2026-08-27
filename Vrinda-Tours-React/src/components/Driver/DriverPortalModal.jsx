import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, Phone, Navigation, Power, Shield, MapPin, 
  LogOut, ChevronRight, Zap, CheckCircle2, Clock, Search, Star
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

  const vehicleType = driverData?.vehicleType || 'E-Rickshaw';
  const vehicleNo = driverData?.vehicleNo || 'UP-85 VT 2026';
  const rating = driverData?.rating || '4.9';

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
