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

export interface AuditLogItem {
  id: number;
  actor_id: string;
  actor_role: string;
  actor_name?: string;
  actor_email?: string;
  action: string;
  previous_state?: string;
  new_state?: string;
  entity_type: string;
  entity_id: string;
  rationale?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export const getAuditLogs = (params?: { entityType?: string; actorId?: string; limit?: number }) => {
  return api.get<{ success: boolean; logs: AuditLogItem[] }>('/admin/audit-logs', { params });
};

export const createSystemUser = (data: { name: string; email: string; role: string; department?: string; password?: string }) => {
  return api.post<{ success: boolean; user: any }>('/admin/users', data);
};

export const updateUserStatus = (id: string | number, data: { status?: string; rationale?: string }) => {
  return api.put<{ success: boolean; user: any }>(`/admin/users/${id}/status`, data);
};

export const deleteSystemUser = (id: string | number) => {
  return api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`);
};

export const resetUserPassword = (id: string | number, newPassword?: string) => {
  return api.put<{ success: boolean; message: string; user: any }>(`/admin/users/${id}/password`, { newPassword });
};

export const resetDatabase = () => {
  return api.post<{ success: boolean; message: string }>('/admin/reset-db');
};

