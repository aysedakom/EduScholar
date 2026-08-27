// frontend/src/api/calendar.ts
import api from './axios';

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: 'Disbursement' | 'Deadline' | 'Announcement' | 'Academic' | 'Interview' | 'Compliance';
  targetAudience: string;
  description: string;
  priority: 'Normal' | 'High' | 'Critical';
  sendNotification: boolean;
  isOfficialLGU: boolean;
  source?: 'system' | 'custom';
  createdAt?: string;
}

export const getCalendarEvents = (params?: { category?: string; search?: string }) => {
  return api.get<{ success: boolean; data: CalendarEventItem[] }>('/calendar/events', { params });
};

export const createCalendarEvent = (data: {
  title: string;
  date: string;
  time?: string;
  category: string;
  targetAudience: string;
  description?: string;
  priority?: string;
  sendNotification?: boolean;
  isOfficialLGU?: boolean;
}) => {
  return api.post<{ success: boolean; message: string; data: CalendarEventItem }>('/calendar/events', data);
};

export const deleteCalendarEvent = (id: string) => {
  return api.delete<{ success: boolean; message: string }>(`/calendar/events/${id}`);
};
