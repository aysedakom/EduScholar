// frontend/src/api/admin.ts
import api from './axios';

export interface AdminStats {
  users: number;
  applications: number;
  scholarships: number;
  partners: number;
  distributions: number;
  scholars: number;
  timestamp: string;
}

export const getAdminStats = () => {
  return api.get<AdminStats>('/admin/stats');
};

export const getUsers = () => {
  return api.get<any[]>('/admin/users');
};

export const resetDatabase = () => {
  return api.post<{ success: boolean; message: string }>('/admin/reset-db');
};
