/**
 * Vrinda Tours — Vrinda Vihar In-App Help Centre & Support Messaging Engine
 * Provides real-time bidirectional messaging between pilgrims/devotees and
 * the Vrinda Vihar Operations Support Desk, backed by Supabase & 0ms LocalStorage cache.
 */

import { supabase } from '../config/supabase';

const THREAD_STORAGE_KEY = 'vt_helpcenter_thread_id';
const MESSAGES_CACHE_KEY = 'vt_helpcenter_messages_cache';
const ALL_THREADS_CACHE_KEY = 'vt_admin_support_threads_cache';

/**
 * Get or create a unique persistent Thread ID for the current devotee/browser session
 */
export function getOrCreateThreadId(userInfo = {}) {
  let threadId = localStorage.getItem(THREAD_STORAGE_KEY);
  if (!threadId) {
    const userSlug = (userInfo.email || userInfo.phone || userInfo.name || 'devotee')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 10) || 'pilgrim';
    threadId = `th_${userSlug}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    localStorage.setItem(THREAD_STORAGE_KEY, threadId);
  }
  return threadId;
}

/**
 * Common auto-responses for instant guidance while an admin connects
 */
const AUTO_RESPONSES = {
  vip: "Radhe Radhe! For Bankey Bihari VIP Darshan & Prem Mandir Light Show passes, our local Brajwasi guide coordinates priority entry slots daily from 8:00 AM to 12:00 PM and 5:00 PM to 9:30 PM. Would you like us to reserve a VIP pass for your travel dates?",
  hotel: "Namaste! Vrinda Vihar verified stays include traditional Gaudiya Ashrams, AC Guest Houses, and 4-Star Pilgrim Resorts in Raman Reti, VIP Road, and Govardhan. You can book directly with zero platform fee.",
  parikrama: "Hare Krishna! The Govardhan Parikrama (21 km) and Vrindavan Panchkosi Parikrama (11 km) can be arranged on foot or via electric E-Rickshaw with our verified Brajwasi sevaks. E-Rickshaw assistance is available 24/7.",
  custom: "Radhe Radhe! We specialize in custom 1-Day, 2-Day, and 84 Kos Brij Mahayatra itineraries for families and groups. Please share your arrival date, number of devotees, and preferred temples.",
  default: "Thank you for reaching out to Vrinda Vihar Help Centre. Your inquiry has been registered with priority ticket #VT-{ID}. A dedicated Brajwasi pilgrimage concierge is reviewing your request and will reply shortly."
};

/**
 * Real-time Supabase listener for a single devotee thread
 */
export function subscribeToThread(threadId, onNewMessage) {
  if (!threadId || !supabase) return () => {};

  const channel = supabase
    .channel(`realtime_thread_${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `thread_id=eq.${threadId}`
      },
      (payload) => {
        const raw = payload.new;
        if (raw) {
          const msg = {
            id: raw.id,
            thread_id: raw.thread_id,
            sender: raw.sender === 'system' ? 'concierge_bot' : raw.sender,
            sender_name: raw.sender_name,
            sender_email: raw.sender_email,
            sender_phone: raw.sender_phone,
            message: raw.text || raw.message || '',
            text: raw.text || raw.message || '',
            category: raw.category || 'general',
            metadata: raw.metadata || {},
            created_at: raw.created_at || new Date().toISOString()
          };
          onNewMessage(msg);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Send a message from Devotee to Vrinda Vihar Help Centre
 */
export async function sendSupportMessage({
  threadId,
  sender = 'user',
  text,
  senderName = 'Devotee Pilgrim',
  senderEmail = '',
  senderPhone = '',
  category = 'general',
  metadata = {}
}) {
  if (!text || !text.trim()) return null;

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  const messageObj = {
    id: msgId,
    thread_id: threadId,
    sender, // 'user' | 'admin' | 'concierge_bot'
    sender_name: senderName,
    sender_email: senderEmail,
    sender_phone: senderPhone,
    message: text.trim(),
    text: text.trim(),
    category,
    status: 'sent',
    created_at: timestamp,
    metadata
  };

  // 1. Save to Local Cache (0ms instant optimistic UI update)
  try {
    const cached = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    const updated = [...cached, messageObj];
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(updated));

    // Also update Admin threads cache so Admin Panel reflects it instantly
    const allThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
    if (!allThreads[threadId]) {
      allThreads[threadId] = {
        thread_id: threadId,
        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: senderPhone,
        status: 'open',
        category,
        last_message: text.trim(),
        last_updated: timestamp,
        messages: []
      };
    }
    allThreads[threadId].last_message = text.trim();
    allThreads[threadId].last_updated = timestamp;
    allThreads[threadId].sender_name = senderName || allThreads[threadId].sender_name;
    allThreads[threadId].sender_email = senderEmail || allThreads[threadId].sender_email;
    allThreads[threadId].sender_phone = senderPhone || allThreads[threadId].sender_phone;
    allThreads[threadId].messages.push(messageObj);
    localStorage.setItem(ALL_THREADS_CACHE_KEY, JSON.stringify(allThreads));
  } catch (err) {
    console.warn('Local messaging cache warning:', err);
  }

  // 2. Persist to Supabase Database
  try {
    const supabaseSender = messageObj.sender === 'concierge_bot' ? 'system' : (messageObj.sender || 'user');
    await supabase
      .from('support_messages')
      .insert([
        {
          id: messageObj.id,
          thread_id: threadId,
          sender: supabaseSender,
          sender_name: messageObj.sender_name || 'Devotee Pilgrim',
          sender_email: messageObj.sender_email || '',
          sender_phone: messageObj.sender_phone || '',
          text: messageObj.message,
          category: messageObj.category || 'general',
          metadata: messageObj.metadata || {},
          is_read: false,
          created_at: timestamp
        }
      ]);
  } catch (e) {
    console.warn('Supabase support_messages insert fallback:', e);
  }

  // 3. Trigger smart concierge auto-reply if user is initiating query
  if (sender === 'user') {
    setTimeout(async () => {
      let autoText = AUTO_RESPONSES.default.replace('{ID}', threadId.slice(-4).toUpperCase());
      const lower = text.toLowerCase();
      if (lower.includes('vip') || lower.includes('pass') || lower.includes('darshan') || lower.includes('bihari')) {
        autoText = AUTO_RESPONSES.vip;
      } else if (lower.includes('hotel') || lower.includes('room') || lower.includes('stay') || lower.includes('ashram')) {
        autoText = AUTO_RESPONSES.hotel;
      } else if (lower.includes('parikrama') || lower.includes('govardhan') || lower.includes('rickshaw') || lower.includes('driver')) {
        autoText = AUTO_RESPONSES.parikrama;
      } else if (lower.includes('custom') || lower.includes('package') || lower.includes('plan') || lower.includes('itinerary')) {
        autoText = AUTO_RESPONSES.custom;
      }

      await sendConciergeResponse({
        threadId,
        text: autoText,
        senderName: 'Vrinda Vihar Concierge',
        sender: 'concierge_bot'
      });
    }, 1200);
  }

  return messageObj;
}

/**
 * Send automated concierge reply
 */
async function sendConciergeResponse({ threadId, text, senderName, sender = 'concierge_bot' }) {
  const replyObj = {
    id: `bot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    thread_id: threadId,
    sender,
    sender_name: senderName,
    message: text,
    text: text,
    status: 'delivered',
    created_at: new Date().toISOString()
  };

  try {
    const cached = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    cached.push(replyObj);
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(cached));

    const allThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
    if (allThreads[threadId]) {
      allThreads[threadId].messages.push(replyObj);
      allThreads[threadId].last_message = text;
      allThreads[threadId].last_updated = replyObj.created_at;
      localStorage.setItem(ALL_THREADS_CACHE_KEY, JSON.stringify(allThreads));
    }
  } catch {}

  try {
    await supabase.from('support_messages').insert([
      {
        id: replyObj.id,
        thread_id: threadId,
        sender: 'system',
        sender_name: replyObj.sender_name,
        text: replyObj.message,
        is_read: false,
        created_at: replyObj.created_at
      }
    ]);
  } catch {}

  // Dispatch custom window event so open chat windows update immediately
  window.dispatchEvent(new CustomEvent('vt_new_support_message', { detail: { threadId, message: replyObj } }));
}

/**
 * Admin sends a direct reply to user's thread
 */
export async function sendAdminReply({
  threadId,
  replyText,
  adminName = 'Vrinda Vihar Operations',
  adminEmail = 'support@vrindatours.com'
}) {
  if (!replyText || !replyText.trim()) return null;

  const msgId = `adm_reply_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  const replyObj = {
    id: msgId,
    thread_id: threadId,
    sender: 'admin',
    sender_name: adminName,
    sender_email: adminEmail,
    message: replyText.trim(),
    text: replyText.trim(),
    status: 'delivered',
    created_at: timestamp
  };

  // 1. Update Local Storage
  try {
    const cached = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    cached.push(replyObj);
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(cached));

    const allThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
    if (allThreads[threadId]) {
      allThreads[threadId].messages.push(replyObj);
      allThreads[threadId].last_message = replyText.trim();
      allThreads[threadId].last_updated = timestamp;
      allThreads[threadId].status = 'in_progress';
      localStorage.setItem(ALL_THREADS_CACHE_KEY, JSON.stringify(allThreads));
    }
  } catch {}

  // 2. Persist to Supabase
  try {
    await supabase.from('support_messages').insert([
      {
        id: replyObj.id,
        thread_id: threadId,
        sender: 'admin',
        sender_name: adminName,
        sender_email: adminEmail,
        text: replyObj.message,
        is_read: false,
        created_at: timestamp
      }
    ]);
  } catch (err) {
    console.warn('Supabase admin reply warning:', err);
  }

  // Notify active windows
  window.dispatchEvent(new CustomEvent('vt_new_support_message', { detail: { threadId, message: replyObj } }));
  return replyObj;
}

/**
 * Get message history for a specific thread
 */
export async function getThreadMessages(threadId) {
  let localMsgs = [];
  try {
    const all = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    localMsgs = all.filter(m => m.thread_id === threadId);
  } catch {}

  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      const normalizedData = data.map(m => ({ 
        ...m, 
        sender: m.sender === 'system' ? 'concierge_bot' : m.sender,
        message: m.text || m.message || '' 
      }));
      const map = new Map();
      [...localMsgs, ...normalizedData].forEach(item => {
        if (item.id && !map.has(item.id)) {
          map.set(item.id, item);
        }
      });
      return Array.from(map.values());
    }
  } catch {}

  return localMsgs;
}

