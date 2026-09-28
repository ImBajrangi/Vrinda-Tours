import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  X, Navigation, Clock, ShieldCheck, Phone, Star, ArrowRight, 
  CheckCircle2, Zap, Tag, ChevronRight, User, Shield, 
  HeartHandshake, CreditCard, Banknote, Sparkles, Check, Copy, ChevronDown,
  ArrowUpDown, Search, MapPin, Share2, MessageSquare, Landmark,
  AlertCircle, UserCheck, Smartphone, Building, RefreshCw, Percent, Radio
} from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { 
  fetchNearbyDrivers, 
  subscribeToLiveDrivers,
  claimDriverForRideAtomic,
  isDriverDiscoverable
} from '../../services/realtimeDatabaseService';
import { searchAllPlacesAndAreas } from '../../services/geocodingService';
import './RiderFindingView.css';

/* Custom Vector Vehicle Graphics */
function ErickshawSvg() {
  return (
    <svg viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="ubr-veh-svg">
      <path d="M12 26L18 8C19 5.5 21 5 25 5H44C48 5 50 7 51 11L54 26H12Z" fill="#10b981" />
      <path d="M17 10H45C47 10 48 11.5 48.5 13.5L51.5 24H14.5L17 10Z" fill="#d1fae5" />
      <path d="M13 26L7 34H15" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 26H55" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="25" y="16" width="22" height="9" rx="2" fill="#047857" />
      <circle cx="12" cy="35" r="5.5" fill="#0f172a" />
      <circle cx="12" cy="35" r="2.2" fill="#f8fafc" />
      <circle cx="48" cy="35" r="5.5" fill="#0f172a" />
      <circle cx="48" cy="35" r="2.2" fill="#f8fafc" />
    </svg>
  );
}

function AutoSvg() {
  return (
    <svg viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="ubr-veh-svg">
      <path d="M13 25L19 7C20 5 22 4 26 4H43C47 4 49 6 50 10L53 25H13Z" fill="#f59e0b" />
      <path d="M17 9H44C46 9 47 10.5 47.5 12.5L50.5 23H15L17 9Z" fill="#fef3c7" />
      <path d="M10 25H55L53 32H12L10 25Z" fill="#047857" />
      <circle cx="12" cy="35" r="5.5" fill="#0f172a" />
      <circle cx="12" cy="35" r="2.2" fill="#f8fafc" />
      <circle cx="47" cy="35" r="5.5" fill="#0f172a" />
      <circle cx="47" cy="35" r="2.2" fill="#f8fafc" />
    </svg>
  );
}

function CabSvg() {
  return (
    <svg viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="ubr-veh-svg">
      <path d="M7 26C7 26 9 22 15 21C19 20 22 12 25 10C27 8.5 31 8.5 39 8.5C44 8.5 47 11 50 16L55 22C59 23 60 26 60 28V32C60 33 59 34 58 34H8C6.8 34 6 33 6 32V28C6 27 6.5 26 7 26Z" fill="#334155" />
      <circle cx="17" cy="34" r="5.2" fill="#0f172a" />
      <circle cx="48" cy="34" r="5.2" fill="#0f172a" />
    </svg>
  );
}

const VEHICLE_TIERS = [
  { id: 'erickshaw', name: 'Pilgrim E-Rickshaw', shortName: 'E-Rickshaw', tagline: 'Direct narrow alley entry', capacity: 4, baseFare: 40, perKmRate: 12, icon: ErickshawSvg },
  { id: 'auto', name: 'Braj Auto Plus', shortName: 'Auto Plus', tagline: 'Fast 3-wheeler with luggage space', capacity: 3, baseFare: 60, perKmRate: 15, icon: AutoSvg },
  { id: 'cab_prime', name: 'Vrinda Cab Prime', shortName: 'Cab Prime', tagline: 'AC Sedan for Govardhan & Barsana', capacity: 4, baseFare: 150, perKmRate: 22, icon: CabSvg }
];

