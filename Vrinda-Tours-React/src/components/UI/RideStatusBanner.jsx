import './UI.css';

export default function RideStatusBanner({ status, driverName, onCancel }) {
  const getStatusText = () => {
    switch (status) {
      case 'requested': return `Waiting for ${driverName} to accept...`;
      case 'accepted': return `${driverName} is on the way!`;
      case 'arrived': return `${driverName} has arrived at your location.`;
      default: return 'Requesting ride...';
    }
  };

  return (
    <div className="ride-status-banner visible">
      <span id="ride-status-text">{getStatusText()}</span>
      <button className="cancel-ride" onClick={onCancel}>Cancel</button>
    </div>
  );
}
