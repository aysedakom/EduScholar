import api from './axios';
import type { AppNotification } from '../types';

export const getMyNotifications = () => {
  return api.get<{ notifications: AppNotification[]; unreadCount: number }>('/notifications');
};

export const markNotificationRead = (id: string) => {
  return api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return api.patch('/notifications/read-all');
};

