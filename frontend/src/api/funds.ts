// frontend/src/api/funds.ts
import api from './axios';

export interface FundPoolItem {
  id: string;
  name: string;
  funder_agency: string;
  funder_type: string;
  revenue_source: string;
  total_budget: number;
  disbursed_amount: number;
  committed_amount: number;
  remaining_balance: number;
  utilization_rate: string;
  fiscal_year: string;
  status: 'Active' | 'Depleted' | 'Pending Allocation';
  contact_person?: string;
  tranches_released: number;
  last_drawdown_date?: string;
}

export interface DrawdownRequestItem {
  id: string;
  fund_id: string;
  fund_name: string;
  funder_agency: string;
  requested_amount: number;
  tranche_name: string;
  target_programs: string[];
  justification: string;
  status: 'Submitted to Funder Treasury' | 'Under Funder Treasury Review' | 'Transferred & Credited' | 'Rejected';
  requested_by: string;
  requested_date: string;
  approved_date?: string | null;
  voucher_number: string;
  disbursed_to_vault: boolean;
}

export const getFundPools = () => {
  return api.get<{ success: boolean; count: number; data: FundPoolItem[] }>('/funds');
};

export const createFundPool = (payload: Partial<FundPoolItem>) => {
  return api.post<{ success: boolean; data: FundPoolItem }>('/funds', payload);
};

export const getDrawdownRequests = () => {
  return api.get<{ success: boolean; count: number; data: DrawdownRequestItem[] }>('/funds/drawdowns');
};

export const submitDrawdownRequest = (payload: {
  fund_id: string;
  requested_amount: number;
  tranche_name: string;
  target_programs?: string[];
  justification?: string;
  requested_by?: string;
}) => {
  return api.post<{ success: boolean; message: string; data: DrawdownRequestItem }>('/funds/drawdown', payload);
};

export const updateDrawdownStatus = (id: string, status: string, notes?: string) => {
  return api.patch<{ success: boolean; message: string; data: DrawdownRequestItem }>(`/funds/drawdown/${id}/status`, {
    status,
    notes,
  });
};
