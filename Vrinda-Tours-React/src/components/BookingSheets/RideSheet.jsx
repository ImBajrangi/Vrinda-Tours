import { useMemo } from 'react';
import { X, Car, Phone, Star } from 'lucide-react';
import { calculateDistance, formatDistance, calculateETA } from '../../utils/distance';
import { useBottomSheetDrag } from '../../hooks/useBottomSheetDrag';
import './BookingSheets.css';

export default function RideSheet({ destination, drivers, userPosition, onSelectDriver, onClose }) {
  const { isDragging, sheetStyle, handleProps, triggerClose } = useBottomSheetDrag(onClose);

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
      <div className="booking-overlay visible" onClick={triggerClose} />
      <div 
        className={`booking-sheet visible ${isDragging ? 'dragging' : ''}`}
        style={sheetStyle}
      >
        <div className="booking-sheet-handle-wrapper" {...handleProps} title="Drag down to dismiss">
          <div className="booking-sheet-handle" />
        </div>
        <div className="booking-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#000000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Available Pilgrim Rides</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-body)' }}>Destination: {destination?.name || 'Pilgrim Site'}</span>
            </div>
          </div>
          <button className="booking-sheet-close" onClick={triggerClose} title="Close"><X size={16} /></button>
        </div>
        <div className="booking-sheet-body">
          {availableDrivers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--color-body)' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>🛺</div>
              <h4 style={{ color: 'var(--color-ink)', margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 800 }}>No Drivers Currently Online</h4>
              <span style={{ fontSize: '0.82rem', lineHeight: 1.5, display: 'block', maxWidth: '320px', margin: '0 auto' }}>
                Please wait a moment or ask a fleet partner to go online using the Driver Companion Portal.
              </span>
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
                      <div className="rd-title-row">
                        <h4>{d.name}</h4>
                        <span className="rd-rating"><Star size={11} fill="#f59e0b" color="#f59e0b" /> {d.rating || '4.9'}</span>
                      </div>
                      <div className="rd-meta">
                        <span className="rd-vehicle-tag">{d.vehicleType || 'E-Rickshaw'}</span>
                        <span className="rd-dot">•</span>
                        <span className="rd-plate">{d.vehicleNo || 'UP-85'}</span>
                      </div>
                      <div className="rd-eta">{d._distanceText} away • ETA {d._eta}</div>
                    </div>
                    <div className="rd-actions-col">
                      <button className="rd-call-btn" onClick={() => window.open(`tel:${d.phone}`)} title="Call Driver">
                        <Phone size={15} />
                      </button>
                      <button className="rd-select-btn" onClick={() => onSelectDriver(d)}>Book</button>
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
