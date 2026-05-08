import { useMemo } from 'react';
import { X, Car } from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import './BookingSheets.css';

export default function RideSheet({ destination, drivers, userPosition, onSelectDriver, onClose }) {
  const refLat = userPosition?.lat || destination?.lat || 27.64;
  const refLng = userPosition?.lng || destination?.lng || 77.38;

  const availableDrivers = useMemo(() => {
    return drivers
      .filter(d => d.status === 'available' && d.location?.lat)
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

  return (
    <>
      <div className="booking-overlay visible" onClick={onClose} />
      <div className="booking-sheet visible">
        <div className="booking-sheet-handle" />
        <div className="booking-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={20} />
            <h3>Nearby Drivers</h3>
          </div>
          <button className="booking-sheet-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="booking-sheet-body">
          {availableDrivers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#666' }}>
              <p>No drivers available right now</p>
              <span style={{ fontSize: '0.75rem' }}>Please try again in a few minutes</span>
            </div>
          ) : (
            <div className="drivers-list">
              {availableDrivers.map((d) => {
                const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <div key={d.id} className="ride-driver-card">
                    <div className="rd-avatar">
                      {d.photo ? <img src={d.photo} alt={d.name} /> : initials}
                    </div>
                    <div className="rd-info">
                      <h4>{d.name}</h4>
                      <div className="rd-eta">{d._distanceText} away • ETA {d._eta}</div>
                    </div>
                    <button className="rd-select-btn" onClick={() => onSelectDriver(d)}>Select</button>
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
