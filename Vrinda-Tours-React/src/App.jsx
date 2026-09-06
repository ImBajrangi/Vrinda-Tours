import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Navigation, ChevronRight, Minus, Car } from 'lucide-react';
import { locations } from './data/locations';
import { useGeolocation } from './hooks/useGeolocation';
import MapView from './components/Map/MapView';
import Header from './components/Header/Header';
import { getPersistedLocalRide, subscribeToRideRequest } from './services/rideService';
import CategoryPills from './components/CategoryPills/CategoryPills';
import LocationCard from './components/LocationCard/LocationCard';
import { useFirebaseDrivers } from './hooks/useFirebaseDrivers';
import { useFirebaseLocations } from './hooks/useFirebaseLocations';
import { useFavorites } from './hooks/useFavorites';
import { fetchNavigationRoute, openExternalGoogleMaps } from './utils/navigationService';
import RideStatusBanner from './components/UI/RideStatusBanner';
import NavigationBanner from './components/UI/NavigationBanner';
import MapStyleSwitcher from './components/UI/MapStyleSwitcher';
import Toast from './components/UI/Toast';
import './components/UI/UI.css';
import { doc, updateDoc, collection, getDocs, writeBatch, onSnapshot, deleteField } from 'firebase/firestore';
import { firestore } from './config/firebase';
import { locations as initialData } from './data/locations';
import AnnouncementBanner from './components/UI/AnnouncementBanner';
import ErrorBoundary from './components/UI/ErrorBoundary';
import PartnerLandingPage from './components/PartnerLanding/PartnerLandingPage';
import Confetti from './components/UI/Confetti';
import { updatePageSEO } from './utils/seoHelper';

