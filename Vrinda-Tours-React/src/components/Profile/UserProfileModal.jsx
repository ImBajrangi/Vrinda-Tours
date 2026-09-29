import { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Heart, Clock, Award, Phone, 
  MapPin, BedDouble, Utensils, Car, Sparkles, X, 
  ChevronRight, Smartphone, Settings, ExternalLink,
  CheckCircle2, AlertCircle, RefreshCw, LogOut, ArrowRight
} from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { getLocalUserBookings, cancelUserBooking } from '../../services/bookingService';
import { getPersistedLocalRide } from '../../services/rideService';
import './UserProfileModal.css';

export default function UserProfileModal({
  isOpen,
  onClose,
  initialRole = 'user',
  onSelectLocation,
  onOpenDriverWorkspace,
  onOpenHotelWorkspace,
  onOpenRestaurantWorkspace,
  onOpenAdminWorkspace,
  onOpenInstallApp
}) {
  const [activeRole, setActiveRole] = useState(() => {
    return sessionStorage.getItem('vt_active_user_role') || initialRole || 'user';
  });

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'favorites' | 'role_workspace'
  const [bookings, setBookings] = useState([]);
  const [liveRide, setLiveRide] = useState(null);
  const [driverDuty, setDriverDuty] = useState(true);
  const { favorites, removeFavorite } = useFavorites();

  // Load user bookings and active ride
  useEffect(() => {
    if (isOpen) {
      setBookings(getLocalUserBookings());
      setLiveRide(getPersistedLocalRide());
    }

    const handleBookingsUpdate = () => {
      setBookings(getLocalUserBookings());
    };
    window.addEventListener('vt:bookings-updated', handleBookingsUpdate);
    return () => window.removeEventListener('vt:bookings-updated', handleBookingsUpdate);
  }, [isOpen]);

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    sessionStorage.setItem('vt_active_user_role', newRole);
    if (newRole !== 'user') {
      setActiveTab('role_workspace');
    } else {
      setActiveTab('overview');
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Cancel this booking request?')) {
      await cancelUserBooking(id);
      setBookings(getLocalUserBookings());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vt-profile-modal-overlay" onClick={onClose}>
      <div className="vt-profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="vt-pm-header">
          <div className="vt-pm-user-row">
            <div className="vt-pm-avatar">
              <User size={20} />
            </div>
            <div className="vt-pm-user-meta">
              <div className="vt-pm-name-row">
                <h3>Braj Yatri</h3>
                <span className={`vt-pm-role-badge ${activeRole}`}>
                  {activeRole === 'user' ? 'Devotee / Pilgrim' :
                   activeRole === 'driver' ? 'Sarathi Driver' :
                   activeRole === 'hotel' ? 'Stay Partner' :
                   activeRole === 'restaurant' ? 'Dining Partner' : 'Super Admin'}
                </span>
              </div>
              <span className="vt-pm-user-phone">+91 98765 43210 • Vrindavan</span>
            </div>
          </div>

          <button className="vt-pm-close-btn" onClick={onClose} aria-label="Close Profile">
            <X size={18} />
          </button>
        </div>

        {/* Role Switcher Pills */}
        <div className="vt-pm-role-selector">
          <span className="vt-pm-section-label">ACTIVE ROLE VIEW</span>
          <div className="vt-pm-role-pills-row">
            <button
              className={`vt-pm-role-pill ${activeRole === 'user' ? 'active' : ''}`}
              onClick={() => handleRoleChange('user')}
            >
              <User size={13} />
              <span>Pilgrim</span>
            </button>
            <button
              className={`vt-pm-role-pill ${activeRole === 'driver' ? 'active' : ''}`}
              onClick={() => handleRoleChange('driver')}
            >
              <Car size={13} />
              <span>Driver</span>
            </button>
            <button
              className={`vt-pm-role-pill ${activeRole === 'hotel' ? 'active' : ''}`}
              onClick={() => handleRoleChange('hotel')}
            >
              <BedDouble size={13} />
              <span>Hotel</span>
            </button>
            <button
              className={`vt-pm-role-pill ${activeRole === 'restaurant' ? 'active' : ''}`}
              onClick={() => handleRoleChange('restaurant')}
            >
              <Utensils size={13} />
              <span>Dining</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs (For User Mode) */}
        {activeRole === 'user' && (
          <div className="vt-pm-nav-tabs">
            <button 
              className={`vt-pm-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`vt-pm-nav-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              My Bookings ({bookings.length})
            </button>
            <button 
              className={`vt-pm-nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              Saved ({favorites.length})
            </button>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="vt-pm-body-content">
          {/* ========================================================= */}
          {/* ROLE: PILGRIM / DEVOTEE OVERVIEW                          */}
          {/* ========================================================= */}
          {activeRole === 'user' && activeTab === 'overview' && (
            <div className="vt-pm-view-stack">
              {/* Live Active Ride Capsule if any */}
              {liveRide && (liveRide.status === 'searching' || liveRide.status === 'accepted' || liveRide.status === 'driver_arrived') && (
                <div className="vt-pm-live-card">
                  <div className="vt-pm-live-header">
                    <span className="vt-pm-live-badge"><Car size={12} /> Active Ride Request</span>
                    <span className="vt-pm-live-pin">PIN: {liveRide.safetyPin || '9653'}</span>
                  </div>
                  <strong className="vt-pm-live-dest">{liveRide.destName || 'Temple Destination'}</strong>
                  <div className="vt-pm-live-status">
                    {liveRide.status === 'searching' ? 'Finding nearby Sarathi...' : 'Sarathi is on the way'}
                  </div>
                </div>
              )}

              {/* Devotional Stats Quick Grid */}
              <div className="vt-pm-stats-grid">
                <div className="vt-pm-stat-box">
                  <div className="vt-pm-stat-icon gold"><Sparkles size={16} /></div>
                  <strong className="vt-pm-stat-num">450</strong>
                  <span className="vt-pm-stat-lbl">Yatra Points</span>
                </div>
                <div className="vt-pm-stat-box">
                  <div className="vt-pm-stat-icon emerald"><ShieldCheck size={16} /></div>
                  <strong className="vt-pm-stat-num">{favorites.length}</strong>
                  <span className="vt-pm-stat-lbl">Saved Temples</span>
                </div>
                <div className="vt-pm-stat-box">
                  <div className="vt-pm-stat-icon blue"><Clock size={16} /></div>
                  <strong className="vt-pm-stat-num">{bookings.length}</strong>
                  <span className="vt-pm-stat-lbl">Enquiries</span>
                </div>
              </div>

              {/* Quick Actions List */}
              <div className="vt-pm-action-list">
                <div 
                  className="vt-pm-action-item" 
                  onClick={() => onOpenInstallApp?.()}
                >
                  <div className="vt-pm-action-icon green"><Smartphone size={16} /></div>
                  <div className="vt-pm-action-text">
                    <strong>Install Vrinda Travels App</strong>
                    <span>Offline temple maps & 1-tap e-rickshaws</span>
                  </div>
                  <ChevronRight size={16} className="vt-pm-action-arrow" />
                </div>

                <a 
                  href="https://wa.me/919876543210?text=Radhe%20Radhe!%20I%20need%20assistance%20with%20Vrinda%20Travels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vt-pm-action-item"
                >
                  <div className="vt-pm-action-icon emerald"><Phone size={16} /></div>
                  <div className="vt-pm-action-text">
                    <strong>24x7 Braj Yatra Helpline</strong>
                    <span>Instant WhatsApp assistance & priest seva</span>
                  </div>
                  <ExternalLink size={14} className="vt-pm-action-arrow" />
                </a>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* USER: BOOKING REQUESTS TAB                                */}
          {/* ========================================================= */}
          {activeRole === 'user' && activeTab === 'bookings' && (
            <div className="vt-pm-bookings-list">
              {bookings.length === 0 ? (
                <div className="vt-pm-empty-state">
                  <BedDouble size={32} className="vt-pm-empty-icon" />
                  <h4>No Booking Requests Yet</h4>
                  <p>When you request a hotel or restaurant booking, our team reaches out to confirm and details will appear here.</p>
                </div>
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="vt-pm-booking-card">
                    <div className="vt-pm-bc-header">
                      <div className="vt-pm-bc-type">
                        {b.type === 'hotel' ? <BedDouble size={14} /> : <Utensils size={14} />}
                        <span>{b.id}</span>
                      </div>
                      <span className={`vt-pm-bc-status ${b.status}`}>
                        {b.status === 'confirmed' ? 'Confirmed' : b.status === 'cancelled' ? 'Cancelled' : 'Team Reaching Out'}
                      </span>
                    </div>

                    <strong className="vt-pm-bc-venue">{b.venueName}</strong>

                    <div className="vt-pm-bc-details">
                      <span>📅 {b.checkInDate} {b.checkOutDate ? `to ${b.checkOutDate}` : ''}</span>
                      <span>👥 {b.guests} Guests • {b.roomType || 'Standard'}</span>
                    </div>

                    {b.status === 'pending_reachout' && (
                      <div className="vt-pm-bc-footer">
                        <span className="vt-pm-bc-hint">📞 Team will call: {b.customerPhone}</span>
                        <button 
                          className="vt-pm-bc-cancel-btn"
                          onClick={() => handleCancelBooking(b.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* USER: SAVED FAVORITES TAB                                 */}
          {/* ========================================================= */}
          {activeRole === 'user' && activeTab === 'favorites' && (
            <div className="vt-pm-favorites-list">
              {favorites.length === 0 ? (
                <div className="vt-pm-empty-state">
                  <Heart size={32} className="vt-pm-empty-icon" />
                  <h4>No Saved Sacred Sites</h4>
                  <p>Tap the heart icon on any temple or holy kund card to save it for quick pilgrimage darshan.</p>
                </div>
              ) : (
                favorites.map((name) => (
                  <div key={name} className="vt-pm-fav-item">
                    <div className="vt-pm-fav-info">
                      <Heart size={14} fill="#e11d48" color="#e11d48" />
                      <strong>{name}</strong>
                    </div>
                    <button 
                      className="vt-pm-fav-remove"
                      onClick={() => removeFavorite({ name })}
                      title="Remove from saved"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* ROLE: SARATHI DRIVER WORKSPACE                            */}
          {/* ========================================================= */}
          {activeRole === 'driver' && (
            <div className="vt-pm-role-view">
              <div className="vt-pm-driver-duty-box">
                <div className="vt-pm-dd-text">
                  <strong>Driver Duty Status</strong>
                  <span>{driverDuty ? 'Online & Ready for Pilgrims' : 'Offline'}</span>
                </div>
                <button 
                  className={`vt-pm-toggle-btn ${driverDuty ? 'active' : ''}`}
                  onClick={() => setDriverDuty(!driverDuty)}
                >
                  {driverDuty ? 'ON DUTY' : 'OFF DUTY'}
                </button>
              </div>

              <div className="vt-pm-stats-grid">
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">₹1,840</strong>
                  <span className="vt-pm-stat-lbl">Today's Earnings</span>
                </div>
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">12</strong>
                  <span className="vt-pm-stat-lbl">Trips Done</span>
                </div>
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">4.95 ★</strong>
                  <span className="vt-pm-stat-lbl">Driver Rating</span>
                </div>
              </div>

              <button 
                className="vt-pm-primary-cta"
                onClick={() => { onClose(); onOpenDriverWorkspace?.(); }}
              >
                <span>Open Full Sarathi Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* ROLE: HOTEL & STAY PARTNER                                */}
          {/* ========================================================= */}
          {activeRole === 'hotel' && (
            <div className="vt-pm-role-view">
              <div className="vt-pm-venue-meta-box">
                <BedDouble size={20} className="vt-pm-vm-icon" />
                <div>
                  <strong>Ashram & Hotel Stay Desk</strong>
                  <span>Verified Partner • Instant 0% commission guest inquiries</span>
                </div>
              </div>

              <div className="vt-pm-stats-grid">
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">18</strong>
                  <span className="vt-pm-stat-lbl">Available Rooms</span>
                </div>
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">4</strong>
                  <span className="vt-pm-stat-lbl">New Inquiries</span>
                </div>
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">98%</strong>
                  <span className="vt-pm-stat-lbl">Occupancy</span>
                </div>
              </div>

              <button 
                className="vt-pm-primary-cta"
                onClick={() => { onClose(); onOpenHotelWorkspace?.(); }}
              >
                <span>Open Hotel Partner Console</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* ROLE: RESTAURANT & DINING PARTNER                         */}
          {/* ========================================================= */}
          {activeRole === 'restaurant' && (
            <div className="vt-pm-role-view">
              <div className="vt-pm-venue-meta-box">
                <Utensils size={20} className="vt-pm-vm-icon" />
                <div>
                  <strong>Sattvic Bhojanalaya Desk</strong>
                  <span>Pure Vaishnava kitchen table reservations</span>
                </div>
              </div>

              <div className="vt-pm-stats-grid">
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">6</strong>
                  <span className="vt-pm-stat-lbl">Reserved Tables</span>
                </div>
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">85</strong>
                  <span className="vt-pm-stat-lbl">Thali Pre-orders</span>
                </div>
                <div className="vt-pm-stat-box">
                  <strong className="vt-pm-stat-num">4.8 ★</strong>
                  <span className="vt-pm-stat-lbl">Taste Rating</span>
                </div>
              </div>

              <button 
                className="vt-pm-primary-cta"
                onClick={() => { onClose(); onOpenRestaurantWorkspace?.(); }}
              >
                <span>Open Restaurant Partner Console</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
