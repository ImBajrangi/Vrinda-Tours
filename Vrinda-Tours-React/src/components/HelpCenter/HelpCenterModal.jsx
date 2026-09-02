import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, MessageSquare, Headphones, Sparkles, CheckCheck, 
  Clock, ShieldCheck, ChevronRight, User, AlertCircle, RefreshCw,
  Phone, Mail, ArrowRight, CornerDownRight, ThumbsUp, CheckCircle2,
  Copy, Check, CreditCard, Calendar, Users, MapPin, Tag
} from 'lucide-react';
import { 
  getOrCreateThreadId, 
  sendSupportMessage, 
  getThreadMessages,
  subscribeToThread
} from '../../services/messagingService';
import './HelpCenterModal.css';

const QUICK_PROMPTS = [
  { icon: '👑', label: 'VIP Darshan Pass', category: 'vip', text: 'How can I get priority VIP darshan pass for Bankey Bihari & Prem Mandir?' },
  { icon: '🛺', label: 'Govardhan Parikrama', category: 'parikrama', text: 'I need an electric E-Rickshaw guide for 21 km Govardhan Parikrama.' },
  { icon: '🏨', label: 'Ashram & Stays', category: 'hotel', text: 'I want assistance booking a verified Ashram or AC Guest House in Vrindavan.' },
  { icon: '🗺️', label: 'Custom Itinerary', category: 'custom', text: 'Can you create a custom 2-day Brij Yatra itinerary with cab & driver?' },
  { icon: '📦', label: 'Track Reservation', category: 'support', text: 'I need an update on my existing booking or driver dispatch.' }
];

function parseBookingOrPayment(text) {
  if (!text || typeof text !== 'string') return null;

  if (text.includes('Payment Verified via Stripe') || text.includes('Stripe*')) {
    const pkgMatch = text.match(/Package:\s*([^•\n]+)/i);
    const txnMatch = text.match(/Transaction ID:\s*([^•\n]+)/i);
    const amtMatch = text.match(/Amount:\s*([^•\n]+)/i);
    const statusMatch = text.match(/Status:\s*([^•\n]+)/i);
    const datesMatch = text.match(/Travel Dates:\s*([^•\n]+)/i) || text.match(/Dates:\s*([^•\n]+)/i);
    const partyMatch = text.match(/Party:\s*([^•\n]+)/i);

    return {
      type: 'payment',
      title: pkgMatch ? pkgMatch[1].trim() : 'Brij Yatra Pilgrimage Package',
      txnId: txnMatch ? txnMatch[1].trim() : '',
      amount: amtMatch ? amtMatch[1].trim() : '',
      status: statusMatch ? statusMatch[1].trim() : 'Confirmed & Paid',
      dates: datesMatch ? datesMatch[1].trim() : '',
      party: partyMatch ? partyMatch[1].trim() : '2 Guests'
    };
  }

  if (text.includes('I would like to reserve') || text.includes('Reservation Inquiry')) {
    const pkgMatch = text.match(/reserve \*?([^*\n•]+)\*?/i);
    const datesMatch = text.match(/Dates:\s*([^•\n]+)/i);
    const devoteeMatch = text.match(/Devotee:\s*([^•\n]+)/i);
    const mobileMatch = text.match(/Mobile:\s*([^•\n]+)/i);
    const emailMatch = text.match(/Email:\s*([^•\n]+)/i);
    const partyMatch = text.match(/Party:\s*([^•\n]+)/i);

    return {
      type: 'reservation',
      title: pkgMatch ? pkgMatch[1].trim() : 'Brij Yatra Reservation',
      dates: datesMatch ? datesMatch[1].trim() : '',
      devotee: devoteeMatch ? devoteeMatch[1].trim() : '',
      mobile: mobileMatch ? mobileMatch[1].trim() : '',
      email: emailMatch && !emailMatch[1].includes('Not provided') ? emailMatch[1].trim() : '',
      party: partyMatch ? partyMatch[1].trim() : ''
    };
  }

  return null;
}

