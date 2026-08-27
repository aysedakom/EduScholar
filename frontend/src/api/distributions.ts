// frontend/src/api/distributions.ts
import api from './axios';

export interface DistributionBatch {
  id: number | string;
  batch_code: string;
  program_name: string;
  category: string;
  term: string;
  beneficiary_count: number;
  total_amount: number;
  disbursement_channel: string;
  payout_date: string;
  status: string;
  fund_source: string;
}

export const getDistributions = (params?: { status?: string; category?: string; search?: string }) => {
  return api.get<DistributionBatch[]>('/distributions', { params });
};

export const createDistribution = (payload: Partial<DistributionBatch>) => {
  return api.post<DistributionBatch>('/distributions', payload);
};

export const updateDistributionStatus = (id: number | string, status: string) => {
  return api.patch<DistributionBatch>(`/distributions/${id}/status`, { status });
};
