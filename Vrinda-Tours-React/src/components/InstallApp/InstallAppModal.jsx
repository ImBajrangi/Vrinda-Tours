import { useState, useEffect } from 'react';
import { 
  Smartphone, Download, ShieldCheck, Zap, MapPin, 
  Car, Sparkles, X, CheckCircle2, Apple, Share, PlusSquare 
} from 'lucide-react';
import './InstallAppModal.css';

export default function InstallAppModal({ isOpen, onClose, triggerReason = 'manual' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState('pilgrim'); // 'pilgrim' | 'driver'
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    // Capture PWA beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      // iOS guide
    } else {
      // Direct WebAPK or manual
      alert('To install, tap the 3 dots (Menu) on Chrome and tap "Install App" or "Add to Home Screen".');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vt-app-modal-overlay" onClick={onClose}>
      <div className="vt-app-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="vt-am-header">
          <div className="vt-am-badge">
            <Sparkles size={13} className="vt-am-badge-icon" />
            <span>Official Mobile Experience</span>
          </div>
          <button className="vt-am-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Hero Branding */}
        <div className="vt-am-hero">
          <div className="vt-am-logo-wrap">
            <img src="/official-logo.svg" alt="Vrinda Travels Logo" className="vt-am-logo-img" />
            <div className="vt-am-logo-ring" />
          </div>
          <h2 className="vt-am-title">Install Vrinda Travels App</h2>
          <p className="vt-am-subtitle">
            {triggerReason === 'booking_success'
              ? '🎉 Booking request saved! Install the official app for instant trip tracking & offline maps.'
              : 'Lightning-fast mobile app for sacred Brij Darshan, verified E-Rickshaws & verified stay bookings.'}
          </p>
        </div>

        {/* Role Benefits Segment Switcher */}
        <div className="vt-am-tab-pills">
          <button
            className={`vt-am-tab ${activeTab === 'pilgrim' ? 'active' : ''}`}
            onClick={() => setActiveTab('pilgrim')}
          >
            <MapPin size={14} />
            <span>For Pilgrims & Devotees</span>
          </button>
          <button
            className={`vt-am-tab ${activeTab === 'driver' ? 'active' : ''}`}
            onClick={() => setActiveTab('driver')}
          >
            <Car size={14} />
            <span>For Sarathi Drivers</span>
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="vt-am-benefits-list">
          {activeTab === 'pilgrim' ? (
            <>
              <div className="vt-am-benefit-item">
                <div className="vt-am-icon-box emerald">
                  <Zap size={16} />
                </div>
                <div>
                  <strong>Instant 1-Tap E-Rickshaw Dispatch</strong>
                  <span>Book local verified rides with 0% surge and direct temple entry permits.</span>
                </div>
              </div>
              <div className="vt-am-benefit-item">
                <div className="vt-am-icon-box amber">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <strong>Offline Temple Guides & Aarti Timings</strong>
                  <span>Works seamlessly in low-network temple corridors and remote Kunds.</span>
                </div>
              </div>
              <div className="vt-am-benefit-item">
                <div className="vt-am-icon-box blue">
                  <Smartphone size={16} />
                </div>
                <div>
                  <strong>Zero Battery Drain & Super Smooth</strong>
                  <span>Optimized for all Android & iPhone models with instant startup.</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="vt-am-benefit-item">
                <div className="vt-am-icon-box emerald">
                  <Car size={16} />
                </div>
                <div>
                  <strong>0% Commission Direct Bookings</strong>
                  <span>Receive customer ride requests straight from temples and hotels without deductions.</span>
                </div>
              </div>
              <div className="vt-am-benefit-item">
                <div className="vt-am-icon-box amber">
                  <Zap size={16} />
                </div>
                <div>
                  <strong>Voice Navigation in Braj Bhasha</strong>
                  <span>Accurate alley-level directions avoiding heavy car traffic zones.</span>
                </div>
              </div>
              <div className="vt-am-benefit-item">
                <div className="vt-am-icon-box blue">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <strong>Instant UPI & Cash Payments</strong>
                  <span>Direct customer settlement with complete earning transparency.</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* iOS Specific Instructions if on iPhone */}
        {isIos && (
          <div className="vt-am-ios-guide">
            <div className="vt-am-ios-guide-header">
              <Apple size={14} />
              <span>How to install on iPhone / iPad:</span>
            </div>
            <p>1. Tap the <Share size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>Share button</strong> at bottom of Safari.</p>
            <p>2. Scroll down and tap <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</p>
          </div>
        )}

        {/* Action Button CTA */}
        <div className="vt-am-action-bar">
          <button className="vt-am-install-btn" onClick={handleInstallClick}>
            <Download size={18} />
            <span>{isInstalled ? 'App Ready in Standalone Mode' : 'Install App Now (Free)'}</span>
          </button>
          <button className="vt-am-dismiss-btn" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
