import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Phone, Navigation, Power, Car, Shield, Award, CheckCircle, 
  AlertTriangle, Clock, MapPin, User, LogOut, Check, ChevronRight, Zap
} from 'lucide-react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteField, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { calculateDistance, formatDistance } from '../../utils/distance';
import './DriverPortalModal.css';

export default function DriverPortalModal({ onClose, drivers = [] }) {
  const [driverId, setDriverId] = useState(() => sessionStorage.getItem('vt_driver_id'));
  const [driverData, setDriverData] = useState(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsText, setGpsText] = useState('GPS Inactive');
  const [onlineStartTime, setOnlineStartTime] = useState(null);
  const [onlineHoursText, setOnlineHoursText] = useState('0.0h');
  const [ridesCompletedToday, setRidesCompletedToday] = useState(0);
  
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
        // Registered driver deleted
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

    // REQUIREMENT: Only update Firestore if driver moved >= 15m OR >= 10s passed since last update
    if (!last.time || distMeters >= 15 || timeElapsedMs >= 10000) {
      lastLocationRef.current = { lat, lng, time: now };
      setGpsText(`📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      
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
      setGpsText('GPS not supported');
      return;
    }

    setGpsActive(true);
    setGpsText('Acquiring location...');

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading } = pos.coords;
        updateDriverLocationInFirestore(latitude, longitude, heading);
      },
      (err) => {
        setGpsText(`GPS Error: ${err.message}`);
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
    setGpsText('GPS Inactive');
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
      setLoginError('Please enter a valid 10-digit phone number');
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
        setLoginError('Phone number not registered. Contact admin to register your vehicle.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Connection error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 8. Ride Action Handlers
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
      await updateDoc(doc(firestore, 'drivers', driverId), {
        'currentRide.status': 'arrived'
      });
    } catch (err) {
      console.error('Error marking arrived:', err);
    }
  };

  const handleCompleteRide = async () => {
    if (!driverId) return;
    try {
      setRidesCompletedToday(prev => prev + 1);
      await updateDoc(doc(firestore, 'drivers', driverId), {
        status: 'available',
        currentRide: deleteField()
      });
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
  const rating = driverData?.rating || '4.9 ★';

  return (
    <>
      <div className="dp-modal-overlay" onClick={onClose} />

      <div className="dp-modal-container">
        <div className="dp-modal-header">
          <div className="dp-brand">
            <div className="dp-brand-logo-wrapper">
              <img src="/official-logo.svg" alt="Vrindopnishad" className="dp-brand-img" />
            </div>
            <div>
              <h2>Vrindopnishad Partner Companion</h2>
              <span className="dp-brand-sub">Pilgrim Fleet Driver Portal</span>
            </div>
          </div>
          <button className="dp-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {!driverId ? (
          /* LOGIN SCREEN WITH QUICK DEMO SELECTOR */
          <div className="dp-login-body">
            <div className="dp-login-hero">
              <div className="dp-hero-badge">
                <Shield size={14} /> Verified Fleet Network
              </div>
              <h3>Driver Sign In</h3>
              <p>Sign in with your registered mobile number or select your driver profile below to start receiving pilgrim rides.</p>
            </div>

            {/* Quick Demo Driver Selector Cards */}
            {drivers.length > 0 && (
              <div className="dp-quick-selector">
                <span className="dp-qs-title">QUICK DEMO DRIVER LOGIN</span>
                <div className="dp-qs-grid">
                  {drivers.map((d) => (
                    <div 
                      key={d.id} 
                      className="dp-qs-card"
                      onClick={() => {
                        sessionStorage.setItem('vt_driver_id', d.id);
                        setDriverId(d.id);
                        setDriverData(d);
                      }}
                    >
                      <div className="dp-qs-avatar">
                        {d.photo ? <img src={d.photo} alt={d.name} /> : (d.name || 'D')[0].toUpperCase()}
                      </div>
                      <div className="dp-qs-info">
                        <strong>{d.name}</strong>
                        <span>{d.vehicleType || 'E-Rickshaw'} • {d.vehicleNo || 'UP-85'}</span>
                      </div>
                      <button className="dp-qs-btn">Select</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="dp-login-form">
              <div className="dp-form-group">
                <label>Mobile Phone Number</label>
                <div className="dp-input-box">
                  <Phone size={18} color="#94a3b8" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="dp-login-error">
                  <AlertTriangle size={16} /> {loginError}
                </div>
              )}

              <button type="submit" className="dp-login-submit" disabled={isLoggingIn}>
                {isLoggingIn ? 'Verifying Credentials...' : 'Go to Dashboard'}
              </button>

              <div className="dp-login-hint">
                <span>Not registered as a driver yet?</span> Ask the fleet manager in Admin Panel to add your vehicle.
              </div>
            </form>
          </div>
        ) : (

          /* DRIVER DASHBOARD */
          <div className="dp-dash-body">
            {/* Driver Profile Bar */}
            <div className="dp-profile-card">
              <div className="dp-avatar">
                {driverData?.photo ? (
                  <img src={driverData.photo} alt={driverData.name} />
                ) : (
                  (driverData?.name || 'D')[0].toUpperCase()
                )}
                <span className={`dp-status-dot ${isOnline ? (currentRide ? 'busy' : 'online') : 'offline'}`} />
              </div>
              <div className="dp-profile-info">
                <h4>{driverData?.name || 'Driver'}</h4>
                <div className="dp-profile-tags">
                  <span className="dp-tag-vehicle">🛺 {vehicleType} ({vehicleNo})</span>
                  <span className="dp-tag-rating">{rating}</span>
                </div>
              </div>
              <button className="dp-logout-btn" onClick={handleLogout} title="Logout Driver">
                <LogOut size={16} /> Logout
              </button>
            </div>

            {/* Status Card & Online Toggle */}
            <div className={`dp-status-box ${isOnline ? (currentRide ? 'busy' : 'online') : 'offline'}`}>
              <div className="dp-status-indicator">
                {isOnline ? (currentRide ? '🚗' : '⚡') : '💤'}
              </div>
              <div className="dp-status-meta">
                <h3>{isOnline ? (currentRide ? 'On a Ride' : 'Online & Receiving Rides') : 'You are Offline'}</h3>
                <p>{isOnline ? 'Transmitting live GPS coordinates for pilgrim bookings' : 'Toggle the switch below to start receiving ride requests'}</p>
              </div>

              <button className={`dp-power-toggle ${isOnline ? 'active' : ''}`} onClick={toggleOnline}>
                <Power size={22} />
                <span>{isOnline ? 'GO OFFLINE' : 'GO ONLINE'}</span>
              </button>
            </div>

            {/* Performance Stats */}
            <div className="dp-stats-grid">
              <div className="dp-stat-card">
                <div className="dp-stat-val">{ridesCompletedToday}</div>
                <div className="dp-stat-lbl">Rides Today</div>
              </div>
              <div className="dp-stat-card">
                <div className="dp-stat-val">{onlineHoursText}</div>
                <div className="dp-stat-lbl">Hours Online</div>
              </div>
              <div className="dp-stat-card">
                <div className="dp-stat-val">{rating}</div>
                <div className="dp-stat-lbl">Pilgrim Rating</div>
              </div>
            </div>

            {/* Live GPS Telemetry */}
            <div className="dp-gps-bar">
              <div className={`dp-gps-pulse ${gpsActive ? 'active' : ''}`} />
              <div className="dp-gps-info">
                <Navigation size={14} />
                <span>{gpsText}</span>
              </div>
              <span className="dp-gps-rate">Throttled Stream (≥15m or 10s)</span>
            </div>

            {/* Active Ride Lifecycle Card (If Accepted or Arrived) */}
            {currentRide && (currentRide.status === 'accepted' || currentRide.status === 'arrived') && (
              <div className="dp-active-ride-card">
                <div className="dp-arc-header">
                  <span className="dp-arc-badge">
                    {currentRide.status === 'accepted' ? 'En Route to Pickup' : 'Arrived at Pickup'}
                  </span>
                  <span className="dp-arc-time"><Clock size={14} /> Active Trip</span>
                </div>

                <div className="dp-arc-route">
                  <div className="dp-arc-step">
                    <div className="dp-step-icon pickup"><MapPin size={16} /></div>
                    <div>
                      <span className="dp-step-lbl">PICKUP LOCATION</span>
                      <strong>{currentRide.pickupName || 'Pilgrim Location'}</strong>
                    </div>
                  </div>

                  <div className="dp-arc-step">
                    <div className="dp-step-icon dest"><ChevronRight size={16} /></div>
                    <div>
                      <span className="dp-step-lbl">DESTINATION</span>
                      <strong>{currentRide.destName}</strong>
                    </div>
                  </div>
                </div>

                <div className="dp-arc-actions">
                  {currentRide.status === 'accepted' ? (
                    <button className="dp-btn-arrive" onClick={handleMarkArrived}>
                      <CheckCircle size={18} /> Mark Arrived at Pickup
                    </button>
                  ) : (
                    <button className="dp-btn-complete" onClick={handleCompleteRide}>
                      <Zap size={18} /> Complete Ride
                    </button>
                  )}
                  <button className="dp-btn-cancel-ride" onClick={handleDeclineRide}>
                    Decline / Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Incoming Ride Request Overlay */}
        {currentRide && currentRide.status === 'requested' && (
          <div className="dp-req-overlay">
            <div className="dp-req-card">
              <div className="dp-req-header">
                <div className="dp-req-bell">🔔</div>
                <div>
                  <h4>New Ride Request!</h4>
                  <span>A pilgrim needs a ride in Vrindavan/Barsana</span>
                </div>
              </div>

              <div className="dp-req-locations">
                <div className="dp-req-loc">
                  <div className="dp-dot pickup" />
                  <div>
                    <label>Pickup Location</label>
                    <strong>{currentRide.pickupName || 'Pilgrim Location'}</strong>
                  </div>
                </div>

                <div className="dp-req-loc">
                  <div className="dp-dot dest" />
                  <div>
                    <label>Destination</label>
                    <strong>{currentRide.destName}</strong>
                  </div>
                </div>
              </div>

              <div className="dp-req-timer">
                <Clock size={14} /> Auto-declining in <strong>{countdown}s</strong>
              </div>

              <div className="dp-req-actions">
                <button className="dp-btn-reject" onClick={handleDeclineRide}>
                  Decline
                </button>
                <button className="dp-btn-accept" onClick={handleAcceptRide}>
                  Accept Ride Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
