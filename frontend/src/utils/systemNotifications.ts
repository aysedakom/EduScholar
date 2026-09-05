import type { AppNotification, User } from '../types';

export interface ScholarshipNoticePayload {
  id?: string;
  recipientStudentId?: string;
  recipientStudentName?: string;
  recipientEmail?: string;
  recipientRole?: 'student' | 'system_admin' | 'admin' | 'supervisor' | 'school_coordinator' | string;
  recipientUserId?: string | number;
  scholarshipTitle?: string;
  subject: string;
  message: string;
  category?: 'Award Notice' | 'Document Compliance' | 'Interview Schedule' | 'Disbursement Payout' | 'Renewal Reminder' | 'General Notice';
  priority?: 'normal' | 'urgent' | 'high';
}

const STORAGE_KEY = 'qc_system_notifications';

const getStoredUserProfile = (): User | null => {
  try {
    const raw = localStorage.getItem('user_profile');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

// Purge any corrupted or inappropriate test notices from storage
const sanitizeNoticeList = (list: any[]): AppNotification[] => {
  return list.filter((n) => {
    if (!n || typeof n !== 'object') return false;
    const combinedText = `${n.title || ''} ${n.message || ''}`.toLowerCase();
    // Exclude vulgarity / dirty test data
    if (combinedText.includes('burat')) return false;
    return true;
  });
};

export const getRawSystemNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sanitizeNoticeList(parsed);
      }
    }
  } catch (e) {
    console.error('Error reading system notifications from localStorage:', e);
  }
  return [];
};

export const getSystemNotifications = (targetUser?: User | null): AppNotification[] => {
  const user = targetUser || getStoredUserProfile();
  const allNotifs = getRawSystemNotifications();

  if (!user) {
    return [];
  }

  const userRole = user.role || 'student';
  const userNameLower = (user.name || '').toLowerCase().trim();
  const userEmailLower = (user.email || '').toLowerCase().trim();
  const userStudentId = String(user.studentId || user.student_id || '').trim();
  const userIdStr = user.id ? String(user.id) : '';

  return allNotifs.filter((n: any) => {
    const notifRecipientRole = n.recipientRole ? String(n.recipientRole).toLowerCase() : '';
    const notifRecipientName = n.recipientStudentName ? String(n.recipientStudentName).toLowerCase().trim() : '';
    const notifRecipientEmail = n.recipientEmail ? String(n.recipientEmail).toLowerCase().trim() : '';
    const notifRecipientStudentId = n.recipientStudentId ? String(n.recipientStudentId).trim() : '';
    const notifRecipientUserId = n.recipientUserId ? String(n.recipientUserId) : '';

    // =========================================================================
    // 1. STUDENT ROLE: Strictly private notifications for THIS student only
    // =========================================================================
    if (userRole === 'student') {
      // Must NOT see admin-targeted notices
      if (notifRecipientRole === 'system_admin' || notifRecipientRole === 'admin') {
        return false;
      }

      // Check if this notice explicitly targets another student
      if (notifRecipientName && userNameLower && notifRecipientName !== userNameLower) {
        return false;
      }
      if (notifRecipientEmail && userEmailLower && notifRecipientEmail !== userEmailLower) {
        return false;
      }
      if (notifRecipientStudentId && userStudentId && notifRecipientStudentId !== userStudentId) {
        return false;
      }
      if (notifRecipientUserId && userIdStr && notifRecipientUserId !== userIdStr) {
        return false;
      }

      // If text mentions another student's name in "Dear [Name]"
      if (n.message && n.message.includes('Dear ') && !n.message.toLowerCase().includes(`dear ${userNameLower}`)) {
        if (n.message.includes('Dear Ar-jay') && !userNameLower.includes('ar-jay')) {
          return false;
        }
      }

      // Match criteria for current student
      const matchesUserId = Boolean(notifRecipientUserId && notifRecipientUserId === userIdStr);
      const matchesEmail = Boolean(notifRecipientEmail && notifRecipientEmail === userEmailLower);
      const matchesStudentId = Boolean(notifRecipientStudentId && notifRecipientStudentId === userStudentId);
      const matchesName = Boolean(notifRecipientName && notifRecipientName === userNameLower);

      return matchesUserId || matchesEmail || matchesStudentId || matchesName;
    }

    // =========================================================================
    // 2. SYSTEM ADMIN / ADMIN ROLE: Receives application filings and admin alerts
    // =========================================================================
    if (userRole === 'system_admin' || userRole === 'admin') {
      // Personal notices addressed specifically to individual students are hidden from admin bell
      if (notifRecipientRole === 'student') {
        return false;
      }
      if (n.title?.startsWith('Application Submitted:')) {
        // "Application Submitted: ..." is the student-facing confirmation
        return false;
      }

      // Admin receives "New Application Submitted:" and notices tagged for system_admin/admin
      if (notifRecipientRole === 'system_admin' || notifRecipientRole === 'admin') {
        return true;
      }
      if (n.title?.startsWith('New Application') || n.title?.includes('Special Eligibility Review')) {
        return true;
      }

      return false;
    }

    // =========================================================================
    // 3. OTHER ROLES (Supervisor, Coordinator)
    // =========================================================================
    if (notifRecipientRole && notifRecipientRole === userRole) {
      return true;
    }

    return false;
  });
};

