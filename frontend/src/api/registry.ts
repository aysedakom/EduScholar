// frontend/src/api/registry.ts
import api from './axios';

export interface ScholarRegistryRecord {
  id: number | string;
  student_id: string;
  user_id?: number | string;
  full_name: string;
  email: string;
  school: string;
  program_id: string;
  program_name: string;
  current_term: string;
  scholarship_age: string;
  gwa: number;
  units_enrolled: number;
  status: string;
  grant_amount: number;
  disbursement_status: string;
}

export const getScholars = (params?: { status?: string; school?: string; search?: string }) => {
  return api.get<ScholarRegistryRecord[]>('/registry', { params });
};

export const addScholar = (payload: Partial<ScholarRegistryRecord>) => {
  return api.post<ScholarRegistryRecord>('/registry', payload);
};

export const updateScholarStatus = (id: number | string, status: string, disbursementStatus?: string, gwa?: number) => {
  return api.patch<ScholarRegistryRecord>(`/registry/${id}/status`, { status, disbursementStatus, gwa });
};