function formatChatMessage(text) {
  if (!text) return '';
  return text.split('\n').map((line, idx) => {
    if (!line.trim()) return <br key={idx} />;
    const parts = line.split(/(\*[^*]+\*|\*\*[^*]+\*\*)/g);
    return (
      <p key={idx} className="hc-msg-para">
        {parts.map((part, pIdx) => {
          if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
            const clean = part.replace(/^\*+|\*+$/g, '');
            return <strong key={pIdx}>{clean}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
}

export default function HelpCenterModal({
  isOpen,
  onClose,
  initialCategory = 'general',
  initialMessage = '',
  currentUser = null
}) {
  const [threadId, setThreadId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'faqs'
  const [copiedTxn, setCopiedTxn] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const savedName = localStorage.getItem('vt_user_name') || currentUser?.name || '';
    const savedPhone = localStorage.getItem('vt_user_phone') || currentUser?.phone || '';
    const savedEmail = localStorage.getItem('vt_user_email') || currentUser?.email || '';

    setUserName(savedName);
    setUserPhone(savedPhone);
    setUserEmail(savedEmail);

    const tId = getOrCreateThreadId({ name: savedName, phone: savedPhone, email: savedEmail });
    setThreadId(tId);

    loadHistory(tId);

    if (initialMessage && initialMessage.trim()) {
      setInputText(initialMessage);
    }

    // 1. In-tab custom event listener
    const handleNewMessage = (e) => {
      if (e.detail?.threadId === tId && e.detail?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === e.detail.message.id)) return prev;
          return [...prev, e.detail.message];
        });
      }
    };
    window.addEventListener('vt_new_support_message', handleNewMessage);

    // 2. Cross-device / Cross-tab live Supabase Real-time listener
    const unsubRealtime = subscribeToThread(tId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      window.removeEventListener('vt_new_support_message', handleNewMessage);
      unsubRealtime();
    };
  }, [isOpen, initialMessage, currentUser]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const loadHistory = async (tId) => {
    const list = await getThreadMessages(tId);
    if (list && list.length > 0) {
      setMessages(list);
    } else {
      setMessages([
        {
          id: 'welcome_initial',
          thread_id: tId,
          sender: 'concierge_bot',
          sender_name: 'Vrinda Vihar Concierge',
          message: 'Radhe Radhe! 🙏 Welcome to Vrinda Vihar 24/7 Pilgrimage Help Centre.\nOur dedicated Brajwasi concierge desk is at your service. Choose a topic below or type your inquiry.',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSendMessage = async (customText = null, category = 'general') => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    setInputText('');

    const newMsg = await sendSupportMessage({
      threadId,
      sender: 'user',
      text: textToSend,
      senderName: userName || 'Devotee Pilgrim',
      senderPhone: userPhone,
      senderEmail: userEmail,
      category: category || initialCategory
    });

    if (newMsg) {
      setMessages((prev) => [...prev, newMsg]);
    }
    setIsSending(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (userName) localStorage.setItem('vt_user_name', userName);
    if (userPhone) localStorage.setItem('vt_user_phone', userPhone);
    if (userEmail) localStorage.setItem('vt_user_email', userEmail);
    setShowDetailsForm(false);
  };

  const handleCopyTxn = (txnId) => {
    if (!txnId) return;
    navigator.clipboard.writeText(txnId);
    setCopiedTxn(txnId);
    setTimeout(() => setCopiedTxn(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="hc-modal-overlay" onClick={onClose}>
      <div 
        className="hc-modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog" 
        aria-modal="true"
        aria-label="Vrinda Vihar Help Centre"
      >
        {/* Professional Luxury Concierge Header */}
        <div className="hc-header">
          <div className="hc-header-left">
            <div className="hc-avatar-wrap">
              <div className="hc-avatar-icon">
                <Sparkles size={17} className="hc-avatar-gold-icon" />
              </div>
              <span className="hc-status-dot pulse" title="Brajwasi Concierge Online" />
            </div>
            <div className="hc-header-titles">
              <div className="hc-title-row">
                <h3 className="hc-title-text">Vrinda Concierge</h3>
                <span className="hc-badge-live">
                  <span className="hc-live-dot" />
                  Live
                </span>
              </div>
              <p className="hc-sub-status">
                <span>Verified Brajwasi Support Desk</span>
              </p>
            </div>
          </div>

          <div className="hc-header-actions">
            {userName ? (
              <button
                type="button"
                className={`hc-devotee-chip ${showDetailsForm ? 'active' : ''}`}
                onClick={() => setShowDetailsForm(!showDetailsForm)}
                title="Edit Devotee Profile"
              >
                <div className="hc-devotee-avatar-letter">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="hc-devotee-chip-name">{userName}</span>
              </button>
            ) : (
              <button
                type="button"
                className={`hc-btn-icon ${showDetailsForm ? 'active' : ''}`}
                onClick={() => setShowDetailsForm(!showDetailsForm)}
                title="Devotee Contact Details"
                aria-label="Contact Details"
              >
                <User size={15} />
              </button>
            )}

            <button
              type="button"
              className="hc-btn-close"
              onClick={onClose}
              title="Close Help Centre"
              aria-label="Close Help Centre"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Unified Luxury Sub-Bar Segmented Switcher */}
        <div className="hc-nav-bar">
          <div className="hc-segmented-pill">
            <button 
              type="button"
              className={`hc-seg-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare size={13} />
              <span>Direct Messaging</span>
            </button>
            <button 
              type="button"
              className={`hc-seg-btn ${activeTab === 'faqs' ? 'active' : ''}`}
              onClick={() => setActiveTab('faqs')}
            >
              <ShieldCheck size={13} />
              <span>Instant Yatra Guide</span>
            </button>
          </div>
        </div>

        {/* User Contact Details Drawer */}
        {showDetailsForm && (
          <form className="hc-details-bar" onSubmit={handleSaveContact}>
            <div className="hc-details-header">
              <span className="hc-details-title">Devotee Contact Details</span>
              <span className="hc-details-subtitle">Used for booking confirmations and live updates</span>
            </div>
            <div className="hc-details-fields">
              <div className="hc-details-input-wrap">
                <User size={14} className="hc-field-icon" />
                <input
                  type="text"
                  placeholder="Your Name (e.g. Radhika Sharma)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="hc-input-small"
                />
              </div>
              <div className="hc-details-input-wrap">
                <Phone size={14} className="hc-field-icon" />
                <input
                  type="tel"
                  placeholder="Phone Number (10 digits)"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="hc-input-small"
                />
              </div>
            </div>
            <button type="submit" className="hc-btn-save-contact">
              <Check size={14} />
              <span>Save Details</span>
            </button>
          </form>
        )}

        {/* TAB 1: DIRECT MESSAGING THREAD */}
        {activeTab === 'chat' && (
          <div className="hc-chat-panel">
            {/* Sleek Floating Quick Chips Strip */}
            <div className="hc-quick-chips-wrap">
              <div className="hc-chips-scroll">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="hc-chip"
                    onClick={() => handleSendMessage(qp.text, qp.category)}
                  >
                    <span className="hc-chip-icon">{qp.icon}</span>
                    <span className="hc-chip-text">{qp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="hc-messages-body">
              {messages.map((msg, index) => {
                const parsedReceipt = parseBookingOrPayment(msg.message || msg.text);
                const isMe = msg.sender === 'user' || (userName && msg.sender_name === userName && msg.sender !== 'admin' && !parsedReceipt);
                const isAdmin = msg.sender === 'admin';
                const isBot = msg.sender === 'concierge_bot' || msg.sender === 'system';

                /* Case A & B: Full-Width Rich Boarding Pass / Ticket Cards */
                if (parsedReceipt) {
                  return (
                    <div key={msg.id || index} className="hc-ticket-row">
                      {parsedReceipt.type === 'payment' ? (
                        <div className="hc-receipt-card hc-receipt-stripe">
                          <div className="hc-receipt-top">
                            <div className="hc-receipt-badge hc-badge-success">
                              <CheckCircle2 size={13} />
                              <span>Stripe Payment Confirmed</span>
                            </div>
                            {parsedReceipt.amount && (
                              <span className="hc-receipt-amt">{parsedReceipt.amount}</span>
                            )}
                          </div>

                          <h4 className="hc-receipt-title">{parsedReceipt.title}</h4>

                          <div className="hc-receipt-grid">
                            {parsedReceipt.dates && (
                              <div className="hc-receipt-cell">
                                <span className="hc-cell-lbl">Travel Dates</span>
                                <span className="hc-cell-val">{parsedReceipt.dates}</span>
                              </div>
                            )}
                            {parsedReceipt.party && (
                              <div className="hc-receipt-cell">
                                <span className="hc-cell-lbl">Devotees</span>
                                <span className="hc-cell-val">{parsedReceipt.party}</span>
                              </div>
                            )}
                            {parsedReceipt.status && (
                              <div className="hc-receipt-cell">
                                <span className="hc-cell-lbl">Status</span>
                                <span className="hc-cell-val hc-status-active">
                                  <span className="hc-status-dot-mini" />
                                  {parsedReceipt.status}
                                </span>
                              </div>
                            )}
                            {parsedReceipt.txnId && (
                              <div className="hc-receipt-cell hc-cell-full">
                                <span className="hc-cell-lbl">Transaction Reference</span>
                                <div className="hc-txn-row">
                                  <span className="hc-txn-id">{parsedReceipt.txnId}</span>
                                  <button 
                                    type="button" 
                                    className="hc-btn-copy-mini"
                                    onClick={() => handleCopyTxn(parsedReceipt.txnId)}
                                    title="Copy Reference ID"
                                  >
                                    {copiedTxn === parsedReceipt.txnId ? (
                                      <Check size={11} className="hc-copied-icon" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                    <span>{copiedTxn === parsedReceipt.txnId ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="hc-receipt-footer">
                            <span className="hc-receipt-footer-note">
                              🔒 100% Guaranteed Booking • Priority Concierge Notified
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="hc-receipt-card hc-receipt-inquiry">
                          <div className="hc-receipt-top">
                            <div className="hc-receipt-badge hc-badge-inquiry">
                              <Sparkles size={12} />
                              <span>Yatra Reservation Request</span>
                            </div>
                            <span className="hc-inquiry-status-pill">
                              <span className="hc-pulse-dot-amber" />
                              Connecting Concierge
                            </span>
                          </div>

                          <h4 className="hc-receipt-title">{parsedReceipt.title}</h4>

                          <div className="hc-receipt-grid">
                            {parsedReceipt.dates && (
                              <div className="hc-receipt-cell">
                                <span className="hc-cell-lbl">Yatra Dates</span>
                                <span className="hc-cell-val">{parsedReceipt.dates}</span>
                              </div>
                            )}
                            {parsedReceipt.devotee && (
                              <div className="hc-receipt-cell">
                                <span className="hc-cell-lbl">Devotee</span>
                                <span className="hc-cell-val">{parsedReceipt.devotee}</span>
                              </div>
                            )}
                            {parsedReceipt.mobile && (
                              <div className="hc-receipt-cell">
                                <span className="hc-cell-lbl">Mobile</span>
                                <span className="hc-cell-val">{parsedReceipt.mobile}</span>
                              </div>
                            )}
                            {parsedReceipt.party && (
                              <div className="hc-receipt-cell">
                                <span className="hc-cell-lbl">Party</span>
                                <span className="hc-cell-val">{parsedReceipt.party}</span>
                              </div>
                            )}
                          </div>

                          <div className="hc-receipt-footer">
                            <span className="hc-receipt-footer-note">
                              ⚡ Our live travel desk will confirm availability momentarily.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                /* Case C: Standard Rich Chat Bubble */
                return (
                  <div 
                    key={msg.id || index} 
                    className={`hc-message-row ${isMe ? 'is-me' : 'is-support'}`}
                  >
                    {!isMe && (
                      <div className="hc-msg-avatar" title={isAdmin ? 'Vrinda Vihar Desk' : 'Brajwasi Concierge'}>
                        {isAdmin ? <ShieldCheck size={14} /> : <Sparkles size={14} />}
                      </div>
                    )}

                    <div className="hc-bubble-wrap">
                      <div className="hc-msg-sender-name">
                        {isMe 
                          ? 'You' 
                          : (isAdmin ? 'Vrinda Vihar Desk' : 'Vrinda Concierge')}
                      </div>

                      <div className={`hc-bubble ${isMe ? 'bubble-me' : isAdmin ? 'bubble-admin' : 'bubble-bot'}`}>
                        <div className="hc-msg-content">
                          {formatChatMessage(msg.message || msg.text)}
                        </div>
                        <div className="hc-msg-meta">
                          <span className="hc-msg-time">
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                          {isMe && <CheckCheck size={13} className="hc-msg-status-icon" />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Compose Box */}
            <form 
              className="hc-compose-form" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <div className="hc-input-wrap">
                <input
                  ref={inputRef}
                  type="text"
                  className="hc-chat-input"
                  placeholder="Type your pilgrimage inquiry or message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className="hc-btn-send"
                  disabled={!inputText.trim() || isSending}
                  aria-label="Send Message"
                >
                  <Send size={15} />
                </button>
              </div>

              <div className="hc-compose-footer">
                <span className="hc-ticket-tag">
                  🛡️ Ticket #{threadId ? threadId.slice(-6).toUpperCase() : 'LIVE'} • Verified Brajwasi Support
                </span>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: INSTANT YATRA GUIDE & HELP CENTER FAQS */}
        {activeTab === 'faqs' && (
          <div className="hc-faqs-container">
            <div className="hc-faq-card">
              <div className="hc-faq-top-row">
                <div className="hc-faq-tag hc-tag-gold">👑 VIP Darshan & Passes</div>
                <h4>Bankey Bihari Temple</h4>
              </div>
              <div className="hc-faq-facts-grid">
                <div className="hc-fact-pill">
                  <Clock size={12} />
                  <span><strong>Morning:</strong> 7:45 AM – 12:00 PM</span>
                </div>
                <div className="hc-fact-pill">
                  <Clock size={12} />
                  <span><strong>Evening:</strong> 5:30 PM – 9:30 PM</span>
                </div>
                <div className="hc-fact-pill hc-fact-highlight">
                  <ShieldCheck size={12} />
                  <span>Gate 2 Priority & Wheelchair Desk</span>
                </div>
              </div>
              <button 
                type="button" 
                className="hc-faq-ask-btn"
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('Please arrange wheelchair or VIP pass for Bankey Bihari Darshan', 'vip');
                }}
              >
                <span>Get VIP Pass Assistance</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="hc-faq-card">
              <div className="hc-faq-top-row">
                <div className="hc-faq-tag hc-tag-emerald">🛺 21 KM Parikrama</div>
                <h4>Govardhan E-Rickshaws</h4>
              </div>
              <div className="hc-faq-facts-grid">
                <div className="hc-fact-pill">
                  <MapPin size={12} />
                  <span>Mansi Ganga • Dan Ghati • Radha Kund</span>
                </div>
                <div className="hc-fact-pill hc-fact-highlight">
                  <Tag size={12} />
                  <span>Fixed Flat Rate • Zero Surge</span>
                </div>
                <div className="hc-fact-pill">
                  <User size={12} />
                  <span>Verified Brajwasi Local Drivers</span>
                </div>
              </div>
              <button 
                type="button" 
                className="hc-faq-ask-btn"
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('I want to book an E-Rickshaw for Govardhan Parikrama', 'parikrama');
                }}
              >
                <span>Book Parikrama Rickshaw</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="hc-faq-card">
              <div className="hc-faq-top-row">
                <div className="hc-faq-tag hc-tag-blue">🏨 Direct Pricing</div>
                <h4>Verified Ashrams & Stays</h4>
              </div>
              <div className="hc-faq-facts-grid">
                <div className="hc-fact-pill">
                  <Calendar size={12} />
                  <span>Gaudiya Ashrams • VIP AC Rooms</span>
                </div>
                <div className="hc-fact-pill hc-fact-highlight">
                  <CreditCard size={12} />
                  <span>100% Direct Rates • 0% Fee</span>
                </div>
                <div className="hc-fact-pill">
                  <Sparkles size={12} />
                  <span>Clean Sattvic Living Guaranteed</span>
                </div>
              </div>
              <button 
                type="button" 
                className="hc-faq-ask-btn"
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('I need a direct rate quote for hotel and ashram booking', 'hotel');
                }}
              >
                <span>Find Ashram / Hotel</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="hc-faq-card">
              <div className="hc-faq-top-row">
                <div className="hc-faq-tag hc-tag-gold">🚗 Private Cabs</div>
                <h4>Mathura & Brij Darshan</h4>
              </div>
              <div className="hc-faq-facts-grid">
                <div className="hc-fact-pill">
                  <MapPin size={12} />
                  <span>Barsana • Nandgaon • Gokul • Mathura</span>
                </div>
                <div className="hc-fact-pill hc-fact-highlight">
                  <Clock size={12} />
                  <span>1 & 2 Day Full Itineraries</span>
                </div>
              </div>
              <button 
                type="button" 
                className="hc-faq-ask-btn"
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('I need a private cab for Mathura, Barsana & Gokul Yatra', 'custom');
                }}
              >
                <span>Plan Private Cab Tour</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
