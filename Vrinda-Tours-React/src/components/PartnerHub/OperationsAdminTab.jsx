import { useState } from 'react';
import { 
  ShieldCheck, Plus, Trash2, Phone, Star, 
  MapPin, CheckCircle2, Search, UserCheck, AlertCircle, X 
} from 'lucide-react';
import { supabase } from '../../config/supabase';

export default function OperationsAdminTab({ drivers = [], onAddDriver, onDeleteDriver }) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'drivers' | 'restaurants' | 'hotels'
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('driver');
  const [vehicleType, setVehicleType] = useState('E-Rickshaw');
  const [vehicleNo, setVehicleNo] = useState('');

  // Sample Multi-Category Partners
  const [allPartners, setAllPartners] = useState([
    { id: 'd_1', name: 'Shri Daasi', category: 'driver', phone: '+919876543201', role: '🛺 E-Rickshaw • UP-85 VT 2026', verified: true, rating: '4.9', status: 'Available' },
    { id: 'd_2', name: 'Radhe', category: 'driver', phone: '+919876543202', role: '🛺 E-Rickshaw • UP-85', verified: true, rating: '4.9', status: 'Offline' },
    { id: 'r_1', name: 'Brijwasin Dining', category: 'restaurant', phone: '+919876543230', role: '🍽️ Sattvic Bhojanalaya', verified: true, rating: '4.8', status: 'Open' },
    { id: 'r_2', name: 'Govinda\'s Kitchen', category: 'restaurant', phone: '+919876543220', role: '🍽️ Pure Sattvic Thali', verified: true, rating: '4.7', status: 'Open' },
    { id: 'h_1', name: 'Radha Krishna Dham', category: 'hotel', phone: '+919876543210', role: '🏨 Temple Guesthouse', verified: true, rating: '4.9', status: '4 Rooms' },
    { id: 'h_2', name: 'Vrinda Heritage Stay', category: 'hotel', phone: '+919876543213', role: '🏨 Heritage Haveli', verified: true, rating: '4.8', status: '2 Suites' }
  ]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const newId = `partner_${Date.now()}`;
    const newEntry = {
      id: newId,
      name,
      phone,
      category,
      role: category === 'driver' ? `🛺 ${vehicleType} • ${vehicleNo || 'UP-85'}` : (category === 'restaurant' ? '🍽️ Sattvic Restaurant' : '🏨 Hotel Partner'),
      verified: true,
      rating: '5.0',
      status: 'Active'
    };

    // Optimistic local state
    setAllPartners(prev => [newEntry, ...prev]);

    // Save to Supabase
    try {
      await supabase.from('partners').insert([
        {
          id: newId,
          name,
          phone,
          category,
          role_details: newEntry.role,
          rating: 5.0,
          verified: true
        }
      ]);
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }

    setShowAddModal(false);
    setName('');
    setPhone('');
    setVehicleNo('');
  };

  const toggleVerify = (id) => {
    setAllPartners(prev => prev.map(p => p.id === id ? { ...p, verified: !p.verified } : p));
  };

  const removePartner = (id) => {
    if (window.confirm('Are you sure you want to remove this verified partner?')) {
      setAllPartners(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = allPartners.filter(p => {
    const matchesTab = activeSubTab === 'all' || p.category === activeSubTab;
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.phone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <>
      {/* Expandable Search & Add Action Bar */}
      <div className="ph-search-action-bar">
        <div className={`ph-search-box ${isFocused || searchQuery ? 'expanded' : ''}`}>
          <Search size={15} className="ph-search-icon" />
          <input 
            type="text" 
            placeholder="Search partners..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="ph-search-input"
          />
          {(isFocused || searchQuery) && (
            <button 
              className="ph-search-clear" 
              onClick={() => {
                setSearchQuery('');
                setIsFocused(false);
              }}
              title="Close search"
              onMouseDown={(e) => {
                e.preventDefault();
                setSearchQuery('');
                setIsFocused(false);
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button 
          className={`ph-btn-add-partner ${isFocused || searchQuery ? 'icon-only' : ''}`}
          onClick={() => setShowAddModal(true)}
          title="Register New Partner"
        >
          <span className="ph-btn-add-partner-icon">
            <Plus size={16} />
          </span>
          <span className="ph-btn-add-partner-text">Add Partner</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="ph-sub-filter-bar">
        {[
          { key: 'all', label: 'All Partners' },
          { key: 'driver', label: '🛺 Drivers' },
          { key: 'restaurant', label: '🍽️ Dining' },
          { key: 'hotel', label: '🏨 Stays' }
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setActiveSubTab(chip.key)}
            className={`ph-sub-filter-chip ${activeSubTab === chip.key ? 'active' : ''}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Partner Cards List */}
      <div className="ph-cards-list">
        {filtered.map(p => (
          <div key={p.id} className="ph-order-card">
            <div className="ph-order-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <span className="ph-order-guest">{p.name}</span>
                {p.verified && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    color: '#15803d',
                    background: '#dcfce7',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              <span className="ph-tag-gold"><Star size={11} fill="#f59e0b" color="#f59e0b" /> {p.rating}</span>
            </div>

            <div className="ph-order-meta">
              <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.role}</span>
              <span style={{ 
                color: p.status === 'Available' || p.status === 'Open' ? '#15803d' : '#71717a', 
                fontWeight: 800, 
                flexShrink: 0,
                marginLeft: 'auto'
              }}>
                ● {p.status}
              </span>
            </div>

            <div className="ph-order-actions">
              <button 
                className={`ph-btn-action ${p.verified ? 'outline' : 'primary'}`} 
                onClick={() => toggleVerify(p.id)}
                style={{ fontSize: '0.74rem', padding: '7px 10px' }}
              >
                <UserCheck size={13} /> {p.verified ? 'Verified' : '+ Verify'}
              </button>
              <button 
                className="ph-btn-action outline" 
                onClick={() => window.open(`tel:${p.phone}`)}
                style={{ fontSize: '0.74rem', padding: '7px 10px' }}
              >
                <Phone size={13} /> Call
              </button>
              <button 
                className="ph-btn-action outline" 
                style={{ color: '#ef4444', borderColor: '#fecaca', flex: 'none', width: '34px', height: '34px', padding: 0 }}
                onClick={() => removePartner(p.id)}
                title="Remove Partner"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Partner Form Modal */}
      {showAddModal && (
        <div 
          className="ph-sub-modal-backdrop"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="ph-sub-modal-card"
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Register Brij Partner</h4>
              <button 
                className="ph-close-btn" 
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <label className="ph-modal-label">Partner Type</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="ph-modal-select"
                >
                  <option value="driver">🛺 Driver Partner (E-Rickshaw/Taxi)</option>
                  <option value="restaurant">🍽️ Restaurant & Dining Staff</option>
                  <option value="hotel">🏨 Hotel, Ashram & Stay Staff</option>
                </select>
              </div>

              <div>
                <label className="ph-modal-label">Full Name / Business Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Radhe Shyam" 
                  required 
                  className="ph-modal-input"
                />
              </div>

              <div>
                <label className="ph-modal-label">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="+91 98765 43210" 
                  required 
                  className="ph-modal-input"
                />
              </div>

              {category === 'driver' && (
                <div>
                  <label className="ph-modal-label">Vehicle Number Plate</label>
                  <input 
                    type="text" 
                    value={vehicleNo} 
                    onChange={e => setVehicleNo(e.target.value)} 
                    placeholder="UP-85 VT 2026" 
                    className="ph-modal-input"
                  />
                </div>
              )}

              <button type="submit" className="ph-modal-submit-btn">
                Complete Partner Registration
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
