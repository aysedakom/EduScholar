// backend/models/liveChatModel.js
const { pool } = require('../config/db');
const { broadcast } = require('../realtime/socketServer');

const ALLOWED_CATEGORIES = [
  'Scholarship Application',
  'Requirements',
  'Application Status',
  'Scholarship Renewal',
  'Grant/Disbursement',
  'Account/Login',
  'Technical Support',
  'Other Concern',
];

/**
 * Calculate queue position for a waiting session
 */
const getQueuePosition = async (sessionId) => {
  try {
    const sessionRes = await pool.query('SELECT created_at, status FROM live_chat_sessions WHERE id = $1', [sessionId]);
    if (!sessionRes.rows[0] || sessionRes.rows[0].status !== 'Waiting') return 0;
    
    const createdAt = sessionRes.rows[0].created_at;
    const countRes = await pool.query(
      `SELECT COUNT(*)::integer as position 
       FROM live_chat_sessions 
       WHERE status = 'Waiting' AND created_at <= $1`,
      [createdAt]
    );
    return countRes.rows[0]?.position || 1;
  } catch (err) {
    console.error('[liveChatModel.getQueuePosition] Error:', err.message);
    return 1;
  }
};

/**
 * Create a new Live Chat session (Public guest or logged-in student)
 */
const createSession = async ({ guest_name, guest_email, category, initial_message, user_id }) => {
  try {
    // Enforce 3 active/waiting session limit per user or email
    const activeCheck = await pool.query(
      `SELECT COUNT(*)::integer as count 
       FROM live_chat_sessions 
       WHERE status IN ('Waiting', 'Active') 
         AND (
           (user_id IS NOT NULL AND user_id = $1)
           OR (guest_email IS NOT NULL AND LOWER(guest_email) = LOWER($2))
         )`,
      [user_id || -1, guest_email || '']
    );

    if (activeCheck.rows[0]?.count >= 3) {
      throw new Error('Queue limit reached: You are restricted to a maximum of 3 active live chat requests in the queue. Please resolve your existing chats first.');
    }

    const sessionCode = `LIVE-${Math.floor(100000 + Math.random() * 900000)}`;
    const selectedCategory = ALLOWED_CATEGORIES.includes(category) ? category : 'Other Concern';

    const res = await pool.query(
      `INSERT INTO live_chat_sessions 
         (session_code, guest_name, guest_email, user_id, category, initial_message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Waiting')
       RETURNING *`,
      [sessionCode, guest_name, guest_email || null, user_id || null, selectedCategory, initial_message]
    );

    const session = res.rows[0];

    // Insert initial message into live_chat_messages
    await pool.query(
      `INSERT INTO live_chat_messages (session_id, sender_type, sender_id, sender_name, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [session.id, user_id ? 'student' : 'guest', user_id || null, guest_name, initial_message]
    );

    const queuePosition = await getQueuePosition(session.id);
    session.queue_position = queuePosition;

    // Broadcast live event to Admin Dashboard
    broadcast({
      type: 'LIVE_CHAT_EVENT',
      action: 'NEW_SESSION',
      session,
      timestamp: new Date().toISOString(),
    });

    return session;
  } catch (err) {
    console.error('[liveChatModel.createSession] Error:', err.message);
    throw err;
  }
};

/**
 * Get all live chat sessions with optional status filter for Admin Dashboard
 */
const getSessions = async (filters = {}) => {
  try {
    const { status, search } = filters;
    let query = `
      SELECT s.*, 
             COALESCE(
               (SELECT COUNT(*)::integer FROM live_chat_sessions w WHERE w.status = 'Waiting' AND w.created_at <= s.created_at), 
               0
             ) as queue_position,
             (SELECT COUNT(*)::integer FROM live_chat_messages m WHERE m.session_id = s.id) as message_count
      FROM live_chat_sessions s
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      if (status === 'Expired/Closed' || status === 'Expired' || status === 'Closed') {
        params.push('Expired');
        params.push('Closed');
        query += ` AND (s.status = $1 OR s.status = $2)`;
      } else {
        params.push(status);
        query += ` AND s.status = $${params.length}`;
      }
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (s.session_code ILIKE $${params.length} OR s.guest_name ILIKE $${params.length} OR s.category ILIKE $${params.length} OR s.initial_message ILIKE $${params.length})`;
    }

    query += ` ORDER BY CASE 
                 WHEN s.status = 'Waiting' THEN 1 
                 WHEN s.status = 'Active' THEN 2 
                 WHEN s.status = 'Resolved' THEN 3 
                 ELSE 4 
               END, s.created_at DESC`;

    const res = await pool.query(query, params);

    // Get count statistics for Admin filter tabs
    const statsRes = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'Active' THEN 1 END)::integer as active_count,
        COUNT(CASE WHEN status = 'Waiting' THEN 1 END)::integer as waiting_count,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END)::integer as resolved_count,
        COUNT(CASE WHEN status IN ('Expired', 'Closed') THEN 1 END)::integer as expired_count,
        COUNT(CASE WHEN status = 'Archived' THEN 1 END)::integer as archived_count,
        COUNT(*)::integer as total_count
      FROM live_chat_sessions
    `);

    return {
      sessions: res.rows,
      stats: statsRes.rows[0] || { active_count: 0, waiting_count: 0, resolved_count: 0, expired_count: 0, archived_count: 0, total_count: 0 },
    };
  } catch (err) {
    console.error('[liveChatModel.getSessions] Error:', err.message);
    throw err;
  }
};

