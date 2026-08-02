import React from 'react';
import './AnnouncementBanner.css';

export default function AnnouncementBanner() {
  const marqueeItems = [
    { text: '✨ COMING SOON IN BRIJ MANDAL', isBadge: true },
    { text: '🛺 Electric Rickshaw & E-Auto Rides in Vrindavan, Barsana & Govardhan' },
    { text: '🏨 Verified Pilgrim Guest Houses & Pure Sattvic Dining' },
    { text: '📍 Mathura • Vrindavan • Barsana • Nandgaon • Govardhan • Gokul' },
    { text: '🚩 Vrinda Tours — Authentic Brij Mandal Pilgrimage Companion' }
  ];

  return (
    <div className="announcement-banner">
      <div className="banner-left-badge">
        <span className="badge-pulse"></span>
        <span className="badge-text">COMING SOON</span>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-track">
          {/* Double array for seamless 100% infinite loop */}
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
            <div key={index} className="marquee-item">
              {item.isBadge ? (
                <span className="coming-soon-tag">{item.text}</span>
              ) : (
                <span className="marquee-text">{item.text}</span>
              )}
              <span className="marquee-separator">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
