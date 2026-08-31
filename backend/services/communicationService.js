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
  /**
   * Get list of conversations for current user
   * - Student: their helpdesk thread with Financial Aid Desk + their filed support tickets
   * - Treasury: Inter-agency desks (Scholarship Admin, COA Audit, University Bursars) + Disbursement tickets
   * - Supervisor: Inter-agency desks (Scholarship Admin, School Coordinators, Evaluation Unit)
   * - School Coordinator: Inter-agency desks (Scholarship Admin, City Treasury) + School student inquiries
   * - Admin/System Admin: All student inquiries & support tickets + Inter-departmental desks
   */
  async getConversations(currentUser) {
    try {
      const userRole = currentUser.role || 'student';

      // =========================================================================
      // 1. STUDENT VIEW
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

        // Fetch any tickets explicitly classified as Disbursement/Payout
        try {
          const payoutTicketsRes = await pool.query(
            `SELECT t.*, u.name as user_name, u.student_id,
                    (SELECT message FROM chat_messages WHERE conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_ticket_msg,
                    (SELECT created_at FROM chat_messages WHERE conversation_id = t.conversation_id ORDER BY created_at DESC LIMIT 1) as last_msg_time,
                    (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = t.conversation_id AND sender_role != 'treasury' AND is_read = FALSE) as unread_tkt_count
             FROM support_tickets t
             LEFT JOIN users u ON t.user_id = u.id
             WHERE t.category ILIKE '%disbursement%' OR t.category ILIKE '%payout%' OR t.category ILIKE '%stipend%'
             ORDER BY CASE WHEN t.status = 'Open' THEN 1 WHEN t.status = 'In Progress' THEN 2 ELSE 3 END, t.created_at DESC`
          );

          for (const tkt of payoutTicketsRes.rows) {
            treasuryThreads.push({
              conversation_id: tkt.conversation_id || `conv_ticket_${tkt.ticket_code.toLowerCase()}`,
              participant_id: tkt.user_id,
              participant_name: `${tkt.user_name || 'Scholar'} [${tkt.ticket_code}]`,
              participant_role: `Disbursement Ticket: ${tkt.subject}`,
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
          console.warn('[communicationService] Treasury tickets fetch note:', tktErr.message);
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

      // B. Fetch support tickets as dedicated high-priority threads
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

      // C. Fetch standard student conversations
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
        } else if (conversationId.startsWith('conv_ticket_') || conversationId.toLowerCase().includes('tkt-')) {
          try {
            const rawCode = conversationId.replace('conv_ticket_', '').toUpperCase();
            const ticketRes = await pool.query(
              `SELECT t.*, u.name as user_name, u.role as user_role
               FROM support_tickets t
               LEFT JOIN users u ON t.user_id = u.id
               WHERE t.conversation_id = $1 OR t.ticket_code ILIKE $2 OR LOWER(t.ticket_code) = LOWER($3)`,
              [conversationId, `%${rawCode}%`, rawCode]
            );

            if (ticketRes.rows[0]) {
              const t = ticketRes.rows[0];
              senderName = t.applicant_name || t.user_name || 'Applicant';
              senderRole = t.user_role || 'student';
              senderId = t.user_id;
              initialText = `[Ticket #${t.ticket_code}] ${t.subject}\nCategory: ${t.category} | Priority: ${t.priority}\n\n${t.description}`;
            }
          } catch (fillErr) {
            console.warn('[CommunicationService.getMessages] Ticket backfill note:', fillErr.message);
          }
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
      const conversationId = data.conversation_id || (currentUser.role === 'student' ? `conv-student-${currentUser.id}` : data.conversationId);
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

      if (conversationId && conversationId.startsWith('conv_ticket_')) {
        const tktCheck = await pool.query(
          `SELECT status, ticket_code FROM support_tickets WHERE conversation_id = $1`,
          [conversationId]
        );
        if (tktCheck.rows.length > 0) {
          const tktStatus = tktCheck.rows[0].status;
          if (tktStatus === 'Closed' || tktStatus === 'Resolved') {
            const err = new Error(`Ticket #${tktCheck.rows[0].ticket_code} is permanently CLOSED and ARCHIVED. No further messages can be sent.`);
            err.statusCode = 403;
            throw err;
          }
        }
      }

      const res = await pool.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_role, recipient_id, recipient_role, message, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
         RETURNING *`,
        [conversationId, senderId, senderName, senderRole, recipientId, recipientRole, message]
      );

      const savedMessage = res.rows[0];

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
                `💬 New Message from ${currentUser.name || 'Scholar'}`,
                message.length > 150 ? `${message.substring(0, 147)}...` : message,
              ]
            );
          }
        } else {
          // Admin replying to student: extract student id from convId or support_tickets
          let targetStudentId = null;
          const studentIdMatch = conversationId.match(/conv-student-(\d+)/);
          if (studentIdMatch && studentIdMatch[1]) {
            targetStudentId = parseInt(studentIdMatch[1]);
          } else if (recipientId) {
            targetStudentId = parseInt(recipientId);
          } else {
            const ticketOwner = await pool.query('SELECT user_id FROM support_tickets WHERE conversation_id = $1', [conversationId]);
            if (ticketOwner.rows[0]) {
              targetStudentId = ticketOwner.rows[0].user_id;
            }
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
