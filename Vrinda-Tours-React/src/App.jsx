import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { Navigation } from 'lucide-react';
import { locations } from './data/locations';
import { useGeolocation } from './hooks/useGeolocation';
import MapView from './components/Map/MapView';
import Header from './components/Header/Header';
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

// Lazy-loaded on-demand portals & modals for instant initial load (<100ms)
const HotelBooking = lazy(() => import('./components/BookingSheets/HotelBooking'));
const RestaurantBooking = lazy(() => import('./components/BookingSheets/RestaurantBooking'));
const RideSheet = lazy(() => import('./components/BookingSheets/RideSheet'));
const FavoritesListSheet = lazy(() => import('./components/UI/FavoritesListSheet'));
const DriversPanel = lazy(() => import('./components/Admin/DriversPanel'));
const AdminPanel = lazy(() => import('./components/Admin/AdminPanel'));
const DriverPortalModal = lazy(() => import('./components/Driver/DriverPortalModal'));
const DriverLandingPage = lazy(() => import('./components/Driver/DriverLandingPage'));
const HotelLandingPage = lazy(() => import('./components/Hotel/HotelLandingPage'));
const RestaurantLandingPage = lazy(() => import('./components/Restaurant/RestaurantLandingPage'));
const AgencyLandingPage = lazy(() => import('./components/Agency/AgencyLandingPage'));
const PartnerHubModal = lazy(() => import('./components/PartnerHub/PartnerHubModal'));
const PartnerLandingPage = lazy(() => import('./components/PartnerLanding/PartnerLandingPage'));

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [mapStyle, setMapStyle] = useState(() => localStorage.getItem('vrinda_map_style') || 'carto');
  const [hotelBooking, setHotelBooking] = useState(null);
  const [restaurantBooking, setRestaurantBooking] = useState(null);
  const [rideRequest, setRideRequest] = useState(null); // { destination: loc }
  const [activeRide, setActiveRide] = useState(null); // { driver, status }
  const [driversVisible, setDriversVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
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

  const handleOpenPartnerDashboard = useCallback((id, role) => {
    setDriverLandingVisible(false);
    setHotelLandingVisible(false);
    setRestaurantLandingVisible(false);
    setAgencyLandingVisible(false);
    setPartnerLandingVisible(false);
    setDriverPortalVisible(false);
    
    if (id) {
      setActivePartnerId(id);
      sessionStorage.setItem('vt_partner_id', id);
    }
    if (role) {
      setActivePartnerRole(role);
      sessionStorage.setItem('vt_partner_role', role);
    }
    setPartnerHubVisible(true);
  }, []);

  const { position, loading, requestLocation } = useGeolocation();
  const { drivers, firebaseReady } = useFirebaseDrivers();
  const { locations, loading: locationsLoading } = useFirebaseLocations();
  const { favorites, removeFavorite } = useFavorites();

  const favoriteLocations = useMemo(() => {
    return locations.filter((loc) => favorites.includes(loc.name));
  }, [locations, favorites]);

  // Listen to passenger active ride status updates in real-time
  useEffect(() => {
    if (!activeRide?.driver?.id) return;

    const driverRef = doc(firestore, 'drivers', activeRide.driver.id);
    const unsub = onSnapshot(driverRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentRide) {
          setActiveRide(prev => prev ? { ...prev, status: data.currentRide.status } : null);
        } else {
          // Ride completed or cancelled by driver
          if (activeRide.status === 'arrived' || activeRide.status === 'accepted') {
            setToast({ message: 'Ride completed', type: 'success' });
          }
          setActiveRide(null);
        }
      }
    });

    return () => unsub();
  }, [activeRide?.driver?.id]);

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

  const handleRequestRide = useCallback(async (driver) => {
    setRideRequest(null);
    try {
      const rideData = {
        pickupLat: position?.lat || 27.646,
        pickupLng: position?.lng || 77.377,
        pickupName: position ? 'Your Current GPS Location' : 'Barsana Center',
        destName: activeLocation?.name || 'Pilgrim Destination',
        destLat: activeLocation?.lat || 27.646,
        destLng: activeLocation?.lng || 77.377,
        status: 'requested',
        timestamp: Date.now()
      };

      await updateDoc(doc(firestore, 'drivers', driver.id), { currentRide: rideData });
      setActiveRide({ driver, status: 'requested' });
      setToast({ message: 'Ride requested', type: 'success' });
    } catch (err) {
      console.error('Ride request error:', err);
      setToast({ message: 'Ride request failed', type: 'error' });
    }
  }, [position, activeLocation]);

  const handleCancelRide = useCallback(async () => {
    if (activeRide?.driver) {
      try {
        await updateDoc(doc(firestore, 'drivers', activeRide.driver.id), { currentRide: deleteField() });
        setActiveRide(null);
        setToast({ message: 'Ride cancelled', type: 'error' });
      } catch (err) {
        console.error('Cancel ride error:', err);
      }
    }
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

        {rideRequest && (
          <RideSheet
            destination={rideRequest.destination}
            drivers={drivers}
            userPosition={position}
            onSelectDriver={handleRequestRide}
            onClose={() => setRideRequest(null)}
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
          <AdminPanel
            drivers={drivers}
            locations={locations}
            userPosition={position}
            onSelectLocation={handleSelectLocation}
            onClose={() => setAdminVisible(false)}
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
          <PartnerLandingPage
            onClose={() => setPartnerLandingVisible(false)}
            onOpenPartnerHub={(role) => handleOpenPartnerDashboard(null, role)}
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

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </main>
  );
}
