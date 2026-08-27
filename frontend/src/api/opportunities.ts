import api from './axios';
import type { Opportunity } from '../types';

export const getOpportunities = (params?: {
  providerType?: string;
  status?: string;
  category?: string;
  search?: string;
}) => {
  return api.get<Opportunity[]>('/opportunities', { params });
};

export const getOpportunity = (id: string) => {
  return api.get<Opportunity>(`/opportunities/${id}`);
};
