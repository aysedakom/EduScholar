// frontend/src/api/communication.ts
import api from './axios';

export interface AnnouncementItem {
  id: number;
  announcement_code: string;
  title: string;
  target_group: string;
  message: string;
  priority: 'normal' | 'high' | 'urgent';
  sent_by: string;
  status: 'active' | 'archived';
  created_at: string;
}

export interface ConversationThread {
  conversation_id: string;
  participant_id: number;
  participant_name: string;
  participant_role: string;
  student_id?: string;
  avatar: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: string;
  academic_status?: string;
  status_badge_variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
}

export interface ChatMessageItem {
  id: number;
  conversation_id: string;
  sender_id: number;
  sender_name: string;
  sender_role: 'student' | 'admin' | 'supervisor' | 'system' | 'school_coordinator' | 'treasury' | string;
  recipient_id?: number;
  recipient_role?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  target_group: string;
  message: string;
  priority: 'normal' | 'high' | 'urgent';
  sent_by?: string;
}

export interface SendMessagePayload {
  conversation_id: string;
  message: string;
  recipient_id?: number;
}

// Announcements API
export const getAnnouncements = (params?: { targetGroup?: string; search?: string }) => {
  return api.get<{ success: boolean; data: AnnouncementItem[] }>('/communication/announcements', { params });
};

export const createAnnouncement = (payload: CreateAnnouncementPayload) => {
  return api.post<{ success: boolean; message: string; data: AnnouncementItem }>('/communication/announcements', payload);
};

// Messaging Desk API
export const getConversations = () => {
  return api.get<{ success: boolean; data: ConversationThread[] }>('/communication/conversations');
};

export const getMessages = (conversationId: string) => {
  return api.get<{ success: boolean; data: ChatMessageItem[] }>(`/communication/messages/${conversationId}`);
};

export const sendMessage = (payload: SendMessagePayload) => {
  return api.post<{ success: boolean; data: ChatMessageItem }>('/communication/messages', payload);
};
