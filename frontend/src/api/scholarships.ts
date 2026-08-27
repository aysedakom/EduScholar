import api from './axios';
import type { Scholarship, Bursary } from '../types';

// Scholarships
export const getScholarships = (params?: { status?: string; category?: string; search?: string }) => {
  return api.get<Scholarship[]>('/scholarships', { params });
};

export const getScholarship = (id: string) => {
  return api.get<Scholarship>(`/scholarships/${id}`);
};

// Bursaries
export const getBursaries = (params?: { type?: string; status?: string; search?: string }) => {
  return api.get<Bursary[]>('/bursaries', { params });
};

export const getBursary = (id: string) => {
  return api.get<Bursary>(`/bursaries/${id}`);
};

