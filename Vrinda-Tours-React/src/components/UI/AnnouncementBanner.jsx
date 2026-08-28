import React, { useState, useEffect } from 'react';
import { Zap, Building2, MapPin, Landmark, Sparkles } from 'lucide-react';
import './AnnouncementBanner.css';

const DEFAULT_MARQUEE = [
  { text: 'Electric Rickshaw & E-Auto Rides in Vrindavan & Barsana', icon: 'zap' },
  { text: 'Verified Pilgrim Stays & Pure Sattvic Dining', icon: 'hotel' },
  { text: 'Mathura • Vrindavan • Barsana • Nandgaon • Govardhan • Gokul', icon: 'pin' },
  { text: 'Vrinda Vihar — Authentic Brij Mandal Pilgrimage Companion', icon: 'landmark' }
];

function BannerIcon({ type }) {
  if (type === 'zap') return <Zap size={13} className="marquee-lucide-icon" />;
  if (type === 'hotel') return <Building2 size={13} className="marquee-lucide-icon" />;
  if (type === 'pin') return <MapPin size={13} className="marquee-lucide-icon" />;
  if (type === 'landmark') return <Landmark size={13} className="marquee-lucide-icon" />;
  return <Sparkles size={13} className="marquee-lucide-icon" />;
}

export default function AnnouncementBanner() {
  const [marqueeItems, setMarqueeItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vrinda_announcement_items');
      return saved ? JSON.parse(saved) : DEFAULT_MARQUEE;
    } catch {
      return DEFAULT_MARQUEE;
    }
  });

  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem('vrinda_announcement_enabled') !== 'false';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('vrinda_announcement_items');
        if (saved) setMarqueeItems(JSON.parse(saved));
        setIsEnabled(localStorage.getItem('vrinda_announcement_enabled') !== 'false');
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('vrinda_announcement_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vrinda_announcement_update', handleStorageChange);
    };
  }, []);

  if (!isEnabled || !marqueeItems || marqueeItems.length === 0) return null;

  return (
    <div className="announcement-banner">
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => {
            const cleanText = (item.text || '').replace(/[✨🏨📍🚩🛕🛺]/g, '').trim();
            const iconType = item.icon || (item.text?.includes('Electric') ? 'zap' : item.text?.includes('Stays') ? 'hotel' : item.text?.includes('Mathura') ? 'pin' : 'landmark');
            return (
              <div key={index} className="marquee-item">
                <BannerIcon type={iconType} />
                <span className="marquee-text">{cleanText}</span>
                <span className="marquee-separator">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
