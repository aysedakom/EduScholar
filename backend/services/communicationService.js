// backend/services/communicationService.js
const { pool } = require('../config/db');

class CommunicationService {
  /**
   * Fetch all active announcements
   */
  async getAnnouncements(filters = {}) {
    try {
      const { targetGroup, search } = filters;
      let query = `
        SELECT id, announcement_code, title, target_group, message, priority, sent_by, status, created_at
        FROM announcements
        WHERE status = 'active'
      `;
      const params = [];

      if (targetGroup && targetGroup !== 'All') {
        params.push(targetGroup);
        query += ` AND (target_group = $${params.length} OR target_group = 'All Students' OR target_group = 'All Qualified Scholars' OR target_group = 'All Applicants')`;
      }

      if (search) {
        params.push(`%${search}%`);
        query += ` AND (title ILIKE $${params.length} OR message ILIKE $${params.length})`;
      }

      query += ` ORDER BY created_at DESC LIMIT 50`;

      const res = await pool.query(query, params);
      return res.rows;
    } catch (err) {
      console.error('[CommunicationService.getAnnouncements] Error:', err);
      throw err;
    }
  }

  /**
   * Create a bulk announcement and notify targeted scholars
   */
  async createAnnouncement(data, creatorUser) {
    try {
      const code = `ANC-${Math.floor(100 + Math.random() * 900)}`;
      const title = data.title;
      const targetGroup = data.target_group || data.targetGroup || 'All Students';
      const message = data.message;
      const priority = data.priority || 'normal';
      const sentBy = data.sent_by || data.sentBy || (creatorUser?.name ? `${creatorUser.name} (QCYDO Desk)` : 'Quezon City Scholarship Administration');
      const userId = creatorUser?.id || null;

      const res = await pool.query(
        `INSERT INTO announcements (announcement_code, title, target_group, message, priority, sent_by, created_by_user_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         RETURNING *`,
        [code, title, targetGroup, message, priority, sentBy, userId]
      );

      const createdAnnouncement = res.rows[0];

      // Dispatch in-app notifications to targeted students
      try {
        let studentQuery = `SELECT id FROM users WHERE role = 'student'`;
        const studentRes = await pool.query(studentQuery);

        for (const student of studentRes.rows) {
          await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, is_read, category)
             VALUES ($1, $2, $3, $4, FALSE, 'announcement')`,
            [
              student.id,
              `📢 ${title}`,
              message.length > 200 ? `${message.substring(0, 197)}...` : message,
              priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : 'info',
            ]
          );
        }
      } catch (notifErr) {
        console.warn('[CommunicationService.createAnnouncement] Notification dispatch warning:', notifErr.message);
      }

      return createdAnnouncement;
    } catch (err) {
      console.error('[CommunicationService.createAnnouncement] Error:', err);
      throw err;
    }
  }

  /**
   * Get conversations list for the current user
   * - If admin/staff: returns list of student chat threads with their names and latest message
   * - If student: returns their thread with Financial Aid Desk
   */
  async getConversations(currentUser) {
    try {
      const isAdmin = currentUser.role !== 'student';

      if (!isAdmin) {
        // Student view: their Helpdesk thread + their filed Support Tickets
        const convId = `conv-student-${currentUser.id}`;
        const msgRes = await pool.query(
          `SELECT message, created_at, sender_role, is_read 
           FROM chat_messages 
           WHERE conversation_id = $1 
           ORDER BY created_at DESC LIMIT 1`,
          [convId]
        );

        const lastMsg = msgRes.rows[0] || {
          message: 'Financial Aid Desk is online to assist you.',
          created_at: new Date().toISOString(),
          sender_role: 'admin',
          is_read: true,
        };

        const threads = [
          {
            conversation_id: convId,
            participant_id: 2,
            participant_name: 'Financial Aid Desk',
            participant_role: 'Financial Aid Counselor Desk',
            avatar: 'FA',
            last_message: lastMsg.message,
            last_message_time: lastMsg.created_at,
            unread_count: 0,
            status: 'Active Response Desk',
            is_ticket: false,
          },
        ];

        // Fetch student's support tickets as conversation threads
        try {
          const ticketsRes = await pool.query(
            `SELECT t.*, 
                    (SELECT message FROM chat_messages WHERE conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_ticket_msg,
                    (SELECT created_at FROM chat_messages WHERE conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_msg_time
             FROM support_tickets t
             WHERE t.user_id = $1
             ORDER BY t.created_at DESC`,
            [currentUser.id]
          );

          for (const tkt of ticketsRes.rows) {
            threads.push({
              conversation_id: tkt.conversation_id || `conv_ticket_${tkt.ticket_code.toLowerCase()}`,
              participant_id: 2,
              participant_name: `Ticket #${tkt.ticket_code}: ${tkt.subject}`,
              participant_role: `${tkt.category} (${tkt.priority} Priority)`,
              avatar: '🎫',
              last_message: tkt.last_ticket_msg || tkt.description,
              last_message_time: tkt.last_msg_time || tkt.updated_at || tkt.created_at,
              unread_count: 0,
              status: tkt.status === 'Closed' ? 'Closed / Resolved' : `Ticket ${tkt.status}`,
              is_ticket: true,
              ticket_id: tkt.id,
              ticket_code: tkt.ticket_code,
              ticket_status: tkt.status,
              ticket_priority: tkt.priority,
              ticket_category: tkt.category,
              ticket_subject: tkt.subject,
              resolution_remarks: tkt.resolution_remarks,
              closed_at: tkt.closed_at,
            });
          }
        } catch (tktErr) {
          console.warn('[communicationService] Student tickets fetch note:', tktErr.message);
        }

        return threads;
      }