export const saveSystemNotifications = (notifs: AppNotification[]): void => {
  try {
    const clean = sanitizeNoticeList(notifs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new Event('qc_new_notification'));
  } catch (e) {
    console.error('Error saving system notifications:', e);
  }
};

export const sendSystemScholarshipNotice = (payload: ScholarshipNoticePayload): AppNotification => {
  const newNotif: AppNotification = {
    id: payload.id || `SYS-NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: payload.subject,
    message: payload.message,
    date: new Date().toISOString().split('T')[0],
    read: false,
    type: payload.priority === 'urgent' ? 'warning' : 'info',
  };

  // Add metadata for recipient scoping & security
  (newNotif as any).sender = 'GovServe Education Automated System';
  (newNotif as any).office = 'Quezon City Youth Development Office (QCYDO)';
  (newNotif as any).recipientUserId = payload.recipientUserId;
  (newNotif as any).recipientRole = payload.recipientRole || 'student';
  (newNotif as any).recipientStudentId = payload.recipientStudentId;
  (newNotif as any).recipientStudentName = payload.recipientStudentName;
  (newNotif as any).recipientEmail = payload.recipientEmail;
  (newNotif as any).scholarshipTitle = payload.scholarshipTitle;
  (newNotif as any).category = payload.category || 'General Notice';
  (newNotif as any).isSystemDispatch = true;

  const current = getRawSystemNotifications();
  const updated = [newNotif, ...current];
  saveSystemNotifications(updated);

  return newNotif;
};

export const mergeNotifications = (
  localNotifs: AppNotification[],
  remoteNotifs: any[]
): AppNotification[] => {
  const normalizedRemote: AppNotification[] = (remoteNotifs || []).map((r) => ({
    id: String(r.id),
    title: r.title,
    message: r.message,
    date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : (r.date || new Date().toISOString().split('T')[0]),
    read: Boolean(r.is_read || r.read),
    type: r.type || 'info',
    link: r.link,
    sender: 'GovServe Education Automated System',
    office: 'Quezon City Youth Development Office (QCYDO)',
  }));

  const map = new Map<string, AppNotification>();

  // Add remote first
  for (const n of normalizedRemote) {
    map.set(n.id, n);
  }

  // Add local (if not duplicate by id or title+date)
  for (const n of localNotifs) {
    const existing = map.get(n.id);
    if (!existing) {
      const duplicate = Array.from(map.values()).find(
        (item) => item.title === n.title && item.date === n.date
      );
      if (!duplicate) {
        map.set(n.id, n);
      }
    }
  }

  return Array.from(map.values());
};

export interface NotificationDestination {
  link: string;
  actionLabel: string;
  contextHint: string;
}

export const getNotificationDestination = (
  notif?: AppNotification | null,
  role?: string
): NotificationDestination => {
  if (!notif) {
    return { link: '/dashboard', actionLabel: 'Go to Dashboard →', contextHint: 'Dashboard' };
  }

  const userRole = (role || 'student').toLowerCase();

  // Explicit link on notification record
  if (notif.link && notif.link.startsWith('/')) {
    let actionLabel = 'Go to Associated Page →';
    if (notif.link.includes('/applications')) actionLabel = 'Open Application Tracker →';
    else if (notif.link.includes('/support') || notif.link.includes('/ticket')) actionLabel = 'Open Support Ticket →';
    else if (notif.link.includes('/review')) actionLabel = 'Open Review Queue →';
    else if (notif.link.includes('/messages')) actionLabel = 'Open Chat & Messages →';
    else if (notif.link.includes('/documents')) actionLabel = 'Open Document Vault →';
    else if (notif.link.includes('/school')) actionLabel = 'Open School Coordinator Portal →';
    return { link: notif.link, actionLabel, contextHint: 'Direct System Link' };
  }

  const title = (notif.title || '').toLowerCase();
  const msg = (notif.message || '').toLowerCase();

  // 1. Support Tickets (e.g. "Support Ticket Update: TKT-2026-3910")
  if (title.includes('ticket') || title.includes('tkt-') || msg.includes('ticket') || title.includes('support')) {
    if (userRole === 'admin' || userRole === 'system_admin') {
      return {
        link: '/admin/ticket-inbox',
        actionLabel: 'Open Ticket in Admin Desk →',
        contextHint: 'Administrative Help Desk',
      };
    }
    return {
      link: '/support',
      actionLabel: 'View Ticket in Support Desk →',
      contextHint: 'Help & Support Center',
    };
  }

  // 2. Direct Messages / Desk Inquiries (e.g. "New Message from Financial Aid Desk")
  if (title.includes('message') || msg.includes('message') || title.includes('chat') || title.includes('desk')) {
    if (userRole === 'admin' || userRole === 'system_admin') {
      return {
        link: '/admin/messages',
        actionLabel: 'Open Messages Inbox →',
        contextHint: 'Admin Communication Center',
      };
    }
    return {
      link: '/messages',
      actionLabel: 'Open Chat & Messages →',
      contextHint: 'Communication Desk',
    };
  }

  // 3. Applications / Scholarship Submission / Review
  if (
    title.includes('application') ||
    title.includes('scholarship') ||
    msg.includes('application') ||
    title.includes('economic') ||
    title.includes('merit')
  ) {
    if (userRole === 'admin' || userRole === 'system_admin') {
      return {
        link: '/admin/review-queue',
        actionLabel: 'Inspect in Review Queue →',
        contextHint: 'Application Review Queue',
      };
    }
    if (userRole === 'school_coordinator') {
      return {
        link: '/school/portal',
        actionLabel: 'Open Coordinator Portal →',
        contextHint: 'School Verification Portal',
      };
    }
    if (userRole === 'supervisor') {
      return {
        link: '/supervisor/endorsements',
        actionLabel: 'View Endorsement Queue →',
        contextHint: 'Supervisor Review Portal',
      };
    }
    return {
      link: '/applications',
      actionLabel: 'Track Application Status →',
      contextHint: 'Live Application Tracker',
    };
  }

  // 4. Disbursements & Financial Aid
  if (
    title.includes('disbursement') ||
    title.includes('fund release') ||
    title.includes('stipend') ||
    msg.includes('payout')
  ) {
    if (userRole === 'treasury') {
      return {
        link: '/treasury/distribution',
        actionLabel: 'Open Treasury Distribution →',
        contextHint: 'Treasury Disbursement Portal',
      };
    }
    return {
      link: '/financial-aid',
      actionLabel: 'Track Stipend Disbursement →',
      contextHint: 'Financial Aid Release Hub',
    };
  }

  // 5. Document Vault & Requirements
  if (title.includes('document') || msg.includes('document') || title.includes('vault')) {
    return {
      link: '/documents',
      actionLabel: 'Open Document Vault →',
      contextHint: 'Verified Document Vault',
    };
  }

  // Default fallback according to role
  if (userRole === 'student') {
    return {
      link: '/dashboard',
      actionLabel: 'Go to Student Dashboard →',
      contextHint: 'Student Portal Dashboard',
    };
  }
  return {
    link: '/admin/overview',
    actionLabel: 'Go to Admin Dashboard →',
    contextHint: 'Administrator Overview',
  };
};
