import api from './axios';
import type { Application } from '../types';

export const getMyApplications = (params?: { status?: string; type?: string }) => {
  return api.get<Application[]>('/applications', { params });
};

export const getApplicationById = (id: string | number) => {
  return api.get<Application>(`/applications/${id}`);
};

export interface CreateApplicationPayload {
  type?: string;
  programId?: string;
  programName?: string;
  referenceId?: string;
  title?: string;
  amount?: number;
  progress?: number;
  requirementsCount?: number;
  completedRequirements?: number;
  jobId?: string;
  notes?: string;
  formData?: any;
  documentsSubmitted?: any[];
  remarks?: string;
}

const appSyncChannel = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('eduscholar_app_sync') : null;

export const createApplication = async (payload: CreateApplicationPayload) => {
  const res = await api.post<Application>('/applications', payload);
  try {
    appSyncChannel?.postMessage({ type: 'APPLICATION_UPDATED', id: res.data?.id, timestamp: Date.now() });
  } catch (_) {}
  return res;
};

export const updateApplicationStatus = async (id: string | number, status: string, notes?: string, remarks?: string) => {
  const res = await api.patch<Application>(`/applications/${id}/status`, { status, notes, remarks });
  try {
    appSyncChannel?.postMessage({ type: 'APPLICATION_UPDATED', id, status, timestamp: Date.now() });
  } catch (_) {}
  return res;
};

export const resubmitApplicationDocument = (
  id: string | number,
  payload: { documentId: string; name: string; size?: string; fileData?: string; category?: string }
) => {
  return api.post<{ success: boolean; message: string; newStatus: string }>(`/applications/${id}/resubmit-document`, payload);
};

