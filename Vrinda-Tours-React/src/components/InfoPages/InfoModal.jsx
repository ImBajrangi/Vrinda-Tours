import React, { useState } from 'react';
import { 
  X, ShieldCheck, Heart, Sparkles, BookOpen, 
  HelpCircle, Compass, Phone, Mail, MapPin, 
  ExternalLink, CheckCircle2, ChevronRight, AlertCircle, FileText
} from 'lucide-react';
import './InfoModal.css';

export const INFO_TABS = {
  about: {
    id: 'about',
    title: 'About Vrinda Vihar',
    subtitle: 'Sacred Brij 84 Kos Pilgrimage Mission',
    icon: Sparkles
  },
  guidelines: {
    id: 'guidelines',
    title: 'Pilgrim Guidelines',
    subtitle: 'Temple Etiquette, Parikrama & Safety',
    icon: Compass
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    subtitle: 'Devotee Agreement & Fair Fare Policy',
    icon: FileText
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'DPDP Act 2023 & GPS Data Protection',
    icon: ShieldCheck
  },
  yatra: {
    id: 'yatra',
    title: '84 Kos Yatra Guide',
    subtitle: '12 Sacred Forests & Parikrama Trails',
    icon: BookOpen
  },
  contact: {
    id: 'contact',
    title: 'Contact Operations',
    subtitle: '24/7 Brij Pilgrimage Concierge',
    icon: Phone
  }
};

