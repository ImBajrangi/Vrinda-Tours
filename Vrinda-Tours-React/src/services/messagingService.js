/**
 * Vrinda Tours — Vrinda Vihar In-App Help Centre & Support Messaging Engine
 * Provides real-time bidirectional messaging between pilgrims/devotees and
 * the Vrinda Vihar Operations Support Desk, backed by Supabase Real-Time Broadcast & Postgres.
 */

import { supabase, safeRemoveChannel } from '../config/supabase';

const THREAD_STORAGE_KEY = 'vt_helpcenter_thread_id';
const MESSAGES_CACHE_KEY = 'vt_helpcenter_messages_cache';
const ALL_THREADS_CACHE_KEY = 'vt_admin_support_threads_cache';

// Browser-level cross-tab broadcast channel
const localBc = typeof window !== 'undefined' && 'BroadcastChannel' in window 
  ? new BroadcastChannel('vt_realtime_chat_hub') 
  : null;

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

// Active Supabase channel registry to reuse joined WebSocket connections
const activeThreadChannels = new Map();
let activeAdminChannel = null;

function safeBroadcast(channelInstance, eventName, payload) {
  if (!channelInstance) return;
  try {
    if (channelInstance.state === 'joined') {
      channelInstance.send({
        type: 'broadcast',
        event: eventName,
        payload
      });
    }
  } catch {}
}

/**
 * Real-time Supabase listener for a single devotee thread (Bi-directional WebSocket + Postgres)
 */
export function subscribeToThread(threadId, onNewMessage) {
  if (!threadId) return () => {};

  // 1. Cross-tab & In-tab broadcast listeners
  const handleLocalMsg = (msg) => {
    if (msg && msg.thread_id === threadId) {
      onNewMessage(msg);
    }
  };

  const bcHandler = (e) => {
    if (e?.data) handleLocalMsg(e.data);
  };
  if (localBc) {
    localBc.addEventListener('message', bcHandler);
  }

  const windowHandler = (e) => {
    if (e.detail?.threadId === threadId && e.detail?.message) {
      onNewMessage(e.detail.message);
    }
  };
  window.addEventListener('vt_new_support_message', windowHandler);

  // 2. Supabase Real-Time Broadcast & Postgres Channel
  let channel = null;
  if (supabase) {
    channel = supabase
      .channel(`vt_chat_${threadId}`)
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        if (payload && payload.thread_id === threadId) {
          onNewMessage(payload);
        }
      })
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

    activeThreadChannels.set(threadId, channel);
  }

  return () => {
    if (localBc) localBc.removeEventListener('message', bcHandler);
    window.removeEventListener('vt_new_support_message', windowHandler);
    activeThreadChannels.delete(threadId);
    safeRemoveChannel(channel);
  };
}

/**
 * Real-time Supabase listener for Admin Inbox (Listens to ALL devotee inquiries globally)
 */
export function subscribeToAdminInbox(onInboxEvent) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('vt_admin_global_inbox')
    .on('broadcast', { event: 'devotee_inquiry' }, ({ payload }) => {
      onInboxEvent(payload);
    })
    .on('broadcast', { event: 'new_message' }, ({ payload }) => {
      onInboxEvent(payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
      onInboxEvent();
    })
    .subscribe();

  activeAdminChannel = channel;

  const bcHandler = (e) => {
    if (e?.data) onInboxEvent(e.data);
  };
  if (localBc) {
    localBc.addEventListener('message', bcHandler);
  }

  return () => {
    if (localBc) localBc.removeEventListener('message', bcHandler);
    if (activeAdminChannel === channel) activeAdminChannel = null;
    safeRemoveChannel(channel);
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

  // 1. Optimistic Local Cache Update (0ms)
  try {
    const cached = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    cached.push(messageObj);
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(cached));

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
  } catch {}

  // 2. Broadcast immediately over local bus
  if (localBc) {
    try { localBc.postMessage(messageObj); } catch {}
  }
  window.dispatchEvent(new CustomEvent('vt_new_support_message', { detail: { threadId, message: messageObj } }));

  // 3. Broadcast safely over active Supabase Real-Time WebSocket channels
  const activeThreadChan = activeThreadChannels.get(threadId);
  safeBroadcast(activeThreadChan, 'new_message', messageObj);
  safeBroadcast(activeAdminChannel, 'devotee_inquiry', messageObj);

  // 4. Persist permanently to Supabase Postgres Database
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

  return messageObj;
}

