import React from 'react';
import { Sparkles } from 'lucide-react';
import './AnnouncementBanner.css';

export default function AnnouncementBanner() {
  const marqueeItems = [
    { text: '✨ Electric Rickshaw & E-Auto Rides in Vrindavan & Barsana' },
    { text: '🏨 Verified Pilgrim Stays & Pure Sattvic Dining' },
    { text: '📍 Mathura • Vrindavan • Barsana • Nandgaon • Govardhan • Gokul' },
    { text: '🚩 Vrinda Tours — Authentic Brij Mandal Pilgrimage Companion' }
  ];

  return (
    <div className="announcement-banner">
      <div className="banner-left-badge">
        <span className="badge-pulse"></span>
        <span className="badge-text">LIVE PILGRIM COMPANION</span>
      </div>

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