export default function RiderFindingView({
  destination,
  userPosition,
  drivers = [],
  activeRide,
  onRequestRide,
  onCancelRide,
  onClose
}) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  // Locations State
  const [pickupLocation, setPickupLocation] = useState(() => {
    if (userPosition?.lat && userPosition?.lng) {
      return { name: 'Your Current GPS Location', lat: userPosition.lat, lng: userPosition.lng, isGps: true };
    }
    return { name: 'Vrindavan Center', lat: 27.5818, lng: 77.7010, isGps: false };
  });

  const [destLocation, setDestLocation] = useState(() => {
    if (destination?.lat && destination?.lng) return destination;
    return { name: 'Shri Bankey Bihari Mandir', lat: 27.580456, lng: 77.701103 };
  });

  const [selectedTierId, setSelectedTierId] = useState('erickshaw');
  const [stage, setStage] = useState('FINDING_DRIVERS'); // 'FINDING_DRIVERS' | 'MATCHING' | 'TRIP_ACTIVE' | 'COMPLETED'
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('destination');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [safetyPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [liveDriversList, setLiveDriversList] = useState([]);
  const [isClaimingRide, setIsClaimingRide] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('LIVE_STREAMING'); // 'LIVE_STREAMING' | 'RECONNECTING'

  // Sync real-time discoverable drivers from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadDrivers = async () => {
      try {
        const live = await fetchNearbyDrivers({
          userLat: pickupLocation.lat,
          userLng: pickupLocation.lng
        });
        if (isMounted) {
          setLiveDriversList(live);
          setNetworkStatus('LIVE_STREAMING');
        }
      } catch (err) {
        if (isMounted) setNetworkStatus('RECONNECTING');
      }
    };

    loadDrivers();
    const unsub = subscribeToLiveDrivers(() => {
      loadDrivers();
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [pickupLocation.lat, pickupLocation.lng]);

  // Sync external active ride
  useEffect(() => {
    if (activeRide?.status) {
      if (activeRide.status === 'completed') setStage('COMPLETED');
      else setStage('TRIP_ACTIVE');
      if (activeRide.driver) setAssignedDriver(activeRide.driver);
    }
  }, [activeRide]);

  // Trip Distance & Fare Calculation
  const tripDistanceKm = useMemo(() => {
    const d = calculateDistance(pickupLocation.lat, pickupLocation.lng, destLocation.lat, destLocation.lng);
    return Math.max(d, 0.8);
  }, [pickupLocation, destLocation]);

  const selectedTier = useMemo(() => {
    return VEHICLE_TIERS.find(t => t.id === selectedTierId) || VEHICLE_TIERS[0];
  }, [selectedTierId]);

  const currentFare = useMemo(() => {
    return Math.round(selectedTier.baseFare + (tripDistanceKm * selectedTier.perKmRate));
  }, [selectedTier, tripDistanceKm]);

  // Handle Location Search in Picker
  useEffect(() => {
    if (!isPickerOpen) return;
    const fetchPlaces = async () => {
      const places = await searchAllPlacesAndAreas(searchQuery, userPosition);
      setSearchResults(places);
    };
    fetchPlaces();
  }, [searchQuery, isPickerOpen, userPosition]);

  // Handle Atomic Driver Dispatch
  const handleSelectDriverDirect = async (driver) => {
    if (isClaimingRide) return;
    setIsClaimingRide(true);

    const rideId = `VT-RIDE-${Date.now()}`;

    try {
      // Execute Atomic Database Claim to prevent race conditions
      const claimResult = await claimDriverForRideAtomic({
        rideId,
        driverId: driver.id,
        passengerName: 'Pilgrim Devotee',
        pickupLoc: pickupLocation.name,
        pickupLat: pickupLocation.lat,
        pickupLng: pickupLocation.lng,
        dropLoc: destLocation.name,
        dropLat: destLocation.lat,
        dropLng: destLocation.lng,
        distanceKm: tripDistanceKm,
        fare: currentFare,
        tier: selectedTierId,
        safetyPin
      });

      if (claimResult && claimResult.success === false && claimResult.error === 'DRIVER_ALREADY_BUSY') {
        alert('⚠️ That driver was just assigned to another nearby devotee. Refreshing available fleet...');
        const fresh = await fetchNearbyDrivers({ userLat: pickupLocation.lat, userLng: pickupLocation.lng });
        setLiveDriversList(fresh);
        setIsClaimingRide(false);
        return;
      }

      setAssignedDriver(driver);
      setStage('TRIP_ACTIVE');
      onRequestRide?.(driver, {
        rideId,
        tier: selectedTierId,
        fare: currentFare,
        safetyPin,
        pickupName: pickupLocation.name,
        destName: destLocation.name,
        distanceKm: tripDistanceKm
      });
    } catch (err) {
      console.warn('Ride claim fallback:', err);
      setAssignedDriver(driver);
      setStage('TRIP_ACTIVE');
    } finally {
      setIsClaimingRide(false);
    }
  };

  const handleRequestRideCTA = () => {
    if (liveDriversList.length > 0) {
      handleSelectDriverDirect(liveDriversList[0]);
    } else {
      alert('Currently no verified drivers are discoverable with live GPS. Please try again in 30 seconds.');
    }
  };

  return (
    <>
      <div className="rf-overlay visible" onClick={triggerClose} />

      <div className={`rf-sheet visible ${isDragging ? 'dragging' : ''}`} style={sheetStyle}>
        {/* Top Handle */}
        <div className="rf-handle-wrapper" {...handleProps} title="Drag down to dismiss">
          <div className="rf-handle" />
        </div>

        {/* ----------------------------------------------------------- */}
        {/* STAGE 1: FINDING & CHOOSING DRIVER                          */}
        {/* ----------------------------------------------------------- */}
        {stage === 'FINDING_DRIVERS' && (
          <div className="rf-stage-layout">
            {/* Header with Title & Route */}
            <div className="rf-header-top">
              <div className="rf-brand-row">
                <ErickshawSvg />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0 }}>Find Nearby Sarathi</h3>
                    <span 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '0.68rem', 
                        padding: '1px 6px', 
                        borderRadius: '6px',
                        background: networkStatus === 'LIVE_STREAMING' ? '#dcfce7' : '#fef3c7',
                        color: networkStatus === 'LIVE_STREAMING' ? '#15803d' : '#b45309',
                        fontWeight: 700 
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                      {networkStatus === 'LIVE_STREAMING' ? 'Live GPS' : 'Connecting'}
                    </span>
                  </div>
                  <span>{liveDriversList.length} verified drivers live near you (GPS &lt;60s)</span>
                </div>
              </div>
              <button className="rf-close-btn" onClick={triggerClose}>
                <X size={16} />
              </button>
            </div>

            {/* Route Selector Capsule */}
            <div className="rf-route-box">
              <div className="rf-route-timeline">
                <span className="rf-dot pickup" />
                <span className="rf-line" />
                <span className="rf-dot dest" />
              </div>
              <div className="rf-route-inputs">
                <div 
                  className="rf-route-stop-input" 
                  onClick={() => { setPickerTarget('pickup'); setIsPickerOpen(true); }}
                >
                  <span className="rf-stop-lbl">PICKUP</span>
                  <strong>{pickupLocation.name}</strong>
                </div>
                <div className="rf-divider" />
                <div 
                  className="rf-route-stop-input" 
                  onClick={() => { setPickerTarget('destination'); setIsPickerOpen(true); }}
                >
                  <span className="rf-stop-lbl">DESTINATION</span>
                  <strong className="dest-highlight">{destLocation.name}</strong>
                </div>
              </div>
              <div className="rf-route-badge">
                <Navigation size={11} />
                <span>{formatDistance(tripDistanceKm)}</span>
              </div>
            </div>

            {/* Vehicle Tier Horizontal Selector */}
            <div className="rf-tier-pills">
              {VEHICLE_TIERS.map(tier => {
                const IconComp = tier.icon;
                const isSelected = selectedTierId === tier.id;
                const fare = Math.round(tier.baseFare + (tripDistanceKm * tier.perKmRate));

                return (
                  <button
                    key={tier.id}
                    className={`rf-tier-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedTierId(tier.id)}
                  >
                    <div className="rf-tier-icon-wrap">
                      <IconComp />
                    </div>
                    <div className="rf-tier-info">
                      <strong>{tier.shortName}</strong>
                      <span>₹{fare}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Available Drivers List */}
            <div className="rf-drivers-section">
              <span className="rf-section-title">VERIFIED ACTIVE FLEET</span>
              
              <div className="rf-driver-cards-list">
                {liveDriversList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b', fontSize: '0.84rem' }}>
                    <Clock size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                    <strong style={{ display: 'block', color: '#1e293b' }}>Searching for active Sarathi drivers...</strong>
                    <span>Drivers must have live GPS updated within 60s to appear here.</span>
                  </div>
                ) : (
                  liveDriversList.map(driver => (
                    <div key={driver.id} className="rf-driver-card">
                      <div className="rf-dc-avatar">
                        <User size={18} />
                        <span className="rf-dc-status-dot online" />
                      </div>

                      <div className="rf-dc-details">
                        <div className="rf-dc-name-row">
                          <strong>{driver.name}</strong>
                          <span className="rf-dc-rating">★ {driver.rating}</span>
                        </div>
                        <div className="rf-dc-sub">
                          <span>{driver.vehicleType}</span>
                          <span>•</span>
                          <span>{driver.vehicleNo}</span>
                        </div>
                        <div className="rf-dc-eta">
                          <Clock size={11} />
                          <span>{driver._distanceText} away • {driver._etaText || '~5-8 min arrival'}</span>
                        </div>
                      </div>

                      <button 
                        className="rf-dc-request-btn"
                        disabled={isClaimingRide}
                        onClick={() => handleSelectDriverDirect(driver)}
                      >
                        <span>₹{currentFare}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Sticky Action */}
            <div className="rf-dock-footer">
              <button 
                className="rf-primary-cta" 
                onClick={handleRequestRideCTA}
                disabled={isClaimingRide || liveDriversList.length === 0}
              >
                <span>{isClaimingRide ? 'Assigning Sarathi...' : `Request ${selectedTier.shortName}`}</span>
                <span className="rf-cta-fare">₹{currentFare}</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STAGE 2: TRIP ACTIVE & LIVE TRACKING                        */}
        {/* ----------------------------------------------------------- */}
        {stage === 'TRIP_ACTIVE' && (
          <div className="rf-active-stage">
            <div className="rf-active-banner">
              <div className="rf-live-badge">
                <span className="rf-pulse-dot" />
                <span>Sarathi Dispatched & On The Way</span>
              </div>
              <div className="rf-pin-box">
                <span className="rf-pin-lbl">SAFETY PIN</span>
                <strong>{safetyPin}</strong>
                <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Share with driver</span>
              </div>
            </div>

            {assignedDriver && (
              <div className="rf-active-driver-card">
                <div className="rf-adc-header">
                  <div className="rf-dc-avatar">
                    <User size={22} />
                  </div>
                  <div>
                    <h4>{assignedDriver.name}</h4>
                    <span>{assignedDriver.vehicleType} • {assignedDriver.vehicleNo}</span>
                  </div>
                </div>

                <div className="rf-adc-actions">
                  <a href={`tel:${assignedDriver.phone}`} className="rf-adc-btn call">
                    <Phone size={14} />
                    <span>Call Sarathi</span>
                  </a>
                  <a 
                    href={`https://wa.me/${assignedDriver.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="rf-adc-btn whatsapp"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            <div className="rf-active-trip-meta">
              <div className="rf-atm-row">
                <span>Destination</span>
                <strong>{destLocation.name}</strong>
              </div>
              <div className="rf-atm-row">
                <span>Trip Fare</span>
                <strong className="fare">₹{currentFare} (Cash / UPI)</strong>
              </div>
            </div>

            <button className="rf-cancel-btn" onClick={() => { onCancelRide?.(); setStage('FINDING_DRIVERS'); }}>
              Cancel Ride
            </button>
          </div>
        )}

        {/* Location Picker Overlay */}
        {isPickerOpen && (
          <div className="rf-picker-overlay">
            <div className="rf-picker-header">
              <h4>Choose {pickerTarget === 'pickup' ? 'Pickup Location' : 'Destination'}</h4>
              <button className="rf-close-btn" onClick={() => setIsPickerOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="rf-picker-search-bar">
              <Search size={16} />
              <input 
                type="text"
                placeholder="Search area, temple, station, ghat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="rf-picker-list">
              {searchResults.map(p => (
                <div 
                  key={p.id || p.name} 
                  className="rf-picker-item"
                  onClick={() => {
                    if (pickerTarget === 'pickup') setPickupLocation(p);
                    else setDestLocation(p);
                    setIsPickerOpen(false);
                  }}
                >
                  <MapPin size={16} className="rf-pi-icon" />
                  <div>
                    <strong>{p.name}</strong>
                    <span>{p.subtitle || p.category}</span>
                  </div>
                  {p.distanceText && <span className="rf-pi-dist">{p.distanceText}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
