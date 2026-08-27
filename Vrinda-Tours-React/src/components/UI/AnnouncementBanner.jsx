import React, { useState, useEffect } from 'react';
import './AnnouncementBanner.css';

const DEFAULT_MARQUEE = [
  { text: '✨ Electric Rickshaw & E-Auto Rides in Vrindavan & Barsana' },
  { text: '🏨 Verified Pilgrim Stays & Pure Sattvic Dining' },
  { text: '📍 Mathura • Vrindavan • Barsana • Nandgaon • Govardhan • Gokul' },
  { text: '🚩 Vrinda Vihar — Authentic Brij Mandal Pilgrimage Companion' }
];

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
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
            <div key={index} className="marquee-item">
              <span className="marquee-text">{item.text}</span>
              <span className="marquee-separator">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
