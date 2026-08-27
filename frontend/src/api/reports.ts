// frontend/src/api/reports.ts
import api from './axios';

export interface MonitoringReportResponse {
  totalActiveScholars: number;
  averageGpa: number;
  retentionRate: string;
  onTimeGraduationRate: string;
  fundDisbursementSummary: {
    totalAllocated: number;
    totalDisbursed: number;
    utilizationPercent: number;
  };
  audits: any[];
}

export const getMonitoringReports = () => {
  return api.get<MonitoringReportResponse>('/reports/monitoring');
};

export const updateMonitoringReportStatus = (id: number | string, retentionStatus: string) => {
  return api.patch<{ message: string }>(`/reports/monitoring/${id}/status`, { retentionStatus });
};
