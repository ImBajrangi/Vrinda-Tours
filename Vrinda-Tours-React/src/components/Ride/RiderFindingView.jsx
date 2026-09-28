import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  X, Navigation, Clock, ShieldCheck, Phone, Star, ArrowRight, 
  User, MapPin, MessageSquare, Check, Radio, Users, ChevronRight,
  Shield, CheckCircle, Search
} from 'lucide-react';
import { calculateDistance, formatDistance } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { 
  fetchNearbyDrivers, 
  subscribeToLiveDrivers,
  claimDriverForRideAtomic
} from '../../services/realtimeDatabaseService';
import { searchAllPlacesAndAreas } from '../../services/geocodingService';
import './RiderFindingView.css';

/* Minimalist Uber-Style Vector Vehicle Icons */
function RickshawIcon({ className = "veh-icon" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 18L10 6C10.5 4.5 12 4 15 4H23C25.5 4 27 5.5 27.5 8L29 18H6Z" fill="#10B981" />
      <path d="M10 7H23C24.5 7 25.2 8 25.5 9.5L27 16H8L10 7Z" fill="#FFFFFF" fillOpacity="0.85" />
      <path d="M6 18H29V22C29 22.5 28.5 23 28 23H7C6.5 23 6 22.5 6 22V18Z" fill="#047857" />
      <circle cx="9" cy="24" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="26" cy="24" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}

function AutoIcon({ className = "veh-icon" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M7 17L11 5C11.5 4 13 3.5 16 3.5H23C25.5 3.5 27 5 27.5 7.5L29 17H7Z" fill="#F59E0B" />
      <path d="M10.5 6H23.5C24.8 6 25.4 7 25.8 8.5L27.2 15H8.5L10.5 6Z" fill="#FEF3C7" />
      <path d="M5 17H29V21.5C29 22.3 28.3 23 27.5 23H6.5C5.7 23 5 22.3 5 21.5V17Z" fill="#047857" />
      <circle cx="8.5" cy="24" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="25.5" cy="24" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}

function CabIcon({ className = "veh-icon" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 18C4 18 6 13.5 10 12.5C13 11.5 15 5.5 17 4.5C18.5 3.5 21 3.5 26 3.5C29.5 3.5 31.5 5.5 33 9L36 14C38.5 15 39.5 17 39.5 19V22C39.5 22.5 39 23 38.5 23H5C4.5 23 4 22.5 4 22V18Z" fill="#334155" transform="scale(0.8) translate(0, 4)" />
      <circle cx="9" cy="23" r="3.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="24" cy="23" r="3.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}

const VEHICLE_TIERS = [
  { 
    id: 'erickshaw', 
    name: 'Pilgrim E-Rickshaw', 
    shortName: 'E-Rickshaw', 
    description: 'Direct narrow temple alley access', 
    seats: 4, 
    baseFare: 40, 
    perKmRate: 12, 
    Icon: RickshawIcon,
    etaText: '2-4 min away'
  },
  { 
    id: 'auto', 
    name: 'Braj Auto Plus', 
    shortName: 'Auto Plus', 
    description: 'Fast 3-wheeler with luggage boot', 
    seats: 3, 
    baseFare: 60, 
    perKmRate: 15, 
    Icon: AutoIcon,
    etaText: '3-5 min away'
  },
  { 
    id: 'cab_prime', 
    name: 'Vrinda Cab Prime', 
    shortName: 'Cab Prime', 
    description: 'AC Sedan for Barsana & Govardhan', 
    seats: 4, 
    baseFare: 150, 
    perKmRate: 22, 
    Icon: CabIcon,
    etaText: '6-8 min away'
  }
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
      return { name: 'Current Location', lat: userPosition.lat, lng: userPosition.lng, isGps: true };
    }
    return { name: 'Vrindavan Center', lat: 27.5818, lng: 77.7010, isGps: false };
  });

  const [destLocation, setDestLocation] = useState(() => {
    if (destination?.lat && destination?.lng) return destination;
    return { name: 'Shri Bankey Bihari Mandir', lat: 27.580456, lng: 77.701103 };
  });

  const [selectedTierId, setSelectedTierId] = useState('erickshaw');
  const [stage, setStage] = useState('FINDING_DRIVERS'); // 'FINDING_DRIVERS' | 'TRIP_ACTIVE' | 'COMPLETED'
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState('destination');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [safetyPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [liveDriversList, setLiveDriversList] = useState([]);
  const [isClaimingRide, setIsClaimingRide] = useState(false);
  const [networkStatus, setNetworkStatus] = useState('LIVE_STREAMING');

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
        alert('This driver was just assigned to another nearby ride. Refreshing available fleet...');
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
      alert('No verified drivers with live GPS updates in the last 60 seconds. Please try again shortly.');
    }
  };

  return (
    <>
      <div className="ubr-overlay visible" onClick={triggerClose} aria-hidden="true" />

      <div className={`ubr-sheet visible ${isDragging ? 'is-dragging' : ''}`} style={sheetStyle}>
        {/* Top Drag Handle & Gesture Zone */}
        <div className="ubr-drag-zone" {...handleProps} title="Swipe down to dismiss">
          <div className="ubr-drag-pill" />
        </div>

        {/* ----------------------------------------------------------- */}
        {/* STAGE 1: FINDING & CHOOSING DRIVER                          */}
        {/* ----------------------------------------------------------- */}
        {stage === 'FINDING_DRIVERS' && (
          <div className="ubr-sheet-content">
            {/* Header with Title & Route */}
            <div className="ubr-sheet-header">
              <div>
                <h3 className="ubr-title">Choose a Ride</h3>
                <div className="ubr-status-line">
                  <span className="ubr-live-dot" />
                  <span className="ubr-subtitle">
                    {liveDriversList.length} verified {liveDriversList.length === 1 ? 'driver' : 'drivers'} nearby (GPS active)
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                className="ubr-icon-close-btn" 
                onClick={triggerClose}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Route Selector Card (Uber Style) */}
            <div className="ubr-route-card">
              <div className="ubr-route-track">
                <span className="ubr-stop-dot pickup" />
                <span className="ubr-stop-line" />
                <span className="ubr-stop-dot drop" />
              </div>
              <div className="ubr-route-stops">
                <button 
                  type="button"
                  className="ubr-stop-row" 
                  onClick={() => { setPickerTarget('pickup'); setIsPickerOpen(true); }}
                >
                  <span className="ubr-stop-tag">PICKUP</span>
                  <strong className="ubr-stop-name">{pickupLocation.name}</strong>
                </button>
                <div className="ubr-stop-divider" />
                <button 
                  type="button"
                  className="ubr-stop-row" 
                  onClick={() => { setPickerTarget('destination'); setIsPickerOpen(true); }}
                >
                  <span className="ubr-stop-tag">DESTINATION</span>
                  <strong className="ubr-stop-name destination">{destLocation.name}</strong>
                </button>
              </div>
              <div className="ubr-route-meta-badge">
                <Navigation size={12} />
                <span>{formatDistance(tripDistanceKm)}</span>
              </div>
            </div>

            {/* Vehicle Tier List (Uber Style Clean Cards) */}
            <div className="ubr-tier-list">
              {VEHICLE_TIERS.map(tier => {
                const isSelected = selectedTierId === tier.id;
                const fare = Math.round(tier.baseFare + (tripDistanceKm * tier.perKmRate));
                const TierIcon = tier.Icon;

                return (
                  <div
                    key={tier.id}
                    className={`ubr-tier-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedTierId(tier.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="ubr-tier-left">
                      <div className="ubr-veh-avatar">
                        <TierIcon className="ubr-veh-svg" />
                      </div>
                      <div className="ubr-tier-desc">
                        <div className="ubr-tier-heading">
                          <strong className="ubr-tier-name">{tier.shortName}</strong>
                          <span className="ubr-seat-badge">
                            <Users size={11} /> {tier.seats}
                          </span>
                        </div>
                        <div className="ubr-tier-sub">
                          <span>{tier.etaText}</span>
                          <span>•</span>
                          <span>{tier.description}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ubr-tier-price">
                      <strong>₹{fare}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Available Drivers List */}
            {liveDriversList.length > 0 && (
              <div className="ubr-drivers-section">
                <span className="ubr-section-title">ACTIVE SARATHI FLEET</span>
                <div className="ubr-drivers-scroll">
                  {liveDriversList.slice(0, 4).map(driver => (
                    <div key={driver.id} className="ubr-driver-row">
                      <div className="ubr-driver-avatar">
                        <User size={16} />
                        <span className="ubr-driver-online-dot" />
                      </div>
                      <div className="ubr-driver-info">
                        <div className="ubr-driver-name-row">
                          <strong>{driver.name}</strong>
                          <span className="ubr-driver-rating">★ {driver.rating}</span>
                        </div>
                        <span className="ubr-driver-details">
                          {driver.vehicleType} • {driver.vehicleNo}
                        </span>
                      </div>
                      <button 
                        type="button"
                        className="ubr-quick-book-btn"
                        disabled={isClaimingRide}
                        onClick={() => handleSelectDriverDirect(driver)}
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Sticky Primary CTA */}
            <div className="ubr-cta-wrap">
              <button 
                type="button"
                className="ubr-confirm-btn" 
                onClick={handleRequestRideCTA}
                disabled={isClaimingRide || liveDriversList.length === 0}
              >
                <span>{isClaimingRide ? 'Assigning Sarathi...' : `Request ${selectedTier.shortName}`}</span>
                <span className="ubr-btn-fare">₹{currentFare}</span>
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* STAGE 2: TRIP ACTIVE & LIVE TRACKING                        */}
        {/* ----------------------------------------------------------- */}
        {stage === 'TRIP_ACTIVE' && (
          <div className="ubr-sheet-content">
            <div className="ubr-active-card">
              <div className="ubr-active-header">
                <div>
                  <div className="ubr-live-tag">
                    <span className="ubr-pulse-indicator" />
                    <span>Sarathi On The Way</span>
                  </div>
                  <h4 className="ubr-active-sub">Meet at your pickup location</h4>
                </div>
                <div className="ubr-pin-badge">
                  <span className="ubr-pin-label">PIN</span>
                  <strong>{safetyPin}</strong>
                </div>
              </div>

              {assignedDriver && (
                <div className="ubr-assigned-driver-card">
                  <div className="ubr-driver-head">
                    <div className="ubr-driver-big-avatar">
                      <User size={22} />
                    </div>
                    <div>
                      <h4 className="ubr-assigned-name">{assignedDriver.name}</h4>
                      <span className="ubr-assigned-veh">
                        {assignedDriver.vehicleType} • {assignedDriver.vehicleNo}
                      </span>
                    </div>
                  </div>

                  <div className="ubr-contact-row">
                    <a href={`tel:${assignedDriver.phone}`} className="ubr-call-btn">
                      <Phone size={15} />
                      <span>Call Driver</span>
                    </a>
                    <a 
                      href={`https://wa.me/${assignedDriver.phone?.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ubr-wa-btn"
                    >
                      <MessageSquare size={15} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="ubr-trip-details-card">
                <div className="ubr-trip-row">
                  <span>Destination</span>
                  <strong>{destLocation.name}</strong>
                </div>
                <div className="ubr-trip-row">
                  <span>Total Fare</span>
                  <strong className="ubr-fare-amount">₹{currentFare} (Cash / UPI)</strong>
                </div>
              </div>

              <button 
                type="button" 
                className="ubr-cancel-ride-btn" 
                onClick={() => { onCancelRide?.(); setStage('FINDING_DRIVERS'); }}
              >
                Cancel Ride
              </button>
            </div>
          </div>
        )}

        {/* Location Picker Modal Overlay */}
        {isPickerOpen && (
          <div className="ubr-picker-overlay">
            <div className="ubr-picker-header">
              <h4>Choose {pickerTarget === 'pickup' ? 'Pickup Location' : 'Destination'}</h4>
              <button 
                type="button" 
                className="ubr-icon-close-btn" 
                onClick={() => setIsPickerOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="ubr-picker-search">
              <Search size={16} className="ubr-search-icon" />
              <input 
                type="text"
                placeholder="Search area, temple, station, ghat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className="ubr-clear-btn" 
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="ubr-picker-results">
              {searchResults.map(p => (
                <div 
                  key={p.id || p.name} 
                  className="ubr-picker-item"
                  onClick={() => {
                    if (pickerTarget === 'pickup') setPickupLocation(p);
                    else setDestLocation(p);
                    setIsPickerOpen(false);
                  }}
                >
                  <div className="ubr-picker-item-icon">
                    <MapPin size={16} />
                  </div>
                  <div className="ubr-picker-item-text">
                    <strong>{p.name}</strong>
                    <span>{p.town || 'Vrindavan'} • {p.category}</span>
                  </div>
                  {p.distanceText && (
                    <span className="ubr-picker-dist">{p.distanceText}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
