import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, MessageSquare, Headphones, Sparkles, CheckCheck, 
  Clock, ShieldCheck, ChevronRight, User, AlertCircle, RefreshCw,
  Phone, Mail, ArrowRight, CornerDownRight, ThumbsUp
} from 'lucide-react';
import { 
  getOrCreateThreadId, 
  sendSupportMessage, 
  getThreadMessages 
} from '../../services/messagingService';
import './HelpCenterModal.css';

const QUICK_PROMPTS = [
  { label: 'Bankey Bihari VIP Pass', category: 'vip', text: 'How can I get priority VIP darshan pass for Bankey Bihari & Prem Mandir?' },
  { label: 'Govardhan Parikrama Guide', category: 'parikrama', text: 'I need an electric E-Rickshaw guide for 21 km Govardhan Parikrama.' },
  { label: 'Hotel / Ashram Stay Booking', category: 'hotel', text: 'I want assistance booking a verified Ashram or AC Guest House in Vrindavan.' },
  { label: 'Custom Family Yatra Plan', category: 'custom', text: 'Can you create a custom 2-day Brij Yatra itinerary with cab & driver?' },
  { label: 'Track My Booking / Ride', category: 'support', text: 'I need an update on my existing booking or driver dispatch.' }
];

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
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize or fetch existing thread
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

    // Load message history
    loadHistory(tId);

    // Handle initial message if passed from another component
    if (initialMessage && initialMessage.trim()) {
      setInputText(initialMessage);
    }

    // Listener for new inbound messages
    const handleNewMessage = (e) => {
      if (e.detail?.threadId === tId && e.detail?.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === e.detail.message.id)) return prev;
          return [...prev, e.detail.message];
        });
      }
    };

    window.addEventListener('vt_new_support_message', handleNewMessage);
    return () => window.removeEventListener('vt_new_support_message', handleNewMessage);
  }, [isOpen, initialMessage, currentUser]);

  // Scroll to bottom on new messages
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
      // Default welcome message from Concierge Desk
      setMessages([
        {
          id: 'welcome_initial',
          thread_id: tId,
          sender: 'concierge_bot',
          sender_name: 'Vrinda Vihar Help Desk',
          message: 'Radhe Radhe! 🙏 Welcome to Vrinda Vihar 24/7 Pilgrimage Help Centre. How may we assist your divine journey today? You can choose a quick topic below or type your question.',
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
        {/* Header Bar */}
        <div className="hc-header">
          <div className="hc-header-left">
            <div className="hc-avatar-wrap">
              <div className="hc-avatar-icon">
                <Headphones size={20} />
              </div>
              <span className="hc-status-dot pulse" title="Live Agents Online" />
            </div>
            <div className="hc-header-titles">
              <div className="hc-title-row">
                <h3>Vrinda Vihar Help Centre</h3>
                <span className="hc-badge-live">Live Support</span>
              </div>
              <p className="hc-sub-status">
                <Sparkles size={11} className="hc-sparkle" />
                <span>Brajwasi Concierge • Typical reply in &lt;2 min</span>
              </p>
            </div>
          </div>

          <div className="hc-header-actions">
            <button
              type="button"
              className="hc-btn-icon"
              onClick={() => setShowDetailsForm(!showDetailsForm)}
              title="Devotee Contact Details"
              aria-label="Contact Details"
            >
              <User size={18} />
            </button>
            <button
              type="button"
              className="hc-btn-close"
              onClick={onClose}
              title="Close Help Centre"
              aria-label="Close Help Centre"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User Contact Details Drawer (Optional) */}
        {showDetailsForm && (
          <form className="hc-details-bar" onSubmit={handleSaveContact}>
            <div className="hc-details-fields">
              <input
                type="text"
                placeholder="Your Name (e.g. Radhika Sharma)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="hc-input-small"
              />
              <input
                type="tel"
                placeholder="Phone Number (10 digits)"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="hc-input-small"
              />
            </div>
            <button type="submit" className="hc-btn-save-contact">
              Save Info
            </button>
          </form>
        )}

        {/* Tab Switcher: Chat vs Quick FAQs */}
        <div className="hc-tabs">
          <button 
            type="button"
            className={`hc-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={14} />
            <span>Direct Messaging</span>
          </button>
          <button 
            type="button"
            className={`hc-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
          >
            <ShieldCheck size={14} />
            <span>Instant Yatra Guide</span>
          </button>
        </div>

        {/* TAB 1: DIRECT MESSAGING THREAD */}
        {activeTab === 'chat' && (
          <>
            {/* Quick Topic Chips Slider */}
            <div className="hc-quick-chips-wrap">
              <span className="hc-chips-label">Quick Inquiries:</span>
              <div className="hc-chips-scroll">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="hc-chip"
                    onClick={() => handleSendMessage(qp.text, qp.category)}
                  >
                    <span>{qp.label}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="hc-messages-body">
              {messages.map((msg, index) => {
                const isMe = msg.sender === 'user';
                const isBot = msg.sender === 'concierge_bot';
                const isAdmin = msg.sender === 'admin';

                return (
                  <div 
                    key={msg.id || index} 
                    className={`hc-message-row ${isMe ? 'is-me' : 'is-support'}`}
                  >
                    {!isMe && (
                      <div className="hc-msg-avatar">
                        {isAdmin ? <ShieldCheck size={14} /> : <Headphones size={14} />}
                      </div>
                    )}

                    <div className="hc-bubble-wrap">
                      <div className="hc-msg-sender-name">
                        {isMe ? (userName || 'You') : (msg.sender_name || (isAdmin ? 'Vrinda Vihar Desk' : 'Concierge Desk'))}
                      </div>
                      <div className={`hc-bubble ${isMe ? 'bubble-me' : isAdmin ? 'bubble-admin' : 'bubble-bot'}`}>
                        <p className="hc-msg-text">{msg.message}</p>
                        <div className="hc-msg-meta">
                          <span className="hc-msg-time">
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
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
                  autoFocus
                />
                <button
                  type="submit"
                  className="hc-btn-send"
                  disabled={!inputText.trim() || isSending}
                  aria-label="Send Message"
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="hc-compose-footer">
                <span className="hc-ticket-tag">
                  Ticket #{threadId.slice(-6).toUpperCase()} • Verified Brajwasi Support
                </span>
              </div>
            </form>
          </>
        )}

        {/* TAB 2: INSTANT YATRA GUIDE & HELP CENTER FAQS */}
        {activeTab === 'faqs' && (
          <div className="hc-faqs-container">
            <div className="hc-faq-card">
              <h4>Bankey Bihari VIP Darshan & Timings</h4>
              <p>
                Morning Darshan opens at 7:45 AM and closes at 12:00 PM. Evening Darshan opens at 5:30 PM to 9:30 PM. For elderly devotees and families with infants, wheelchair services are available at Gate No. 2.
              </p>
              <button 
                type="button" 
                className="hc-faq-ask-btn"
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('Please arrange wheelchair or VIP pass for Bankey Bihari Darshan', 'vip');
                }}
              >
                <span>Request Assistance for Bankey Bihari</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="hc-faq-card">
              <h4>Govardhan 21 KM Parikrama Logistics</h4>
              <p>
                Parikrama route covers Mansi Ganga, Dan Ghati, Radha Kund, and Shyam Kund. Clean electric E-Rickshaws with verified Brajwasi drivers can be booked for flat rates with zero surge.
              </p>
              <button 
                type="button" 
                className="hc-faq-ask-btn"
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('I want to book an E-Rickshaw for Govardhan Parikrama', 'parikrama');
                }}
              >
                <span>Book Govardhan E-Rickshaw</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="hc-faq-card">
              <h4>Zero-Platform Fee Direct Reservations</h4>
              <p>
                All hotel, ashram, and tour packages booked on Vrinda Tours carry 100% direct pricing with transparent billing and zero hidden convenience charges.
              </p>
              <button 
                type="button" 
                className="hc-faq-ask-btn"
                onClick={() => {
                  setActiveTab('chat');
                  handleSendMessage('I need a direct rate quote for hotel and cab booking', 'hotel');
                }}
              >
                <span>Inquire About Direct Rates</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
