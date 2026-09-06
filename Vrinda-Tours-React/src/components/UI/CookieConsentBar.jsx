import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Cookie, SlidersHorizontal, X } from 'lucide-react';
import MorphingIcon from './MorphingIcon';
import './CookieConsentBar.css';

const COOKIE_STORAGE_KEY = 'vt_cookie_consent';

const CATEGORY_DEFINITIONS = [
  {
    id: 'necessary',
    title: 'Strictly Necessary Cookies',
    description:
      'These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.',
    locked: true
  },
  {
    id: 'performance',
    title: 'Performance Cookies',
    description:
      'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.',
    locked: false
  },
  {
    id: 'functional',
    title: 'Functional Cookies',
    description:
      'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.',
    locked: false
  },
  {
    id: 'targeting',
    title: 'Targeting Cookies',
    description:
      'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.',
    locked: false
  }
];

/**
 * Modern Minimalist Floating Cookie Consent Bar & Privacy Preference Center
 * Features Apple-style dynamic island spring reveal, morphing bouncy icons,
 * fluid CSS grid expansion, and tactile iOS physics.
 */
export default function CookieConsentBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPrefOpen, setIsPrefOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isPrefClosing, setIsPrefClosing] = useState(false);

  // Granular Cookie Category Preferences
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true,
    performance: true,
    functional: false,
    targeting: true
  });

  // Accordion state: 'performance' is open by default matching reference image
  const [expandedSection, setExpandedSection] = useState('performance');

  useEffect(() => {
    try {
      const savedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!savedConsent) {
        // Natural gentle reveal after initial page paint with Apple spring entrance
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 750);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(savedConsent);
        if (parsed && typeof parsed === 'object' && parsed.categories) {
          setCookieSettings(parsed.categories);
        }
      }
    } catch {
      // Storage unavailable or blocked
    }

    // Expose global trigger for footer link or policy to reopen preference center
    window.openCookieConsent = () => {
      setIsVisible(true);
      setIsPrefOpen(true);
    };

    return () => {
      delete window.openCookieConsent;
    };
  }, []);

  // Prevent background body scroll when preference modal is active
  useEffect(() => {
    if (isPrefOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isPrefOpen]);

  const handleDismiss = (consentData) => {
    setIsClosing(true);
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentData));
    } catch (e) {
      console.warn('Cookie consent save failed:', e);
    }
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      setIsPrefOpen(false);
      setIsPrefClosing(false);
    }, 340);
  };

  const handleClosePrefModal = () => {
    setIsPrefClosing(true);
    setTimeout(() => {
      setIsPrefOpen(false);
      setIsPrefClosing(false);
    }, 250);
  };

  const handleAllowAll = () => {
    const allAllowed = {
      necessary: true,
      performance: true,
      functional: true,
      targeting: true
    };
    setCookieSettings(allAllowed);
    handleDismiss({
      status: 'allowed_all',
      categories: allAllowed,
      timestamp: new Date().toISOString()
    });
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      necessary: true,
      performance: false,
      functional: false,
      targeting: false
    };
    setCookieSettings(essentialOnly);
    handleDismiss({
      status: 'rejected_all',
      categories: essentialOnly,
      timestamp: new Date().toISOString()
    });
  };

  const handleConfirmChoices = () => {
    handleDismiss({
      status: 'custom_confirmed',
      categories: cookieSettings,
      timestamp: new Date().toISOString()
    });
  };

  const toggleCategory = (key) => {
    if (key === 'necessary') return; // Cannot disable strictly necessary
    setCookieSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAccordion = (key) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  if (!isVisible && !isPrefOpen) return null;
  if (typeof document === 'undefined') return null;

  return (
    <>
      {/* 1. Main Floating Pill Banner (Portaled to document.body for true bottom viewport positioning) */}
      {isVisible && !isPrefOpen && createPortal(
        <aside
          className={`vt-cookie-bar-container ${isClosing ? 'is-hiding' : 'is-revealed'}`}
          role="region"
          aria-label="Cookie consent banner"
        >
          <div className="vt-cookie-bar-pill">
            {/* Left Section: Circular Cookie Icon & Consent Message */}
            <div className="vt-cookie-bar-left">
              <div className="vt-cookie-icon-badge" aria-hidden="true">
                <Cookie size={19} className="vt-cookie-icon" strokeWidth={2} />
              </div>
              <p className="vt-cookie-text">
                By clicking “Accept”, you agree to the storing of cookies on your device.
              </p>
            </div>

            {/* Right Section: Sliders Preference Icon, Reject & Accept Action Buttons */}
            <div className="vt-cookie-bar-actions">
              <button
                type="button"
                className="vt-cookie-btn-pref"
                onClick={() => setIsPrefOpen(true)}
                title="Privacy Preference Center"
                aria-label="Open Privacy Preference Center"
              >
                <SlidersHorizontal size={17} strokeWidth={2} />
              </button>

              <button
                type="button"
                className="vt-cookie-btn-reject"
                onClick={handleRejectAll}
                aria-label="Reject non-essential cookies"
              >
                Reject
              </button>

              <button
                type="button"
                className="vt-cookie-btn-accept"
                onClick={handleAllowAll}
                aria-label="Accept all cookies"
              >
                Accept
              </button>
            </div>
          </div>
        </aside>,
        document.body
      )}

      {/* 2. Full Privacy Preference Center Modal (Apple-style Spring Morphing) */}
      {isPrefOpen && createPortal(
        <div
          className={`vt-cookie-modal-backdrop ${isPrefClosing ? 'is-closing' : 'is-open'}`}
          onClick={handleClosePrefModal}
        >
          <div
            className={`vt-cookie-pref-center-card ${isPrefClosing ? 'is-closing' : 'is-open'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="vt-pref-center-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Close Icon & Centered Title */}
            <div className="vt-pref-center-header">
              <button
                type="button"
                className="vt-pref-close-btn"
                onClick={handleClosePrefModal}
                aria-label="Close Privacy Preference Center"
              >
                <X size={18} />
              </button>
              <h3 id="vt-pref-center-title" className="vt-pref-center-title">
                Privacy Preference Center
              </h3>
              <div className="vt-pref-header-spacer" />
            </div>

            {/* Body Container */}
            <div className="vt-pref-center-body">
              {/* Introduction Narrative */}
              <p className="vt-pref-intro-text">
                When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device and is mostly used to make the site work as you expect it to. The information does not usually directly identify you, but it can give you a more personalized web experience.
              </p>

              {/* Top Full-Width "Allow" Button */}
              <button
                type="button"
                className="vt-pref-btn-allow-all"
                onClick={handleAllowAll}
              >
                Allow
              </button>

              {/* Accordion Categories List (Fluid Morphing Grid) */}
              <div className="vt-pref-accordion-list">
                {CATEGORY_DEFINITIONS.map((category) => {
                  const isOpen = expandedSection === category.id;
                  const isLocked = category.locked;
                  const isChecked = cookieSettings[category.id];

                  return (
                    <div
                      key={category.id}
                      className={`vt-pref-acc-item ${isOpen ? 'is-open' : ''}`}
                    >
                      <div
                        className="vt-pref-acc-header"
                        onClick={() => toggleAccordion(category.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleAccordion(category.id);
                          }
                        }}
                        aria-expanded={isOpen}
                      >
                        <div className="vt-pref-acc-title-wrap">
                          <span className="vt-pref-acc-toggle-icon">
                            <MorphingIcon
                              icon={isOpen ? 'minus' : 'plus'}
                              size={15}
                              color="currentColor"
                              spring="bouncy"
                            />
                          </span>
                          <span className="vt-pref-acc-title">{category.title}</span>
                        </div>

                        <div className="vt-pref-switch-wrap" onClick={(e) => e.stopPropagation()}>
                          <label
                            className={`vt-pref-switch ${isLocked ? 'is-locked' : ''}`}
                            aria-label={`Toggle ${category.title}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isLocked}
                              onChange={() => toggleCategory(category.id)}
                            />
                            <span className="vt-pref-slider" />
                          </label>
                        </div>
                      </div>

                      {/* Smooth Fluid CSS Grid Expansion Container */}
                      <div className="vt-pref-acc-content-wrapper">
                        <div className="vt-pref-acc-body">
                          <p>{category.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Footer Action Buttons: Reject & Confirm */}
            <div className="vt-pref-center-footer">
              <button
                type="button"
                className="vt-pref-btn-reject"
                onClick={handleRejectAll}
              >
                Reject
              </button>
              <button
                type="button"
                className="vt-pref-btn-confirm"
                onClick={handleConfirmChoices}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
