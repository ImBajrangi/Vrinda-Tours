import React, { useState } from 'react';
import { 
  X, ShieldCheck, Heart, Sparkles, BookOpen, 
  Phone, Mail, MapPin, ExternalLink, CheckCircle2, 
  ChevronRight, AlertTriangle, FileText, Lock, FileCheck2,
  HeartHandshake, Zap, Leaf, Shirt, Footprints, 
  UtensilsCrossed, PhoneCall, MessageSquare, Building2, Compass
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
      <div className="im-overlay" onClick={onClose} aria-hidden="true" />
      <div className="im-modal-container" role="dialog" aria-modal="true" aria-labelledby="im-modal-title">
        {/* Header */}
        <div className="im-header">
          <div className="im-header-left">
            <div className="im-brand-icon" aria-label="Vrinda Vihar Official Brand Mark">
              <svg className="im-official-logo" viewBox="0 0 272 259" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1,0,0,1,-418.083907,-98.227791)">
                  <g id="Official-Brand-Logo">
                    <g transform="matrix(4.145086,-0.002331,0.002331,4.145086,392.989907,96.134588)">
                      <path className="im-tilak-path" d="M57.834,30.387C56.654,32.383 55.478,34.382 54.312,36.384C53.918,37.06 53.608,37.766 53.209,38.446C48.566,46.361 43.853,54.439 39.163,62.366C38.779,63.016 37.032,63.032 36.623,62.366C33.816,57.794 31.021,53.054 28.282,48.368C25.102,42.932 21.829,37.568 18.606,32.154C20.036,31.656 21.335,30.88 22.362,29.936C24.625,27.854 25.337,24.562 26.153,21.078C27.236,16.454 28.118,11.474 29.28,6.923C29.251,7.034 29.458,6.935 29.456,6.318C29.454,5.641 29.194,5.934 29.042,5.934C29.005,5.935 28.945,5.928 28.91,5.94C27.251,6.49 25.728,7.226 24.192,7.847C20.95,9.158 18.054,10.423 14.827,11.792C13.275,12.45 11.532,12.883 10.042,13.702C9.517,13.99 9.021,14.403 8.566,14.873C7.727,13.441 6.889,12.006 6.048,10.569C6.858,10.85 7.779,11.037 8.475,10.966C9.384,10.873 10.549,10.138 11.621,9.717C17.152,7.543 22.112,5.456 27.279,3.273C29.292,2.422 31.27,1.527 33.643,0.905C33.685,2.513 33.088,4.066 32.691,5.664C31.469,10.576 30.594,15.435 29.385,20.358C28.576,23.655 27.638,26.964 27.974,30.589C28.591,37.246 31.811,43.844 37.441,45.268C40.955,46.158 44.027,43.701 45.618,41.568C48.461,37.753 49.891,31.263 48.792,25.149C48.615,24.163 48.252,23.075 47.944,22.055C46.08,15.883 44.209,9.645 42.458,3.567C42.178,2.597 41.66,1.56 41.878,0.529C44.241,0.975 46.268,1.805 48.405,2.479C53.743,4.161 59.086,5.9 64.497,7.595C66.26,8.147 67.656,9.109 69.711,8.263C70.345,8.003 70.938,7.651 71.493,7.228C70.393,9.143 69.283,11.054 68.165,12.962C67.566,12.444 66.919,12.022 66.249,11.72C63.335,10.402 59.85,9.604 56.41,8.364C53.184,7.202 49.349,6.039 46.177,5.157C47.133,8.882 48.202,12.338 49.247,16.018C50.901,21.846 52.161,28.041 57.23,30.154C57.432,30.238 57.634,30.316 57.834,30.387Z" />
                    </g>
                    <g id="raj" transform="matrix(1.003197,0,0,1.003197,497.7262,176.385095)">
                      <path className="im-raj-path" d="M70.741,44.628C79.705,59.855 63.424,78.538 46.988,71.021C39.415,67.557 33.18,57.201 37.751,46.908C40.134,41.541 45.423,36.436 53.107,35.871C62.341,35.192 66.783,39.76 70.741,44.628Z" />
                    </g>
                    <g id="shyam-shri" transform="matrix(-0.001887,0.999998,-0.999998,-0.001887,1007.189386,-420.946519)">
                      <ellipse className="im-shyam-ellipse" cx="596" cy="453.98" rx="26" ry="21.98" />
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div>
              <h3 id="im-modal-title">{INFO_TABS[activeTab]?.title || 'Pilgrim Information'}</h3>
              <span className="im-header-sub">{INFO_TABS[activeTab]?.subtitle}</span>
            </div>
          </div>
          <button className="im-close-btn" onClick={onClose} title="Close" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="im-tabs-bar" role="tablist">
          {Object.values(INFO_TABS).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`im-tab-chip ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} className="im-tab-icon" />
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
                <span className="im-tag">Vrindopnishad Mission</span>
                <h4>Preserving the Sacred Brij 84 Kos Yatra</h4>
                <p>
                  Vrinda Vihar is dedicated to the spiritual service of Shri Radha Rani and Lord Krishna, connecting pilgrims worldwide with verified Brajwasi drivers, authentic ashrams, and zero-middleman travel.
                </p>
              </div>

              <div className="im-grid-two">
                <div className="im-feature-card">
                  <div className="im-card-icon-badge">
                    <HeartHandshake size={18} />
                  </div>
                  <strong>0% Middleman Fees</strong>
                  <p>100% of ride fares and temple donations go directly to local drivers and ashrams.</p>
                </div>
                <div className="im-feature-card">
                  <div className="im-card-icon-badge">
                    <Zap size={18} />
                  </div>
                  <strong>Verified Brajwasi Drivers</strong>
                  <p>Clean, courteous local Sarathi electric rickshaws for smooth temple darshan.</p>
                </div>
                <div className="im-feature-card">
                  <div className="im-card-icon-badge">
                    <Leaf size={18} />
                  </div>
                  <strong>Eco-Friendly Parikrama</strong>
                  <p>Promoting zero-emission battery vehicles and clean Yamuna ghat preservation.</p>
                </div>
                <div className="im-feature-card">
                  <div className="im-card-icon-badge">
                    <ShieldCheck size={18} />
                  </div>
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
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <Shirt size={18} />
                  </div>
                  <h4>Temple Dress Code &amp; Footwear</h4>
                </div>
                <p>
                  Wear traditional modest attire (Kurta-Pyjama / Dhoti / Saree / Salwar). Always leave footwear at designated Chappal stands before entering temple sanctums. Leather belts and wallets are prohibited inside inner sanctums.
                </p>
              </div>

              <div className="im-info-card warning">
                <div className="im-card-header">
                  <div className="im-card-icon-badge warning">
                    <AlertTriangle size={18} />
                  </div>
                  <h4>Monkey &amp; Eyewear Safety</h4>
                </div>
                <p>
                  Never wear eyeglasses, sunglasses, or carry open food in old Vrindavan alleys (Banke Bihari, Nidhivan) and Barsana Hill. Keep mobile phones zipped securely inside bags.
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <Footprints size={18} />
                  </div>
                  <h4>Govardhan 21 km Parikrama Rules</h4>
                </div>
                <p>
                  Always circumambulate clockwise (keeping Giriraj to your right). Stay hydrated with buttermilk (Chhaachh). Barefoot walking or authorized E-Rickshaws available.
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <UtensilsCrossed size={18} />
                  </div>
                  <h4>Sattvic Diet Standards</h4>
                </div>
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
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <CheckCircle2 size={18} />
                  </div>
                  <h4>1. Transparent Fares &amp; Direct Payment</h4>
                </div>
                <p>
                  All estimated ride fares are fixed standard rates established with local driver associations. Devotees pay drivers directly in cash or UPI. Vrinda Vihar charges 0% commission to devotees.
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <ShieldCheck size={18} />
                  </div>
                  <h4>2. Free Cancellation Policy</h4>
                </div>
                <p>
                  Cancel ride requests anytime before driver arrival with zero cancellation penalty. Package bookings enjoy a 100% refund when cancelled 24 hours prior.
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <Heart size={18} />
                  </div>
                  <h4>3. Devotee Sanctity Clause</h4>
                </div>
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
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <MapPin size={18} />
                  </div>
                  <h4>GPS Location Protection</h4>
                </div>
                <p>
                  Real-time GPS coordinates are collected only with your explicit permission during active navigation and ride dispatch. We never track your location when the app is closed.
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <Lock size={18} />
                  </div>
                  <h4>End-to-End Payment Encryption</h4>
                </div>
                <p>
                  All online payments and UPI transactions are handled securely through PCI-DSS Level 1 certified payment gateways. We never store card or UPI PIN details.
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <FileCheck2 size={18} />
                  </div>
                  <h4>DPDP Act 2023 Compliance</h4>
                </div>
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
                  <div className="im-card-icon-badge">
                    <Compass size={18} />
                  </div>
                  <strong>12 Sacred Forests</strong>
                  <p>Vrindavan, Madhuvan, Talavan, Kumudvan, Bahulavan, Kamyavan, Khadiravan, Bhadravan, Bhandirvan, Belvan, Lohavan, Mahavan.</p>
                </div>
                <div className="im-feature-card">
                  <div className="im-card-icon-badge">
                    <Sparkles size={18} />
                  </div>
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
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <PhoneCall size={18} />
                  </div>
                  <h4>24/7 Devotee Helpline</h4>
                </div>
                <p>
                  <a href="tel:+917618218181" className="im-contact-link">
                    +91 76182 18181
                  </a>
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge green">
                    <MessageSquare size={18} />
                  </div>
                  <h4>WhatsApp Pilgrimage Concierge</h4>
                </div>
                <p>
                  <a 
                    href="https://wa.me/917618218181?text=Hare%20Krishna%2C%20I%20need%20assistance%20with%20Vrindavan%20Yatra" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="im-whatsapp-link"
                  >
                    Chat on WhatsApp (+91 76182 18181) →
                  </a>
                </p>
              </div>

              <div className="im-info-card">
                <div className="im-card-header">
                  <div className="im-card-icon-badge">
                    <Building2 size={18} />
                  </div>
                  <h4>Headquarters Address</h4>
                </div>
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