/**
 * Get a single live chat session by ID or Session Code with full message history
 */
const getSessionById = async (idOrCode) => {
  try {
    const isNumeric = !isNaN(Number(idOrCode)) && /^\d+$/.test(String(idOrCode));
    let sessionRes;
    if (isNumeric) {
      sessionRes = await pool.query('SELECT * FROM live_chat_sessions WHERE id = $1::integer', [parseInt(idOrCode, 10)]);
    } else {
      sessionRes = await pool.query('SELECT * FROM live_chat_sessions WHERE session_code = $1::varchar', [String(idOrCode)]);
    }

    const session = sessionRes.rows[0];
    if (!session) return null;

    if (session.status === 'Waiting') {
      session.queue_position = await getQueuePosition(session.id);
    } else {
      session.queue_position = 0;
    }

    const messagesRes = await pool.query(
      `SELECT * FROM live_chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [session.id]
    );

    session.messages = messagesRes.rows;
    return session;
  } catch (err) {
    console.error('[liveChatModel.getSessionById] Error:', err.message);
    throw err;
  }
};

/**
 * Send a message in a Live Chat session
 */
const sendMessage = async (sessionId, { sender_type, sender_id, sender_name, message }) => {
  try {
    const sessionRes = await pool.query('SELECT * FROM live_chat_sessions WHERE id = $1', [sessionId]);
    const session = sessionRes.rows[0];
    if (!session) throw new Error('Live chat session not found');

    if (session.status === 'Expired' || session.status === 'Closed' || session.status === 'Archived') {
      throw new Error('This live chat session has ended and is read-only.');
    }

    const msgRes = await pool.query(
      `INSERT INTO live_chat_messages (session_id, sender_type, sender_id, sender_name, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sessionId, sender_type, sender_id || null, sender_name, message]
    );

    const savedMsg = msgRes.rows[0];

    // Update last_message_at and last_user_activity_at (resets auto-close timer on user activity)
    await pool.query(
      `UPDATE live_chat_sessions 
       SET last_message_at = NOW(), 
           last_user_activity_at = CASE WHEN $2 IN ('student', 'guest') THEN NOW() ELSE last_user_activity_at END,
           updated_at = NOW() 
       WHERE id = $1`,
      [sessionId, sender_type]
    );

    broadcast({
      type: 'LIVE_CHAT_EVENT',
      action: 'NEW_MESSAGE',
      sessionId,
      message: savedMsg,
      timestamp: new Date().toISOString(),
    });

    return savedMsg;
  } catch (err) {
    console.error('[liveChatModel.sendMessage] Error:', err.message);
    throw err;
  }
};

/**
 * Admin action: Accept a Waiting Chat (Waiting -> Active)
 */
