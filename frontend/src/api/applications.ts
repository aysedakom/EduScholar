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

export const createApplication = (payload: CreateApplicationPayload) => {
  return api.post<Application>('/applications', payload);
};

export const updateApplicationStatus = (id: string | number, status: string, notes?: string, remarks?: string) => {
  return api.patch<Application>(`/applications/${id}/status`, { status, notes, remarks });
};

export const resubmitApplicationDocument = (
  id: string | number,
  payload: { documentId: string; name: string; size?: string; fileData?: string; category?: string }
) => {
  return api.post<{ success: boolean; message: string; newStatus: string }>(`/applications/${id}/resubmit-document`, payload);
};
