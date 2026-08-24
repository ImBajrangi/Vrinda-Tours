import { useState } from 'react';
import { Phone, Car, CheckCircle2, Navigation } from 'lucide-react';
import './UI.css';

export default function RideStatusBanner({ status, driver, onCancel }) {
  const [exiting, setExiting] = useState(false);

  const driverName = driver?.name || 'Your Driver';
  const driverPhone = driver?.phone;
  const vehicleType = driver?.vehicleType || 'E-Rickshaw';
  const vehicleNo = driver?.vehicleNo || 'UP-85';

  const handleCancelClick = () => {
    setExiting(true);
    setTimeout(() => {
      onCancel();
    }, 260);
  };

  const renderContent = () => {
    switch (status) {
      case 'requested':
        return {
          title: `Sending request to ${driverName}...`,
          sub: 'Waiting for driver to accept',
          icon: <Car size={20} className="pulse-icon" color="#ffffff" />,
          badgeClass: 'requested'
        };
      case 'accepted':
        return {
          title: `${driverName} accepted your ride!`,
          sub: `En route in ${vehicleType} (${vehicleNo})`,
          icon: <Navigation size={20} className="pulse-icon" color="#ffffff" />,
          badgeClass: 'accepted'
        };
      case 'arrived':
        return {
          title: `${driverName} has arrived!`,
          sub: `Meet your ${vehicleType} at pickup location`,
          icon: <CheckCircle2 size={20} color="#ffffff" />,
          badgeClass: 'arrived'
        };
      default:
        return {
          title: 'Connecting to driver...',
          sub: 'Please wait',
          icon: <Car size={20} color="#ffffff" />,
          badgeClass: 'requested'
        };
    }
  };

  const info = renderContent();

  return (
    <div className={`ride-status-card ${exiting ? 'exiting' : 'entering'} ${info.badgeClass}`}>
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
            <Phone size={15} /> Call Driver
          </button>
        )}
        <button className="rsc-cancel-btn" onClick={handleCancelClick}>
          Cancel Ride
        </button>
      </div>
    </div>
  );
}
