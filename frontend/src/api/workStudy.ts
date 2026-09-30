import axios from './axios';

export interface WorkStudyJob {
  id: number | string;
  job_code: string;
  title: string;
  department: string;
  location: string;
  hourly_rate: number;
  max_hours_per_week: number;
  slots_available: number;
  slots_filled: number;
  supervisor_name: string;
  supervisor_email: string;
  description: string;
  requirements: string[] | string;
  status: 'Open' | 'Closed' | 'Filled';
}

export interface WorkStudyLog {
  id: number;
  log_code: string;
  application_id?: number;
  user_id: number;
  job_id: number;
  work_date: string;
  clock_in: string;
  clock_out: string;
  hours_logged: number;
  tasks_completed: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  supervisor_remarks?: string;
  student_name?: string;
  student_email?: string;
  job_title?: string;
  job_department?: string;
  hourly_rate?: number;
  approved_at?: string;
}

export const getWorkStudyJobs = async (params?: { department?: string; status?: string; search?: string }) => {
  const response = await axios.get('/api/work-study/jobs', { params });
  return response.data;
};

export const getWorkStudyJobById = async (id: string | number) => {
  const response = await axios.get(`/api/work-study/jobs/${id}`);
  return response.data;
};

export const submitWorkStudyLog = async (data: {
  job_id: number | string;
  work_date: string;
  clock_in: string;
  clock_out: string;
  hours_logged: number;
  tasks_completed: string;
  application_id?: number;
}) => {
  const response = await axios.post('/api/work-study/logs', data);
  return response.data;
};

export const getWorkStudyLogs = async (params?: { user_id?: number; job_id?: number; status?: string }) => {
  const response = await axios.get('/api/work-study/logs', { params });
  return response.data;
};

export const updateWorkStudyLogStatus = async (
  logId: number,
  status: 'Approved' | 'Rejected' | 'Pending Approval',
  supervisor_remarks?: string
) => {
  const response = await axios.put(`/api/work-study/logs/${logId}/status`, { status, supervisor_remarks });
  return response.data;
};
