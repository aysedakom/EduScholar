// frontend/src/api/portalSettings.ts
import api from './axios';

export interface PortalSettingsData {
  isOpen: boolean;
  academicYear: string;
  term: string;
  openingDate: string;
  closingDate: string;
  closedMessage: string;
  nextCycleOpening: string;
  updatedAt?: string;
}

export const getPortalSettings = () => {
  return api.get<{ success: boolean; data: PortalSettingsData }>('/portal-settings');
};

export const updatePortalSettings = (payload: Partial<PortalSettingsData>) => {
  return api.patch<{ success: boolean; message: string; data: PortalSettingsData }>('/portal-settings', payload);
};
