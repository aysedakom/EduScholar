// backend/services/communicationService.js
const { pool } = require('../config/db');
const { broadcast } = require('../realtime/socketServer');

/**
 * Helper to compute operating hours in Philippine Standard Time (PHT, UTC+8)
 * Desk Operating Hours: 8:00 AM to 5:00 PM PHT (08:00 to 17:00 PHT)
 */
function getPhilippineTimeInfo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
  const isOpen = hour >= 8 && hour < 17; // 8:00 AM (08:00) to 4:59:59 PM (<17:00). Closes automatically at 5:00 PM PHT!

  return {
    isOpen,
    hour,
    minute,
    second,
    timeZone: 'Asia/Manila (PHT, UTC+8)',
    openTime: '8:00 AM',
    closeTime: '5:00 PM',
  };
}

class CommunicationService {
  /**
   * Return current operating hours status in PHT
   */
  getOperatingHoursStatus() {
    return getPhilippineTimeInfo();
  }

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
   * Get list of conversations for current user
   * - Student: STRICTLY their official Financial Aid Desk thread only (prevent access to Treasury & Admissions Evaluators)
   * - Treasury: Inter-agency desks (Scholarship Admin, COA Audit, University Bursars)
   * - Supervisor: Inter-agency desks (Scholarship Admin, School Coordinators, Evaluation Unit)
   * - School Coordinator: Inter-agency desks (Scholarship Admin, City Treasury) + School student inquiries
   * - Admin/System Admin: All student live chat inquiries + Inter-departmental desks
   */
  async getConversations(currentUser) {
    try {
      const userRole = currentUser.role || 'student';

      // =========================================================================
      // 1. STUDENT VIEW: Strictly Financial Aid Review Desk only
      // =========================================================================
      if (userRole === 'student') {
        const convId = `conv-student-${currentUser.id}`;
        const msgRes = await pool.query(
          `SELECT message, created_at, sender_role, is_read 
           FROM chat_messages 
           WHERE conversation_id = $1 
           ORDER BY created_at DESC LIMIT 1`,
          [convId]
        );

        const lastMsg = msgRes.rows[0] || {
          message: 'Quezon City Scholarship Board Financial Aid Desk is ready to assist you during operating hours (8:00 AM - 5:00 PM PHT).',
          created_at: new Date().toISOString(),
          sender_role: 'admin',
          is_read: true,
        };

        const threads = [
          {
            conversation_id: convId,
            participant_id: 2,
            participant_name: 'Quezon City Scholarship Board (Financial Aid Desk)',
            participant_role: 'Financial Aid & Scholarship Review Desk',
            avatar: '🏛️',
            last_message: lastMsg.message,
            last_message_time: lastMsg.created_at,
            unread_count: 0,
            status: 'Active Official Support Desk',
            is_ticket: false,
          },
        ];

        return threads;
      }

      // =========================================================================
      // 2. TREASURY OFFICER VIEW
      // =========================================================================
      if (userRole === 'treasury') {
        const treasuryThreads = [
          {
            conversation_id: 'conv-treasury-admin',
            participant_id: 1,
            participant_name: 'Quezon City Scholarship Board (Admin Desk)',
            participant_role: 'Financial Aid & Disbursement Directorate',
            avatar: '🏛️',
            status: 'Official Board Communications',
            is_ticket: false,
            academic_status: 'Executive Secretariat',
            status_badge_variant: 'primary',
            last_message: 'Coordination channel for fund drawdowns, tranche endorsements, and student stipend clearing.',
          },
          {
            conversation_id: 'conv-treasury-audit',
            participant_id: 3,
            participant_name: 'City Accounting & Internal Audit Office',
            participant_role: 'COA Compliance & Voucher Release Desk',
            avatar: '💼',
            status: 'Audit & Liquidation Office',
            is_ticket: false,
            academic_status: 'COA Oversight Desk',
            status_badge_variant: 'secondary',
            last_message: 'Liquidation summaries and disbursement vouchers for FY 2026-2027 on file.',
          },
          {
            conversation_id: 'conv-treasury-bursar',
            participant_id: 4,
            participant_name: 'Partner Higher Education Bursar Desk',
            participant_role: 'Institutional Tuition Billing & Verification',
            avatar: '🏫',
            status: 'Tuition & School Aid Billing',
            is_ticket: false,
            academic_status: 'Institutional Accounts',
            status_badge_variant: 'info',
            last_message: 'Verification of university tuition accounts and institutional aid disbursement.',
          },
        ];

        // Fetch latest messages and unread counts for each treasury channel
        for (const thread of treasuryThreads) {
          const latestRes = await pool.query(
            `SELECT message, created_at, sender_name, sender_role, is_read 
             FROM chat_messages 
             WHERE conversation_id = $1 
             ORDER BY created_at DESC LIMIT 1`,
            [thread.conversation_id]
          );

          const unreadRes = await pool.query(
            `SELECT COUNT(*) FROM chat_messages 
             WHERE conversation_id = $1 AND sender_role != 'treasury' AND is_read = FALSE`,
            [thread.conversation_id]
          );

          if (latestRes.rows[0]) {
            thread.last_message = latestRes.rows[0].message;
            thread.last_message_time = latestRes.rows[0].created_at;
          } else {
            thread.last_message_time = new Date().toISOString();
          }
          thread.unread_count = parseInt(unreadRes.rows[0]?.count || 0);
        }

        return treasuryThreads;
      }

      // =========================================================================
      // 3. SUPERVISOR VIEW
      // =========================================================================
      if (userRole === 'supervisor') {
        const supervisorThreads = [
          {
            conversation_id: 'conv-supervisor-admin',
            participant_id: 1,
            participant_name: 'Quezon City Scholarship Board (Admin Desk)',
            participant_role: 'Scholarship Operations & Policy Secretariat',
            avatar: '🏛️',
            status: 'Evaluation & Retention Desk',
            is_ticket: false,
            academic_status: 'Board Policy Desk',
            status_badge_variant: 'primary',
            last_message: 'Coordination for scholar GPA evaluations, academic appeals, and retention recommendations.',
          },
          {
            conversation_id: 'conv-supervisor-coordinator',
            participant_id: 4,
            participant_name: 'School Registrars & Coordinators Desk',
            participant_role: 'Academic Verification & Monitoring',
            avatar: '🏫',
            status: 'School Registrar Hotline',
            is_ticket: false,
            academic_status: 'Academic Verification',
            status_badge_variant: 'info',
            last_message: 'Enrollment verification certificates and semestral transcript validations.',
          },
          {
            conversation_id: 'conv-supervisor-eval',
            participant_id: 5,
            participant_name: 'Scholar Academic Evaluation Unit',
            participant_role: 'Student Grade Appeals & Retention Desk',
            avatar: '📋',
            status: 'Advisory Unit',
            is_ticket: false,
            academic_status: 'Evaluation Unit',
            status_badge_variant: 'secondary',
            last_message: 'Academic evaluation and mentorship tracking desk.',
          },
        ];

        for (const thread of supervisorThreads) {
          const latestRes = await pool.query(
            `SELECT message, created_at, sender_name, is_read 
             FROM chat_messages 
             WHERE conversation_id = $1 
             ORDER BY created_at DESC LIMIT 1`,
            [thread.conversation_id]
          );

          const unreadRes = await pool.query(
            `SELECT COUNT(*) FROM chat_messages 
             WHERE conversation_id = $1 AND sender_role != 'supervisor' AND is_read = FALSE`,
            [thread.conversation_id]
          );

          if (latestRes.rows[0]) {
            thread.last_message = latestRes.rows[0].message;
            thread.last_message_time = latestRes.rows[0].created_at;
          } else {
            thread.last_message_time = new Date().toISOString();
          }
          thread.unread_count = parseInt(unreadRes.rows[0]?.count || 0);
        }

        return supervisorThreads;
      }

      // =========================================================================
      // 4. SCHOOL COORDINATOR VIEW
      // =========================================================================
      if (userRole === 'school_coordinator') {
        const coordinatorThreads = [
          {
            conversation_id: 'conv-school-admin',
            participant_id: 1,
            participant_name: 'Quezon City Scholarship Board (Admin Desk)',
            participant_role: 'Scholarship Operations Desk',
            avatar: '🏛️',
            status: 'Masterlist Certification Hotline',
            is_ticket: false,
            academic_status: 'Board Operations',
            status_badge_variant: 'primary',
            last_message: 'Official channel for certified masterlist submissions and student verification certifications.',
          },
          {
            conversation_id: 'conv-school-treasury',
            participant_id: 2,
            participant_name: 'City Treasury Disbursing Officer',
            participant_role: 'Institutional Fund Release & Billing Desk',
            avatar: '💰',
            status: 'Treasury Payout Desk',
            is_ticket: false,
            academic_status: 'Treasury Clearance',
            status_badge_variant: 'warning',
            last_message: 'Institutional aid disbursement and billing statement coordination.',
          },
        ];

        for (const thread of coordinatorThreads) {
          const latestRes = await pool.query(
            `SELECT message, created_at, sender_name, is_read 
             FROM chat_messages 
             WHERE conversation_id = $1 
             ORDER BY created_at DESC LIMIT 1`,
            [thread.conversation_id]
          );

          const unreadRes = await pool.query(
            `SELECT COUNT(*) FROM chat_messages 
             WHERE conversation_id = $1 AND sender_role != 'school_coordinator' AND is_read = FALSE`,
            [thread.conversation_id]
          );

          if (latestRes.rows[0]) {
            thread.last_message = latestRes.rows[0].message;
            thread.last_message_time = latestRes.rows[0].created_at;
          } else {
            thread.last_message_time = new Date().toISOString();
          }
          thread.unread_count = parseInt(unreadRes.rows[0]?.count || 0);
        }

        return coordinatorThreads;
      }

      // =========================================================================
      // 5. ADMIN & SYSTEM ADMIN VIEW
      // =========================================================================
      const threads = [];

      // A. Inter-Departmental Official Desks
      const interDeptThreads = [
        {
          conversation_id: 'conv-treasury-admin',
          participant_id: 2,
          participant_name: 'City Treasury Disbursing Officer',
          participant_role: 'City Treasury Directorate',
          avatar: '🏛️',
          status: 'Treasury Fund Release Hotline',
          is_ticket: false,
          academic_status: 'City Treasury Desk',
          status_badge_variant: 'primary',
          last_message: 'Budget drawdowns, stipend disbursements, and reconciliation clearing statements.',
        },
        {
          conversation_id: 'conv-supervisor-admin',
          participant_id: 3,
          participant_name: 'Academic Evaluation Supervisor Desk',
          participant_role: 'Scholar Retention & GPA Review Desk',
          avatar: '📋',
          status: 'Supervisor Coordination',
          is_ticket: false,
          academic_status: 'Evaluation Directorate',
          status_badge_variant: 'secondary',
          last_message: 'Scholar retention reviews, GPA monitoring submissions, and academic appeals coordination.',
        },
        {
          conversation_id: 'conv-school-admin',
          participant_id: 4,
          participant_name: 'Partner Schools & Registrars Desk',
          participant_role: 'Higher Education Institutional Registrars',
          avatar: '🏫',
          status: 'Registrar Masterlists',
          is_ticket: false,
          academic_status: 'School Coordination',
          status_badge_variant: 'info',
          last_message: 'Certified masterlist submissions and student verification certifications.',
        },
      ];

      for (const thread of interDeptThreads) {
        const latestRes = await pool.query(
          `SELECT message, created_at, sender_name, is_read 
           FROM chat_messages 
           WHERE conversation_id = $1 
           ORDER BY created_at DESC LIMIT 1`,
          [thread.conversation_id]
        );

        const unreadRes = await pool.query(
          `SELECT COUNT(*) FROM chat_messages 
           WHERE conversation_id = $1 AND sender_role != 'admin' AND is_read = FALSE`,
          [thread.conversation_id]
        );

        if (latestRes.rows[0]) {
          thread.last_message = latestRes.rows[0].message;
          thread.last_message_time = latestRes.rows[0].created_at;
        } else {
          thread.last_message_time = new Date().toISOString();
        }
        thread.unread_count = parseInt(unreadRes.rows[0]?.count || 0);
        threads.push(thread);
      }

      // B. Fetch standard student live chat conversations
      const studentsRes = await pool.query(
        `SELECT 
           u.id, 
           u.name, 
           u.email, 
           u.student_id, 
           u.major, 
           u.department,
           u.created_at,
           a.id as application_id,
           a.reference_id,
           a.application_code,
           a.status as application_status,
           a.title as application_title,
           sr.status as registry_status
         FROM users u
         LEFT JOIN (
           SELECT DISTINCT ON (user_id) user_id, id, status, title, reference_id, application_code
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

        const applicantRefId =
          student.reference_id ||
          student.application_code ||
          (student.application_id
            ? `APP-QC-2026-${String(student.application_id).padStart(4, '0')}`
            : student.student_id || `APP-QC-2026-${String(student.id).padStart(4, '0')}`);

        threads.push({
          conversation_id: convId,
          participant_id: student.id,
          participant_name: student.name,
          participant_role: student.application_title || student.major || 'Quezon City Applicant',
          student_id: applicantRefId,
          reference_id: applicantRefId,
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
      // 1. Strict student access control: students can ONLY access their own Financial Aid desk thread
      if (currentUser?.role === 'student' && conversationId !== `conv-student-${currentUser.id}`) {
        const err = new Error('Access denied. Students are restricted to the official Financial Aid Review Desk only.');
        err.statusCode = 403;
        throw err;
      }

      // 2. Strict treasury/evaluator access control: cannot directly access student chat threads
      if (
        (currentUser?.role === 'treasury' || currentUser?.role === 'supervisor') &&
        conversationId.startsWith('conv-student-')
      ) {
        const err = new Error('Access denied. Direct student chat is restricted to the Scholarship Board Admin Desk.');
        err.statusCode = 403;
        throw err;
      }

      let res = await pool.query(
        `SELECT id, conversation_id, sender_id, sender_name, sender_role, recipient_id, recipient_role, message, is_read, created_at
         FROM chat_messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
      );

      let messages = res.rows;

      // If this is an inter-agency or support ticket conversation and no messages exist yet, auto-populate welcome context
      if (messages.length === 0) {
        let initialText = null;
        let senderName = 'System Desk';
        let senderRole = 'admin';
        let senderId = 1;

        if (conversationId === 'conv-treasury-admin') {
          initialText = 'Official inter-agency hotline established between the Scholarship Board and City Treasury Office. You may coordinate fund tranche drawdowns, stipend disbursements, and reconciliation clearing statements here.';
          senderName = 'Quezon City Scholarship Board (Admin Desk)';
          senderRole = 'admin';
        } else if (conversationId === 'conv-treasury-audit') {
          initialText = 'COA Compliance Desk: Liquidation certificates and disbursement vouchers for FY 2026-2027 are on file.';
          senderName = 'City Accounting & Internal Audit Office';
          senderRole = 'staff';
        } else if (conversationId === 'conv-treasury-bursar') {
          initialText = 'Higher Education Accounts Desk: Matriculation and institutional tuition billing statements for enrolled scholars are synchronized.';
          senderName = 'Partner Higher Education Bursar Desk';
          senderRole = 'school_coordinator';
        } else if (conversationId === 'conv-supervisor-admin') {
          initialText = 'Supervisor Desk hotline: Scholar retention reviews, GPA monitoring submissions, and academic appeals coordination.';
          senderName = 'Quezon City Scholarship Board (Admin Desk)';
          senderRole = 'admin';
        } else if (conversationId === 'conv-supervisor-coordinator') {
          initialText = 'Enrollment Verification & Semester Certification channel active.';
          senderName = 'School Registrars & Coordinators Desk';
          senderRole = 'school_coordinator';
        } else if (conversationId === 'conv-supervisor-eval') {
          initialText = 'Academic Evaluation and Mentorship tracking desk active.';
          senderName = 'Scholar Academic Evaluation Unit';
          senderRole = 'supervisor';
        } else if (conversationId === 'conv-school-admin') {
          initialText = 'School Coordinator Portal: Direct channel for certified masterlist submissions and student verification certifications.';
          senderName = 'Quezon City Scholarship Board (Admin Desk)';
          senderRole = 'admin';
        } else if (conversationId === 'conv-school-treasury') {
          initialText = 'Institutional aid disbursement and billing statement coordination.';
          senderName = 'City Treasury Disbursing Officer';
          senderRole = 'treasury';
        } else if (conversationId.startsWith('conv-student-')) {
          initialText = 'Welcome to the official Quezon City Scholarship Board Financial Aid Review Desk. Our counselors are available from 8:00 AM to 5:00 PM (Philippine Standard Time) to assist you with applications, qualifications, and document reviews.';
          senderName = 'Quezon City Scholarship Board (Financial Aid Desk)';
          senderRole = 'admin';
        }

        if (initialText) {
          try {
            const insertRes = await pool.query(
              `INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_role, message, is_read, created_at)
               VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
               RETURNING *`,
              [conversationId, senderId, senderName, senderRole, initialText]
            );
            messages = insertRes.rows;
          } catch (insErr) {
            console.warn('[CommunicationService.getMessages] Initial text insert note:', insErr.message);
          }
        }
      }

      // Auto mark messages as read for recipient
      if (currentUser && messages.length > 0) {
        await pool.query(
          `UPDATE chat_messages SET is_read = TRUE 
           WHERE conversation_id = $1 AND sender_id != $2`,
          [conversationId, currentUser.id]
        );
      }

      return messages;
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
      // 1. Operating Hours Enforcement for Students (8:00 AM to 5:00 PM Philippine Standard Time)
      if (currentUser.role === 'student') {
        const timeInfo = getPhilippineTimeInfo();
        if (!timeInfo.isOpen) {
          const err = new Error(
            'Live Support Chat is currently CLOSED. Support hours are 8:00 AM to 5:00 PM (Philippine Standard Time, PHT). Channels will automatically reopen at 8:00 AM PHT.'
          );
          err.statusCode = 400;
          throw err;
        }
      }

      // 2. Strict conversation destination routing
      let conversationId = data.conversation_id || data.conversationId;
      if (currentUser.role === 'student') {
        conversationId = `conv-student-${currentUser.id}`;
      }

      // 3. Prevent Treasury & Supervisor from directly chatting with students
      if (
        (currentUser.role === 'treasury' || currentUser.role === 'supervisor') &&
        conversationId.startsWith('conv-student-')
      ) {
        const err = new Error('Direct student chat is restricted. All communications must go through the Scholarship Board Admin Desk.');
        err.statusCode = 403;
        throw err;
      }

      const senderId = currentUser.id;
      const senderName = currentUser.name || (currentUser.role === 'admin' ? 'ADMIN (Financial Aid Desk)' : currentUser.role === 'treasury' ? 'City Treasury Officer' : 'Staff');
      const senderRole = currentUser.role;
      const message = data.message;
      const recipientId = data.recipient_id || null;
      let recipientRole = 'admin';

      if (conversationId === 'conv-treasury-admin') {
        recipientRole = senderRole === 'treasury' ? 'admin' : 'treasury';
      } else if (conversationId === 'conv-supervisor-admin') {
        recipientRole = senderRole === 'supervisor' ? 'admin' : 'supervisor';
      } else if (conversationId === 'conv-school-admin') {
        recipientRole = senderRole === 'school_coordinator' ? 'admin' : 'school_coordinator';
      } else if (conversationId === 'conv-school-treasury') {
        recipientRole = senderRole === 'school_coordinator' ? 'treasury' : 'school_coordinator';
      } else if (currentUser.role === 'student') {
        recipientRole = 'admin';
      } else {
        recipientRole = 'student';
      }

      const res = await pool.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_role, recipient_id, recipient_role, message, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
         RETURNING *`,
        [conversationId, senderId, senderName, senderRole, recipientId, recipientRole, message]
      );

      const savedMessage = res.rows[0];

      // Broadcast new message immediately via WebSocket to all connected clients
      try {
        broadcast({
          type: 'DB_EVENT',
          table: 'chat_messages',
          action: 'INSERT',
          record: savedMessage,
          timestamp: new Date().toISOString(),
        });
      } catch (wsErr) {
        console.warn('[CommunicationService.sendMessage] WebSocket broadcast note:', wsErr.message);
      }

      // Create in-app notification for the recipient(s)
      try {
        if (conversationId === 'conv-treasury-admin') {
          const targetRole = senderRole === 'treasury' ? 'admin' : 'treasury';
          const targetUsers = await pool.query('SELECT id FROM users WHERE role = $1', [targetRole]);
          for (const u of targetUsers.rows) {
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
               VALUES ($1, $2, $3, 'info', FALSE, 'chat_inquiry', '/messages')`,
              [
                u.id,
                `🏛️ Message from ${senderName}`,
                message.length > 150 ? `${message.substring(0, 147)}...` : message,
              ]
            );
          }
        } else if (conversationId === 'conv-supervisor-admin' || conversationId === 'conv-school-admin') {
          const targetRole = senderRole === 'admin' ? (conversationId.includes('supervisor') ? 'supervisor' : 'school_coordinator') : 'admin';
          const targetUsers = await pool.query('SELECT id FROM users WHERE role = $1', [targetRole]);
          for (const u of targetUsers.rows) {
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
               VALUES ($1, $2, $3, 'info', FALSE, 'chat_inquiry', '/messages')`,
              [
                u.id,
                `💬 Message from ${senderName}`,
                message.length > 150 ? `${message.substring(0, 147)}...` : message,
              ]
            );
          }
        } else if (currentUser.role === 'student') {
          // Notify admins
          const adminUsers = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'system_admin')");
          for (const admin of adminUsers.rows) {
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
               VALUES ($1, $2, $3, 'info', FALSE, 'chat_inquiry', '/messages')`,
              [
                admin.id,
                `💬 New Live Inquiry from ${currentUser.name || 'Scholar'}`,
                message.length > 150 ? `${message.substring(0, 147)}...` : message,
              ]
            );
          }
        } else {
          // Admin replying to student
          let targetStudentId = null;
          const studentIdMatch = conversationId.match(/conv-student-(\d+)/);
          if (studentIdMatch && studentIdMatch[1]) {
            targetStudentId = parseInt(studentIdMatch[1]);
          } else if (recipientId) {
            targetStudentId = parseInt(recipientId);
          }

          if (targetStudentId) {
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category, link)
               VALUES ($1, $2, $3, 'success', FALSE, 'chat_response', '/messages')`,
              [
                targetStudentId,
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
