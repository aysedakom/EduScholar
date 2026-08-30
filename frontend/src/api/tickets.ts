// frontend/src/api/tickets.ts
import api from './axios';

export interface SupportTicketItem {
  id: number;
  ticket_code: string;
  user_id: number;
  applicant_name: string;
  applicant_email: string;
  student_id?: string;
  department?: string;
  major?: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  description: string;
  conversation_id: string;
  admin_notes?: string;
  resolution_remarks?: string;
  closed_at?: string;
  closed_by?: number;
  closed_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketPayload {
  subject: string;
  category: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  description: string;
  applicant_name?: string;
  applicant_email?: string;
}

export interface UpdateTicketStatusPayload {
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  adminNotes?: string;
  resolutionRemarks?: string;
}

export const getTickets = (params?: { status?: string; category?: string; priority?: string; search?: string }) => {
  return api.get<{ success: boolean; data: SupportTicketItem[] }>('/tickets', { params });
};

export const getTicketById = (id: string | number) => {
  return api.get<{ success: boolean; data: SupportTicketItem }>(`/tickets/${id}`);
};

export const createTicket = (payload: CreateTicketPayload) => {
  return api.post<{ success: boolean; message: string; data: SupportTicketItem }>('/tickets', payload);
};

export const updateTicketStatus = (id: string | number, payload: UpdateTicketStatusPayload) => {
  return api.patch<{ success: boolean; message: string; data: SupportTicketItem }>(`/tickets/${id}/status`, payload);
};

export const closeTicket = (id: string | number, payload?: { resolutionRemarks?: string; adminNotes?: string }) => {
  return api.post<{ success: boolean; message: string; data: SupportTicketItem }>(`/tickets/${id}/close`, payload || {});
};