      // Admin view: list of distinct student conversations + active support tickets
      const threads = [];

      // 1. Fetch support tickets as dedicated high-priority threads
      try {
        const adminTicketsRes = await pool.query(
          `SELECT t.*, u.name as user_name, u.student_id, u.email as user_email,
                  (SELECT message FROM chat_messages WHERE conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_ticket_msg,
                  (SELECT created_at FROM chat_messages WHERE conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_msg_time,
                  (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = t.conversation_id AND sender_role = 'student' AND is_read = FALSE) as unread_tkt_count
           FROM support_tickets t
           LEFT JOIN users u ON t.user_id = u.id
           ORDER BY CASE WHEN t.status = 'Open' THEN 1 WHEN t.status = 'In Progress' THEN 2 ELSE 3 END, t.created_at DESC`
        );

        for (const tkt of adminTicketsRes.rows) {
          threads.push({
            conversation_id: tkt.conversation_id || `conv_ticket_${tkt.ticket_code.toLowerCase()}`,
            participant_id: tkt.user_id,
            participant_name: `${tkt.user_name || 'Applicant'} [${tkt.ticket_code}]`,
            participant_role: `Ticket: ${tkt.subject} (${tkt.category})`,
            student_id: tkt.student_id || `STU-2026-${String(tkt.user_id).padStart(4, '0')}`,
            avatar: '🎫',
            last_message: tkt.last_ticket_msg || tkt.description,
            last_message_time: tkt.last_msg_time || tkt.created_at,
            unread_count: parseInt(tkt.unread_tkt_count || 0),
            academic_status: `Ticket: ${tkt.status}`,
            status_badge_variant: tkt.status === 'Closed' ? 'secondary' : tkt.status === 'Open' ? 'danger' : 'warning',
            status: tkt.status === 'Closed' ? 'Closed' : `Ticket ${tkt.status} (${tkt.priority})`,
            is_ticket: true,
            ticket_id: tkt.id,
            ticket_code: tkt.ticket_code,
            ticket_status: tkt.status,
            ticket_priority: tkt.priority,
            ticket_category: tkt.category,
            ticket_subject: tkt.subject,
            resolution_remarks: tkt.resolution_remarks,
            closed_at: tkt.closed_at,
          });
        }
      } catch (tktErr) {
        console.warn('[communicationService] Admin tickets fetch note:', tktErr.message);
      }

      // 2. Fetch standard student conversations
      const studentsRes = await pool.query(
        `SELECT 
           u.id, 
           u.name, 
           u.email, 
           u.student_id, 
           u.major, 
           u.department,
           u.created_at,
           a.status as application_status,
           a.title as application_title,
           sr.status as registry_status
         FROM users u
         LEFT JOIN (
           SELECT DISTINCT ON (user_id) user_id, status, title 
           FROM applications 
           ORDER BY user_id, id DESC
         ) a ON a.user_id = u.id
         LEFT JOIN student_registry sr ON sr.user_id = u.id
         WHERE u.role = 'student'
         ORDER BY u.name ASC`
      );

