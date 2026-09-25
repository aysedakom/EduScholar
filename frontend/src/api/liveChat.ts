// frontend/src/api/liveChat.ts
import api from './axios';

export interface LiveChatMessage {
  id: number;
  session_id: number;
  sender_type: 'student' | 'guest' | 'admin' | 'system';
  sender_id?: number | null;
  sender_name: string;
  message: string;
  created_at: string;
}

export interface LiveChatSession {
  id: number;
  session_code: string;
  guest_name: string;
  guest_email?: string | null;
  user_id?: number | null;
  category: string;
  initial_message: string;
  status: 'Waiting' | 'Active' | 'Resolved' | 'Expired' | 'Closed' | 'Archived';
  assigned_admin_id?: number | null;
  assigned_admin_name?: string | null;
  queue_position?: number;
  message_count?: number;
  last_message_at: string;
  last_user_activity_at: string;
  closed_at?: string | null;
  created_at: string;
  messages?: LiveChatMessage[];
}

export interface LiveChatStats {
  active_count: number;
  waiting_count: number;
  resolved_count: number;
  expired_count: number;
  archived_count: number;
  total_count: number;
}

export const ALLOWED_CONCERN_CATEGORIES = [
  'Scholarship Application',
  'Requirements',
  'Application Status',
  'Scholarship Renewal',
  'Grant/Disbursement',
  'Account/Login',
  'Technical Support',
  'Other Concern',
];

export const startLiveChat = (data: {
  complete_name: string;
  guest_email?: string;
  category: string;
  initial_message: string;
}) => api.post('/live-chat/start', data);

export const getLiveChatSessions = (params?: { status?: string; search?: string }) =>
  api.get<{ success: boolean; data: LiveChatSession[]; stats: LiveChatStats }>('/live-chat/sessions', { params });

export const getLiveChatSession = (id: string | number) =>
  api.get<{ success: boolean; data: LiveChatSession }>(`/live-chat/sessions/${id}`);

export const sendLiveChatMessage = (
  sessionId: number,
  data: { message: string; sender_name?: string; sender_type?: string }
) => api.post<{ success: boolean; data: LiveChatMessage }>(`/live-chat/sessions/${sessionId}/messages`, data);

export const acceptLiveChatSession = (sessionId: number) =>
  api.put<{ success: boolean; message: string; data: LiveChatSession }>(`/live-chat/sessions/${sessionId}/accept`);

export const updateLiveChatStatus = (sessionId: number, data: { status: string; remarks?: string }) =>
  api.put<{ success: boolean; message: string; data: LiveChatSession }>(`/live-chat/sessions/${sessionId}/status`, data);

export const checkLiveChatInactivity = () => api.post('/live-chat/check-inactivity');