/**
 * Admin sends a direct reply to user's thread (Bi-Directional WebSocket & DB persist)
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

  // 2. Broadcast locally
  if (localBc) {
    try { localBc.postMessage(replyObj); } catch {}
  }
  window.dispatchEvent(new CustomEvent('vt_new_support_message', { detail: { threadId, message: replyObj } }));

  // 3. Broadcast safely over active Supabase WebSocket to devotee (<20ms)
  const activeThreadChan = activeThreadChannels.get(threadId);
  safeBroadcast(activeThreadChan, 'new_message', replyObj);

  // 4. Persist to Supabase Database
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

  return replyObj;
}

/**
 * Get message history for a specific thread
 */
export async function getThreadMessages(threadId) {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (!error) {
      if (data && data.length > 0) {
        const normalizedData = data.map(m => ({ 
          ...m, 
          sender: m.sender === 'system' ? 'concierge_bot' : m.sender,
          message: m.text || m.message || '' 
        }));
        return normalizedData;
      } else {
        // If Supabase has 0 messages, clear stale local cache for this thread
        try {
          const all = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
          const remaining = all.filter(m => m.thread_id !== threadId);
          localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(remaining));
        } catch {}
        return [];
      }
    }
  } catch {}

  let localMsgs = [];
  try {
    const all = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    localMsgs = all.filter(m => m.thread_id === threadId);
  } catch {}
  return localMsgs;
}

/**
 * Get all support threads for the Admin Console
 */
export async function getAllSupportThreads() {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error) {
      if (!data || data.length === 0) {
        try {
          localStorage.removeItem(ALL_THREADS_CACHE_KEY);
          localStorage.removeItem(MESSAGES_CACHE_KEY);
        } catch {}
        return [];
      }

      const threadsMap = {};
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

  let localThreads = {};
  try {
    localThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
  } catch {}
  return Object.values(localThreads).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
}

/**
 * Clear entire support chat history from Supabase and client storage
 */
