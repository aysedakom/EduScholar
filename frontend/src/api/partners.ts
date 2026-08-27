// frontend/src/api/partners.ts
import api from './axios';

export interface PartnerSchool {
  id: number | string;
  school_id: string;
  name: string;
  short_name: string;
  school_type: string;
  address: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  partnership_status: string;
  active_scholars: number;
  scholarship_slots: number;
  programs_offered?: string;
  partnership_start?: string;
  partnership_end?: string;
}

export const getPartners = () => {
  return api.get<PartnerSchool[]>('/partners');
};

export const getPartnerById = (id: string | number) => {
  return api.get<PartnerSchool>(`/partners/${id}`);
};