// Lazy-loaded secondary modals and partner portals on-demand
const HotelBooking = lazy(() => import('./components/BookingSheets/HotelBooking'));
const RestaurantBooking = lazy(() => import('./components/BookingSheets/RestaurantBooking'));
const InstantRideModal = lazy(() => import('./components/Ride/InstantRideModal'));
const FavoritesListSheet = lazy(() => import('./components/UI/FavoritesListSheet'));
const DriversPanel = lazy(() => import('./components/Admin/DriversPanel'));
const AdminDashboardPage = lazy(() => import('./components/Admin/AdminDashboardPage'));
const DriverPortalModal = lazy(() => import('./components/Driver/DriverPortalModal'));
const DriverLandingPage = lazy(() => import('./components/Driver/DriverLandingPage'));
const HotelLandingPage = lazy(() => import('./components/Hotel/HotelLandingPage'));
const RestaurantLandingPage = lazy(() => import('./components/Restaurant/RestaurantLandingPage'));
const AgencyLandingPage = lazy(() => import('./components/Agency/AgencyLandingPage'));
const PartnerHubModal = lazy(() => import('./components/PartnerHub/PartnerHubModal'));
const HelpCenterModal = lazy(() => import('./components/HelpCenter/HelpCenterModal'));
const InfoModal = lazy(() => import('./components/InfoPages/InfoModal'));

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('vrinda_map_style') || 'carto');
  const [hotelBooking, setHotelBooking] = useState(null);
  const [restaurantBooking, setRestaurantBooking] = useState(null);
  const [rideRequest, setRideRequest] = useState(null); // { destination: loc }
  const [activeRide, setActiveRide] = useState(null); // { driver, status, rideData }
  const [driversVisible, setDriversVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [helpCenterVisible, setHelpCenterVisible] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState(null);
  const [driverPortalVisible, setDriverPortalVisible] = useState(false);
  const [partnerHubVisible, setPartnerHubVisible] = useState(false);
  const [activePartnerId, setActivePartnerId] = useState(() => sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_driver_id'));
  const [activePartnerRole, setActivePartnerRole] = useState(() => sessionStorage.getItem('vt_partner_role') || 'driver');
  const [driverLandingVisible, setDriverLandingVisible] = useState(false);
  const [hotelLandingVisible, setHotelLandingVisible] = useState(false);
  const [restaurantLandingVisible, setRestaurantLandingVisible] = useState(false);
  const [agencyLandingVisible, setAgencyLandingVisible] = useState(false);
  const [partnerLandingVisible, setPartnerLandingVisible] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [persistedRide, setPersistedRide] = useState(() => getPersistedLocalRide());
  const [isLiveRideCapsuleMinimized, setIsLiveRideCapsuleMinimized] = useState(false);

  // Active modal/overlay detection to prevent floating capsules from overlapping bottom sheets/cards
  const isAnyModalActive = Boolean(
    activeLocation ||
    hotelBooking ||
    restaurantBooking ||
    partnerHubVisible ||
    driversVisible ||
    adminVisible ||
    helpCenterVisible ||
    infoModalTab ||
    driverPortalVisible ||
    (activeRoute && isNavExpanded) ||
    (activeFilter === 'favourites' && !partnerLandingVisible)
  );
  const isCapsuleDocked = isAnyModalActive || isLiveRideCapsuleMinimized;

  // Listen to background ride events & storage changes
  useEffect(() => {
    const handleStorageUpdate = (e) => {
      const current = getPersistedLocalRide();
      setPersistedRide(current);
    };

    window.addEventListener('vt:ride-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('vt:ride-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Real-time listener for current persisted ride document
  useEffect(() => {
    if (!persistedRide?.id) return;

    const unsub = subscribeToRideRequest(persistedRide.id, (updated) => {
      if (!updated) {
        setPersistedRide(null);
        return;
      }
      setPersistedRide(updated);
      
      if (updated.status === 'accepted' && updated.driver) {
        setToast({
          message: `🎉 Sarathi Assigned! ${updated.driver.name} is on the way (${updated.driver.vehicleNo || 'E-Rickshaw'})`,
          type: 'success'
        });
      } else if (updated.status === 'driver_arrived') {
        setToast({
          message: '🛺 Sarathi has arrived at your pickup point!',
          type: 'success'
        });
      }
    });

    return () => unsub();
  }, [persistedRide?.id]);

  // Dynamic SEO & Title Metadata Updates on User Navigation
  useEffect(() => {
    if (activeLocation) {
      updatePageSEO({
        title: `${activeLocation.name} — Vrindavan Darshan, Map & Travel Guide`,
        description: activeLocation.description || `Explore ${activeLocation.name} in sacred Brij Dham with Vrinda Vihar interactive map, verified drivers, and travel tips.`,
        image: activeLocation.image,
        url: `/#${encodeURIComponent(activeLocation.name)}`
      });
    } else if (hotelBooking) {
      updatePageSEO({
        title: `Book ${hotelBooking.name} — Verified Vrindavan Ashram & Stay`,
        description: `Reserve your devotee room at ${hotelBooking.name} in Vrindavan with 0% middleman fees and pure sattvic amenities on Vrinda Vihar.`,
        image: hotelBooking.image,
        url: '/#stays'
      });
    } else if (restaurantBooking) {
      updatePageSEO({
        title: `${restaurantBooking.name} — Pure Sattvic Bhojanalaya Vrindavan`,
        description: `Experience authentic Vaishnava sattvic dining at ${restaurantBooking.name} in Vrindavan.`,
        image: restaurantBooking.image,
        url: '/#dining'
      });
    } else if (rideRequest) {
      updatePageSEO({
        title: `Book E-Rickshaw to ${rideRequest.destination?.name || 'Temple'} | Vrinda Vihar`,
        description: `Instant verified Sarathi electric rickshaw dispatch in Vrindavan for pilgrim travel to ${rideRequest.destination?.name || 'sacred temples'}.`,
        url: '/#rides'
      });
    } else if (activeFilter && activeFilter !== 'all') {
      const filterName = activeFilter === 'Temple' ? 'Temples & Mandirs' : 
                         activeFilter === 'Holy Site' ? 'Sacred Kunds & Holy Sites' : 
                         activeFilter === 'Hotel' ? 'Verified Ashrams & Stays' : 
                         activeFilter === 'Restaurant' || activeFilter === 'Dining' ? 'Sattvic Dining & Bhojanalayas' : 
                         activeFilter === 'favourites' ? 'My Saved Favourite Sacred Sites' : activeFilter;
      updatePageSEO({
        title: `${filterName} in Mathura & Vrindavan — Brij Pilgrimage Map`,
        description: `Explore all ${filterName.toLowerCase()} across Vrindavan, Mathura, Barsana and Govardhan on Vrinda Vihar interactive guide.`,
        url: `/#${activeFilter}`
      });
    } else {
      updatePageSEO();
    }
  }, [activeLocation, hotelBooking, restaurantBooking, rideRequest, activeFilter]);

  const handleOpenPartnerDashboard = useCallback((id, role) => {
    setDriverLandingVisible(false);
    setHotelLandingVisible(false);
    setRestaurantLandingVisible(false);
    setAgencyLandingVisible(false);
    setPartnerLandingVisible(false);
    setDriverPortalVisible(false);
    
    let effectiveRole = role;
    if (!effectiveRole) {
      try {
        const isAdmin = sessionStorage.getItem('vt_is_admin') === 'true' || 
                        localStorage.getItem('vt_admin_session') === 'true' ||
                        localStorage.getItem('vt_user_role') === 'admin';
        if (isAdmin) {
          effectiveRole = 'admin';
        } else {
          effectiveRole = activePartnerRole || sessionStorage.getItem('vt_partner_role') || 'driver';
        }
      } catch {
        effectiveRole = activePartnerRole || 'driver';
      }
    }
    
    if (id) {
      setActivePartnerId(id);
      sessionStorage.setItem('vt_partner_id', id);
    }
    if (effectiveRole) {
      setActivePartnerRole(effectiveRole);
      sessionStorage.setItem('vt_partner_role', effectiveRole);
    }
    setPartnerHubVisible(true);
  }, [activePartnerRole]);

  const { position, loading, requestLocation } = useGeolocation();
  const { drivers, firebaseReady } = useFirebaseDrivers();
  const { locations, loading: locationsLoading } = useFirebaseLocations();
  const { favorites, removeFavorite } = useFavorites();

  const favoriteLocations = useMemo(() => {
    if (!Array.isArray(locations) || !Array.isArray(favorites)) return [];
    return locations.filter((loc) => loc?.name && favorites.includes(loc.name));
  }, [locations, favorites]);

  const handleCloseAdmin = useCallback(() => {
    setAdminVisible(false);
    setPartnerLandingVisible(true);
    if (window.location.hash.includes('admin') || window.location.search.includes('admin')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  // Deep Link Routing for direct sharing of registration & portal sections
  useEffect(() => {
    const handleDeepLinkRouting = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = (window.location.hash || '').toLowerCase();
        const joinParam = (searchParams.get('join') || searchParams.get('partner') || searchParams.get('page') || searchParams.get('role') || '').toLowerCase();
        const portalParam = (searchParams.get('portal') || '').toLowerCase();
        const appParam = (searchParams.get('app') || '').toLowerCase();

        // Capture and persist referral code across all category landing links
        const refParam = (searchParams.get('ref') || searchParams.get('referral') || searchParams.get('referrer') || searchParams.get('invite') || searchParams.get('code') || '').trim();
        if (refParam) {
          try {
            localStorage.setItem('vrinda_referrer_code', refParam.toUpperCase());
          } catch {}
        }

        // Direct Admin Console access: ?admin=true or ?portal=admin or #admin
        if (hash === '#admin' || searchParams.get('admin') === 'true' || searchParams.get('admin') === '1' || portalParam === 'admin' || joinParam === 'admin') {
          setAdminVisible(true);
          return;
        }

        // Direct User App Map link: ?app=user or #map or #user
        if (appParam === 'user' || hash === '#map' || hash === '#user' || hash === '#app') {
          setPartnerLandingVisible(false);
          setDriverLandingVisible(false);
          setHotelLandingVisible(false);
          setRestaurantLandingVisible(false);
          setAgencyLandingVisible(false);
          setPartnerHubVisible(false);
          return;
        }

        // Direct Partner Hub Dashboard: ?portal=partner or ?partner=hub or #hub or #partner-hub
        if (portalParam === 'partner' || portalParam === 'hub' || joinParam === 'hub' || hash.includes('hub')) {
          setPartnerLandingVisible(false);
          setDriverLandingVisible(false);
          setHotelLandingVisible(false);
          setRestaurantLandingVisible(false);
          setAgencyLandingVisible(false);
          setPartnerHubVisible(true);
          return;
        }

        // Direct Driver Registration / Landing: ?partner=driver or ?join=driver or #driver
        if (joinParam === 'driver' || joinParam === 'drivers' || joinParam === 'cab' || joinParam === 'auto' || joinParam === 'rickshaw' || hash.includes('driver')) {
          setPartnerLandingVisible(false);
          setHotelLandingVisible(false);
          setRestaurantLandingVisible(false);
          setAgencyLandingVisible(false);
          setDriverLandingVisible(true);
          return;
        }

        // Direct Hotel & Stay Desk: ?partner=hotel or ?join=hotel or #hotel
        if (joinParam === 'hotel' || joinParam === 'stay' || joinParam === 'ashram' || joinParam === 'room' || hash.includes('hotel') || hash.includes('stay')) {
          setPartnerLandingVisible(false);
          setDriverLandingVisible(false);
          setRestaurantLandingVisible(false);
          setAgencyLandingVisible(false);
          setHotelLandingVisible(true);
          return;
        }

        // Direct Restaurant / Dining Desk: ?partner=restaurant or ?join=restaurant or #restaurant
        if (joinParam === 'restaurant' || joinParam === 'dining' || joinParam === 'food' || joinParam === 'prasadam' || hash.includes('restaurant')) {
          setPartnerLandingVisible(false);
          setDriverLandingVisible(false);
          setHotelLandingVisible(false);
          setAgencyLandingVisible(false);
          setRestaurantLandingVisible(true);
          return;
        }

        // Direct Agency Desk: ?partner=agency or ?join=agency or #agency
        if (joinParam === 'agency' || joinParam === 'travel' || joinParam === 'partner' || hash.includes('agency')) {
          setPartnerLandingVisible(false);
          setDriverLandingVisible(false);
          setHotelLandingVisible(false);
          setAgencyLandingVisible(true);
          return;
        }

        // Direct Help Center: ?page=help or #help
        if (joinParam === 'help' || hash.includes('help')) {
          setHelpCenterVisible(true);
          return;
        }
      } catch (err) {
        console.warn('Deep link route parsing error:', err);
      }
    };

    handleDeepLinkRouting();
    window.addEventListener('popstate', handleDeepLinkRouting);
    window.addEventListener('hashchange', handleDeepLinkRouting);
    return () => {
      window.removeEventListener('popstate', handleDeepLinkRouting);
      window.removeEventListener('hashchange', handleDeepLinkRouting);
    };
  }, []);

  // Real-time synchronization for active ride with Driver Companion App
  useEffect(() => {
    if (!activeRide?.driver?.id || activeRide.driver.id === 'drv_demo_vrinda') return;

    const unsub = onSnapshot(doc(firestore, 'drivers', activeRide.driver.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.currentRide) {
          setActiveRide(prev => prev ? { 
            ...prev, 
            status: data.currentRide.status || prev.status, 
            rideData: data.currentRide 
          } : null);
        }
      }
    }, (err) => {
      console.warn('Realtime ride tracking snapshot error:', err);
    });

    return () => unsub();
  }, [activeRide?.driver?.id]);

  // Sync back to Partner Hub on hash update
  useEffect(() => {
    const handlePartnerHubHash = () => {
      if (window.location.hash === '#partner-hub' || window.location.hash === '#hub') {
        const storedId = sessionStorage.getItem('vt_partner_id') || sessionStorage.getItem('vt_driver_id');
        const storedRole = sessionStorage.getItem('vt_partner_role') || 'driver';
        handleOpenPartnerDashboard(storedId, storedRole);
      }
    };
    window.addEventListener('hashchange', handlePartnerHubHash);
    return () => window.removeEventListener('hashchange', handlePartnerHubHash);
  }, [handleOpenPartnerDashboard]);

  const handleFilterChange = useCallback((key) => {
    if (key === '__drivers__') {
      setDriversVisible(true);
      return;
    }
    setActiveFilter(key);
    setActiveLocation(null);
  }, []);

  const handleSelectLocation = useCallback((loc) => {
    setIsSearchActive(false);
    setActiveLocation(loc);
  }, []);

  const handleBookHotel = useCallback((loc) => {
    setHotelBooking(loc);
  }, []);

  const handleBookRestaurant = useCallback((loc) => {
    setRestaurantBooking(loc);
  }, []);

  const handleBookRide = useCallback((loc) => {
    setRideRequest({ destination: loc });
  }, []);

  const handleRequestRide = useCallback(async (driver, extraDetails = {}) => {
    try {
      const destinationLoc = rideRequest?.destination || activeLocation;
      const rideData = {
        pickupLat: position?.lat || 27.646,
        pickupLng: position?.lng || 77.377,
        pickupName: position ? 'Your Current GPS Location' : 'Braj Mandal Center',
        destName: destinationLoc?.name || 'Pilgrim Destination',
        destLat: destinationLoc?.lat || 27.646,
        destLng: destinationLoc?.lng || 77.377,
        status: 'requested',
        tier: extraDetails.tier || 'erickshaw',
        fare: extraDetails.fare || 50,
        paymentMethod: extraDetails.paymentMethod || 'cash_upi',
        safetyPin: extraDetails.safetyPin || Math.floor(1000 + Math.random() * 9000).toString(),
        timestamp: Date.now()
      };

      if (driver?.id && driver.id !== 'drv_demo_vrinda') {
        await updateDoc(doc(firestore, 'drivers', driver.id), { currentRide: rideData });
      }
      setActiveRide({ driver, status: 'requested', rideData });
      setToast({ message: `Instant ride request sent to ${driver.name || 'driver'}!`, type: 'success' });
    } catch (err) {
      console.error('Ride request error:', err);
      setActiveRide({ driver, status: 'requested' });
      setToast({ message: 'Ride requested with local driver', type: 'info' });
    }
  }, [position, activeLocation, rideRequest]);

  const handleCancelRide = useCallback(async () => {
    if (activeRide?.driver?.id && activeRide.driver.id !== 'drv_demo_vrinda') {
      try {
        await updateDoc(doc(firestore, 'drivers', activeRide.driver.id), { currentRide: deleteField() });
      } catch (err) {
        console.error('Cancel ride error:', err);
      }
    }
    setActiveRide(null);
    setRideRequest(null);
    setToast({ message: 'Ride cancelled', type: 'error' });
  }, [activeRide]);

  const handleDirections = useCallback(async (loc) => {
    setActiveLocation(null);
    const origin = position || { lat: 27.646, lng: 77.377 }; // user position or Braj center
    
    setToast({ message: 'Calculating route...', type: 'info' });
    const routeData = await fetchNavigationRoute(origin, loc);

    if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
      setActiveRoute({
        ...routeData,
        destName: loc.name,
        destination: loc,
        origin,
      });
      setToast({ message: 'Route ready', type: 'success' });
    } else {
      // Platform in-app route not available -> redirect directly to Google Maps
      setToast({ message: 'Opening Google Maps...', type: 'info' });
      openExternalGoogleMaps(origin, loc);
    }
  }, [position]);

  const handleLocate = useCallback(() => {
    requestLocation();
    if (position && window.__vtMap) {
      window.__vtMap.flyTo(position.lat, position.lng, 14);
    }
  }, [position, requestLocation]);

  // Seed Data to Backend if empty
  useEffect(() => {
    const seed = async () => {
      try {
        const snap = await getDocs(collection(firestore, 'locations'));
        if (snap.empty) {
          console.log('Backend empty. Seeding initial data...');
          const batch = writeBatch(firestore);
          initialData.forEach((loc) => {
            const ref = doc(collection(firestore, 'locations'));
            batch.set(ref, loc);
          });
          await batch.commit();
          setToast({ message: 'Backend successfully initialized', type: 'success' });
        }
      } catch (err) {
        console.error('Seeding Error:', err);
      }
    };
    if (firebaseReady) seed();
  }, [firebaseReady]);

  return (
    <main id="main-content" className="app-main-viewport">
      <h1 className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        Vrinda Vihar — Sacred Brij 84 Kos Yatra, Vrindavan Darshan, Stays & E-Rickshaws
      </h1>
      <AnnouncementBanner />

      <MapView
        locations={locations}
        drivers={drivers}
        activeFilter={activeFilter}
        userPosition={position}
        activeLocation={activeLocation}
        activeRoute={activeRoute}
        mapStyle={mapStyle}
        onSelectLocation={handleSelectLocation}
      />

      <Header
        onSelectLocation={handleSelectLocation}
        onOpenDriverPortal={() => handleOpenPartnerDashboard(activePartnerId, activePartnerRole)}
        onOpenDrivers={() => setDriversVisible(true)}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        onAdminOpen={() => setAdminVisible(true)}
        onSearchFocusChange={setIsSearchActive}
        isNavigating={Boolean(activeRoute)}
        partnerId={activePartnerId}
        partnerRole={activePartnerRole}
        isAdmin={Boolean(sessionStorage.getItem('vt_is_admin') === 'true' || localStorage.getItem('vt_admin_session') === 'true' || localStorage.getItem('vt_user_role') === 'admin')}
      />

      {activeRoute && !partnerLandingVisible && (
        <NavigationBanner
          route={activeRoute}
          userPosition={position}
          isCardVisible={Boolean(activeLocation)}
          onExpandedChange={setIsNavExpanded}
          onExit={() => {
            setActiveRoute(null);
            setIsNavExpanded(false);
          }}
          onOpenExternal={() => openExternalGoogleMaps(activeRoute.origin, activeRoute.destination)}
          onSelectPlace={handleSelectLocation}
        />
      )}

      <LocationCard
        location={!isSearchActive && !activeRide && !rideRequest ? activeLocation : null}
        userPosition={position}
        drivers={drivers}
        onRequestRide={handleRequestRide}
        onBookRide={handleBookRide}
        onClose={() => setActiveLocation(null)}
        onDirections={handleDirections}
        onToast={setToast}
      />

      <Suspense fallback={null}>
        {activeFilter === 'favourites' && !activeLocation && !isSearchActive && !activeRide && !rideRequest && !hotelBooking && !restaurantBooking && !driversVisible && !adminVisible && !driverPortalVisible && !partnerLandingVisible && (
          <FavoritesListSheet
            favoriteLocations={favoriteLocations}
            userPosition={position}
            onSelectLocation={handleSelectLocation}
            onRemoveFavorite={(loc) => {
              removeFavorite(loc);
              setToast({ message: `Removed ${loc.name} from Favourites`, type: 'info' });
            }}
            onExploreAll={() => setActiveFilter('all')}
            onClose={() => setActiveFilter('all')}
          />
        )}

        {hotelBooking && (
          <HotelBooking location={hotelBooking} onClose={() => setHotelBooking(null)} />
        )}

        {restaurantBooking && (
          <RestaurantBooking location={restaurantBooking} onClose={() => setRestaurantBooking(null)} />
        )}

        {/* Persistent Live Ride Floating Activity Pill (Apple Dynamic Island Capsule) */}
        {persistedRide && (persistedRide.status === 'searching' || persistedRide.status === 'requested' || persistedRide.status === 'accepted' || persistedRide.status === 'driver_arrived' || persistedRide.status === 'in_progress') && !rideRequest && !activeRide && !partnerLandingVisible && (
          <div 
            className={`vt-floating-live-ride-pill ${isCapsuleDocked ? 'docked-top' : ''} ${persistedRide.status === 'searching' || persistedRide.status === 'requested' ? 'status-amber' : 'status-emerald'}`}
            onClick={() => setRideRequest({ destination: { name: persistedRide.destName, lat: persistedRide.destLat, lng: persistedRide.destLng } })}
            title="Tap to view live ride status"
            role="button"
            tabIndex={0}
          >
            <div className="vt-flr-info">
              <span className={`vt-flr-title ${persistedRide.status === 'searching' || persistedRide.status === 'requested' ? 'shimmering' : ''}`}>
                {persistedRide.status === 'searching' || persistedRide.status === 'requested'
                  ? 'Finding Sarathi' 
                  : persistedRide.status === 'driver_arrived' 
                  ? 'Sarathi Arrived' 
                  : 'Sarathi on the way'}
              </span>
              {persistedRide.status === 'driver_arrived' ? (
                <>
                  <span className="vt-flr-dot-sep">•</span>
                  <span className="vt-flr-pin-badge">PIN {persistedRide.safetyPin || '9653'}</span>
                </>
              ) : persistedRide.destName ? (
                <>
                  <span className="vt-flr-dot-sep">•</span>
                  <span className="vt-flr-sub">
                    {persistedRide.destName.replace(/^Shri\s+/i, '').replace(/\s+(Mandir|Temple|Ashram|Dham|Bhojnalaya)$/i, '').trim()}
                  </span>
                </>
              ) : null}
            </div>
            <div className="vt-flr-trailing">
              <div className={`vt-flr-wave-bars ${persistedRide.status === 'searching' || persistedRide.status === 'requested' ? 'amber' : 'emerald'}`} title="Live Active">
                <span className="vt-flr-wave-bar" />
                <span className="vt-flr-wave-bar" />
                <span className="vt-flr-wave-bar" />
              </div>
              <ChevronRight size={13} strokeWidth={2.4} className="vt-flr-chevron" />
            </div>
          </div>
        )}

        {(rideRequest || activeRide) && (
          <InstantRideModal
            destination={rideRequest?.destination || activeLocation}
            userPosition={position}
            drivers={drivers}
            activeRide={activeRide}
            onRequestRide={handleRequestRide}
            onCancelRide={handleCancelRide}
            onClose={() => {
              setRideRequest(null);
              if (activeRide?.status === 'completed') {
                setActiveRide(null);
              }
            }}
          />
        )}

        {driversVisible && (
          <DriversPanel
            drivers={drivers}
            onClose={() => setDriversVisible(false)}
            onOpenAdmin={() => setAdminVisible(true)}
            onOpenDriverPortal={() => {
              setDriversVisible(false);
              setDriverPortalVisible(true);
            }}
            onOpenDriverLanding={() => {
              setDriversVisible(false);
              setDriverLandingVisible(true);
            }}
          />
        )}

        {adminVisible && (
          <AdminDashboardPage
            drivers={drivers}
            locations={locations}
            userPosition={position}
            onSelectLocation={handleSelectLocation}
            onClose={handleCloseAdmin}
          />
        )}

        {driverLandingVisible && (
          <DriverLandingPage
            drivers={drivers}
            onClose={() => setDriverLandingVisible(false)}
            onOpenHotelPage={() => { setDriverLandingVisible(false); setHotelLandingVisible(true); }}
            onOpenRestaurantPage={() => { setDriverLandingVisible(false); setRestaurantLandingVisible(true); }}
            onOpenAgencyPage={() => { setDriverLandingVisible(false); setAgencyLandingVisible(true); }}
            onOpenDriverCompanion={(id, role) => handleOpenPartnerDashboard(id, role || 'driver')}
          />
        )}

        {hotelLandingVisible && (
          <HotelLandingPage
            onClose={() => setHotelLandingVisible(false)}
            onOpenDriverPage={() => { setHotelLandingVisible(false); setDriverLandingVisible(true); }}
            onOpenRestaurantPage={() => { setHotelLandingVisible(false); setRestaurantLandingVisible(true); }}
            onOpenAgencyPage={() => { setHotelLandingVisible(false); setAgencyLandingVisible(true); }}
            onOpenHotelCompanion={(id, role) => handleOpenPartnerDashboard(id, role || 'hotel')}
          />
        )}

        {restaurantLandingVisible && (
          <RestaurantLandingPage
            onClose={() => setRestaurantLandingVisible(false)}
            onOpenDriverPage={() => { setRestaurantLandingVisible(false); setDriverLandingVisible(true); }}
            onOpenHotelPage={() => { setRestaurantLandingVisible(false); setHotelLandingVisible(true); }}
            onOpenAgencyPage={() => { setRestaurantLandingVisible(false); setAgencyLandingVisible(true); }}
            onOpenRestaurantCompanion={(id, role) => handleOpenPartnerDashboard(id, role || 'restaurant')}
          />
        )}

        {agencyLandingVisible && (
          <AgencyLandingPage
            onClose={() => setAgencyLandingVisible(false)}
            onOpenDriverPage={() => { setAgencyLandingVisible(false); setDriverLandingVisible(true); }}
            onOpenHotelPage={() => { setAgencyLandingVisible(false); setHotelLandingVisible(true); }}
            onOpenRestaurantPage={() => { setAgencyLandingVisible(false); setRestaurantLandingVisible(true); }}
            onOpenAgencyCompanion={(id, role) => handleOpenPartnerDashboard(id, role || 'agency')}
          />
        )}

        {partnerHubVisible && (
          <PartnerHubModal
            partnerId={activePartnerId}
            initialRole={activePartnerRole}
            authorizedRole={sessionStorage.getItem('vt_is_admin') === 'true' || localStorage.getItem('vt_admin_session') === 'true' || localStorage.getItem('vt_user_role') === 'admin' ? 'admin' : (activePartnerRole || null)}
            drivers={drivers}
            onClose={() => setPartnerHubVisible(false)}
            onOpenLanding={(role) => {
              setPartnerHubVisible(false);
              if (role === 'hotel') setHotelLandingVisible(true);
              else if (role === 'restaurant') setRestaurantLandingVisible(true);
              else if (role === 'agency') setAgencyLandingVisible(true);
              else setDriverLandingVisible(true);
            }}
          />
        )}

        {driverPortalVisible && (
          <DriverPortalModal
            drivers={drivers}
            onClose={() => setDriverPortalVisible(false)}
            onOpenLanding={(role) => {
              setDriverPortalVisible(false);
              if (role === 'hotel') setHotelLandingVisible(true);
              else if (role === 'restaurant') setRestaurantLandingVisible(true);
              else if (role === 'agency') setAgencyLandingVisible(true);
              else setDriverLandingVisible(true);
            }}
          />
        )}

        {partnerLandingVisible && (
          <ErrorBoundary>
            <PartnerLandingPage
              onClose={() => setPartnerLandingVisible(false)}
              onOpenPartnerHub={(role) => handleOpenPartnerDashboard(null, role)}
              onOpenDriverPortal={() => { setPartnerLandingVisible(false); setDriverPortalVisible(true); }}
              onOpenDriverPage={() => { setPartnerLandingVisible(false); setDriverLandingVisible(true); }}
              onOpenHotelPage={() => { setPartnerLandingVisible(false); setHotelLandingVisible(true); }}
              onOpenRestaurantPage={() => { setPartnerLandingVisible(false); setRestaurantLandingVisible(true); }}
              onOpenAgencyPage={() => { setPartnerLandingVisible(false); setAgencyLandingVisible(true); }}
              onOpenAdmin={() => setAdminVisible(true)}
              onOpenHelpCenter={() => setHelpCenterVisible(true)}
              onOpenInfoModal={(tab) => setInfoModalTab(tab || 'about')}
            />
          </ErrorBoundary>
        )}

        {helpCenterVisible && (
          <HelpCenterModal
            isOpen={helpCenterVisible}
            onClose={() => setHelpCenterVisible(false)}
          />
        )}

        {infoModalTab && (
          <InfoModal
            initialTab={infoModalTab}
            onClose={() => setInfoModalTab(null)}
          />
        )}
      </Suspense>

      {/* Map Controls Cluster (Cornered when space is available + Smart Glide) */}
      <div className={`map-controls-cluster ${activeLocation || activeRide || rideRequest || (activeRoute && isNavExpanded) || (activeFilter === 'favourites' && !partnerLandingVisible && !driverLandingVisible && !hotelLandingVisible && !restaurantLandingVisible && !agencyLandingVisible) ? 'card-visible' : (activeRoute && !isNavExpanded) ? 'capsule-visible' : ''} ${hotelBooking || restaurantBooking || partnerHubVisible || driverPortalVisible || driverLandingVisible || hotelLandingVisible || restaurantLandingVisible || agencyLandingVisible || driversVisible || adminVisible ? 'hidden' : ''}`}>
        <MapStyleSwitcher
          activeStyle={mapStyle}
          onStyleChange={(newStyle) => {
            setMapStyle(newStyle);
            try {
              localStorage.setItem('vrinda_map_style', newStyle);
            } catch (e) {}
            const label = newStyle === 'carto' ? 'Default' : newStyle === 'google' ? 'Roadmap' : newStyle === 'satellite' ? 'Satellite' : 'Terrain';
            setToast({ message: label, type: 'info' });
          }}
        />

        <div className="zoom-controls">
          <button className="zoom-btn zoom-in" onClick={() => window.__vtMap?.zoomIn()} title="Zoom In">+</button>
          <div className="zoom-divider" />
          <button className="zoom-btn zoom-out" onClick={() => window.__vtMap?.zoomOut()} title="Zoom Out">−</button>
        </div>

        <button
          className={`fab ${loading ? 'loading' : ''}`}
          onClick={handleLocate}
          title="Center GPS on my location"
        >
          <Navigation size={18} fill="currentColor" />
        </button>
      </div>

      <Confetti />

      {toast && (
        <Toast {...toast} onDismiss={() => setToast(null)} />
      )}
    </main>
  );
}
