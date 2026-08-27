import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  X, Navigation, Clock, ShieldCheck, Phone, Star, ArrowRight, 
  CheckCircle2, Zap, Tag, ChevronRight, User, Shield, 
  HeartHandshake, CreditCard, Banknote, Sparkles, Check, Copy, ChevronDown,
  ArrowUpDown, Search, MapPin
} from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { locations } from '../../data/locations';
import { BRAJ_TOWNS } from '../../data/brajTowns';
import './InstantRideModal.css';

/* ==========================================================================
   HIGH-END VECTOR VEHICLE ASSETS (Zero Emoji, Retina Vector Graphic)
   ========================================================================== */

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
      <path d="M28 20L25 24H29L27 28" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <circle cx="9" cy="26" r="2" fill="#fbbf24" />
    </svg>
  );
}

function CabSvg() {
  return (
    <svg viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="ubr-veh-svg">
      <path d="M7 26C7 26 9 22 15 21C19 20 22 12 25 10C27 8.5 31 8.5 39 8.5C44 8.5 47 11 50 16L55 22C59 23 60 26 60 28V32C60 33 59 34 58 34H8C6.8 34 6 33 6 32V28C6 27 6.5 26 7 26Z" fill="#334155" />
      <path d="M25 11.5C27 10 30 10 36 10V20H18.5C20.5 15 23 13 25 11.5Z" fill="#94a3b8" opacity="0.6" />
      <path d="M38 10C43 10 45.5 12 48 17L51.5 20H38V10Z" fill="#94a3b8" opacity="0.6" />
      <circle cx="17" cy="34" r="5.2" fill="#0f172a" />
      <circle cx="17" cy="34" r="2" fill="#cbd5e1" />
      <circle cx="48" cy="34" r="5.2" fill="#0f172a" />
      <circle cx="48" cy="34" r="2" fill="#cbd5e1" />
      <path d="M6 28H9" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
      <path d="M59 28H56" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TempoSvg() {
  return (
    <svg viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="ubr-veh-svg">
      <path d="M7 11C7 8.5 9 7 12 7H49C53 7 56 10 57 14L59 25C60 27 60 29 60 32V33C60 34 59 35 58 35H7C5.5 35 5 34 5 33V13C5 12 6 11 7 11Z" fill="#475569" />
      <rect x="10" y="10" width="8" height="8" rx="1.5" fill="#cbd5e1" opacity="0.8" />
      <rect x="21" y="10" width="8" height="8" rx="1.5" fill="#cbd5e1" opacity="0.8" />
      <rect x="32" y="10" width="8" height="8" rx="1.5" fill="#cbd5e1" opacity="0.8" />
      <path d="M43 10H50C52 10 53.5 11.5 54 13.5L55.5 18H43V10Z" fill="#cbd5e1" opacity="0.8" />
      <circle cx="15" cy="35" r="5.2" fill="#0f172a" />
      <circle cx="15" cy="35" r="2" fill="#f8fafc" />
      <circle cx="47" cy="35" r="5.2" fill="#0f172a" />
      <circle cx="47" cy="35" r="2" fill="#f8fafc" />
      <path d="M5 24H59" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RouteTimelineSvg() {
  return (
    <svg 
      width="14" 
      height="42" 
      viewBox="0 0 14 42" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="ubr-timeline-svg"
    >
      {/* Origin Emerald Circle with subtle outer halo */}
      <circle cx="7" cy="7" r="5" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.25" />
      <circle cx="7" cy="7" r="3.5" fill="#10b981" />

      {/* Continuous Connecting Line */}
      <line x1="7" y1="12" x2="7" y2="30" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2.5 2.5" />

      {/* Destination Deep Slate Square */}
      <rect x="3.5" y="30" width="7" height="7" rx="1.5" fill="#0f172a" />
    </svg>
  );
}

// 4 Distinct Braj Pilgrimage Vehicle Categories
const VEHICLE_TIERS = [
  {
    id: 'erickshaw',
    name: 'Pilgrim E-Rickshaw',
    shortName: 'E-Rickshaw',
    tagline: 'Direct entry into narrow temple alleys',
    capacity: 4,
    baseFare: 40,
    perKmRate: 12,
    baseEtaMins: 2,
    badge: 'Popular',
    iconComponent: ErickshawSvg
  },
  {
    id: 'auto',
    name: 'Braj Auto Plus',
    shortName: 'Auto Plus',
    tagline: 'Quick 3-wheeler with luggage space',
    capacity: 3,
    baseFare: 60,
    perKmRate: 15,
    baseEtaMins: 4,
    badge: null,
    iconComponent: AutoSvg
  },
  {
    id: 'cab_prime',
    name: 'Vrinda Cab Prime',
    shortName: 'Cab Prime',
    tagline: 'AC sedan for Govardhan & Barsana yatra',
    capacity: 4,
    baseFare: 150,
    perKmRate: 22,
    baseEtaMins: 6,
    badge: 'AC Comfort',
    iconComponent: CabSvg
  },
  {
    id: 'tempo_yatra',
    name: '84 Kos Yatra Tempo',
    shortName: 'Yatra Tempo',
    tagline: 'Spacious coach for group parikrama',
    capacity: 10,
    baseFare: 350,
    perKmRate: 35,
    baseEtaMins: 8,
    badge: 'Group',
    iconComponent: TempoSvg
  }
];

const POPULAR_COUPONS = [
  { code: 'RADHE', discount: 20, label: '₹20 OFF' },
  { code: 'VRINDA20', discount: 20, label: '₹20 OFF' },
  { code: 'YATRA50', discount: 50, label: '₹50 OFF' }
];

const QUICK_DESTINATIONS = [
  { name: 'Bankey Bihari Mandir', lat: 27.580456, lng: 77.701103, tag: 'Vrindavan' },
  { name: 'Prem Mandir', lat: 27.572000, lng: 77.672000, tag: 'Vrindavan' },
  { name: 'Shri Radha Rani Temple', lat: 27.650261, lng: 77.373287, tag: 'Barsana' },
  { name: 'Radha Kund & Shyam Kund', lat: 27.525500, lng: 77.495000, tag: 'Govardhan' },
  { name: 'Krishna Janmabhoomi', lat: 27.505000, lng: 77.682000, tag: 'Mathura' },
  { name: 'Shri Radha Raman Mandir', lat: 27.584321, lng: 77.704512, tag: 'Vrindavan' },
  { name: 'Govardhan Daan Ghati', lat: 27.498000, lng: 77.465000, tag: 'Govardhan' },
  { name: 'Nidhivan Sacred Grove', lat: 27.582500, lng: 77.701800, tag: 'Vrindavan' }
];

export default function InstantRideModal({
  destination,
  userPosition,
  drivers = [],
  activeRide,
  onRequestRide,
  onCancelRide,
  onClose
}) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

  // 1. Dynamic Real-time Pickup & Destination State
  const [pickupLocation, setPickupLocation] = useState(() => {
    if (userPosition?.lat && userPosition?.lng) {
      return { name: 'Current GPS Location', lat: userPosition.lat, lng: userPosition.lng, isGps: true };
    }
    return { name: 'Vrindavan Railway Station', lat: 27.5755, lng: 77.6948, isGps: false };
  });

  const [destLocation, setDestLocation] = useState(() => {
    if (destination?.lat && destination?.lng) {
      return destination;
    }
    return { name: 'Shri Bankey Bihari Mandir', lat: 27.580456, lng: 77.701103 };
  });

  // Location search modal / popover state
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [pickingTarget, setPickingTarget] = useState('destination'); // 'pickup' | 'destination'
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Sync external destination updates
  useEffect(() => {
    if (destination?.lat && destination?.lng) {
      setDestLocation(destination);
    }
  }, [destination]);

  // Sync real-time browser GPS location
  useEffect(() => {
    if (userPosition?.lat && userPosition?.lng) {
      setPickupLocation(prev => {
        if (prev.isGps || prev.name.includes('GPS')) {
          return { name: 'Current GPS Location', lat: userPosition.lat, lng: userPosition.lng, isGps: true };
        }
        return prev;
      });
    }
  }, [userPosition?.lat, userPosition?.lng]);

  // Real-time trip distance calculation
  const tripDistanceKm = useMemo(() => {
    const d = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      destLocation.lat,
      destLocation.lng
    );
    return Math.max(d, 0.8);
  }, [pickupLocation.lat, pickupLocation.lng, destLocation.lat, destLocation.lng]);

  // 2. Active Available Drivers Count & Sorting from Firebase
  const availableDrivers = useMemo(() => {
    return (drivers || [])
      .filter(d => (d.status === 'available' || !d.status) && d.location?.lat)
      .map(d => {
        const dist = calculateDistance(pickupLocation.lat, pickupLocation.lng, d.location.lat, d.location.lng);
        return {
          ...d,
          _distance: dist,
          _distanceText: formatDistance(dist),
          _eta: calculateETA(dist)
        };
      })
      .sort((a, b) => a._distance - b._distance);
  }, [drivers, pickupLocation.lat, pickupLocation.lng]);

  // Nearest driver distance for live ETA
  const nearestDriverDist = availableDrivers[0]?._distance || 1.2;
  const getDynamicTierEta = useCallback((tier) => {
    return Math.max(1, Math.round(nearestDriverDist * 2.2 + tier.baseEtaMins));
  }, [nearestDriverDist]);

  // 3. UI Flow Stages: 'SELECT_TIER' | 'SEARCHING_RADAR' | 'TRIP_ACTIVE' | 'TRIP_COMPLETED'
  const [stage, setStage] = useState(() => {
    if (activeRide?.status && activeRide.status !== 'completed') return 'TRIP_ACTIVE';
    return 'SELECT_TIER';
  });

  const [selectedTierId, setSelectedTierId] = useState('erickshaw');
  const [paymentMethod, setPaymentMethod] = useState('cash_upi');
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [safetyPin] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [searchTimer, setSearchTimer] = useState(45);
  const [searchStepText, setSearchStepText] = useState('Connecting with verified Braj drivers...');
  const [matchedCandidate, setMatchedCandidate] = useState(null);
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCompliments, setSelectedCompliments] = useState([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Sync state if activeRide prop changes externally
  useEffect(() => {
    if (activeRide?.status) {
      if (activeRide.status === 'completed') {
        setStage('TRIP_COMPLETED');
      } else {
        setStage('TRIP_ACTIVE');
      }
    }
  }, [activeRide?.status]);

  // Radar searching countdown & dynamic ticker
  useEffect(() => {
    let interval;
    if (stage === 'SEARCHING_RADAR') {
      interval = setInterval(() => {
        setSearchTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            const bestDriver = availableDrivers[0] || {
              id: 'drv_demo_vrinda',
              name: 'Shyam Sundar Sharma',
              phone: '+91 98765 43210',
              vehicleType: 'Pilgrim E-Rickshaw',
              vehicleNo: 'UP-85-BV-1008',
              rating: 4.9,
              photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
            };
            setMatchedCandidate(bestDriver);
            onRequestRide(bestDriver, {
              tier: selectedTierId,
              fare: currentFare,
              paymentMethod,
              safetyPin,
              pickupName: pickupLocation.name,
              pickupLat: pickupLocation.lat,
              pickupLng: pickupLocation.lng,
              destName: destLocation.name,
              destLat: destLocation.lat,
              destLng: destLocation.lng,
              distanceKm: tripDistanceKm
            });
            setStage('TRIP_ACTIVE');
            return 0;
          }
          
          if (prev === 40) setSearchStepText(`Checking drivers near ${destLocation?.name || 'Vrindavan'}...`);
          if (prev === 28) setSearchStepText('Locking upfront fare with zero surge...');
          if (prev === 16) setSearchStepText('Securing your 4-digit Safety PIN...');
          if (prev === 5) setSearchStepText('Finalizing dispatch & driver arrival...');

          return prev - 1;
        });
      }, 1000);
    } else {
      setSearchTimer(45);
      setSearchStepText('Connecting with verified Braj drivers...');
    }
    return () => clearInterval(interval);
  }, [stage, availableDrivers, onRequestRide, selectedTierId, paymentMethod, safetyPin, destLocation?.name, pickupLocation, tripDistanceKm, currentFare]);

  // Selected Tier object
  const selectedTier = useMemo(() => {
    return VEHICLE_TIERS.find(t => t.id === selectedTierId) || VEHICLE_TIERS[0];
  }, [selectedTierId]);

  // Calculate Dynamic Fare
  const currentFare = useMemo(() => {
    const rawFare = Math.round(selectedTier.baseFare + (tripDistanceKm * selectedTier.perKmRate));
    return Math.max(rawFare - appliedDiscount, 20);
  }, [selectedTier, tripDistanceKm, appliedDiscount]);

  // Combined searchable locations list for real-time picker
  const allSearchableLocations = useMemo(() => {
    const standardPickups = [
      { name: 'Current GPS Location', lat: userPosition?.lat || 27.646, lng: userPosition?.lng || 77.377, category: 'GPS Live' },
      { name: 'Vrindavan Railway Station', lat: 27.5755, lng: 77.6948, category: 'Station' },
      { name: 'Mathura Junction Railway Station', lat: 27.4924, lng: 77.6737, category: 'Station' },
      { name: 'Chhatikara Road Entrance (NH-19)', lat: 27.5785, lng: 77.6592, category: 'Entry' },
      { name: 'Barsana Main Bus Stand', lat: 27.6445, lng: 77.3735, category: 'Station' },
      { name: 'Govardhan Daan Ghati Stand', lat: 27.4985, lng: 77.4645, category: 'Station' }
    ];

    const mappedLocations = (locations || []).map(l => ({
      name: l.name,
      lat: l.lat,
      lng: l.lng,
      category: l.category || 'Sacred Site'
    }));

    const mappedTowns = (BRAJ_TOWNS || []).map(t => ({
      name: `${t.name} Town Center`,
      lat: t.center?.[0] || 27.5818,
      lng: t.center?.[1] || 77.7010,
      category: 'Town'
    }));

    return [...standardPickups, ...mappedLocations, ...mappedTowns];
  }, [userPosition?.lat, userPosition?.lng]);

  const filteredPickerLocations = useMemo(() => {
    if (!locationSearchQuery.trim()) return allSearchableLocations.slice(0, 16);
    const q = locationSearchQuery.toLowerCase();
    return allSearchableLocations.filter(loc => 
      loc.name.toLowerCase().includes(q) || 
      loc.category.toLowerCase().includes(q)
    );
  }, [allSearchableLocations, locationSearchQuery]);

  // Handle Promo Code Apply
  const handleApplyPromo = (overrideCode) => {
    setPromoError('');
    setPromoSuccess('');
    const code = (overrideCode || promoCode).trim().toUpperCase();
    if (!code) return;

    if (overrideCode) setPromoCode(overrideCode);

    if (code === 'RADHE' || code === 'VRINDA20' || code === 'SEVA') {
      setAppliedDiscount(20);
      setPromoSuccess(`₹20 Discount Applied (${code})`);
      setIsPromoOpen(false);
    } else if (code === 'YATRA50') {
      if (currentFare >= 100) {
        setAppliedDiscount(50);
        setPromoSuccess('₹50 Discount Applied!');
        setIsPromoOpen(false);
      } else {
        setPromoError('Valid for fares over ₹100.');
      }
    } else {
      setPromoError('Invalid coupon. Try RADHE for ₹20 off.');
    }
  };

  const handleStartInstantBooking = () => {
    setStage('SEARCHING_RADAR');
    setSearchTimer(45);
  };

  const handleCancel = () => {
    if (stage === 'SEARCHING_RADAR') {
      setStage('SELECT_TIER');
    } else if (stage === 'TRIP_ACTIVE') {
      if (window.confirm('Are you sure you want to cancel your ride request?')) {
        onCancelRide?.();
        setStage('SELECT_TIER');
      }
    } else {
      triggerClose();
    }
  };

  const handleSwapLocations = (e) => {
    e.stopPropagation();
    const temp = pickupLocation;
    setPickupLocation(destLocation);
    setDestLocation(temp);
  };

  const handleOpenPicker = (target) => {
    setPickingTarget(target);
    setLocationSearchQuery('');
    setIsLocationPickerOpen(true);
  };

  const handleSelectLocationFromPicker = (loc) => {
    if (pickingTarget === 'pickup') {
      setPickupLocation({
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
        isGps: loc.category === 'GPS Live'
      });
    } else {
      setDestLocation({
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng
      });
    }
    setIsLocationPickerOpen(false);
  };

  const copyPinToClipboard = () => {
    navigator.clipboard?.writeText(safetyPin);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const activeDriver = activeRide?.driver || matchedCandidate || availableDrivers[0];

  const COMPLIMENT_TAGS = [
    '✨ Sacred Lore Storyteller',
    '🛺 Smooth & Safe Drive',
    '🙏 Polite & Devoted',
    '⭐ Clean Rickshaw',
    '⚡ Super Fast Arrival',
    '🚩 Great Braj Guide'
  ];

  const toggleCompliment = (tag) => {
    setSelectedCompliments(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getPaymentLabel = () => {
    if (paymentMethod === 'cash_upi') return 'Cash / UPI';
    if (paymentMethod === 'card_stripe') return 'Card / Online';
    return 'Yatra Points';
  };

  return (
    <>
      <div className="ubr-overlay visible" onClick={handleCancel} />
      
      <div 
        className={`ubr-sheet visible ${isDragging ? 'dragging' : ''}`}
        style={sheetStyle}
      >
        {/* Grab Handle */}
        <div className="ubr-handle-wrapper" {...handleProps} title="Drag down to dismiss">
          <div className="ubr-handle" />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STAGE 1: TIER SELECTION (UBER / LYFT MINIMALIST LUXURY)      */}
        {/* ------------------------------------------------------------- */}
        {stage === 'SELECT_TIER' && (
          <div className="ubr-stage-layout">
            
            {/* Header: Interactive Real-Time Route Capsule */}
            <div className="ubr-header">
              <div className="ubr-route-capsule">
                {/* Left: Continuous Connected Vector Route Timeline */}
                <RouteTimelineSvg />

                {/* Center: Interactive Location Names */}
                <div className="ubr-route-info">
                  <div 
                    className="ubr-route-stop clickable" 
                    onClick={() => handleOpenPicker('pickup')}
                    title="Click to change pickup location"
                  >
                    <span className="ubr-stop-name">{pickupLocation?.name || 'Current GPS Location'}</span>
                    <span className="ubr-stop-edit-hint">Change</span>
                  </div>
                  <div className="ubr-route-divider-line" />
                  <div 
                    className="ubr-route-stop clickable" 
                    onClick={() => handleOpenPicker('destination')}
                    title="Click to change destination temple"
                  >
                    <strong className="ubr-stop-name destination">{destLocation?.name || 'Select Temple'}</strong>
                    <span className="ubr-stop-edit-hint">Change</span>
                  </div>
                </div>

                {/* Swap Button */}
                <button 
                  type="button" 
                  className="ubr-route-swap-btn"
                  onClick={handleSwapLocations}
                  title="Reverse pickup & destination"
                  aria-label="Reverse route"
                >
                  <ArrowUpDown size={14} />
                </button>

                {/* Right: Crisp Distance Badge */}
                <div className="ubr-route-metric">
                  <Navigation size={10} className="ubr-metric-arrow" />
                  <span>{formatDistance(tripDistanceKm)}</span>
                </div>
              </div>

              <button className="ubr-close-btn" onClick={triggerClose} title="Close" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            {/* Quick Braj Temples Horizontal Scrollbar */}
            <div className="ubr-quick-temples-row">
              <span className="ubr-quick-label">Temples:</span>
              <div className="ubr-quick-chips-scroll">
                {QUICK_DESTINATIONS.map((qd, idx) => {
                  const isCur = destLocation?.name?.toLowerCase().includes(qd.name.toLowerCase().split(' ')[0]);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`ubr-quick-chip ${isCur ? 'active' : ''}`}
                      onClick={() => setDestLocation(qd)}
                    >
                      {qd.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Vehicle Tier List */}
            <div className="ubr-scroll-body">
              <div className="ubr-section-heading-row">
                <span className="ubr-section-title">CHOOSE A RIDE</span>
                <span className="ubr-fleet-status">
                  <span className="ubr-live-dot" />
                  {availableDrivers.length > 0 ? `${availableDrivers.length} drivers nearby` : 'Live Fleet Online'}
                </span>
              </div>

              <div className="ubr-tier-list">
                {VEHICLE_TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const rawTierFare = Math.round(tier.baseFare + (tripDistanceKm * tier.perKmRate));
                  const estimatedFare = Math.max(rawTierFare - appliedDiscount, 20);
                  const dynamicEta = getDynamicTierEta(tier);
                  const etaText = `${dynamicEta} mins away`;
                  const IconComp = tier.iconComponent;

                  return (
                    <div
                      key={tier.id}
                      className={`ubr-tier-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTierId(tier.id)}
                    >
                      {/* Left: Custom SVG Vector Vehicle */}
                      <div className="ubr-tier-visual">
                        <IconComp />
                      </div>

                      {/* Center: Clean Typography */}
                      <div className="ubr-tier-details">
                        <div className="ubr-tier-primary-line">
                          <strong className="ubr-tier-title">{tier.name}</strong>
                          <span className="ubr-tier-seats">
                            <User size={11} strokeWidth={2.5} />
                            {tier.capacity}
                          </span>
                          {tier.badge && (
                            <span className="ubr-badge-pill">{tier.badge}</span>
                          )}
                        </div>
                        <div className="ubr-tier-secondary-line">
                          <span className="ubr-eta-text">{etaText}</span>
                          <span className="ubr-bullet">•</span>
                          <span className="ubr-tagline-text">{tier.tagline}</span>
                        </div>
                      </div>

                      {/* Right: Bold Price Column */}
                      <div className="ubr-tier-pricing">
                        <span className="ubr-final-price">₹{estimatedFare}</span>
                        {appliedDiscount > 0 && (
                          <span className="ubr-original-strike">₹{rawTierFare}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Collapsible / Quick Promo Drawer */}
              {isPromoOpen && (
                <div className="ubr-inline-promo-box">
                  <div className="ubr-promo-input-row">
                    <input 
                      type="text"
                      placeholder="Enter coupon code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                      className="ubr-inline-input"
                      autoFocus
                    />
                    <button className="ubr-inline-apply-btn" onClick={() => handleApplyPromo()}>
                      Apply
                    </button>
                  </div>
                  <div className="ubr-quick-chips-row">
                    {POPULAR_COUPONS.map(c => (
                      <button 
                        key={c.code}
                        type="button"
                        className="ubr-mini-chip"
                        onClick={() => handleApplyPromo(c.code)}
                      >
                        <Tag size={10} /> {c.code} ({c.label})
                      </button>
                    ))}
                  </div>
                  {promoError && <div className="ubr-promo-err">⚠️ {promoError}</div>}
                </div>
              )}

              {/* Payment Sheet Popup when toggled */}
              {isPaymentSheetOpen && (
                <div className="ubr-inline-payment-picker">
                  <span className="ubr-picker-title">SELECT PAYMENT METHOD</span>
                  <div className="ubr-picker-grid">
                    <button
                      type="button"
                      className={`ubr-picker-opt ${paymentMethod === 'cash_upi' ? 'active' : ''}`}
                      onClick={() => { setPaymentMethod('cash_upi'); setIsPaymentSheetOpen(false); }}
                    >
                      <Banknote size={18} />
                      <div>
                        <strong>Cash / UPI</strong>
                        <span>Pay directly to driver</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`ubr-picker-opt ${paymentMethod === 'card_stripe' ? 'active' : ''}`}
                      onClick={() => { setPaymentMethod('card_stripe'); setIsPaymentSheetOpen(false); }}
                    >
                      <CreditCard size={18} />
                      <div>
                        <strong>Card / Online</strong>
                        <span>Instant secure card checkout</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`ubr-picker-opt ${paymentMethod === 'yatra_points' ? 'active' : ''}`}
                      onClick={() => { setPaymentMethod('yatra_points'); setIsPaymentSheetOpen(false); }}
                    >
                      <Sparkles size={18} />
                      <div>
                        <strong>Yatra Points</strong>
                        <span>Redeem divine blessing coins</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Docked Luxury Action Bar (Sticky at bottom, 100% visible) */}
            <div className="ubr-dock-footer">
              {/* Payment & Promo Trigger Bar */}
              <div className="ubr-dock-subbar">
                <button 
                  type="button" 
                  className="ubr-dock-trigger-btn"
                  onClick={() => {
                    setIsPaymentSheetOpen(prev => !prev);
                    setIsPromoOpen(false);
                  }}
                >
                  <Banknote size={14} className="ubr-sub-icon" />
                  <span className="ubr-sub-text">{getPaymentLabel()}</span>
                  <ChevronDown size={13} className="ubr-chevron-icon" />
                </button>

                <button 
                  type="button" 
                  className={`ubr-dock-trigger-btn ${appliedDiscount > 0 ? 'promo-applied' : ''}`}
                  onClick={() => {
                    setIsPromoOpen(prev => !prev);
                    setIsPaymentSheetOpen(false);
                  }}
                >
                  <Tag size={13} className="ubr-sub-icon" />
                  <span className="ubr-sub-text">
                    {appliedDiscount > 0 ? `Saved ₹${appliedDiscount}` : 'Promo Code'}
                  </span>
                  <ChevronDown size={13} className="ubr-chevron-icon" />
                </button>
              </div>

              {/* Uber-Style Bold High-Contrast Primary CTA Button */}
              <button 
                className="ubr-uber-primary-btn" 
                onClick={handleStartInstantBooking}
                aria-label={`Book ${selectedTier.name} for ₹${currentFare}`}
              >
                <span className="ubr-btn-main-label">Choose {selectedTier.shortName}</span>
                <span className="ubr-btn-fare-tag">₹{currentFare}</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 2: UBER RADAR SEARCHING SCREEN                         */}
        {/* ------------------------------------------------------------- */}
        {stage === 'SEARCHING_RADAR' && (
          <div className="ubr-radar-stage">
            <div className="ubr-radar-visual">
              <div className="ubr-radar-wave wave-1" />
              <div className="ubr-radar-wave wave-2" />
              <div className="ubr-radar-wave wave-3" />
              <div className="ubr-radar-center-pod">
                {(() => {
                  const IconComp = selectedTier.iconComponent;
                  return <IconComp />;
                })()}
              </div>
            </div>

            <div className="ubr-radar-content">
              <h3 className="ubr-radar-title">Looking for nearby rides</h3>
              <p className="ubr-radar-subtitle">{searchStepText}</p>
              
              <div className="ubr-radar-timer">
                <Clock size={13} className="ubr-radar-clock" />
                <span>Matching in {searchTimer}s</span>
              </div>

              <div className="ubr-guarantee-chips">
                <div className="ubr-guarantee-item">
                  <ShieldCheck size={14} color="#0f172a" />
                  <span>Verified Driver</span>
                </div>
                <div className="ubr-guarantee-item">
                  <Zap size={14} color="#0f172a" />
                  <span>Locked Fare ₹{currentFare}</span>
                </div>
                <div className="ubr-guarantee-item">
                  <Shield size={14} color="#0f172a" />
                  <span>Safety OTP</span>
                </div>
              </div>
            </div>

            <button className="ubr-cancel-search-btn" onClick={handleCancel}>
              Cancel Request
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 3: ACTIVE TRIP & DRIVER TRACKING                      */}
        {/* ------------------------------------------------------------- */}
        {stage === 'TRIP_ACTIVE' && (
          <div className="ubr-active-stage">
            {/* Status Banner */}
            <div className="ubr-active-banner">
              <div className="ubr-banner-info">
                <div className="ubr-active-pulse" />
                <div>
                  <strong className="ubr-banner-title">
                    {activeRide?.status === 'arrived' 
                      ? 'Driver has arrived' 
                      : activeRide?.status === 'in_progress' 
                      ? 'En route to destination' 
                      : 'Driver on the way'}
                  </strong>
                  <p className="ubr-banner-sub">
                    {activeRide?.status === 'arrived' 
                      ? 'Meet driver at pickup point' 
                      : activeRide?.status === 'in_progress' 
                      ? `Heading to ${destination?.name || 'Destination'}` 
                      : 'Arriving in 2-3 mins'}
                  </p>
                </div>
              </div>

              {/* Safety OTP */}
              <div 
                className="ubr-otp-badge" 
                onClick={copyPinToClipboard}
                title="Click to copy Safety PIN"
              >
                <div className="ubr-otp-tag">PIN</div>
                <strong className="ubr-otp-val">{safetyPin}</strong>
              </div>
            </div>

            {/* Driver Profile */}
            {activeDriver && (
              <div className="ubr-driver-card">
                <img
                  src={activeDriver.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeDriver.name}&backgroundColor=f1f5f9`}
                  alt={activeDriver.name}
                  className="ubr-driver-img"
                />

                <div className="ubr-driver-info">
                  <div className="ubr-driver-title-row">
                    <strong className="ubr-driver-name">{activeDriver.name}</strong>
                    <span className="ubr-driver-verified">
                      <CheckCircle2 size={11} /> Verified
                    </span>
                  </div>
                  <div className="ubr-driver-plate-row">
                    <span className="ubr-plate-pill">{activeDriver.vehicleNo || 'UP-85-BV-1008'}</span>
                    <span className="ubr-veh-name">{activeDriver.vehicleType || selectedTier.name}</span>
                  </div>
                  <div className="ubr-driver-stars">
                    <Star size={12} fill="#0f172a" color="#0f172a" />
                    <strong>{activeDriver.rating || '4.9'}</strong>
                    <span>(1,200+ yatras)</span>
                  </div>
                </div>

                {activeDriver.phone && (
                  <button
                    className="ubr-driver-call-btn"
                    onClick={() => window.open(`tel:${activeDriver.phone}`)}
                    title={`Call ${activeDriver.name}`}
                    aria-label={`Call driver ${activeDriver.name}`}
                  >
                    <Phone size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Fare Summary Matrix */}
            <div className="ubr-summary-row">
              <div className="ubr-summary-col">
                <span className="ubr-sum-label">TRIP FARE</span>
                <strong className="ubr-sum-val">₹{currentFare}</strong>
              </div>
              <div className="ubr-summary-col">
                <span className="ubr-sum-label">PAYMENT</span>
                <strong className="ubr-sum-val">{getPaymentLabel()}</strong>
              </div>
              <div className="ubr-summary-col">
                <span className="ubr-sum-label">DISTANCE</span>
                <strong className="ubr-sum-val">{formatDistance(tripDistanceKm)}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="ubr-active-actions">
              <button className="ubr-sos-action-btn" onClick={() => window.open('tel:112')}>
                <Shield size={14} /> Police SOS
              </button>
              <button className="ubr-cancel-action-btn" onClick={handleCancel}>
                Cancel Ride
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 4: TRIP COMPLETED & RATING                            */}
        {/* ------------------------------------------------------------- */}
        {stage === 'TRIP_COMPLETED' && (
          <div className="ubr-completed-stage">
            <div className="ubr-complete-icon-wrap">
              <CheckCircle2 size={44} color="#0f172a" />
            </div>
            <h3 className="ubr-complete-title">Trip Completed</h3>
            <p className="ubr-complete-sub">You arrived safely at {destination?.name || 'Destination'}</p>

            <div className="ubr-receipt-box">
              <div className="ubr-receipt-line">
                <span>Trip Fare</span>
                <strong>₹{currentFare}</strong>
              </div>
              <div className="ubr-receipt-line">
                <span>Distance</span>
                <span>{formatDistance(tripDistanceKm)}</span>
              </div>
              <div className="ubr-receipt-line">
                <span>Payment</span>
                <span>{getPaymentLabel()}</span>
              </div>
              <div className="ubr-receipt-line total">
                <span>Total Paid</span>
                <strong className="ubr-receipt-total">₹{currentFare}</strong>
              </div>
            </div>

            {!feedbackSubmitted ? (
              <div className="ubr-rating-container">
                <span className="ubr-rate-prompt">Rate your trip with {activeDriver?.name || 'Driver'}</span>
                <div className="ubr-stars-box">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || userRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        className="ubr-star-touch"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(star)}
                      >
                        <Star 
                          size={28} 
                          fill={isFilled ? '#0f172a' : 'none'} 
                          color={isFilled ? '#0f172a' : '#cbd5e1'} 
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="ubr-compliments-cloud">
                  {COMPLIMENT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`ubr-tag-pill ${selectedCompliments.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleCompliment(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <button
                  className="ubr-submit-rate-btn"
                  onClick={() => setFeedbackSubmitted(true)}
                >
                  Submit Feedback
                </button>
              </div>
            ) : (
              <div className="ubr-feedback-success">
                <HeartHandshake size={24} color="#0f172a" />
                <p>Thank you! Your feedback helps keep Braj yatras safe and joyous.</p>
              </div>
            )}

            <button className="ubr-back-map-btn" onClick={triggerClose}>
              Back to Map
            </button>
          </div>
        )}

        {/* Real-Time Location Search & Selector Drawer */}
        {isLocationPickerOpen && (
          <div className="ubr-location-picker-modal">
            <div className="ubr-loc-picker-header">
              <div className="ubr-loc-picker-title">
                <MapPin size={16} color="#0f172a" />
                <span>Select {pickingTarget === 'pickup' ? 'Pickup Point' : 'Sacred Destination'}</span>
              </div>
              <button 
                type="button" 
                className="ubr-loc-picker-close" 
                onClick={() => setIsLocationPickerOpen(false)}
                title="Close picker"
              >
                <X size={16} />
              </button>
            </div>

            <div className="ubr-loc-search-box">
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                className="ubr-loc-search-input"
                placeholder={`Search ${pickingTarget === 'pickup' ? 'stations, gates...' : 'temples, kunds, ashrams...'}`}
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                autoFocus
              />
              {locationSearchQuery && (
                <button 
                  type="button" 
                  className="ubr-loc-clear-btn"
                  onClick={() => setLocationSearchQuery('')}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="ubr-loc-results-list">
              {filteredPickerLocations.map((loc, idx) => {
                const distFromUser = calculateDistance(
                  userPosition?.lat || 27.646,
                  userPosition?.lng || 77.377,
                  loc.lat,
                  loc.lng
                );
                return (
                  <div
                    key={idx}
                    className="ubr-loc-result-item"
                    onClick={() => handleSelectLocationFromPicker(loc)}
                  >
                    <div className="ubr-loc-icon-pill">
                      <MapPin size={14} />
                    </div>
                    <div className="ubr-loc-info">
                      <div className="ubr-loc-name">{loc.name}</div>
                      <div className="ubr-loc-sub">
                        <span className="ubr-loc-badge">{loc.category}</span>
                        <span className="ubr-loc-bullet">•</span>
                        <span>{formatDistance(distFromUser)}</span>
                      </div>
                    </div>
                    <ChevronRight size={15} color="#94a3b8" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
