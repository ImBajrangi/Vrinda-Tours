import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ArrowLeft, ArrowRight, Check, Copy, Clock, Star,
  Calendar, Users, MapPin, Sparkles, ShieldCheck, CreditCard,
  Smartphone, Headphones, CheckCircle2, ChevronRight, Tag,
  Building, User, Phone, AlertCircle, Compass, Heart, MoreVertical, Plus, Minus,
  Sunrise, Moon
} from 'lucide-react';
import { triggerCelebration } from '../UI/Confetti';
import AnimatedCheckCircle from '../UI/AnimatedCheckCircle';
import './PackageReservationModal.css';

/**
 * Sacred Add-on Options for Pilgrims (Replicating Multi-Item Cart from Reference UI)
 */
const DEFAULT_ADDONS = [
  {
    id: 'addon_vip_darshan',
    title: 'VIP Sugam Darshan Pass',
    subtitle: 'Fast-track priority entry at Bankey Bihari & Prem Mandir',
    duration: 'Direct Entry',
    rating: '4.9 (4.8k)',
    price: 499,
    image: '/vrinda-vihar/radha-raman-ji-smile.webp',
    count: 0
  },
  {
    id: 'addon_prasad_box',
    title: 'Chhappan Bhog Mahaprasad Box',
    subtitle: 'Pure desi ghee Mathura peda, sacred tulsi & sacred prasad',
    duration: 'Freshly Blessed',
    rating: '5.0 (2.1k)',
    price: 350,
    image: '/vrinda-vihar/radha-vallabh-ji-1.webp',
    count: 0
  },
  {
    id: 'addon_brajwasi_guide',
    title: 'Dedicated Brajwasi Katha Guide',
    subtitle: 'Local scholar guide narrating divine Radha Krishna leelas',
    duration: 'Full Day',
    rating: '4.9 (1.2k)',
    price: 599,
    image: '/vrinda-vihar/radha-vallabh-ji-temple.webp',
    count: 0
  }
];

const PICKUP_SUGGESTIONS = [
  'Mathura Junction Railway Station (PF 1)',
  'Vrindavan Hotel / Ashram Pickup',
  'Govardhan Parikrama Marg (Any Spot)',
  'Custom Devotee Address / Hotel'
];

/**
 * Modern Luxury Package Reservation Flow (Matching Reference Design)
 * 3-Stage Experience:
 * Stage 1: My Cart List (Package Stepper, Sacred Add-ons Steppers, Promo Code, Fare Breakdown)
 * Stage 2: Checkout (Payment Radio Pods, Add Payment Method, Devotee Contact, Pickup Point)
 * Stage 3: Order Successful Modal (Animated Checkmark Halo, Floating Sparkles, Booking ID)
 */