      for (const student of studentsRes.rows) {
        const convId = `conv-student-${student.id}`;
        const latestMsgRes = await pool.query(
          `SELECT message, created_at, sender_role, is_read 
           FROM chat_messages 
           WHERE conversation_id = $1 
           ORDER BY created_at DESC LIMIT 1`,
          [convId]
        );

        const unreadRes = await pool.query(
          `SELECT COUNT(*) FROM chat_messages 
           WHERE conversation_id = $1 AND sender_role = 'student' AND is_read = FALSE`,
          [convId]
        );

        const lastMsg = latestMsgRes.rows[0];
        const unreadCount = parseInt(unreadRes.rows[0]?.count || 0);

        // Derive accurate scholarship/application status
        let academicStatus = 'Registered Applicant';
        let statusBadgeVariant = 'outline';

        if (student.registry_status === 'Active' || student.application_status === 'Approved') {
          academicStatus = 'Approved Scholar';
          statusBadgeVariant = 'success';
        } else if (student.application_status === 'Under Review') {
          academicStatus = 'Application Under Review';
          statusBadgeVariant = 'warning';
        } else if (student.application_status === 'Submitted') {
          academicStatus = 'Application Submitted';
          statusBadgeVariant = 'primary';
        } else if (student.application_status === 'Waitlisted') {
          academicStatus = 'Waitlisted Applicant';
          statusBadgeVariant = 'info';
        } else if (student.application_status === 'Rejected') {
          academicStatus = 'Application Rejected';
          statusBadgeVariant = 'danger';
        } else {
          academicStatus = 'Applicant (No App)';
          statusBadgeVariant = 'secondary';
        }

        threads.push({
          conversation_id: convId,
          participant_id: student.id,
          participant_name: student.name,
          participant_role: student.application_title || student.major || 'Quezon City Applicant',
          student_id: student.student_id || `STU-2026-${student.id.toString().padStart(4, '0')}`,
          avatar: student.name.charAt(0).toUpperCase(),
          last_message: lastMsg ? lastMsg.message : 'No messages yet.',
          last_message_time: lastMsg ? lastMsg.created_at : student.created_at || new Date().toISOString(),
          unread_count: unreadCount,
          academic_status: academicStatus,
          status_badge_variant: statusBadgeVariant,
          status: unreadCount > 0 ? `Awaiting Response (${unreadCount} new)` : lastMsg ? 'Inquiry Active' : 'No Inquiries Yet',
          is_ticket: false,
        });
      }

      return threads;
    } catch (err) {
      console.error('[CommunicationService.getConversations] Error:', err);
      throw err;
    }
  }

  /**
   * Fetch full chat message history for a conversation
   */
  async getMessages(conversationId, currentUser) {
    try {
      const res = await pool.query(
        `SELECT id, conversation_id, sender_id, sender_name, sender_role, recipient_id, recipient_role, message, is_read, created_at
         FROM chat_messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
      );

      // Auto mark messages as read for recipient
      if (currentUser) {
        await pool.query(
          `UPDATE chat_messages SET is_read = TRUE 
           WHERE conversation_id = $1 AND sender_id != $2`,
          [conversationId, currentUser.id]
        );
      }

      return res.rows;
    } catch (err) {
      console.error('[CommunicationService.getMessages] Error:', err);
      throw err;
    }
  }

  /**
   * Send a new chat message
   */
  async sendMessage(data, currentUser) {
    try {
      const conversationId = data.conversation_id || (currentUser.role === 'student' ? `conv-student-${currentUser.id}` : data.conversationId);
      const senderId = currentUser.id;
      const senderName = currentUser.name || (currentUser.role === 'admin' ? 'ADMIN (Financial Aid Desk)' : 'Scholar');
      const senderRole = currentUser.role;
      const message = data.message;
      const recipientId = data.recipient_id || null;
      const recipientRole = currentUser.role === 'student' ? 'admin' : 'student';

      const res = await pool.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_role, recipient_id, recipient_role, message, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
         RETURNING *`,
        [conversationId, senderId, senderName, senderRole, recipientId, recipientRole, message]
      );

      const savedMessage = res.rows[0];

      // Create notification for the other party
      try {
        if (currentUser.role === 'student') {
          // Notify admin
          const adminUserRes = await pool.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
          if (adminUserRes.rows[0]) {
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category)
               VALUES ($1, $2, $3, 'info', FALSE, 'chat_inquiry')`,
              [
                adminUserRes.rows[0].id,
                `💬 New Inquiry from ${currentUser.name}`,
                message.length > 150 ? `${message.substring(0, 147)}...` : message,
              ]
            );
          }
        } else {
          // Admin replying to student: extract student id from convId e.g. conv-student-8
          const studentIdMatch = conversationId.match(/conv-student-(\d+)/);
          if (studentIdMatch && studentIdMatch[1]) {
            const studentId = parseInt(studentIdMatch[1]);
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category)
               VALUES ($1, $2, $3, 'success', FALSE, 'chat_response')`,
              [
                studentId,
                '📩 New Message from Financial Aid Desk',
                message.length > 150 ? `${message.substring(0, 147)}...` : message,
              ]
            );
          }
        }
      } catch (notifErr) {
        console.warn('[CommunicationService.sendMessage] Notification error:', notifErr.message);
      }

      return savedMessage;
    } catch (err) {
      console.error('[CommunicationService.sendMessage] Error:', err);
      throw err;
    }
  }
}

module.exports = new CommunicationService();