export default function InfoModal({ initialTab = 'about', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'about');

  return (
    <>
      <div className="im-overlay" onClick={onClose} />
      <div className="im-modal-container">
        {/* Header */}
        <div className="im-header">
          <div className="im-header-left">
            <div className="im-brand-icon">
              <span>🕉️</span>
            </div>
            <div>
              <h3>{INFO_TABS[activeTab]?.title || 'Pilgrim Information'}</h3>
              <span className="im-header-sub">{INFO_TABS[activeTab]?.subtitle}</span>
            </div>
          </div>
          <button className="im-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="im-tabs-bar">
          {Object.values(INFO_TABS).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`im-tab-chip ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="im-body">
          {/* 1. ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="im-content-section">
              <div className="im-hero-card">
                <span className="im-tag">Vrindopnishad Trust</span>
                <h4>Preserving the Sacred Brij 84 Kos Yatra</h4>
                <p>
                  Vrinda Vihar is dedicated to the spiritual service of Shri Radha Rani and Lord Krishna, connecting pilgrims worldwide with verified Brajwasi drivers, authentic ashrams, and zero-middleman travel.
                </p>
              </div>

              <div className="im-grid-two">
                <div className="im-feature-card">
                  <span className="im-feat-icon">🤝</span>
                  <strong>0% Middleman Fees</strong>
                  <p>100% of ride fares and temple donations go directly to local drivers and ashrams.</p>
                </div>
                <div className="im-feature-card">
                  <span className="im-feat-icon">🛺</span>
                  <strong>Verified Brajwasi Drivers</strong>
                  <p>Clean, courteous local Sarathi electric rickshaws for smooth temple darshan.</p>
                </div>
                <div className="im-feature-card">
                  <span className="im-feat-icon">🌿</span>
                  <strong>Eco-Friendly Parikrama</strong>
                  <p>Promoting zero-emission battery vehicles and clean Yamuna ghat preservation.</p>
                </div>
                <div className="im-feature-card">
                  <span className="im-feat-icon">🛡️</span>
                  <strong>100% Inspected Stays</strong>
                  <p>Clean ashrams and guesthouses with pure Vaishnava sattvic dining.</p>
                </div>
              </div>

              <div className="im-external-link-row">
                <a href="/about.html" target="_blank" rel="noopener noreferrer">
                  <span>Read Full About Us Page</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* 2. GUIDELINES TAB */}
          {activeTab === 'guidelines' && (
            <div className="im-content-section">
              <div className="im-info-card">
                <h4>🥻 Temple Dress Code &amp; Footwear</h4>
                <p>
                  Wear traditional modest attire (Kurta-Pyjama / Dhoti / Saree / Salwar). Always leave footwear at designated Chappal stands before entering temple sanctums. Leather belts and wallets are prohibited inside inner sanctums.
                </p>
              </div>

              <div className="im-info-card warning">
                <h4>👓 Monkey &amp; Eyewear Safety</h4>
                <p>
                  Never wear eyeglasses, sunglasses, or carry open food in old Vrindavan alleys (Banke Bihari, Nidhivan) and Barsana Hill. Keep mobile phones zipped securely inside bags.
                </p>
              </div>

              <div className="im-info-card">
                <h4>👣 Govardhan 21 km Parikrama Rules</h4>
                <p>
                  Always circumambulate clockwise (keeping Giriraj to your right). Stay hydrated with buttermilk (Chhaachh). Barefoot walking or authorized E-Rickshaws available.
                </p>
              </div>

              <div className="im-info-card">
                <h4>🥗 Sattvic Diet Standards</h4>
                <p>
                  Strictly vegetarian food without onion or garlic. Non-vegetarian food, eggs, alcohol, and smoking are strictly forbidden across Brij Dham.
                </p>
              </div>

              <div className="im-external-link-row">
                <a href="/guidelines.html" target="_blank" rel="noopener noreferrer">
                  <span>View Complete Temple Guidelines</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* 3. TERMS TAB */}
          {activeTab === 'terms' && (
            <div className="im-content-section">
              <div className="im-info-card">
                <h4>1. Transparent Fares &amp; Direct Payment</h4>
                <p>
                  All estimated ride fares are fixed standard rates established with local driver associations. Devotees pay drivers directly in cash or UPI. Vrinda Vihar charges 0% commission to devotees.
                </p>
              </div>

              <div className="im-info-card">
                <h4>2. Free Cancellation Policy</h4>
                <p>
                  Cancel ride requests anytime before driver arrival with zero cancellation penalty. Package bookings enjoy a 100% refund when cancelled 24 hours prior.
                </p>
              </div>

              <div className="im-info-card">
                <h4>3. Devotee Sanctity Clause</h4>
                <p>
                  All users and merchants agree to uphold peaceful conduct, reverence, and zero touting across all sacred temple grounds.
                </p>
              </div>

              <div className="im-external-link-row">
                <a href="/terms.html" target="_blank" rel="noopener noreferrer">
                  <span>Read Complete Terms of Service</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* 4. PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div className="im-content-section">
              <div className="im-info-card">
                <h4>📍 GPS Location Protection</h4>
                <p>
                  Real-time GPS coordinates are collected only with your explicit permission during active navigation and ride dispatch. We never track your location when the app is closed.
                </p>
              </div>

              <div className="im-info-card">
                <h4>🔒 End-to-End Payment Encryption</h4>
                <p>
                  All online payments and UPI transactions are handled securely through PCI-DSS Level 1 certified payment gateways. We never store card or UPI PIN details.
                </p>
              </div>

              <div className="im-info-card">
                <h4>📜 DPDP Act 2023 Compliance</h4>
                <p>
                  You have the complete right to request access, correction, or deletion of your phone number and ride records by emailing privacy@vrindopnishad.in.
                </p>
              </div>

              <div className="im-external-link-row">
                <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
                  <span>View Full Privacy Policy Document</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* 5. 84 KOS YATRA TAB */}
          {activeTab === 'yatra' && (
            <div className="im-content-section">
              <div className="im-hero-card">
                <span className="im-tag">Cornerstone Pilgrimage</span>
                <h4>The 84 Kos Parikrama (approx. 250 km)</h4>
                <p>
                  Traversing 12 sacred forests (Vans) and 24 upavans across Vrindavan, Mathura, Govardhan, Barsana, Gokul, and Kamyavan.
                </p>
              </div>

              <div className="im-grid-two">
                <div className="im-feature-card">
                  <strong>12 Sacred Forests</strong>
                  <p>Vrindavan, Madhuvan, Talavan, Kumudvan, Bahulavan, Kamyavan, Khadiravan, Bhadravan, Bhandirvan, Belvan, Lohavan, Mahavan.</p>
                </div>
                <div className="im-feature-card">
                  <strong>Sacred Kunds</strong>
                  <p>Radha Kund, Shyam Kund, Kusum Sarovar, Prem Sarovar, Manasi Ganga, Potra Kund.</p>
                </div>
              </div>

              <div className="im-external-link-row">
                <a href="/brij-84-kos-yatra.html" target="_blank" rel="noopener noreferrer">
                  <span>Open Full 84 Kos Yatra Day-by-Day Guide</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}

          {/* 6. CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="im-content-section">
              <div className="im-info-card">
                <h4>📞 24/7 Devotee Helpline</h4>
                <p><a href="tel:+917618218181" style={{ color: '#0f172a', fontWeight: 800 }}>+91 76182 18181</a></p>
              </div>

              <div className="im-info-card">
                <h4>💬 WhatsApp Pilgrimage Concierge</h4>
                <p>
                  <a 
                    href="https://wa.me/917618218181?text=Hare%20Krishna%2C%20I%20need%20assistance%20with%20Vrindavan%20Yatra" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#059669', fontWeight: 750 }}
                  >
                    Chat on WhatsApp (+91 76182 18181) →
                  </a>
                </p>
              </div>

              <div className="im-info-card">
                <h4>🏢 Headquarters Address</h4>
                <p>Vrinda Vihar Pilgrimage Center, Raman Reti Road, Vrindavan, Mathura (UP) 281121</p>
              </div>

              <div className="im-external-link-row">
                <a href="/contact.html" target="_blank" rel="noopener noreferrer">
                  <span>Open Standalone Contact Page</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
