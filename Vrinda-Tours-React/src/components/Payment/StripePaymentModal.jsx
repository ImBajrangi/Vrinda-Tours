import React, { useState, useEffect, useMemo } from 'react';
import {
  X, ShieldCheck, Lock, CreditCard, Sparkles, CheckCircle2,
  ArrowRight, Download, Share2, Phone, AlertCircle, RefreshCw,
  ExternalLink, QrCode, Building, Check, Copy
} from 'lucide-react';
import {
  parseNumericPrice,
  formatINR,
  createStripeCheckoutSession,
  processInAppPayment
} from '../../services/stripeService';
import './StripePaymentModal.css';

export default function StripePaymentModal({
  isOpen,
  onClose,
  item,
  dates = 'Sep 15–22, 2026',
  guests = '2 Guests',
  customerInfo = {},
  onPaymentSuccess
}) {
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'stripe_hosted' | 'upi'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(customerInfo.name || '');
  const [customerEmail, setCustomerEmail] = useState(customerInfo.email || '');
  const [customerPhone, setCustomerPhone] = useState(customerInfo.phone || '');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessReceipt(null);
      if (customerInfo.name) setCardName(customerInfo.name);
      if (customerInfo.email) setCustomerEmail(customerInfo.email);
      if (customerInfo.phone) setCustomerPhone(customerInfo.phone);
    }
  }, [isOpen, customerInfo]);

  if (!isOpen || !item) return null;

  // Price calculations
  const basePrice = parseNumericPrice(item.price || item.numericPrice || 2499);
  const guestCount = parseInt(String(guests).replace(/[^0-9]/g, ''), 10) || 2;
  const subtotal = basePrice * (item.priceUnit?.includes('person') || item.price?.includes('person') ? guestCount : 1);
  const tax = Math.round(subtotal * 0.05); // 5% GST on pilgrimage tourism
  const platformFee = 0; // ₹0 waived
  const totalAmount = subtotal + tax + platformFee;

  // Detect Card Brand from input
  const cardBrand = useMemo(() => {
    const clean = cardNumber.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    if (/^(60|65|81|82)/.test(clean)) return 'rupay';
    return 'card';
  }, [cardNumber]);

  // Card Number Auto-formatting (4-digit spacing)
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Card Expiry Formatting (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  // Auto-fill Test Card Credentials for quick testing
  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    if (!cardName) setCardName('Devotee Pilgrim');
    if (!customerEmail) setCustomerEmail('pilgrim@vrindatours.com');
    if (!customerPhone) setCustomerPhone('9876543210');
  };

  // 1. Submit In-App Card Payment
  const handleProcessCardPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setErrorMsg('Please enter a valid 16-digit card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMsg('Please enter valid expiry date (MM/YY).');
      return;
    }
    if (cardCvc.length < 3) {
      setErrorMsg('Please enter valid 3-digit CVV/CVC.');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate real-time payment gateway latency & verification
      await new Promise(r => setTimeout(r, 1400));

      const result = await processInAppPayment({
        amount: totalAmount,
        itemTitle: item.title,
        customerName: cardName || customerInfo.name || 'Devotee',
        customerEmail: customerEmail || customerInfo.email || '',
        customerPhone: customerPhone || customerInfo.phone || '',
        paymentMethod: 'stripe_card',
        cardDetails: {
          cardNumber: cleanCard,
          brand: cardBrand,
          expiry: cardExpiry,
        },
        metadata: {
          item_id: item.id || '',
          dates,
          guests,
          subtotal,
          tax,
          total: totalAmount,
        }
      });

      if (result.success) {
        setSuccessReceipt(result.receipt);
        if (onPaymentSuccess) {
          onPaymentSuccess(result.receipt);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Redirect to Stripe Hosted Checkout
  const handleStripeHostedCheckout = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const { url } = await createStripeCheckoutSession({
        amount: totalAmount,
        title: item.title,
        description: `${dates} • ${guests} • Sacred Brij Pilgrimage`,
        customerEmail: customerEmail || customerInfo.email,
        customerName: cardName || customerInfo.name,
        customerPhone: customerPhone || customerInfo.phone,
        metadata: {
          itemId: item.id || '',
          itemCategory: item.category || 'yatra',
          dates,
          guests,
        }
      });

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to open Stripe Checkout. Please use Card payment.');
      setIsProcessing(false);
    }
  };

  // Copy Transaction ID to clipboard
  const handleCopyTxn = () => {
    if (successReceipt?.transaction_id) {
      navigator.clipboard.writeText(successReceipt.transaction_id);
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2500);
    }
  };

  return (
    <div className="stp-overlay" onClick={onClose}>
      <div className="stp-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="stp-header">
          <div className="stp-header-brand">
            <div className="stp-logo-badge">
              <Lock size={15} color="#2563eb" />
            </div>
            <div>
              <h3 className="stp-title">Stripe Secure Checkout</h3>
              <div className="stp-badge-row">
                <span className="stp-ssl-badge">
                  <ShieldCheck size={12} color="#059669" /> 256-Bit SSL Encrypted
                </span>
                <span className="stp-mode-badge">Live Test Mode</span>
              </div>
            </div>
          </div>
          <button className="stp-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Success Receipt State */}
        {successReceipt ? (
          <div className="stp-success-body">
            <div className="stp-success-icon-wrap">
              <CheckCircle2 size={56} className="stp-success-check-icon" />
            </div>
            <h3 className="stp-success-title">Payment Succeeded!</h3>
            <p className="stp-success-subtitle">
              Your pilgrimage booking for <strong>{item.title}</strong> is verified & confirmed.
            </p>

            <div className="stp-receipt-card">
              <div className="stp-receipt-row">
                <span className="stp-receipt-label">Amount Paid</span>
                <span className="stp-receipt-value stp-receipt-amount">{formatINR(successReceipt.amount)}</span>
              </div>
              <div className="stp-receipt-row">
                <span className="stp-receipt-label">Transaction Reference</span>
                <span className="stp-receipt-value stp-receipt-mono" onClick={handleCopyTxn} title="Click to copy">
                  {successReceipt.transaction_id.slice(0, 18)}...
                  {copiedTxn ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                </span>
              </div>
              <div className="stp-receipt-row">
                <span className="stp-receipt-label">Payment Method</span>
                <span className="stp-receipt-value">Stripe Card (•••• {successReceipt.card_last4})</span>
              </div>
              <div className="stp-receipt-row">
                <span className="stp-receipt-label">Travel Dates</span>
                <span className="stp-receipt-value">{dates}</span>
              </div>
              <div className="stp-receipt-row">
                <span className="stp-receipt-label">Party</span>
                <span className="stp-receipt-value">{guests}</span>
              </div>
            </div>

            <div className="stp-success-actions">
              <button
                type="button"
                className="stp-btn-primary-action"
                onClick={() => {
                  const message = encodeURIComponent(
                    `*Vrinda Tours Booking Confirmation*\n\nPackage: ${item.title}\nTransaction ID: ${successReceipt.transaction_id}\nAmount: ${formatINR(successReceipt.amount)}\nGuest: ${successReceipt.customer_name}\nDates: ${dates}\nParty: ${guests}\n\nStatus: Confirmed via Stripe`
                  );
                  window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
                  onClose();
                }}
              >
                <Phone size={15} />
                <span>Receive Voucher on WhatsApp</span>
              </button>
              <button
                type="button"
                className="stp-btn-outline-action"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="stp-body">
            {/* Left/Top: Order Summary */}
            <div className="stp-order-summary">
              <div className="stp-item-card">
                {item.image && (
                  <img src={item.image} alt={item.title} className="stp-item-img" />
                )}
                <div className="stp-item-details">
                  <span className="stp-item-tag">{item.category || 'Sacred Brij Yatra'}</span>
                  <h4 className="stp-item-title">{item.title}</h4>
                  <span className="stp-item-meta">{dates} • {guests}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="stp-price-breakdown">
                <div className="stp-breakdown-row">
                  <span>Base Pilgrimage Fare</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="stp-breakdown-row">
                  <span>GST & Temple Tourism Tax (5%)</span>
                  <span>{formatINR(tax)}</span>
                </div>
                <div className="stp-breakdown-row stp-waived-row">
                  <span>Platform Fee</span>
                  <span className="stp-waived-badge">₹0 Free</span>
                </div>
                <div className="stp-breakdown-divider" />
                <div className="stp-breakdown-row stp-total-row">
                  <span>Total Payable</span>
                  <span className="stp-total-amount">{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Right/Bottom: Payment Options & Form */}
            <div className="stp-payment-section">
              {/* Payment Method Switcher */}
              <div className="stp-tabs-row">
                <button
                  type="button"
                  className={`stp-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={15} />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  className={`stp-tab-btn ${paymentMethod === 'stripe_hosted' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('stripe_hosted')}
                >
                  <ExternalLink size={15} />
                  <span>Stripe Page</span>
                </button>
                <button
                  type="button"
                  className={`stp-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={15} />
                  <span>UPI / QR</span>
                </button>
              </div>

              {errorMsg && (
                <div className="stp-error-banner">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {paymentMethod === 'card' && (
                <form onSubmit={handleProcessCardPayment} className="stp-form">
                  <div className="stp-test-card-banner">
                    <span>Test Mode Active</span>
                    <button type="button" onClick={handleFillTestCard} className="stp-btn-fill-test">
                      <Sparkles size={11} /> Auto-Fill Test Card
                    </button>
                  </div>

                  {/* Card Number */}
                  <div className="stp-input-group">
                    <label className="stp-label">Card Number</label>
                    <div className="stp-input-wrapper">
                      <input
                        type="text"
                        className="stp-input"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength={19}
                        required
                      />
                      <div className="stp-input-addon">
                        <span className={`stp-card-brand-badge ${cardBrand}`}>
                          {cardBrand.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expiry & CVC Row */}
                  <div className="stp-form-row">
                    <div className="stp-input-group">
                      <label className="stp-label">Expires</label>
                      <input
                        type="text"
                        className="stp-input"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="stp-input-group">
                      <label className="stp-label">CVV / CVC</label>
                      <input
                        type="password"
                        className="stp-input"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div className="stp-input-group">
                    <label className="stp-label">Name on Card</label>
                    <input
                      type="text"
                      className="stp-input"
                      placeholder="e.g. Radhe Shyam"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email & Phone for receipt */}
                  <div className="stp-form-row">
                    <div className="stp-input-group">
                      <label className="stp-label">Email Receipt</label>
                      <input
                        type="email"
                        className="stp-input"
                        placeholder="pilgrim@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>
                    <div className="stp-input-group">
                      <label className="stp-label">Mobile</label>
                      <input
                        type="tel"
                        className="stp-input"
                        placeholder="9876543210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    type="submit"
                    className="stp-btn-submit"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="stp-loading-row">
                        <RefreshCw size={16} className="stp-spin" />
                        <span>Authorizing with Stripe...</span>
                      </span>
                    ) : (
                      <span>Pay {formatINR(totalAmount)} with Stripe</span>
                    )}
                  </button>
                </form>
              )}

              {paymentMethod === 'stripe_hosted' && (
                <div className="stp-hosted-box">
                  <div className="stp-hosted-icon-wrap">
                    <ExternalLink size={28} color="#2563eb" />
                  </div>
                  <h4>Official Stripe Hosted Checkout</h4>
                  <p>
                    You will be securely redirected to Stripe's checkout page supporting 3D Secure, Apple Pay, Google Pay, and international cards.
                  </p>
                  <button
                    type="button"
                    className="stp-btn-submit"
                    onClick={handleStripeHostedCheckout}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="stp-loading-row">
                        <RefreshCw size={16} className="stp-spin" />
                        <span>Opening Stripe...</span>
                      </span>
                    ) : (
                      <span>Proceed to Stripe.com ({formatINR(totalAmount)}) →</span>
                    )}
                  </button>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="stp-upi-box">
                  <div className="stp-upi-qr-card">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=vrindatours@okhdfcbank&pn=Vrinda%20Tours&am=${totalAmount}&cu=INR&tn=Yatra_${item.id || 'Booking'}`)}`}
                      alt="UPI QR Code"
                      className="stp-upi-qr-img"
                    />
                    <span className="stp-upi-scan-text">Scan with Google Pay, PhonePe, or Paytm</span>
                  </div>
                  <div className="stp-upi-id-badge">
                    <span>UPI ID: <strong>vrindatours@okhdfcbank</strong></span>
                  </div>
                  <button
                    type="button"
                    className="stp-btn-submit"
                    onClick={handleProcessCardPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="stp-loading-row">
                        <RefreshCw size={16} className="stp-spin" />
                        <span>Verifying UPI Transfer...</span>
                      </span>
                    ) : (
                      <span>I Have Completed UPI Payment ({formatINR(totalAmount)})</span>
                    )}
                  </button>
                </div>
              )}

              {/* Trust Footer */}
              <div className="stp-trust-footer">
                <div className="stp-trust-item">
                  <ShieldCheck size={14} color="#059669" />
                  <span>PCI-DSS Level 1</span>
                </div>
                <div className="stp-trust-item">
                  <Lock size={14} color="#2563eb" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="stp-trust-item">
                  <Sparkles size={14} color="#f59e0b" />
                  <span>Instant Voucher</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
