import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Cookie } from 'lucide-react';
import './CookieConsentBar.css';

const COOKIE_STORAGE_KEY = 'vt_cookie_consent';

/**
 * Clean Minimal Modern Floating Cookie Consent Bar
 * Minimalist software standard (Uber / Linear aesthetic)
 */
export default function CookieConsentBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!savedConsent) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleDismiss = (status) => {
    setIsClosing(true);
    try {
      localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({ status, timestamp: new Date().toISOString() })
      );
    } catch (e) {
      console.warn('Cookie consent save error:', e);
    }
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 280);
  };

  if (!isVisible) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <aside
      className={`vt-cookie-bar-container ${isClosing ? 'is-hiding' : 'is-revealed'}`}
      role="region"
      aria-label="Cookie consent banner"
    >
      <div className="vt-cookie-bar-pill">
        <div className="vt-cookie-bar-left">
          <div className="vt-cookie-icon-badge" aria-hidden="true">
            <Cookie size={17} className="vt-cookie-icon" strokeWidth={2} />
          </div>
          <p className="vt-cookie-text">
            By clicking “Accept”, you agree to the storing of cookies on your device.
          </p>
        </div>

        <div className="vt-cookie-bar-actions">
          <button
            type="button"
            className="vt-cookie-btn-reject"
            onClick={() => handleDismiss('rejected')}
            aria-label="Reject non-essential cookies"
          >
            Reject
          </button>

          <button
            type="button"
            className="vt-cookie-btn-accept"
            onClick={() => handleDismiss('accepted')}
            aria-label="Accept all cookies"
          >
            Accept
          </button>
        </div>
      </div>
    </aside>,
    document.body
  );
}