export async function clearAllChatHistory() {
  try {
    localStorage.removeItem(MESSAGES_CACHE_KEY);
    localStorage.removeItem(ALL_THREADS_CACHE_KEY);
    localStorage.removeItem(THREAD_STORAGE_KEY);
  } catch {}

  try {
    if (supabase) {
      await supabase.from('support_messages').delete().neq('id', 'keep_none');
    }
  } catch (err) {
    console.warn('Supabase clear history warning:', err);
  }
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

/**
 * Admin directly approves a registration or tour/travel booking request from the Help Center
 */
export async function approveSupportRequest({
  threadId,
  requestType = 'booking',
  entityId = null,
  entityTable = null,
  title = 'Pilgrimage Service',
  adminName = 'Vrinda Operations',
  notes = ''
}) {
  const timestamp = new Date().toISOString();
  const ticketRef = threadId.slice(-6).toUpperCase();

  // 1. Update target table in Supabase if entity exists
  try {
    if (entityId && entityTable && supabase) {
      if (entityTable === 'partners') {
        await supabase.from('partners').update({ verified: true, status: 'active', verified_at: timestamp }).eq('id', entityId);
      } else if (entityTable === 'driver_registrations' || entityTable === 'hotel_registrations' || entityTable === 'restaurant_registrations' || entityTable === 'agency_registrations') {
        await supabase.from(entityTable).update({ status: 'approved', verified: true }).eq('id', entityId);
      } else if (entityTable === 'room_bookings' || entityTable === 'table_reservations') {
        await supabase.from(entityTable).update({ status: 'confirmed', confirmed_at: timestamp }).eq('id', entityId);
      } else if (entityTable === 'ride_requests') {
        await supabase.from('ride_requests').update({ status: 'accepted' }).eq('id', entityId);
      }
    }
  } catch (err) {
    console.warn('Supabase entity status update warning:', err);
  }

  // 2. Craft high-impact official approval ticket message
  const approvalText = `✅ *REQUEST APPROVED & CONFIRMED*\n• Service: ${title}\n• Decision: Approved & Verified by ${adminName}\n• Ticket Reference: #VT-${ticketRef}\n• Status: 100% Confirmed & Active\n• Operational Notes: ${notes || 'All requirements satisfied. Your sacred pilgrimage request is verified.'}`;

  const messageObj = {
    id: `adm_appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    thread_id: threadId,
    sender: 'admin',
    sender_name: adminName,
    sender_email: 'operations@vrindatours.com',
    message: approvalText,
    text: approvalText,
    category: requestType,
    status: 'delivered',
    created_at: timestamp,
    metadata: {
      action_status: 'approved',
      request_type: requestType,
      entity_id: entityId,
      entity_table: entityTable,
      title,
      verified_by: adminName,
      resolved_at: timestamp
    }
  };

  // 3. Update Local Storage Cache
  try {
    const cached = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    cached.push(messageObj);
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(cached));

    const allThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
    if (allThreads[threadId]) {
      allThreads[threadId].messages.push(messageObj);
      allThreads[threadId].last_message = approvalText;
      allThreads[threadId].last_updated = timestamp;
      allThreads[threadId].status = 'resolved';
      localStorage.setItem(ALL_THREADS_CACHE_KEY, JSON.stringify(allThreads));
    }
  } catch {}

  // 4. Multi-tab local broadcast
  if (localBc) {
    try { localBc.postMessage(messageObj); } catch {}
  }
  window.dispatchEvent(new CustomEvent('vt_new_support_message', { detail: { threadId, message: messageObj } }));

  // 5. Supabase WebSocket Broadcast (<20ms)
  const activeThreadChan = activeThreadChannels.get(threadId);
  safeBroadcast(activeThreadChan, 'new_message', messageObj);
  safeBroadcast(activeAdminChannel, 'new_message', messageObj);

  // 6. Persist message to Supabase Postgres
  try {
    await supabase.from('support_messages').insert([
      {
        id: messageObj.id,
        thread_id: threadId,
        sender: 'admin',
        sender_name: adminName,
        sender_email: 'operations@vrindatours.com',
        text: messageObj.message,
        category: requestType,
        metadata: messageObj.metadata,
        is_read: false,
        created_at: timestamp
      }
    ]);
  } catch {}

  return messageObj;
}

/**
 * Admin directly rejects or declines a request
 */
export async function rejectSupportRequest({
  threadId,
  requestType = 'booking',
  entityId = null,
  entityTable = null,
  title = 'Pilgrimage Service',
  adminName = 'Vrinda Operations',
  reason = 'Unavailable for selected dates or slot'
}) {
  const timestamp = new Date().toISOString();
  const ticketRef = threadId.slice(-6).toUpperCase();

  try {
    if (entityId && entityTable && supabase) {
      await supabase.from(entityTable).update({ status: 'declined', decline_reason: reason }).eq('id', entityId);
    }
  } catch {}

  const rejectText = `❌ *REQUEST STATUS: DECLINED*\n• Service: ${title}\n• Decision: Declined by ${adminName}\n• Reason: ${reason}\n• Ticket Reference: #VT-${ticketRef}\n• Alternative: Please reply below or select alternative dates.`;

  const messageObj = {
    id: `adm_rej_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    thread_id: threadId,
    sender: 'admin',
    sender_name: adminName,
    sender_email: 'operations@vrindatours.com',
    message: rejectText,
    text: rejectText,
    category: requestType,
    status: 'delivered',
    created_at: timestamp,
    metadata: {
      action_status: 'rejected',
      request_type: requestType,
      entity_id: entityId,
      entity_table: entityTable,
      reason,
      resolved_at: timestamp
    }
  };

  try {
    const cached = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    cached.push(messageObj);
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(cached));

    const allThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
    if (allThreads[threadId]) {
      allThreads[threadId].messages.push(messageObj);
      allThreads[threadId].last_message = rejectText;
      allThreads[threadId].last_updated = timestamp;
      allThreads[threadId].status = 'resolved';
      localStorage.setItem(ALL_THREADS_CACHE_KEY, JSON.stringify(allThreads));
    }
  } catch {}

  if (localBc) {
    try { localBc.postMessage(messageObj); } catch {}
  }
  window.dispatchEvent(new CustomEvent('vt_new_support_message', { detail: { threadId, message: messageObj } }));

  const activeThreadChan = activeThreadChannels.get(threadId);
  safeBroadcast(activeThreadChan, 'new_message', messageObj);
  safeBroadcast(activeAdminChannel, 'new_message', messageObj);

  try {
    await supabase.from('support_messages').insert([
      {
        id: messageObj.id,
        thread_id: threadId,
        sender: 'admin',
        sender_name: adminName,
        sender_email: 'operations@vrindatours.com',
        text: messageObj.message,
        category: requestType,
        metadata: messageObj.metadata,
        is_read: false,
        created_at: timestamp
      }
    ]);
  } catch {}

  return messageObj;
}

/**
 * Admin inquires or requests additional details/documents from applicant/devotee
 */
export async function inquireSupportRequest({
  threadId,
  requestType = 'booking',
  entityId = null,
  title = 'Pilgrimage Request',
  adminName = 'Vrinda Operations',
  inquiryText = 'Please share your ID proof / exact party count to confirm your request.'
}) {
  const timestamp = new Date().toISOString();
  const ticketRef = threadId.slice(-6).toUpperCase();

  const formattedInquiry = `📋 *ADDITIONAL DETAILS REQUIRED*\n• From: ${adminName} (Operations Desk)\n• Inquiry: ${inquiryText}\n• Ticket Reference: #VT-${ticketRef}\n• Action Required: Please reply directly in this chat with the requested information.`;

  const messageObj = {
    id: `adm_inq_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    thread_id: threadId,
    sender: 'admin',
    sender_name: adminName,
    sender_email: 'operations@vrindatours.com',
    message: formattedInquiry,
    text: formattedInquiry,
    category: requestType,
    status: 'delivered',
    created_at: timestamp,
    metadata: {
      action_status: 'info_requested',
      request_type: requestType,
      entity_id: entityId,
      inquiry_text: inquiryText
    }
  };

  try {
    const cached = JSON.parse(localStorage.getItem(MESSAGES_CACHE_KEY) || '[]');
    cached.push(messageObj);
    localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(cached));

    const allThreads = JSON.parse(localStorage.getItem(ALL_THREADS_CACHE_KEY) || '{}');
    if (allThreads[threadId]) {
      allThreads[threadId].messages.push(messageObj);
      allThreads[threadId].last_message = formattedInquiry;
      allThreads[threadId].last_updated = timestamp;
      allThreads[threadId].status = 'in_progress';
      localStorage.setItem(ALL_THREADS_CACHE_KEY, JSON.stringify(allThreads));
    }
  } catch {}

  if (localBc) {
    try { localBc.postMessage(messageObj); } catch {}
  }
  window.dispatchEvent(new CustomEvent('vt_new_support_message', { detail: { threadId, message: messageObj } }));

  const activeThreadChan = activeThreadChannels.get(threadId);
  safeBroadcast(activeThreadChan, 'new_message', messageObj);
  safeBroadcast(activeAdminChannel, 'new_message', messageObj);

  try {
    await supabase.from('support_messages').insert([
      {
        id: messageObj.id,
        thread_id: threadId,
        sender: 'admin',
        sender_name: adminName,
        sender_email: 'operations@vrindatours.com',
        text: messageObj.message,
        category: requestType,
        metadata: messageObj.metadata,
        is_read: false,
        created_at: timestamp
      }
    ]);
  } catch {}

  return messageObj;
}
