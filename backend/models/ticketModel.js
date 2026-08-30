// backend/models/ticketModel.js
const { pool } = require('../config/db');

const findAll = async (filters = {}) => {
  try {
    const { status, category, priority, search } = filters;
    let query = `
      SELECT t.*, u.name as user_name, u.email as user_email, u.student_id, u.department, u.major
      FROM support_tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }

    if (category && category !== 'All') {
      params.push(category);
      query += ` AND t.category = $${params.length}`;
    }

    if (priority && priority !== 'All') {
      params.push(priority);
      query += ` AND t.priority = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.ticket_code ILIKE $${params.length} OR t.subject ILIKE $${params.length} OR t.description ILIKE $${params.length} OR u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    query += ` ORDER BY CASE WHEN t.status = 'Open' THEN 1 WHEN t.status = 'In Progress' THEN 2 ELSE 3 END, t.created_at DESC`;

    const res = await pool.query(query, params);
    return res.rows;
  } catch (err) {
    console.error('[ticketModel.findAll] Error:', err.message);
    throw err;
  }
};

const findByUser = async (userId) => {
  try {
    const res = await pool.query(
      `SELECT t.*, u.name as user_name, u.email as user_email, u.student_id
       FROM support_tickets t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return res.rows;
  } catch (err) {
    console.error('[ticketModel.findByUser] Error:', err.message);
    throw err;
  }
};

const findById = async (id) => {
  try {
    const res = await pool.query(
      `SELECT t.*, u.name as user_name, u.email as user_email, u.student_id, u.department, u.major,
              cb.name as closed_by_name
       FROM support_tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN users cb ON t.closed_by = cb.id
       WHERE t.id = $1 OR t.ticket_code = $1`,
      [id]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.error('[ticketModel.findById] Error:', err.message);
    throw err;
  }
};

const create = async (data, user) => {
  try {
    const ticketCode = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const conversationId = data.conversation_id || `conv_ticket_${ticketCode.toLowerCase()}`;

    const res = await pool.query(
      `INSERT INTO support_tickets
         (ticket_code, user_id, applicant_name, applicant_email, subject, category, priority, status, description, conversation_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Open', $8, $9)
       RETURNING *`,
      [
        ticketCode,
        user.id,
        user.name || data.applicant_name,
        user.email || data.applicant_email,
        data.subject || data.title,
        data.category || 'General Inquiry',
        data.priority || 'Medium',
        data.description || data.message,
        conversationId,
      ]
    );

    const ticket = res.rows[0];

    // Create / insert initial chat message in chat_messages
    try {
      await pool.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_role, message, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, FALSE, NOW())`,
        [
          conversationId,
          user.id,
          user.name || 'Applicant',
          user.role || 'student',
          `[Ticket #${ticketCode}] ${ticket.subject}\nCategory: ${ticket.category} | Priority: ${ticket.priority}\n\n${ticket.description}`,
        ]
      );
    } catch (chatErr) {
      console.warn('[ticketModel.create] Chat insert note:', chatErr.message);
    }

    // Insert in-app notifications for admins
    try {
      const adminUsers = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'system_admin', 'school_coordinator')");
      for (const admin of adminUsers.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
           VALUES ($1, $2, $3, 'info', false, 'support_ticket', '/messages')`,
          [
            admin.id,
            `🎫 New Support Ticket: ${ticketCode}`,
            `Applicant ${user.name} filed a ticket (${ticket.category}): "${ticket.subject}".`,
          ]
        );
      }
    } catch (notifErr) {
      console.warn('[ticketModel.create] Admin notification note:', notifErr.message);
    }

    return ticket;
  } catch (err) {
    console.error('[ticketModel.create] Error:', err.message);
    throw err;
  }
};

const updateStatus = async (id, { status, adminNotes, resolutionRemarks, adminUser }) => {
  try {
    const isClosed = status === 'Closed' || status === 'Resolved';
    const closedAt = isClosed ? new Date() : null;
    const closedBy = isClosed && adminUser ? adminUser.id : null;

    const res = await pool.query(
      `UPDATE support_tickets
       SET status = $2,
           admin_notes = COALESCE($3, admin_notes),
           resolution_remarks = COALESCE($4, resolution_remarks),
           closed_at = CASE WHEN $2 = 'Closed' OR $2 = 'Resolved' THEN NOW() ELSE closed_at END,
           closed_by = CASE WHEN $2 = 'Closed' OR $2 = 'Resolved' THEN $5 ELSE closed_by END,
           updated_at = NOW()
       WHERE id = $1 OR ticket_code = $1::text
       RETURNING *`,
      [id, status, adminNotes || null, resolutionRemarks || null, closedBy]
    );

    const ticket = res.rows[0];
    if (!ticket) return null;

    // Send in-app notification to the applicant
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
         VALUES ($1, $2, $3, $4, false, 'support_ticket', '/messages')`,
        [
          ticket.user_id,
          `🎫 Support Ticket Update: ${ticket.ticket_code}`,
          isClosed
            ? `Your ticket #${ticket.ticket_code} has been marked as ${status} by Support Officer ${adminUser?.name || 'Admin'}. Remarks: ${resolutionRemarks || 'Inquiry addressed.'}`
            : `Your ticket #${ticket.ticket_code} status was updated to "${status}".`,
          isClosed ? 'success' : 'info',
        ]
      );
    } catch (notifErr) {
      console.warn('[ticketModel.updateStatus] Student notification note:', notifErr.message);
    }

    // Insert system message in chat conversation
    if (ticket.conversation_id) {
      try {
        const sysMsg = isClosed
          ? `🛡️ [SYSTEM NOTICE] Ticket #${ticket.ticket_code} was officially CLOSED by ${adminUser?.name || 'Administrator'}.\nResolution: ${resolutionRemarks || 'Inquiry resolved.'}`
          : `🛡️ [SYSTEM NOTICE] Ticket #${ticket.ticket_code} status updated to "${status}" by ${adminUser?.name || 'Administrator'}.`;

        await pool.query(
          `INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_role, message, is_read, created_at)
           VALUES ($1, $2, $3, 'system', $4, FALSE, NOW())`,
          [
            ticket.conversation_id,
            adminUser?.id || 1,
            adminUser?.name || 'Admin',
            sysMsg,
          ]
        );
      } catch (msgErr) {
        console.warn('[ticketModel.updateStatus] System chat insert note:', msgErr.message);
      }
    }

    return ticket;
  } catch (err) {
    console.error('[ticketModel.updateStatus] Error:', err.message);
    throw err;
  }
};

module.exports = { findAll, findByUser, findById, create, updateStatus };
