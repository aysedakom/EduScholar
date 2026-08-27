import type { AppNotification } from '../types';

export interface ScholarshipNoticePayload {
  id?: string;
  recipientStudentId: string;
  recipientStudentName: string;
  recipientEmail?: string;
  scholarshipTitle: string;
  subject: string;
  message: string;
  category?: 'Award Notice' | 'Document Compliance' | 'Interview Schedule' | 'Disbursement Payout' | 'Renewal Reminder' | 'General Notice';
  priority?: 'normal' | 'urgent' | 'high';
}

const STORAGE_KEY = 'qc_system_notifications';

export const getSystemNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading system notifications from localStorage:', e);
  }
  return [];
};

export const saveSystemNotifications = (notifs: AppNotification[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event('qc_new_notification'));
  } catch (e) {
    console.error('Error saving system notifications:', e);
  }
};

export const sendSystemScholarshipNotice = (payload: ScholarshipNoticePayload): AppNotification => {
  const newNotif: AppNotification = {
    id: payload.id || `SYS-NOTIF-${Date.now()}`,
    title: payload.subject,
    message: payload.message,
    date: new Date().toISOString().split('T')[0],
    read: false,
    type: payload.priority === 'urgent' ? 'warning' : 'info',
  };

  // Add metadata for system masking
  (newNotif as any).sender = 'GovServe Education Automated System';
  (newNotif as any).office = 'Quezon City Youth Development Office (QCYDO)';
  (newNotif as any).recipientStudentId = payload.recipientStudentId;
  (newNotif as any).recipientStudentName = payload.recipientStudentName;
  (newNotif as any).scholarshipTitle = payload.scholarshipTitle;
  (newNotif as any).category = payload.category || 'General Notice';
  (newNotif as any).isSystemDispatch = true;

  const current = getSystemNotifications();
  const updated = [newNotif, ...current];
  saveSystemNotifications(updated);

  return newNotif;
};
