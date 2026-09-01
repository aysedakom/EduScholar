// backend/services/calendarService.js
const { pool } = require('../config/db');
const { broadcast } = require('../realtime/socketServer');

class CalendarService {
  /**
   * Aggregate all live system milestones and custom calendar events
   */
  async getAllCalendarEvents(filters = {}) {
    try {
      const events = [];

      // 1. Fetch Scholarship Application Deadlines from PostgreSQL
      const scholarshipRes = await pool.query(
        `SELECT id, program_code, title, deadline, level, category_title, slots, amount 
         FROM scholarships 
         WHERE status = 'Open' AND deadline IS NOT NULL`
      );

      for (const s of scholarshipRes.rows) {
        const deadlineStr = s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : '2026-09-30';
        events.push({
          id: `SYS-DEADLINE-${s.id}`,
          title: `Application Deadline: ${s.title}`,
          date: deadlineStr,
          time: '11:59 PM',
          category: 'Deadline',
          targetAudience: `All Eligible ${s.level || 'Students'} (Slots: ${s.slots || 500})`,
          description: `Final closing deadline for ${s.title}. All required document attachments and verified QCitizen details must be submitted before cutoff.`,
          priority: 'Critical',
          sendNotification: true,
          isOfficialLGU: true,
          source: 'system',
          createdAt: '2026-08-01',
        });
      }

      // 2. Fetch Partner School Accreditation & MOU Validity Milestones
      const partnerRes = await pool.query(
        `SELECT school_id, name, short_name, school_type, partnership_start, partnership_end, partnership_status 
         FROM partner_schools 
         WHERE partnership_end IS NOT NULL`
      );

      for (const p of partnerRes.rows) {
        const endDateStr = p.partnership_end ? new Date(p.partnership_end).toISOString().split('T')[0] : '2028-12-31';
        events.push({
          id: `SYS-MOU-${p.school_id}`,
          title: `Partner School MOU Expiry & Renewal: ${p.short_name || p.name}`,
          date: endDateStr,
          time: '05:00 PM',
          category: 'Compliance',
          targetAudience: `QCYDO Board & ${p.name} Registrar Desk`,
          description: `Official expiration date of the Memorandum of Understanding (MOU) between Quezon City Local Government and ${p.name}.`,
          priority: 'Normal',
          sendNotification: false,
          isOfficialLGU: true,
          source: 'system',
          createdAt: '2026-08-01',
        });
      }

      // 3. Fetch System Announcements
      const annRes = await pool.query(
        `SELECT id, announcement_code, title, target_group, message, priority, created_at 
         FROM announcements 
         WHERE status = 'active'`
      );

      for (const a of annRes.rows) {
        const createdDateStr = a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '2026-08-25';
        events.push({
          id: `SYS-ANC-${a.id}`,
          title: a.title,
          date: createdDateStr,
          time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: 'Announcement',
          targetAudience: a.target_group,
          description: a.message,
          priority: a.priority === 'urgent' ? 'Critical' : a.priority === 'high' ? 'High' : 'Normal',
          sendNotification: true,
          isOfficialLGU: true,
          source: 'system',
          createdAt: createdDateStr,
        });
      }

      // 4. Fetch Custom Admin Created Calendar Events
      const customRes = await pool.query(
        `SELECT id, event_code, title, event_date, event_time, category, target_audience, description, priority, send_notification, is_official_lgu, created_at 
         FROM calendar_events 
         ORDER BY event_date ASC`
      );

      for (const c of customRes.rows) {
        const dateStr = c.event_date ? new Date(c.event_date).toISOString().split('T')[0] : '';
        events.push({
          id: c.event_code || `CAL-${c.id}`,
          title: c.title,
          date: dateStr,
          time: c.event_time || '08:00 AM',
          category: c.category,
          targetAudience: c.target_audience,
          description: c.description || '',
          priority: c.priority || 'Normal',
          sendNotification: c.send_notification,
          isOfficialLGU: c.is_official_lgu,
          source: 'custom',
          createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '',
        });
      }

      // Sort all events by date ascending
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Filter by category or search if provided
      let filtered = events;
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((e) => e.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.targetAudience.toLowerCase().includes(q)
        );
      }

      return filtered;
    } catch (err) {
      console.error('[CalendarService.getAllCalendarEvents] Error:', err);
      throw err;
    }
  }

  /**
   * Create a new custom calendar milestone
   */
  async createCalendarEvent(data, creatorUser) {
    try {
      const code = `CAL-${Date.now().toString().slice(-6)}`;
      const title = data.title;
      const eventDate = data.date;
      const eventTime = data.time || '08:00 AM';
      const category = data.category || 'Academic';
      const targetAudience = data.targetAudience || 'All Scholars';
      const description = data.description || '';
      const priority = data.priority || 'Normal';
      const sendNotification = Boolean(data.sendNotification);
      const isOfficialLGU = data.isOfficialLGU !== undefined ? Boolean(data.isOfficialLGU) : true;
      const userId = creatorUser?.id || null;

      const res = await pool.query(
        `INSERT INTO calendar_events
          (event_code, title, event_date, event_time, category, target_audience, description, priority, send_notification, is_official_lgu, created_by_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [code, title, eventDate, eventTime, category, targetAudience, description, priority, sendNotification, isOfficialLGU, userId]
      );

      const saved = res.rows[0];

      // If sendNotification is true, dispatch to students in notifications table
      if (sendNotification) {
        try {
          const students = await pool.query(`SELECT id FROM users WHERE role = 'student'`);
          for (const s of students.rows) {
            await pool.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read, category)
               VALUES ($1, $2, $3, $4, FALSE, 'calendar_event')`,
              [
                s.id,
                `📅 Calendar Notice: ${title}`,
                `Scheduled for ${eventDate} at ${eventTime}. ${description}`,
                priority === 'Critical' ? 'error' : priority === 'High' ? 'warning' : 'info',
              ]
            );
          }
        } catch (notifErr) {
          console.warn('[CalendarService.createCalendarEvent] Notification dispatch error:', notifErr.message);
        }
      }

      const eventPayload = {
        id: saved.event_code,
        title: saved.title,
        date: new Date(saved.event_date).toISOString().split('T')[0],
        time: saved.event_time,
        category: saved.category,
        targetAudience: saved.target_audience,
        description: saved.description,
        priority: saved.priority,
        sendNotification: saved.send_notification,
        isOfficialLGU: saved.is_official_lgu,
        source: 'custom',
        createdAt: new Date(saved.created_at).toISOString().split('T')[0],
      };

      // Broadcast new calendar event in real-time
      try {
        broadcast({
          type: 'DB_EVENT',
          table: 'calendar_events',
          action: 'INSERT',
          record: eventPayload,
          timestamp: new Date().toISOString(),
        });
      } catch (wsErr) {
        console.warn('[CalendarService] WebSocket broadcast warning:', wsErr.message);
      }

      return eventPayload;
    } catch (err) {
      console.error('[CalendarService.createCalendarEvent] Error:', err);
      throw err;
    }
  }

  /**
   * Delete custom calendar event
   */
  async deleteCalendarEvent(idOrCode) {
    try {
      await pool.query(
        `DELETE FROM calendar_events WHERE event_code = $1 OR id::text = $1`,
        [idOrCode]
      );

      // Broadcast delete calendar event in real-time
      try {
        broadcast({
          type: 'DB_EVENT',
          table: 'calendar_events',
          action: 'DELETE',
          record: { id: idOrCode, event_code: idOrCode },
          timestamp: new Date().toISOString(),
        });
      } catch (wsErr) {
        console.warn('[CalendarService] WebSocket broadcast warning:', wsErr.message);
      }

      return { success: true, message: `Event ${idOrCode} removed.` };
    } catch (err) {
      console.error('[CalendarService.deleteCalendarEvent] Error:', err);
      throw err;
    }
  }
}

module.exports = new CalendarService();
