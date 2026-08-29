import api from './axios';
import type { Scholarship, Bursary } from '../types';

// Scholarships
export const getScholarships = (params?: { status?: string; category?: string; search?: string }) => {
  return api.get<Scholarship[]>('/scholarships', { params });
};

export const getScholarship = (id: string) => {
  return api.get<Scholarship>(`/scholarships/${id}`);
};

export const updateScholarshipStatus = (id: string, status: string) => {
  return api.patch<Scholarship>(`/scholarships/${id}/status`, { status });
};

export const createScholarship = (data: Partial<Scholarship>) => {
  return api.post<Scholarship>('/scholarships', data);
};

// Bursaries
export const getBursaries = (params?: { type?: string; status?: string; search?: string }) => {
  return api.get<Bursary[]>('/bursaries', { params });
};

export const getBursary = (id: string) => {
  return api.get<Bursary>(`/bursaries/${id}`);
};
