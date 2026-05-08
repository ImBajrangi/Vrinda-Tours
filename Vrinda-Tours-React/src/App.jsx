import { useState, useCallback, useEffect } from 'react';
import { Crosshair } from 'lucide-react';
import { locations } from './data/locations';
import { useGeolocation } from './hooks/useGeolocation';
import MapView from './components/Map/MapView';
import Header from './components/Header/Header';
import CategoryPills from './components/CategoryPills/CategoryPills';
import LocationCard from './components/LocationCard/LocationCard';
import HotelBooking from './components/BookingSheets/HotelBooking';
import RestaurantBooking from './components/BookingSheets/RestaurantBooking';
import { useFirebaseDrivers } from './hooks/useFirebaseDrivers';
import { useFirebaseLocations } from './hooks/useFirebaseLocations';
import RideSheet from './components/BookingSheets/RideSheet';
import RideStatusBanner from './components/UI/RideStatusBanner';
import DriversPanel from './components/Admin/DriversPanel';
import AdminPanel from './components/Admin/AdminPanel'; // This is for login
import Toast from './components/UI/Toast';
import './components/UI/UI.css';
import { doc, updateDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { firestore } from './config/firebase';
import { locations as initialData } from './data/locations';

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeLocation, setActiveLocation] = useState(null);
  const [hotelBooking, setHotelBooking] = useState(null);
  const [restaurantBooking, setRestaurantBooking] = useState(null);
  const [rideRequest, setRideRequest] = useState(null); // { destination: loc }
  const [activeRide, setActiveRide] = useState(null); // { driver, status }
  const [driversVisible, setDriversVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const { position, loading, requestLocation } = useGeolocation();
  const { drivers, firebaseReady } = useFirebaseDrivers();
  const { locations, loading: locationsLoading } = useFirebaseLocations();

  const handleFilterChange = useCallback((key) => {
    if (key === '__drivers__') {
      setDriversVisible(true);
      return;
    }
    setActiveFilter(key);
    setActiveLocation(null);
  }, []);

  const handleSelectLocation = useCallback((loc) => {
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
        pickupName: position ? 'Your Location' : 'Barsana Center',
        destName: activeLocation.name,
        destLat: activeLocation.lat,
        destLng: activeLocation.lng,
        status: 'requested',
        timestamp: Date.now()
      };

      await updateDoc(doc(firestore, 'drivers', driver.id), { currentRide: rideData });
      setActiveRide({ driver, status: 'requested' });
      setToast({ message: `Request sent to ${driver.name}`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Ride request failed', type: 'error' });
    }
  }, [position, activeLocation]);

  const handleCancelRide = useCallback(async () => {
    if (activeRide?.driver) {
      try {
        await updateDoc(doc(firestore, 'drivers', activeRide.driver.id), { currentRide: null });
        setActiveRide(null);
        setToast({ message: 'Ride cancelled', type: 'success' });
      } catch {}
    }
  }, [activeRide]);

  const handleDirections = useCallback((loc) => {
    if (position) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${position.lat},${position.lng}&destination=${loc.lat},${loc.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, '_blank');
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
    <>
      <MapView
        locations={locations}
        drivers={drivers}
        activeFilter={activeFilter}
        userPosition={position}
        activeLocation={activeLocation}
        onSelectLocation={handleSelectLocation}
      />

      <Header onSelectLocation={handleSelectLocation} />

      <CategoryPills 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
        onAdminOpen={() => setAdminVisible(true)} 
      />

      <LocationCard
        location={activeLocation}
        userPosition={position}
        onClose={() => setActiveLocation(null)}
        onBookHotel={handleBookHotel}
        onBookRestaurant={handleBookRestaurant}
        onBookRide={handleBookRide}
        onDirections={handleDirections}
      />

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

      {activeRide && (
        <RideStatusBanner 
          status={activeRide.status} 
          driverName={activeRide.driver.name} 
          onCancel={handleCancelRide} 
        />
      )}

      {driversVisible && (
        <DriversPanel 
          drivers={drivers} 
          onClose={() => setDriversVisible(false)} 
          onOpenAdmin={() => setAdminVisible(true)}
        />
      )}

      {adminVisible && (
        <AdminPanel 
          drivers={drivers} 
          userPosition={position}
          onClose={() => setAdminVisible(false)} 
        />
      )}

      {/* FAB + Zoom Controls */}
      <button className={`fab ${loading ? 'loading' : ''} ${activeLocation ? 'card-visible' : ''}`} onClick={handleLocate} title="Center on my location">
        <Crosshair size={24} />
      </button>

      <div className={`zoom-controls ${activeLocation ? 'card-visible' : ''}`}>
        <button className="zoom-btn" onClick={() => window.__vtMap?.zoomIn()}>+</button>
        <button className="zoom-btn" onClick={() => window.__vtMap?.zoomOut()}>−</button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}