/**
 * Get all support threads for the Admin Console
 */
export async function getAllSupportThreads() {
  let localThreads = {};
  try {
    localThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
  } catch {}

  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      const threadsMap = { ...localThreads };
      data.forEach(rawMsg => {
        const msg = { 
          ...rawMsg, 
          sender: rawMsg.sender === 'system' ? 'concierge_bot' : rawMsg.sender,
          message: rawMsg.text || rawMsg.message || '' 
        };
        const tId = msg.thread_id;
        if (!tId) return;

        if (!threadsMap[tId]) {
          threadsMap[tId] = {
            thread_id: tId,
            sender_name: msg.sender_name || 'Devotee Pilgrim',
            sender_email: msg.sender_email || '',
            sender_phone: msg.sender_phone || '',
            status: 'open',
            category: msg.category || 'general',
            last_message: msg.message,
            last_updated: msg.created_at,
            messages: []
          };
        }
        
        if (msg.sender === 'user' && msg.sender_name && msg.sender_name !== 'Devotee Pilgrim') {
          threadsMap[tId].sender_name = msg.sender_name;
        }
        if (msg.sender_email) threadsMap[tId].sender_email = msg.sender_email;
        if (msg.sender_phone) threadsMap[tId].sender_phone = msg.sender_phone;
        threadsMap[tId].last_message = msg.message;
        threadsMap[tId].last_updated = msg.created_at;

        if (!threadsMap[tId].messages.some(m => m.id === msg.id)) {
          threadsMap[tId].messages.push(msg);
        }
      });

      // Sort each thread's messages chronologically
      Object.values(threadsMap).forEach(t => {
        t.messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      });

      const list = Object.values(threadsMap).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
      return list;
    }
  } catch {}

  return Object.values(localThreads).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
}

/**
 * Update thread status (e.g. 'open', 'in_progress', 'resolved')
 */
export async function updateThreadStatus(threadId, status) {
  try {
    const allThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
    if (allThreads[threadId]) {
      allThreads[threadId].status = status;
      localStorage.setItem(ALL_THREADS_CACHE_KEY, JSON.stringify(allThreads));
    }
  } catch {}
}
