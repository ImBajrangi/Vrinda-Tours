import { useState, useMemo, useEffect } from 'react';
import { X, Phone, Star, MapPin, ArrowRight } from 'lucide-react';
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

  const [selectedDriverId, setSelectedDriverId] = useState(null);

  // Auto-select closest driver
  useEffect(() => {
    if (availableDrivers.length > 0 && !selectedDriverId) {
      setSelectedDriverId(availableDrivers[0].id);
    }
  }, [availableDrivers, selectedDriverId]);

  const selectedDriver = useMemo(() => {
    return availableDrivers.find(d => d.id === selectedDriverId) || availableDrivers[0];
  }, [availableDrivers, selectedDriverId]);

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
          <div className="sheet-title-group">
            <h3>Choose a Pilgrim Ride</h3>
            <div className="sheet-destination-tag">
              <MapPin size={12} color="#71717a" />
              <span>To <strong>{destination?.name || 'Destination'}</strong></span>
              {availableDrivers.length > 0 && (
                <>
                  <span className="rd-dot">•</span>
                  <span>{availableDrivers.length} {availableDrivers.length === 1 ? 'driver' : 'drivers'} nearby</span>
                </>
              )}
            </div>
          </div>
          <button className="booking-sheet-close" onClick={triggerClose} title="Close">
            <X size={16} />
          </button>
        </div>

        <div className="booking-sheet-body rd-sheet-body">
          {availableDrivers.length === 0 ? (
            <div className="no-drivers-state">
              <div className="no-drivers-icon">🛺</div>
              <h4>No Drivers Currently Nearby</h4>
              <p>
                Drivers in Vrindavan & Barsana are currently en route or offline. Try calling directly or check back in a moment.
              </p>
            </div>
          ) : (
            <>
              {/* Scalable Scrollable Fleet List */}
              <div className="rd-fleet-scroll-area">
                {availableDrivers.map((d) => {
                  const isSelected = selectedDriver?.id === d.id;
                  const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  const emoji = getVehicleEmoji(d.vehicleType);

                  return (
                    <div 
                      key={d.id} 
                      className={`rd-fleet-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedDriverId(d.id)}
                    >
                      {/* Left: Avatar */}
                      <div className="rd-avatar-mini">
                        <img 
                          src={d.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.name}&backgroundColor=f1f5f9`} 
                          alt={d.name} 
                        />
                        <span className="rd-vehicle-badge-mini">{emoji}</span>
                      </div>

                      {/* Center: Details */}
                      <div className="rd-row-details">
                        <div className="rd-row-name-line">
                          <span className="rd-row-name">{d.name}</span>
                          <span className="rd-verified-badge">✓ Verified</span>
                        </div>
                        <div className="rd-row-subtext">
                          <span>{d.vehicleType || 'E-Rickshaw'}</span>
                          <span className="rd-dot">•</span>
                          <span className="rd-row-rating-text">★ {d.rating || '4.9'}</span>
                          <span className="rd-dot">•</span>
                          <span>{d.vehicleNo || 'UP-85'}</span>
                        </div>
                      </div>

                      {/* Right: ETA & Distance */}
                      <div className="rd-row-right">
                        <span className="rd-row-eta">{d._eta}</span>
                        <span className="rd-row-dist">{d._distanceText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fixed Bottom Action Bar for Multi-Driver Booking */}
              {selectedDriver && (
                <div className="rd-dock-footer">
                  <button 
                    className="rd-dock-call-btn" 
                    onClick={() => window.open(`tel:${selectedDriver.phone}`)}
                    title={`Call ${selectedDriver.name}`}
                  >
                    <Phone size={18} />
                  </button>

                  <button 
                    className="rd-dock-confirm-btn" 
                    onClick={() => onSelectDriver(selectedDriver)}
                  >
                    <div className="rd-dock-btn-content">
                      <span className="rd-dock-btn-main">Request {selectedDriver.name}</span>
                      <span className="rd-dock-btn-sub">{selectedDriver.vehicleType || 'Ride'} • {selectedDriver._eta} away</span>
                    </div>
                    <ArrowRight size={18} className="rd-dock-arrow" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
