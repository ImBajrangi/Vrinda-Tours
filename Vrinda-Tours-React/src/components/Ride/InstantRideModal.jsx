import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Navigation, Clock, ShieldCheck, Phone, Star, ArrowRight, 
  CheckCircle2, Zap, Tag, ChevronRight, User, Shield, 
  HeartHandshake, CreditCard, Banknote, Sparkles, Check, Copy, ChevronDown,
  ArrowUpDown, Search, MapPin, Share2, MessageSquare, Landmark,
  AlertCircle, UserCheck, Smartphone, Building, RefreshCw, Percent
} from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import { locations } from '../../data/locations';
import { BRAJ_TOWNS } from '../../data/brajTowns';
import { 
  createRideRequest, 
  subscribeToRideRequest, 
  getPersistedLocalRide, 
  cancelRideRequest,
  persistLocalRide 
} from '../../services/rideService';
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

const BRAJ_YATRA_TIPS = [
  {
    icon: '🛕',
    title: 'Bankey Bihari Darshan Tip',
    text: 'Mandir curtains open & close periodically to break intense eye contact (Trance Darshan). Free footwear cloakrooms are outside Gate 2 & 3.'
  },
  {
    icon: '🌸',
    title: 'Nidhivan Sacred Grove',
    text: 'Holy Tulsi pairs here are revered as Gopis of the transcendental Maharaas. The grove remains peaceful and quiet before dusk.'
  },
  {
    icon: '🛺',
    title: 'Temple Alley Mobility',
    text: 'Pilgrim E-Rickshaws have exclusive permit access to enter historic Loi Bazaar and narrow temple alleys where four-wheelers are prohibited.'
  },
  {
    icon: '🕉️',
    title: 'Govardhan 21 km Parikrama',
    text: 'Giriraj Parikrama passes through sacred Radha Kund, Shyam Kund, Daan Ghati and Jatipura Mukharbind with zero steep elevation.'
  },
  {
    icon: '✨',
    title: 'Prem Mandir Evening Aarti',
    text: 'The grand white Italian marble temple features a synchronized musical light & fountain display every evening at 7:00 PM.'
  },
  {
    icon: '🚩',
    title: 'Barsana Radha Rani Palace',
    text: 'Perched on Bhanugarh Hill with sweeping sunset vistas over Braj. Lift/stairs access available from the main bus stand.'
  }
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

  // Radar Interactive & Yatra Tips State
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [landmarkNote, setLandmarkNote] = useState('');
  const [isAddingLandmarkNote, setIsAddingLandmarkNote] = useState(false);

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

  // Active Ride Request ID for persistent sync
  const [activeRideReqId, setActiveRideReqId] = useState(() => {
    const saved = getPersistedLocalRide();
    return saved?.id || null;
  });

  // 3. UI Flow Stages: 'SELECT_TIER' | 'SEARCHING_RADAR' | 'TRIP_ACTIVE' | 'TRIP_COMPLETED'
  const [stage, setStage] = useState(() => {
    const saved = getPersistedLocalRide();
    if (saved) {
      if (saved.status === 'searching' || saved.status === 'requested') return 'SEARCHING_RADAR';
      if (saved.status === 'accepted' || saved.status === 'driver_arrived' || saved.status === 'in_progress') return 'TRIP_ACTIVE';
      if (saved.status === 'completed') return 'TRIP_COMPLETED';
    }
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
  const [matchedCandidate, setMatchedCandidate] = useState(() => {
    const saved = getPersistedLocalRide();
    return saved?.driver || null;
  });
  const [feedbackTarget, setFeedbackTarget] = useState('driver'); // 'driver' | 'platform'
  const [driverRating, setDriverRating] = useState(5);
  const [driverHoverRating, setDriverHoverRating] = useState(0);
  const [driverCompliments, setDriverCompliments] = useState(['🙏 Polite & Devoted', '✨ Clean Rickshaw']);
  const [driverNote, setDriverNote] = useState('');
  const [platformRating, setPlatformRating] = useState(5);
  const [platformHoverRating, setPlatformHoverRating] = useState(0);
  const [platformTags, setPlatformTags] = useState(['⚡ Fast Matching', '🗺️ Accurate Map']);
  const [platformNote, setPlatformNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Real-time backend ride request listener
  useEffect(() => {
    if (!activeRideReqId) return;

    const unsub = subscribeToRideRequest(activeRideReqId, (updated) => {
      if (!updated) return;
      if (updated.status === 'accepted' || updated.status === 'driver_arrived' || updated.status === 'in_progress') {
        if (updated.driver) {
          setMatchedCandidate(updated.driver);
        }
        setStage('TRIP_ACTIVE');
      } else if (updated.status === 'completed') {
        setStage('TRIP_COMPLETED');
      } else if (updated.status === 'cancelled') {
        setStage('SELECT_TIER');
        setActiveRideReqId(null);
      }
    });

    return () => unsub();
  }, [activeRideReqId]);

  // Selected Tier object
  const selectedTier = useMemo(() => {
    return VEHICLE_TIERS.find(t => t.id === selectedTierId) || VEHICLE_TIERS[0];
  }, [selectedTierId]);

  // Calculate Dynamic Fare
  const currentFare = useMemo(() => {
    const rawFare = Math.round(selectedTier.baseFare + (tripDistanceKm * selectedTier.perKmRate));
    return Math.max(rawFare - appliedDiscount, 20);
  }, [selectedTier, tripDistanceKm, appliedDiscount]);

  // Auto-rotate Braj tips during searching radar
  useEffect(() => {
    let tipInterval;
    if (stage === 'SEARCHING_RADAR') {
      tipInterval = setInterval(() => {
        setActiveTipIndex(prev => (prev + 1) % BRAJ_YATRA_TIPS.length);
      }, 4200);
    }
    return () => clearInterval(tipInterval);
  }, [stage]);

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
  }, [stage, destLocation?.name]);

  // When searching timer finishes, fallback transition to active trip
  useEffect(() => {
    if (stage === 'SEARCHING_RADAR' && searchTimer === 0) {
      const bestDriver = availableDrivers[0] || {
        id: 'drv_demo_vrinda',
        name: 'Shyam Sundar Sharma',
        phone: '+91 98765 43210',
        vehicleType: selectedTier.name,
        vehicleNo: 'UP-85-BV-1008',
        rating: 4.9
      };
      setMatchedCandidate(bestDriver);
      if (onRequestRide) {
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
      }
      setStage('TRIP_ACTIVE');
    }
  }, [stage, searchTimer, availableDrivers, onRequestRide, selectedTierId, currentFare, paymentMethod, safetyPin, pickupLocation, destLocation, tripDistanceKm, selectedTier.name]);

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

  const handleStartInstantBooking = async () => {
    setStage('SEARCHING_RADAR');
    setSearchTimer(45);

    try {
      const rideReq = await createRideRequest({
        pickupName: pickupLocation.name,
        pickupLat: pickupLocation.lat,
        pickupLng: pickupLocation.lng,
        destName: destLocation.name,
        destLat: destLocation.lat,
        destLng: destLocation.lng,
        tier: selectedTier.id,
        tierName: selectedTier.name,
        fare: currentFare,
        paymentMethod,
        safetyPin,
        landmarkNote
      });

      if (rideReq?.id) {
        setActiveRideReqId(rideReq.id);
      }
    } catch (err) {
      console.warn('[InstantRideModal] Error creating ride request:', err);
    }
  };

  const handleCancel = async () => {
    if (stage === 'SEARCHING_RADAR') {
      if (activeRideReqId) {
        await cancelRideRequest(activeRideReqId);
        setActiveRideReqId(null);
      }
      setStage('SELECT_TIER');
    } else if (stage === 'TRIP_ACTIVE') {
      if (window.confirm('Are you sure you want to cancel your ride request?')) {
        if (activeRideReqId) {
          await cancelRideRequest(activeRideReqId, activeDriver?.id);
          setActiveRideReqId(null);
        }
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

  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const handleShareTrip = () => {
    const trackingUrl = `${window.location.origin}?trackRide=${activeRide?.id || 'live'}&pin=${safetyPin}`;
    if (navigator.share) {
      navigator.share({
        title: 'Track My Live Braj Yatra Ride',
        text: `Hare Krishna! Track my live ride with ${activeDriver?.name || 'Sarathi'} (${destLocation.name}).`,
        url: trackingUrl
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const DRIVER_COMPLIMENTS = [
    '🙏 Polite & Devoted',
    '🚗 Smooth & Safe Drive',
    '✨ Clean Rickshaw',
    '⚡ Quick Arrival',
    '🛕 Great Temple Guide',
    '🎵 Sacred Atmosphere'
  ];

  const PLATFORM_TAGS = [
    '⚡ Instant Cab Matching',
    '🗺️ Accurate Map & Tracking',
    '💰 Transparent Fair Pricing',
    '🛡️ High Safety Standards',
    '📱 Smooth & Easy App',
    '🌟 Authentic Pilgrimage Service'
  ];

  const toggleDriverCompliment = (tag) => {
    setDriverCompliments(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const togglePlatformTag = (tag) => {
    setPlatformTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getPaymentLabel = () => {
    if (paymentMethod === 'cash_upi') return 'Cash / UPI';
    if (paymentMethod === 'card_stripe') return 'Card / Online';
    return 'Yatra Points';
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
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
            
            {/* Top Navigation & Close Bar */}
            <div className="ubr-top-nav-bar">
              <div className="ubr-top-nav-brand">
                <div className="ubr-top-brand-vector-wrap">
                  <ErickshawSvg />
                </div>
                <div className="ubr-top-brand-titles">
                  <h3 className="ubr-top-title">Book Brij Temple Ride</h3>
                  <span className="ubr-top-subtitle">Zero walking • Direct entry to temple alleys</span>
                </div>
              </div>

              <button className="ubr-close-btn" onClick={triggerClose} title="Close" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            {/* Header: Interactive Real-Time Route Capsule (Full Width) */}
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

                {/* Right Action Stack: Swap Button & Distance Badge */}
                <div className="ubr-route-actions-stack">
                  <button 
                    type="button" 
                    className="ubr-route-swap-btn"
                    onClick={handleSwapLocations}
                    title="Reverse pickup & destination"
                    aria-label="Reverse route"
                  >
                    <ArrowUpDown size={13} />
                  </button>

                  <div className="ubr-route-metric">
                    <Navigation size={10} className="ubr-metric-arrow" />
                    <span>{formatDistance(tripDistanceKm)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Braj Temples Horizontal Scrollbar */}
            <div className="ubr-quick-temples-row">
              <div className="ubr-quick-chips-scroll">
                {QUICK_DESTINATIONS.map((qd, idx) => {
                  const isCur = destLocation?.name === qd.name || (destLocation?.lat === qd.lat && destLocation?.lng === qd.lng);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`ubr-quick-chip ${isCur ? 'active' : ''}`}
                      onClick={() => setDestLocation(qd)}
                    >
                      <Landmark size={13} className="ubr-chip-landmark-icon" />
                      <span>{qd.name}</span>
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
        {/* STAGE 2: SUBTLE, CLASSY & RELATABLE RADAR (UBER EXECUTIVE)   */}
        {/* ------------------------------------------------------------- */}
        {stage === 'SEARCHING_RADAR' && (
          <div className="ubr-radar-stage-clean">
            {/* Top Luxury Indeterminate Progress Line */}
            <div className="ubr-radar-top-progress">
              <div className="ubr-radar-progress-bar" />
            </div>

            {/* 1. Subtle, Hypnotic Radar Centerpiece */}
            <div className="ubr-radar-visual-clean">
              {/* Rotating Soft Radar Beam */}
              <div className="ubr-radar-scanner-sweep" />

              {/* Concentric Expanding Ripple Waves */}
              <div className="ubr-radar-wave wave-1" />
              <div className="ubr-radar-wave wave-2" />
              <div className="ubr-radar-wave wave-3" />

              {/* Range Rings */}
              <div className="ubr-radar-grid-rings">
                <div className="ubr-radar-ring ring-1" />
                <div className="ubr-radar-ring ring-2" />
                <div className="ubr-radar-ring ring-3" />
              </div>

              {/* Central Hero Vehicle Pod (Crisp & Completely Unobstructed) */}
              <div className="ubr-radar-hero-pod">
                <div className="ubr-radar-hero-glow" />
                {(() => {
                  const IconComp = selectedTier.iconComponent;
                  return <IconComp />;
                })()}
              </div>
            </div>

            {/* 2. Focused Status Headline & Real-Time Dynamic Subtitle */}
            <div className="ubr-radar-clean-content">
              <h3 className="ubr-radar-clean-title">Finding your ride...</h3>
              <p className="ubr-radar-clean-subtitle">{searchStepText}</p>
              
              <div className="ubr-radar-clean-timer">
                <Clock size={12} className="ubr-radar-timer-icon" />
                <span>Matching in ~{searchTimer}s</span>
              </div>
            </div>

            {/* 3. Classy, Reassuring Trip Summary Card */}
            <div className="ubr-radar-trip-card">
              <div className="ubr-radar-route-preview">
                <div className="ubr-radar-route-stop">
                  <span className="ubr-radar-route-dot pickup" />
                  <span className="ubr-radar-route-text" title={pickupLocation.name}>
                    {pickupLocation.name || 'Current Location'}
                  </span>
                </div>
                <div className="ubr-radar-route-connector">
                  <span className="ubr-radar-route-arrow">→</span>
                </div>
                <div className="ubr-radar-route-stop">
                  <span className="ubr-radar-route-dot dest" />
                  <span className="ubr-radar-route-text" title={destLocation.name}>
                    {destLocation.name || 'Destination'}
                  </span>
                </div>
              </div>

              <div className="ubr-radar-specs-row">
                <div className="ubr-radar-spec-item">
                  <span className="ubr-radar-spec-label">Tier</span>
                  <span className="ubr-radar-spec-val">{selectedTier.name}</span>
                </div>
                <div className="ubr-radar-spec-sep" />
                <div className="ubr-radar-spec-item">
                  <span className="ubr-radar-spec-label">Upfront Fare</span>
                  <span className="ubr-radar-spec-val fare">₹{currentFare}</span>
                </div>
                <div className="ubr-radar-spec-sep" />
                <div className="ubr-radar-spec-item">
                  <span className="ubr-radar-spec-label">Trip</span>
                  <span className="ubr-radar-spec-val">{formatDistance(tripDistanceKm)}</span>
                </div>
                <div className="ubr-radar-spec-sep" />
                <div className="ubr-radar-spec-item">
                  <span className="ubr-radar-surge-tag">
                    <CheckCircle2 size={11} /> Locked
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Minimalist Trust Badge */}
            <div className="ubr-radar-trust-badge">
              <ShieldCheck size={13} className="ubr-radar-trust-icon" />
              <span>4-Digit Safety PIN • Verified Braj Sarathi</span>
            </div>

            {/* 5. Clean Cancel Action */}
            <button className="ubr-radar-clean-cancel-btn" onClick={handleCancel} type="button">
              Cancel Request
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 3: ACTIVE TRIP & DRIVER TRACKING (LUXURY EXECUTIVE)   */}
        {/* ------------------------------------------------------------- */}
        {stage === 'TRIP_ACTIVE' && (
          <div className="ubr-active-stage-pro">
            {/* Status Banner */}
            <div className="ubr-active-banner-pro">
              <div className="ubr-active-status-col">
                <div className="ubr-live-tag">
                  <span className="ubr-pulse-dot-emerald" />
                  <span className="ubr-live-text">
                    {activeRide?.status === 'driver_arrived' 
                      ? 'Driver Arrived at Pickup' 
                      : activeRide?.status === 'in_progress' 
                      ? 'Trip in Progress' 
                      : 'Driver on the way'}
                  </span>
                </div>
                <p className="ubr-active-eta-text">
                  {activeRide?.status === 'driver_arrived' 
                    ? 'Meet driver at pickup point' 
                    : activeRide?.status === 'in_progress' 
                    ? `Heading to ${destLocation?.name || 'Destination'}` 
                    : 'Arriving in 2-3 mins (0.8 km away)'}
                </p>
              </div>

              {/* Safety OTP Badge with Copied Feedback */}
              <div 
                className={`ubr-otp-badge-pro ${copiedOtp ? 'copied' : ''}`}
                onClick={copyPinToClipboard}
                title="Tap to copy 4-digit Safety PIN"
              >
                <div className="ubr-otp-tag-row">
                  <Shield size={10} />
                  <span>SAFETY PIN</span>
                </div>
                <strong className="ubr-otp-val-pro">
                  {copiedOtp ? 'COPIED!' : safetyPin}
                </strong>
              </div>
            </div>

            {/* Driver Profile Card with 2-Tier Hierarchy (Never Cramped) */}
            {activeDriver && (
              <div className="ubr-driver-card-pro">
                {/* Tier 1: Driver Identity & Vehicle Info */}
                <div className="ubr-driver-card-top-row">
                  <div className="ubr-driver-avatar-wrap">
                    <img
                      src={activeDriver.avatar || activeDriver.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeDriver.name || 'Sarathi')}&backgroundColor=e0f2fe&mouth=smile,twinkle&eyes=happy,default&eyebrows=default&top=shortFlat,shortCurly,shortWaved,theCaesar&facialHairProbability=40`}
                      alt={activeDriver.name}
                      className="ubr-driver-img-pro"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(activeDriver.name || 'Sarathi')}&backgroundColor=e0f2fe`;
                      }}
                    />
                    <span className="ubr-driver-online-badge" />
                  </div>

                  <div className="ubr-driver-identity-col">
                    <strong className="ubr-driver-name">{activeDriver.name}</strong>
                    <div className="ubr-driver-meta-subrow">
                      <span className="ubr-driver-verified-pro">
                        <CheckCircle2 size={11} /> Verified
                      </span>
                      <div className="ubr-driver-stars-pro">
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <strong>{activeDriver.rating || '4.9'}</strong>
                        <span>({activeDriver.reviewsCount || '1.2k'})</span>
                      </div>
                    </div>
                  </div>

                  <div className="ubr-driver-vehicle-col">
                    <span className="ubr-plate-pill-pro">{activeDriver.vehicleNo || 'UP-85-BV-1008'}</span>
                    <span className="ubr-veh-name-pro">{activeDriver.vehicleType || selectedTier.name}</span>
                  </div>
                </div>

                {/* Tier 2: Dedicated Ergonomic Communication Bar */}
                <div className="ubr-driver-card-actions-row">
                  {activeDriver.phone ? (
                    <button
                      type="button"
                      className="ubr-driver-call-btn-pro"
                      onClick={() => window.open(`tel:${activeDriver.phone}`)}
                      title={`Call ${activeDriver.name}`}
                      aria-label={`Call driver ${activeDriver.name}`}
                    >
                      <Phone size={15} />
                      <span>Call Driver</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ubr-driver-call-btn-pro"
                      onClick={() => window.open('tel:+919876543210')}
                      title="Call Sarathi"
                    >
                      <Phone size={15} />
                      <span>Call Driver</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="ubr-driver-chat-btn-pro"
                    onClick={() => window.open(`https://wa.me/?text=Hare%20Krishna%2C%20I%20am%20waiting%20at%20${encodeURIComponent(pickupLocation.name)}`)}
                    title="Message driver on WhatsApp"
                  >
                    <MessageSquare size={15} />
                    <span>WhatsApp Chat</span>
                  </button>
                </div>
              </div>
            )}

            {/* If user added a landmark note */}
            {landmarkNote && (
              <div className="ubr-driver-note-pill">
                <MapPin size={12} color="#047857" />
                <span>Pickup Landmark: <strong>"{landmarkNote}"</strong></span>
              </div>
            )}

            {/* Streamlined Clean Trip Summary Capsule */}
            <div className="ubr-trip-details-capsule">
              <div className="ubr-trip-detail-item">
                <span className="ubr-td-label">TRIP FARE</span>
                <strong className="ubr-td-val">₹{currentFare}</strong>
              </div>
              <span className="ubr-td-divider" />
              <div className="ubr-trip-detail-item">
                <span className="ubr-td-label">PAYMENT</span>
                <strong className="ubr-td-val">{getPaymentLabel()}</strong>
              </div>
              <span className="ubr-td-divider" />
              <div className="ubr-trip-detail-item">
                <span className="ubr-td-label">DISTANCE</span>
                <strong className="ubr-td-val">{formatDistance(tripDistanceKm)}</strong>
              </div>
              <span className="ubr-td-divider" />
              <div className="ubr-trip-detail-item">
                <span className="ubr-td-label">SURGE</span>
                <strong className="ubr-td-val green">0% Free</strong>
              </div>
            </div>

            {/* Safety & Action Controls */}
            <div className="ubr-active-actions-pro">
              <button className="ubr-sos-action-btn-pro" onClick={() => window.open('tel:112')} title="Emergency Dial 112">
                <Shield size={14} /> Police SOS 112
              </button>
              <button className="ubr-share-action-btn-pro" onClick={handleShareTrip} title="Share live ride tracking link">
                <Share2 size={14} /> {copiedShareLink ? 'Link Copied!' : 'Share Live Ride'}
              </button>
              <button className="ubr-cancel-action-btn-pro" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STAGE 4: TRIP COMPLETED & DUAL FEEDBACK (DRIVER & PLATFORM)   */}
        {/* ------------------------------------------------------------- */}
        {stage === 'TRIP_COMPLETED' && (
          <div className="ubr-completed-stage">
            <div className="ubr-complete-icon-wrap">
              <CheckCircle2 size={38} color="#059669" />
            </div>
            <h3 className="ubr-complete-title">Trip Completed!</h3>
            <p className="ubr-complete-sub">You arrived safely at {destLocation?.name || destination?.name || 'Sacred Destination'}</p>

            {/* Compact Receipt Card */}
            <div className="ubr-receipt-box">
              <div className="ubr-receipt-line">
                <span>Trip Fare</span>
                <strong>₹{currentFare}</strong>
              </div>
              <div className="ubr-receipt-line">
                <span>Distance & Route</span>
                <span>{formatDistance(tripDistanceKm)}</span>
              </div>
              <div className="ubr-receipt-line">
                <span>Payment Method</span>
                <span>{getPaymentLabel()}</span>
              </div>
              <div className="ubr-receipt-line total">
                <span>Total Paid</span>
                <strong className="ubr-receipt-total">₹{currentFare}</strong>
              </div>
            </div>

            {!feedbackSubmitted ? (
              <div className="ubr-feedback-pro-card">
                {/* Dual Feedback Target Tabs */}
                <div className="ubr-feedback-target-tabs">
                  <button
                    type="button"
                    className={`ubr-fb-tab-btn ${feedbackTarget === 'driver' ? 'active' : ''}`}
                    onClick={() => setFeedbackTarget('driver')}
                  >
                    <span>🛺 Rate Driver (Sarathi)</span>
                  </button>
                  <button
                    type="button"
                    className={`ubr-fb-tab-btn ${feedbackTarget === 'platform' ? 'active' : ''}`}
                    onClick={() => setFeedbackTarget('platform')}
                  >
                    <span>📱 Rate Platform (App)</span>
                  </button>
                </div>

                {feedbackTarget === 'driver' ? (
                  <div className="ubr-fb-content-pane">
                    <div className="ubr-fb-target-header">
                      <div className="ubr-fb-avatar-wrap">
                        <img
                          src={activeDriver?.avatar || activeDriver?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeDriver?.name || 'Sarathi')}&backgroundColor=e0f2fe&mouth=smile,twinkle&eyes=happy,default&eyebrows=default&top=shortFlat,shortCurly,shortWaved,theCaesar`}
                          alt={activeDriver?.name}
                          className="ubr-fb-avatar-img"
                        />
                      </div>
                      <div className="ubr-fb-target-info">
                        <strong className="ubr-fb-driver-name">{activeDriver?.name || 'Brajwasi Sarathi'}</strong>
                        <span className="ubr-fb-driver-meta">{activeDriver?.vehicleType || selectedTier.name} • {activeDriver?.vehicleNo || 'UP-85-BV-1008'}</span>
                      </div>
                    </div>

                    <div className="ubr-stars-row">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (driverHoverRating || driverRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            className="ubr-star-touch-btn"
                            onMouseEnter={() => setDriverHoverRating(star)}
                            onMouseLeave={() => setDriverHoverRating(0)}
                            onClick={() => setDriverRating(star)}
                            aria-label={`Rate driver ${star} stars`}
                          >
                            <Star
                              size={28}
                              fill={isFilled ? '#f59e0b' : 'none'}
                              color={isFilled ? '#f59e0b' : '#cbd5e1'}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="ubr-star-label-hint">
                      {driverRating === 5 ? '✨ Extraordinary Sarathi' : driverRating === 4 ? 'Great Yatra' : driverRating === 3 ? 'Good Service' : driverRating === 2 ? 'Fair Service' : 'Needs Improvement'}
                    </span>

                    <div className="ubr-compliments-cloud">
                      {DRIVER_COMPLIMENTS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`ubr-tag-pill ${driverCompliments.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleDriverCompliment(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="ubr-fb-note-wrap">
                      <input
                        type="text"
                        className="ubr-fb-note-input"
                        placeholder={`Leave a note of blessing or feedback for ${activeDriver?.name || 'driver'}...`}
                        value={driverNote}
                        onChange={(e) => setDriverNote(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="ubr-fb-content-pane">
                    <div className="ubr-fb-target-header">
                      <div className="ubr-fb-platform-icon">
                        <Sparkles size={20} color="#047857" />
                      </div>
                      <div className="ubr-fb-target-info">
                        <strong className="ubr-fb-driver-name">Vrinda Tours Experience</strong>
                        <span className="ubr-fb-driver-meta">Fast, transparent & spiritual pilgrimage mobility</span>
                      </div>
                    </div>

                    <div className="ubr-stars-row">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (platformHoverRating || platformRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            className="ubr-star-touch-btn"
                            onMouseEnter={() => setPlatformHoverRating(star)}
                            onMouseLeave={() => setPlatformHoverRating(0)}
                            onClick={() => setPlatformRating(star)}
                            aria-label={`Rate platform ${star} stars`}
                          >
                            <Star
                              size={28}
                              fill={isFilled ? '#f59e0b' : 'none'}
                              color={isFilled ? '#f59e0b' : '#cbd5e1'}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="ubr-star-label-hint">
                      {platformRating === 5 ? '✨ Seamless Pilgrimage Service' : platformRating === 4 ? 'Very Good App' : platformRating === 3 ? 'Good Experience' : platformRating === 2 ? 'Needs Polish' : 'Poor Experience'}
                    </span>

                    <div className="ubr-compliments-cloud">
                      {PLATFORM_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`ubr-tag-pill ${platformTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => togglePlatformTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="ubr-fb-note-wrap">
                      <input
                        type="text"
                        className="ubr-fb-note-input"
                        placeholder="How can we improve the Vrinda Tours pilgrimage app?..."
                        value={platformNote}
                        onChange={(e) => setPlatformNote(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="ubr-submit-rate-btn"
                  onClick={() => setFeedbackSubmitted(true)}
                >
                  Submit Feedback
                </button>
              </div>
            ) : (
              <div className="ubr-feedback-success-card">
                <HeartHandshake size={34} color="#059669" />
                <strong className="ubr-fb-success-title">Radhe Radhe! 🙏</strong>
                <p className="ubr-fb-success-sub">Your feedback has been recorded. It helps keep Braj yatras safe, transparent, and joyous for every devotee.</p>
              </div>
            )}

            <button type="button" className="ubr-back-map-btn" onClick={triggerClose}>
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
    </>,
    document.body
  );
}