const acceptSession = async (sessionId, adminUser) => {
  try {
    const res = await pool.query(
      `UPDATE live_chat_sessions
       SET status = 'Active',
           assigned_admin_id = $2,
           assigned_admin_name = $3,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [sessionId, adminUser.id, adminUser.name || 'Financial Aid Officer']
    );

    const session = res.rows[0];
    if (!session) return null;

    // Send automated system notification message in chat
    const sysMsg = `🟢 Admin Officer ${adminUser.name || 'Officer'} has joined the chat session. How can we assist you today?`;
    await pool.query(
      `INSERT INTO live_chat_messages (session_id, sender_type, sender_id, sender_name, message)
       VALUES ($1, 'system', $2, 'System Desk', $3)`,
      [sessionId, adminUser.id, sysMsg]
    );

    broadcast({
      type: 'LIVE_CHAT_EVENT',
      action: 'SESSION_ACCEPTED',
      session,
      timestamp: new Date().toISOString(),
    });

    return session;
  } catch (err) {
    console.error('[liveChatModel.acceptSession] Error:', err.message);
    throw err;
  }
};

/**
 * Admin or system action: Mark chat as Resolved or Closed/Expired (Active -> Resolved -> Archived)
 */
const updateSessionStatus = async (sessionId, status, adminUser = null, remarks = '') => {
  try {
    const validStatuses = ['Active', 'Resolved', 'Expired', 'Closed', 'Archived'];
    if (!validStatuses.includes(status)) throw new Error('Invalid chat status');

    const res = await pool.query(
      `UPDATE live_chat_sessions
       SET status = $2,
           closed_at = CASE WHEN $2 IN ('Resolved', 'Expired', 'Closed', 'Archived') THEN NOW() ELSE closed_at END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [sessionId, status]
    );

    const session = res.rows[0];
    if (!session) return null;

    const officerName = adminUser?.name || 'Administrator';
    let sysText = `🔵 Chat session marked as ${status.toUpperCase()} by ${officerName}.`;
    if (status === 'Expired') {
      sysText = `🔴 Chat session auto-closed due to 2 minutes of user inactivity. Closed conversations are archived for administrative reference.`;
    } else if (status === 'Resolved') {
      sysText = `🔵 Inquiry resolved by Officer ${officerName}. ${remarks ? `Remarks: ${remarks}. ` : ''}Conversation archived for administrative reference.`;
    }

    await pool.query(
      `INSERT INTO live_chat_messages (session_id, sender_type, sender_id, sender_name, message)
       VALUES ($1, 'system', $2, 'System Desk', $3)`,
      [sessionId, adminUser?.id || null, sysText]
    );

    broadcast({
      type: 'LIVE_CHAT_EVENT',
      action: 'STATUS_UPDATED',
      session,
      timestamp: new Date().toISOString(),
    });

    return session;
  } catch (err) {
    console.error('[liveChatModel.updateSessionStatus] Error:', err.message);
    throw err;
  }
};

/**
 * Auto-close chats that have had no user activity for 120 seconds (1-2 minutes)
 */
const autoCloseInactiveSessions = async () => {
  try {
    // Find Waiting or Active sessions where last user activity was > 2 minutes ago
    const inactiveRes = await pool.query(`
      SELECT id, session_code, guest_name 
      FROM live_chat_sessions
      WHERE status IN ('Waiting', 'Active')
        AND last_user_activity_at < NOW() - INTERVAL '2 minutes'
    `);

    for (const session of inactiveRes.rows) {
      await updateSessionStatus(session.id, 'Expired');
      console.log(`[liveChatModel.autoCloseInactiveSessions] Auto-closed inactive session #${session.session_code}`);
    }

    return inactiveRes.rows.length;
  } catch (err) {
    console.error('[liveChatModel.autoCloseInactiveSessions] Error:', err.message);
    return 0;
  }
};

module.exports = {
  ALLOWED_CATEGORIES,
  createSession,
  getSessions,
  getSessionById,
  sendMessage,
  acceptSession,
  updateSessionStatus,
  autoCloseInactiveSessions,
};
