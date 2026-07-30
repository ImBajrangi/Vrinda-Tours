import { useMemo } from 'react';
import { X, Car, Phone, Star } from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import './BookingSheets.css';

export default function RideSheet({ destination, drivers, userPosition, onSelectDriver, onClose }) {
  const refLat = userPosition?.lat || destination?.lat || 27.64;
  const refLng = userPosition?.lng || destination?.lng || 77.38;

  const availableDrivers = useMemo(() => {
    return drivers
      .filter(d => (d.status === 'available' || !d.status) && d.location?.lat)
      .map(d => {
        const dist = calculateDistance(refLat, refLng, d.location.lat, d.location.lng);
        return {
          ...d,
          _distance: dist,
          _distanceText: formatDistance(dist),
          _eta: calculateETA(dist)
        };
      })
      .sort((a, b) => a._distance - b._distance);
  }, [drivers, refLat, refLng]);

  const getVehicleEmoji = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'e-rickshaw': return '🛺';
      case 'auto': return '🛺';
      case 'taxi': return '🚗';
      case 'bike': return '🛵';
      case 'bus': return '🚌';
      default: return '🛺';
    }
  };

  return (
    <>
      <div className="booking-overlay visible" onClick={onClose} />
      <div className="booking-sheet visible">
        <div className="booking-sheet-handle" />
        <div className="booking-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Car size={22} color="#22c55e" />
            <div>
              <h3 style={{ margin: 0 }}>Available Pilgrim Rides</h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Heading to: {destination?.name || 'Destination'}</span>
            </div>
          </div>
          <button className="booking-sheet-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="booking-sheet-body">
          {availableDrivers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛺</div>
              <h4 style={{ color: '#fff', margin: '0 0 0.25rem 0' }}>No Drivers Currently Online</h4>
              <span style={{ fontSize: '0.8rem' }}>Please wait a moment or ask a driver to go online using the Driver Companion Portal.</span>
            </div>
          ) : (
            <div className="drivers-list">
              {availableDrivers.map((d) => {
                const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const emoji = getVehicleEmoji(d.vehicleType);
                return (
                  <div key={d.id} className="ride-driver-card">
                    <div className="rd-avatar">
                      {d.photo ? <img src={d.photo} alt={d.name} /> : initials}
                      <span className="rd-vehicle-badge">{emoji}</span>
                    </div>
                    <div className="rd-info">
                      <h4>{d.name}</h4>
                      <div className="rd-meta">
                        <span className="rd-vehicle">{d.vehicleType || 'E-Rickshaw'} • {d.vehicleNo || 'UP-85'}</span>
                        <span className="rd-rating"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {d.rating || '4.9'}</span>
                      </div>
                      <div className="rd-eta">{d._distanceText} away • ETA {d._eta}</div>
                    </div>
                    <div className="rd-actions-col">
                      <button className="rd-call-btn" onClick={() => window.open(`tel:${d.phone}`)} title="Call Driver">
                        <Phone size={15} />
                      </button>
                      <button className="rd-select-btn" onClick={() => onSelectDriver(d)}>Request Ride</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