export default function PackageReservationModal({
  isOpen,
  onClose,
  packageItem,
  onOpenDetail,
  onOpenHelpCenter,
  currentUser
}) {
  const scrollRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const [step, setStep] = useState(1); // 1: Cart, 2: Checkout, 3: Success
  const [devoteeCount, setDevoteeCount] = useState(2);
  const [addons, setAddons] = useState(DEFAULT_ADDONS);
  const [selectedSlot, setSelectedSlot] = useState('morning'); // 'morning' | 'evening' | 'fullday'
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [promoCode, setPromoCode] = useState('RADHA500');
  const [isPromoApplied, setIsPromoApplied] = useState(true);
  const [promoDiscount, setPromoDiscount] = useState(500);

  // Devotee Information & Checkout Options
  const [devoteeName, setDevoteeName] = useState('');
  const [devoteePhone, setDevoteePhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: false, phone: false });
  const [pickupPoint, setPickupPoint] = useState('Mathura Junction Railway Station (PF 1)');
  const [showPickupSelector, setShowPickupSelector] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mastercard'); // 'mastercard' | 'upi' | 'applepay' | 'cash'
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [customUpiId, setCustomUpiId] = useState('');
  const [bookingRef, setBookingRef] = useState('VV-YATRA-8492');
  const [copiedRef, setCopiedRef] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [step]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !devoteeName) setDevoteeName(currentUser.name);
      if (currentUser.phone && !devoteePhone) setDevoteePhone(currentUser.phone);
    }
  }, [currentUser]);

  // Restore or reset transaction stage on modal reopen
  useEffect(() => {
    if (isOpen && packageItem) {
      setErrorMessage('');
      setIsSubmitting(false);
      setShowPickupSelector(false);
      setShowAddPaymentModal(false);

      // Check if we have a saved transaction for this package (or general pending)
      try {
        const raw = localStorage.getItem('vt_pending_reservation');
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved && (saved.packageId === packageItem.id || saved.packageItem?.title === packageItem.title)) {
            if (saved.step && saved.step < 3) setStep(saved.step);
            if (saved.devoteeCount) setDevoteeCount(saved.devoteeCount);
            if (saved.addons && Array.isArray(saved.addons)) setAddons(saved.addons);
            if (saved.selectedSlot) setSelectedSlot(saved.selectedSlot);
            if (saved.selectedDate) setSelectedDate(saved.selectedDate);
            if (saved.promoCode) setPromoCode(saved.promoCode);
            if (typeof saved.isPromoApplied === 'boolean') setIsPromoApplied(saved.isPromoApplied);
            if (typeof saved.promoDiscount === 'number') setPromoDiscount(saved.promoDiscount);
            if (saved.devoteeName) setDevoteeName(saved.devoteeName);
            if (saved.devoteePhone) setDevoteePhone(saved.devoteePhone);
            if (saved.pickupPoint) setPickupPoint(saved.pickupPoint);
            if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
            if (saved.customUpiId) setCustomUpiId(saved.customUpiId);
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading saved reservation:', e);
      }

      setStep(1);
      setAddons(DEFAULT_ADDONS);
      const randomId = `VV-YATRA-${Math.floor(1000 + Math.random() * 9000)}`;
      setBookingRef(randomId);
    }
  }, [isOpen, packageItem]);

  // Persist transaction stage and hold timer whenever state changes in Stage 1 or Stage 2
  useEffect(() => {
    if (isOpen && packageItem && (step === 1 || step === 2)) {
      try {
        const existingRaw = localStorage.getItem('vt_pending_reservation');
        let holdTimerExpiresAt = null;
        if (existingRaw) {
          const parsed = JSON.parse(existingRaw);
          if (parsed?.holdTimerExpiresAt) holdTimerExpiresAt = parsed.holdTimerExpiresAt;
        }
        if (!holdTimerExpiresAt) {
          const randomDays = Math.floor(Math.random() * 2) + 1; // 1 to 2 days
          const randomHours = Math.floor(Math.random() * 18) + 4; // 4 to 22 hours
          holdTimerExpiresAt = Date.now() + (randomDays * 24 + randomHours) * 3600 * 1000;
        }

        const txPayload = {
          packageId: packageItem.id || packageItem.title,
          packageItem,
          step,
          devoteeCount,
          addons,
          selectedSlot,
          selectedDate,
          promoCode,
          isPromoApplied,
          promoDiscount,
          devoteeName,
          devoteePhone,
          pickupPoint,
          paymentMethod,
          customUpiId,
          holdTimerExpiresAt,
          updatedAt: Date.now()
        };

        localStorage.setItem('vt_pending_reservation', JSON.stringify(txPayload));
        window.dispatchEvent(new CustomEvent('vt:pending_reservation_updated', { detail: txPayload }));
      } catch (e) {
        console.warn('Error saving transaction progress:', e);
      }
    }
  }, [
    isOpen, packageItem, step, devoteeCount, addons, selectedSlot, selectedDate,
    promoCode, isPromoApplied, promoDiscount, devoteeName, devoteePhone,
    pickupPoint, paymentMethod, customUpiId
  ]);

  // Clear transaction stage when order is successfully completed
  useEffect(() => {
    if (step === 3) {
      try {
        localStorage.removeItem('vt_pending_reservation');
        window.dispatchEvent(new CustomEvent('vt:pending_reservation_updated', { detail: null }));
      } catch {}
    }
  }, [step]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !packageItem) return null;
  if (typeof document === 'undefined') return null;

  // Extract base numerical price
  const numericPrice = (() => {
    if (packageItem.numericPrice) return packageItem.numericPrice;
    if (typeof packageItem.price === 'string') {
      const cleaned = packageItem.price.replace(/[^0-9]/g, '');
      const parsed = parseInt(cleaned, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 2499;
  })();

  const baseFare = numericPrice * devoteeCount;
  const addonsTotal = addons.reduce((acc, item) => acc + item.price * item.count, 0);
  const orderAmount = baseFare + addonsTotal;
  const discountAmount = isPromoApplied ? promoDiscount : 0;
  const deliveryTransport = 0; // AC Transport included free
  const taxAmount = 0; // Temple seva & darshan taxes included
  const totalAmount = Math.max(0, orderAmount - discountAmount + deliveryTransport + taxAmount);

  const handleUpdateAddonCount = (id, delta) => {
    setAddons((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newCount = Math.max(0, Math.min(10, item.count + delta));
          return { ...item, count: newCount };
        }
        return item;
      })
    );
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'RADHA500' || code === 'VRINDA2026') {
      setIsPromoApplied(true);
      setPromoDiscount(500);
      setErrorMessage('');
      triggerCelebration({ mode: 'micro', originX: '70%', originY: '28%', count: 14 });
    } else if (code === 'VIPYATRA' || code === 'VRNDYTRA' || code === '3H4-KU70') {
      setIsPromoApplied(true);
      setPromoDiscount(800);
      setErrorMessage('');
      triggerCelebration({ mode: 'micro', originX: '70%', originY: '28%', count: 16 });
    } else {
      setIsPromoApplied(false);
      setPromoDiscount(0);
      setErrorMessage('Invalid promo code. Try RADHA500 or VIPYATRA');
    }
  };

  const handleProceedToCheckout = () => {
    setStep(2);
  };

  const handleConfirmReservation = (e) => {
    if (e) e.preventDefault();
    const phoneDigits = (devoteePhone || '').replace(/[^0-9]/g, '');
    const isPhoneInvalid = !devoteePhone || phoneDigits.length < 10;
    const isNameInvalid = !devoteeName || devoteeName.trim().length < 2;

    if (isPhoneInvalid || isNameInvalid) {
      setFieldErrors({
        name: isNameInvalid,
        phone: isPhoneInvalid
      });

      if (isPhoneInvalid) {
        setErrorMessage('Please enter a valid 10-digit WhatsApp / Mobile number for driver pickup.');
        phoneInputRef.current?.focus();
      } else if (isNameInvalid) {
        setErrorMessage('Please enter the lead devotee full name.');
        nameInputRef.current?.focus();
      }
      return;
    }

    setFieldErrors({ name: false, phone: false });
    setIsSubmitting(true);
    setErrorMessage('');

    // Trigger celebratory confetti burst on reservation confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3); // Success Screen
      triggerCelebration({ mode: 'cannon', count: 56 });
    }, 600);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return createPortal(
    <div className="vt-pkm-overlay" onClick={onClose}>
      <div className="vt-pkm-modal-shell" onClick={(e) => e.stopPropagation()}>

        {/* =========================================================================
            STAGE 1: MY CART LIST (Matching Reference Mockup Left Screen)
            ========================================================================= */}
        {step === 1 && (
          <div className="vt-pkm-view-container vt-pkm-cart-view">
            {/* Top Navigation Bar: Back Arrow | My Cart List | 3-Dots Menu */}
            <div className="vt-pkm-top-bar">
              <button type="button" className="vt-pkm-nav-icon-btn" onClick={onClose} aria-label="Close cart">
                <ArrowLeft size={18} />
              </button>
              <h3 className="vt-pkm-nav-title">My Cart List</h3>
              <button
                type="button"
                className="vt-pkm-nav-icon-btn"
                onClick={() => onOpenDetail && onOpenDetail(packageItem)}
                title="View Package Details"
                aria-label="View Package Details"
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Scrollable Cart Content */}
            <div className="vt-pkm-scroll-content" ref={scrollRef}>
              <div className="vt-pkm-body-layout">
                {/* Left Column: Items, Addons, Slots */}
                <div className="vt-pkm-layout-left">
                  {/* Item Card 1: Main Selected Package */}
                  <div className="vt-pkm-item-card">
                    <div className="vt-pkm-item-thumb-wrap">
                      <img
                        src={packageItem.image}
                        alt={packageItem.title}
                        className="vt-pkm-item-thumb"
                        loading="lazy"
                      />
                    </div>

                    <div className="vt-pkm-item-info">
                      <h4 className="vt-pkm-item-title">{packageItem.title}</h4>

                      <div className="vt-pkm-item-meta-row">
                        <span className="vt-pkm-meta-pill">
                          <Clock size={11} />
                          <span>{packageItem.duration || '15-20 min'}</span>
                        </span>
                        <span className="vt-pkm-meta-pill vt-pkm-rating-pill">
                          <Star size={11} fill="#f59e0b" color="#f59e0b" />
                          <span>{packageItem.rating || '4.9'} ({packageItem.reviewsCount || '12.1k'})</span>
                        </span>
                      </div>

                      <div className="vt-pkm-item-price-stepper-row">
                        <div className="vt-pkm-item-price">
                          <span className="vt-pkm-currency">₹</span>
                          <span className="vt-pkm-amount">{numericPrice.toLocaleString('en-IN')}</span>
                          <small className="vt-pkm-unit">/person</small>
                        </div>

                        {/* Stepper Control (- 02 +) */}
                        <div className="vt-pkm-stepper">
                          <button
                            type="button"
                            className="vt-pkm-step-btn vt-pkm-step-minus"
                            onClick={() => setDevoteeCount((c) => Math.max(1, c - 1))}
                            disabled={devoteeCount <= 1}
                            aria-label="Decrease devotees"
                          >
                            <Minus size={13} strokeWidth={2.5} />
                          </button>
                          <span className="vt-pkm-step-val">{String(devoteeCount).padStart(2, '0')}</span>
                          <button
                            type="button"
                            className="vt-pkm-step-btn vt-pkm-step-plus"
                            onClick={() => setDevoteeCount((c) => Math.min(20, c + 1))}
                            aria-label="Increase devotees"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Item Cart: Optional Sacred Add-ons */}
                  <div className="vt-pkm-addons-section">
                    <span className="vt-pkm-section-heading">Sacred Pilgrimage Add-ons</span>
                    <div className="vt-pkm-addons-list">
                      {addons.map((addon) => (
                        <div key={addon.id} className={`vt-pkm-item-card vt-pkm-addon-card ${addon.count > 0 ? 'is-active-addon' : ''}`}>
                          <div className="vt-pkm-item-thumb-wrap">
                            <img
                              src={addon.image}
                              alt={addon.title}
                              className="vt-pkm-item-thumb"
                              loading="lazy"
                            />
                          </div>

                          <div className="vt-pkm-item-info">
                            <h4 className="vt-pkm-item-title">{addon.title}</h4>

                            <div className="vt-pkm-item-meta-row">
                              <span className="vt-pkm-meta-pill">
                                <Clock size={11} />
                                <span>{addon.duration}</span>
                              </span>
                              <span className="vt-pkm-meta-pill vt-pkm-rating-pill">
                                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                                <span>{addon.rating}</span>
                              </span>
                            </div>

                            <div className="vt-pkm-item-price-stepper-row">
                              <div className="vt-pkm-item-price">
                                <span className="vt-pkm-currency">₹</span>
                                <span className="vt-pkm-amount">{addon.price}</span>
                              </div>

                              <div className="vt-pkm-stepper">
                                <button
                                  type="button"
                                  className="vt-pkm-step-btn vt-pkm-step-minus"
                                  onClick={() => handleUpdateAddonCount(addon.id, -1)}
                                  disabled={addon.count <= 0}
                                  aria-label="Decrease addon"
                                >
                                  <Minus size={13} strokeWidth={2.5} />
                                </button>
                                <span className="vt-pkm-step-val">{String(addon.count).padStart(2, '0')}</span>
                                <button
                                  type="button"
                                  className="vt-pkm-step-btn vt-pkm-step-plus"
                                  onClick={() => handleUpdateAddonCount(addon.id, 1)}
                                  aria-label="Increase addon"
                                >
                                  <Plus size={13} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Darshan Slot Selector */}
                  <div className="vt-pkm-section-card">
                    <span className="vt-pkm-section-heading">Select Darshan Timing Slot</span>
                    <div className="vt-pkm-slots-row">
                      <button
                        type="button"
                        className={`vt-pkm-slot-chip ${selectedSlot === 'morning' ? 'active' : ''}`}
                        onClick={() => setSelectedSlot('morning')}
                      >
                        <div className="vt-pkm-slot-header">
                          <Sunrise size={17} className="vt-pkm-slot-pure-icon slot-morning" />
                          <span className="vt-pkm-slot-time">Morning Slot</span>
                        </div>
                        <span className="vt-pkm-slot-sub">06:00 AM Mangala</span>
                      </button>

                      <button
                        type="button"
                        className={`vt-pkm-slot-chip ${selectedSlot === 'evening' ? 'active' : ''}`}
                        onClick={() => setSelectedSlot('evening')}
                      >
                        <div className="vt-pkm-slot-header">
                          <Moon size={16} className="vt-pkm-slot-pure-icon slot-evening" />
                          <span className="vt-pkm-slot-time">Evening Slot</span>
                        </div>
                        <span className="vt-pkm-slot-sub">04:30 PM Sandhya</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Promo, Order Summary & Action */}
                <div className="vt-pkm-layout-right">
                  {/* Promo Code Input Bar */}
                  <div className="vt-pkm-promo-card">
                    <div className="vt-pkm-promo-input-row">
                      <Tag size={15} className={`vt-pkm-promo-lead-icon ${isPromoApplied ? 'applied' : ''}`} />
                      <input
                        type="text"
                        className="vt-pkm-promo-input"
                        placeholder="Promo Code (RADHA500)"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          if (isPromoApplied) {
                            setIsPromoApplied(false);
                            setPromoDiscount(0);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={`vt-pkm-promo-btn ${isPromoApplied ? 'is-confirmed' : ''}`}
                        onClick={handleApplyPromo}
                      >
                        {isPromoApplied ? (
                          <>
                            <Check size={12} strokeWidth={3} />
                            <span>Confirmed</span>
                          </>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {isPromoApplied && (
                      <div className="vt-pkm-promo-success-badge">
                        <Sparkles size={13} className="vt-pkm-promo-sparkle" />
                        <span>Devotee savings applied • ₹{promoDiscount} off yatra</span>
                      </div>
                    )}
                    {errorMessage && (
                      <span className="vt-pkm-promo-err-text">{errorMessage}</span>
                    )}
                  </div>

                  {/* Order Summary Block */}
                  <div className="vt-pkm-order-summary-card">
                    <h5 className="vt-pkm-summary-title">Order Summary</h5>
                    <div className="vt-pkm-summary-row">
                      <span>Order Amount</span>
                      <strong>₹{orderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="vt-pkm-summary-row vt-pkm-row-discount">
                      <span>Promo-code</span>
                      <strong className="vt-pkm-discount-val">- ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="vt-pkm-summary-row">
                      <span>AC Yatra Transport &amp; Guide</span>
                      <span className="vt-pkm-tag-free">Included</span>
                    </div>
                    <div className="vt-pkm-summary-row">
                      <span>Temple Seva &amp; Tax</span>
                      <span>₹0.00</span>
                    </div>

                    <div className="vt-pkm-summary-dashed-line" />

                    <div className="vt-pkm-summary-total-row">
                      <span className="vt-pkm-total-label">Total Amount</span>
                      <div className="vt-pkm-total-val">
                        <span className="vt-pkm-curr-symbol">₹</span>
                        <span>{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Action CTA Button */}
                  <div className="vt-pkm-desktop-cta-box">
                    <button
                      type="button"
                      className="vt-pkm-btn-proceed"
                      onClick={handleProceedToCheckout}
                    >
                      <span>Proceed Transactions</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* Trust Perks */}
                  <div className="vt-pkm-trust-strip">
                    <div className="vt-pkm-trust-pill">
                      <ShieldCheck size={14} className="vt-pkm-trust-icon" />
                      <span>100% Verified Pass</span>
                    </div>
                    <span className="vt-pkm-trust-dot">•</span>
                    <div className="vt-pkm-trust-pill">
                      <Sparkles size={14} className="vt-pkm-trust-icon" />
                      <span>Instant Voucher</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Action Bar (Apple iOS Cart Summary & Checkout Dock) */}
            <div className="vt-pkm-bottom-bar">
              <div className="vt-pkm-mobile-bar-summary">
                <div className="vt-pkm-mobile-bar-price-box">
                  <div className="vt-pkm-mobile-bar-label-row">
                    <span className="vt-pkm-mobile-bar-sub">Total Pass Fare</span>
                    {isPromoApplied && (
                      <span className="vt-pkm-mobile-bar-saved">Saved ₹{promoDiscount}</span>
                    )}
                  </div>
                  <span className="vt-pkm-mobile-bar-total">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </div>
                <button
                  type="button"
                  className="vt-pkm-btn-proceed vt-pkm-btn-proceed-mobile"
                  onClick={handleProceedToCheckout}
                >
                  <span>Proceed</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: CHECKOUT (Matching Reference Mockup Middle Screen)
            ========================================================================= */}
        {step === 2 && (
          <div className="vt-pkm-view-container vt-pkm-checkout-view">
            {/* Top Navigation Bar: Back Arrow | Checkout | 3-Dots Menu */}
            <div className="vt-pkm-top-bar">
              <button
                type="button"
                className="vt-pkm-nav-icon-btn"
                onClick={() => setStep(1)}
                aria-label="Back to Cart"
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="vt-pkm-nav-title">Checkout</h3>
              <button type="button" className="vt-pkm-nav-icon-btn" onClick={onClose} aria-label="Close modal">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Scrollable Checkout Content */}
            <div className="vt-pkm-scroll-content">
              <div className="vt-pkm-body-layout">
                {/* Left Column: Payment Methods, Devotee Details, Pickup */}
                <div className="vt-pkm-layout-left">
                  {/* Payment Methods Radio List */}
                  <div className="vt-pkm-section-card">
                    <span className="vt-pkm-section-heading">Select Payment Method</span>
                    <div className="vt-pkm-payment-methods-list">
                      {/* Master Card / Online Card */}
                      <label className={`vt-pkm-pay-option ${paymentMethod === 'mastercard' ? 'selected' : ''}`}>
                        <div className="vt-pkm-pay-opt-left">
                          <div className="vt-pkm-pay-brand-icon mastercard-logo">
                            <span className="mc-circle mc-red" />
                            <span className="mc-circle mc-yellow" />
                          </div>
                          <div className="vt-pkm-pay-opt-text">
                            <span className="vt-pkm-pay-title">Master Card</span>
                            <span className="vt-pkm-pay-sub">•••••••• 8463</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="checkout_payment"
                          checked={paymentMethod === 'mastercard'}
                          onChange={() => setPaymentMethod('mastercard')}
                        />
                        <div className="vt-pkm-radio-dot">
                          <AnimatedCheckCircle
                            checked={paymentMethod === 'mastercard'}
                            size={18}
                            color="#0f172a"
                          />
                        </div>
                      </label>

                      {/* UPI QR */}
                      <label className={`vt-pkm-pay-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                        <div className="vt-pkm-pay-opt-left">
                          <div className="vt-pkm-pay-brand-icon upi-logo">
                            <Smartphone size={17} color="#2563eb" />
                          </div>
                          <div className="vt-pkm-pay-opt-text">
                            <span className="vt-pkm-pay-title">UPI / Google Pay</span>
                            <span className="vt-pkm-pay-sub">{customUpiId || 'vrinda.yatra@okaxis'}</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="checkout_payment"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                        />
                        <div className="vt-pkm-radio-dot">
                          <AnimatedCheckCircle
                            checked={paymentMethod === 'upi'}
                            size={18}
                            color="#0f172a"
                          />
                        </div>
                      </label>

                      {/* Apple Pay */}
                      <label className={`vt-pkm-pay-option ${paymentMethod === 'applepay' ? 'selected' : ''}`}>
                        <div className="vt-pkm-pay-opt-left">
                          <div className="vt-pkm-pay-brand-icon apple-logo">
                            <CreditCard size={17} color="#0f172a" />
                          </div>
                          <div className="vt-pkm-pay-opt-text">
                            <span className="vt-pkm-pay-title">Apple Pay / Net Banking</span>
                            <span className="vt-pkm-pay-sub">One-touch biometric checkout</span>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="checkout_payment"
                          checked={paymentMethod === 'applepay'}
                          onChange={() => setPaymentMethod('applepay')}
                        />
                        <div className="vt-pkm-radio-dot">
                          <AnimatedCheckCircle
                            checked={paymentMethod === 'applepay'}
                            size={18}
                            color="#0f172a"
                          />
                        </div>
                      </label>

                      {/* + Add Payment Method Button */}
                      <button
                        type="button"
                        className="vt-pkm-add-payment-btn"
                        onClick={() => setShowAddPaymentModal(!showAddPaymentModal)}
                      >
                        <Plus size={15} />
                        <span>Add Payment Method</span>
                      </button>

                      {showAddPaymentModal && (
                        <div className="vt-pkm-add-payment-box">
                          <span className="vt-pkm-add-pay-title">Enter Custom UPI ID / Card</span>
                          <div className="vt-pkm-input-wrap">
                            <input
                              type="text"
                              className="vt-pkm-input"
                              placeholder="e.g. devotee@oksbi / yourname@upi"
                              value={customUpiId}
                              onChange={(e) => setCustomUpiId(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="vt-pkm-save-upi-btn"
                            onClick={() => {
                              if (customUpiId) setPaymentMethod('upi');
                              setShowAddPaymentModal(false);
                            }}
                          >
                            Save &amp; Select
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Devotee Contact Information Form */}
                  <div className="vt-pkm-section-card">
                    <div className="vt-pkm-section-header-row">
                      <span className="vt-pkm-section-heading">Pilgrim WhatsApp &amp; Contact Details</span>
                      <span className="vt-pkm-section-hint">Required for Pickup</span>
                    </div>
                    <div className="vt-pkm-form-grid">
                      <div className="vt-pkm-field-group">
                        <div className={`vt-pkm-input-wrap ${fieldErrors.name ? 'has-error' : ''}`}>
                          <User size={15} className="vt-pkm-input-icon" />
                          <input
                            ref={nameInputRef}
                            type="text"
                            className="vt-pkm-input"
                            placeholder="Lead Devotee Full Name *"
                            value={devoteeName}
                            onChange={(e) => {
                              setDevoteeName(e.target.value);
                              if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: false }));
                            }}
                            required
                          />
                        </div>
                        {fieldErrors.name && (
                          <span className="vt-pkm-field-helper error">Please enter devotee full name</span>
                        )}
                      </div>

                      <div className="vt-pkm-field-group">
                        <div className={`vt-pkm-input-wrap ${fieldErrors.phone ? 'has-error' : ''}`}>
                          <div className="vt-pkm-phone-prefix">
                            <span className="vt-pkm-flag-icon">🇮🇳</span>
                            <span className="vt-pkm-prefix-code">+91</span>
                          </div>
                          <input
                            ref={phoneInputRef}
                            type="tel"
                            maxLength={11}
                            className="vt-pkm-input vt-pkm-input-phone"
                            placeholder="WhatsApp Mobile (98765 43210) *"
                            value={devoteePhone}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                              const formatted = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5)}` : raw;
                              setDevoteePhone(formatted);
                              if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: false }));
                            }}
                            required
                          />
                        </div>
                        {fieldErrors.phone ? (
                          <span className="vt-pkm-field-helper error">10-digit mobile number required for pickup pass</span>
                        ) : (
                          <span className="vt-pkm-field-helper">Driver will coordinate pickup via WhatsApp 1h prior</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delivery / Pickup Address Card */}
                  <div className="vt-pkm-section-card">
                    <span className="vt-pkm-section-heading">Delivery Address / Pickup Point</span>
                    <div
                      className="vt-pkm-delivery-card"
                      onClick={() => setShowPickupSelector(!showPickupSelector)}
                      title="Click to change pickup location"
                    >
                      <div className="vt-pkm-delivery-left">
                        <div className="vt-pkm-del-icon-badge">
                          <MapPin size={17} />
                        </div>
                        <div className="vt-pkm-del-text">
                          <span className="vt-pkm-del-address">{pickupPoint}</span>
                          <span className="vt-pkm-del-city">Mathura - Vrindavan (UP)</span>
                        </div>
                      </div>
                      <ChevronRight size={17} className="vt-pkm-del-chevron" />
                    </div>

                    {showPickupSelector && (
                      <div className="vt-pkm-pickup-suggestions">
                        {PICKUP_SUGGESTIONS.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`vt-pkm-pickup-option ${pickupPoint === item ? 'selected' : ''}`}
                            onClick={() => {
                              setPickupPoint(item);
                              setShowPickupSelector(false);
                            }}
                          >
                            <MapPin size={13} />
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Order Summary & Pay Now */}
                <div className="vt-pkm-layout-right">
                  <div className="vt-pkm-order-summary-card">
                    <h5 className="vt-pkm-summary-title">Order Summary</h5>
                    <div className="vt-pkm-summary-row">
                      <span>Order Amount</span>
                      <strong>₹{orderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="vt-pkm-summary-row vt-pkm-row-discount">
                      <span>Promo-code</span>
                      <strong className="vt-pkm-discount-val">- ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="vt-pkm-summary-row">
                      <span>Delivery</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="vt-pkm-summary-row">
                      <span>Tax</span>
                      <span>₹0.00</span>
                    </div>

                    <div className="vt-pkm-summary-dashed-line" />

                    <div className="vt-pkm-summary-total-row">
                      <span className="vt-pkm-total-label">Total Amount</span>
                      <div className="vt-pkm-total-val">
                        <span className="vt-pkm-curr-symbol">₹</span>
                        <span>{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="vt-pkm-inline-err">
                      <AlertCircle size={14} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Desktop Pay Now CTA */}
                  <div className="vt-pkm-desktop-cta-box">
                    <button
                      type="button"
                      className={`vt-pkm-btn-proceed ${isSubmitting ? 'is-loading' : ''}`}
                      onClick={handleConfirmReservation}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>Securing Sacred Reservation...</span>
                      ) : (
                        <>
                          <span>Pay Now</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust Perks */}
                  <div className="vt-pkm-trust-strip">
                    <div className="vt-pkm-trust-pill">
                      <ShieldCheck size={14} className="vt-pkm-trust-icon" />
                      <span>256-Bit Encrypted</span>
                    </div>
                    <span className="vt-pkm-trust-dot">•</span>
                    <div className="vt-pkm-trust-pill">
                      <CheckCircle2 size={14} className="vt-pkm-trust-icon" />
                      <span>Guaranteed Darshan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Bottom Action Bar (Apple iOS Checkout Summary Dock) */}
            <div className="vt-pkm-bottom-bar">
              <div className="vt-pkm-mobile-bar-summary">
                <div className="vt-pkm-mobile-bar-price-box">
                  <span className="vt-pkm-mobile-bar-sub">Final Payable</span>
                  <span className="vt-pkm-mobile-bar-total">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                </div>
                <button
                  type="button"
                  className={`vt-pkm-btn-proceed vt-pkm-btn-proceed-mobile ${isSubmitting ? 'is-loading' : ''}`}
                  onClick={handleConfirmReservation}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span>Securing Pass...</span>
                  ) : (
                    <>
                      <span>Pay Now</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 3: ORDER SUCCESSFUL! (Matching Reference Mockup Right Screen)
            ========================================================================= */}
        {step === 3 && (
          <div className="vt-pkm-view-container vt-pkm-success-view">
            {/* Background Dim Checkout Canvas Simulation */}
            <div className="vt-pkm-success-sheet-backdrop">
              <div className="vt-pkm-success-sheet-card">
                {/* Circular Animated Checkmark Badge with Lottie vector Trim Path */}
                <div className="vt-pkm-success-icon-orb">
                  <div className="vt-pkm-orb-outer-halo" />
                  <div className="vt-pkm-orb-core">
                    <AnimatedCheckCircle size={44} color="#ffffff" />
                  </div>
                  {/* Floating Sparkles Particles Around Badge */}
                  <span className="vt-pkm-sparkle sp-1">✦</span>
                  <span className="vt-pkm-sparkle sp-2">✦</span>
                  <span className="vt-pkm-sparkle sp-3">★</span>
                  <span className="vt-pkm-sparkle sp-4">★</span>
                  <span className="vt-pkm-sparkle sp-5">✦</span>
                  <span className="vt-pkm-sparkle sp-6">✦</span>
                </div>

                {/* Title & Body from Reference Mockup */}
                <h2 className="vt-pkm-success-title">Order Successful!</h2>
                <p className="vt-pkm-success-narrative">
                  We're preparing your sacred yatra pass. Dedicated driver and guide details have been sent to your WhatsApp.
                </p>

                {/* Reference ID Pill */}
                <div className="vt-pkm-ref-pill" onClick={handleCopyRef} title="Click to copy ID">
                  <span className="vt-pkm-ref-label">Booking Ref:</span>
                  <span className="vt-pkm-ref-code">{bookingRef}</span>
                  <span className="vt-pkm-copy-icon">
                    {copiedRef ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  </span>
                </div>

                {/* Action Buttons Suite (Reference Match: Go Home + Track your order) */}
                <div className="vt-pkm-success-btn-stack">
                  <button
                    type="button"
                    className="vt-pkm-btn-success-primary"
                    onClick={() => {
                      onClose();
                      if (onOpenDetail) onOpenDetail(packageItem);
                    }}
                  >
                    Go Home
                  </button>

                  <button
                    type="button"
                    className="vt-pkm-btn-success-secondary"
                    onClick={() => {
                      onClose();
                      if (onOpenHelpCenter) onOpenHelpCenter();
                    }}
                  >
                    Track your order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

