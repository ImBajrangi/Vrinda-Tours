import { Phone, Car, CheckCircle, Navigation } from 'lucide-react';
import './UI.css';

export default function RideStatusBanner({ status, driver, onCancel }) {
  const driverName = driver?.name || 'Your Driver';
  const driverPhone = driver?.phone;
  const vehicleType = driver?.vehicleType || 'E-Rickshaw';
  const vehicleNo = driver?.vehicleNo || 'UP-85';

  const renderContent = () => {
    switch (status) {
      case 'requested':
        return {
          title: `Sending request to ${driverName}...`,
          sub: 'Waiting for driver to accept ride',
          icon: <Car size={20} className="pulse-icon" color="#f59e0b" />,
          badgeClass: 'requested'
        };
      case 'accepted':
        return {
          title: `${driverName} accepted your ride!`,
          sub: `Driver is en route in ${vehicleType} (${vehicleNo})`,
          icon: <Navigation size={20} className="pulse-icon" color="#22c55e" />,
          badgeClass: 'accepted'
        };
      case 'arrived':
        return {
          title: `${driverName} has arrived!`,
          sub: `Please meet your ${vehicleType} at pickup location`,
          icon: <CheckCircle size={20} color="#3b82f6" />,
          badgeClass: 'arrived'
        };
      default:
        return {
          title: 'Connecting to driver...',
          sub: 'Please wait',
          icon: <Car size={20} />,
          badgeClass: 'requested'
        };
    }
  };

  const info = renderContent();

  return (
    <div className={`ride-status-card visible ${info.badgeClass}`}>
      <div className="rsc-main">
        <div className="rsc-icon-wrapper">
          {info.icon}
        </div>
        <div className="rsc-text">
          <h4>{info.title}</h4>
          <p>{info.sub}</p>
        </div>
      </div>

      <div className="rsc-actions">
        {driverPhone && (
          <button className="rsc-call-btn" onClick={() => window.open(`tel:${driverPhone}`)} title="Call Driver">
            <Phone size={16} /> Call Driver
          </button>
        )}
        <button className="rsc-cancel-btn" onClick={onCancel}>
          Cancel Ride
        </button>
      </div>
    </div>
  );
}
