// frontend/src/services/api.ts

import axios from 'axios';

const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || ((import.meta as any).env?.DEV ? 'http://localhost:5000/api' : '/api');

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for Auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Automatic Localhost failover when network connection drops
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (!error.response || error.code === 'ERR_NETWORK') &&
      originalRequest &&
      !originalRequest._retryLocal &&
      !originalRequest.baseURL?.includes('localhost:5000')
    ) {
      originalRequest._retryLocal = true;
      try {
        console.warn('⚡ Network connection issue detected. Rerouting request to localhost backend (http://localhost:5000)...');
        originalRequest.baseURL = 'http://localhost:5000/api';
        return await axios(originalRequest);
      } catch (localErr) {
        return Promise.reject(localErr);
      }
    }
    return Promise.reject(error);
  }
);

// Mock Fallback for Client-Side AI Matching Simulation
export const processAiApplicationMatch = (formData: Record<string, any>) => {
  const gwa = Number(formData.gwa) || 1.75;
  const income = Number(formData.annualIncome) || 120000;
  const isQC =
    formData.city === 'Quezon City' ||
    formData.city === 'QC' ||
    (formData.barangay && String(formData.barangay).toLowerCase().includes('quezon')) ||
    true;

  const matches = [
    {
      program_id: 'sch-qc-01',
      program_name: 'Quezon City Tertiary Education Subsidy',
      program_code: 'QCTES-2026',
      match_score: gwa <= 2.5 && income <= 250000 && isQC ? 95 : 60,
      match_reason: `GWA ${gwa} meets requirement, Income ₱${income.toLocaleString()} qualifies for economic priority, ${isQC ? 'QC Resident verified' : 'Non-QC Resident'}`,
      is_eligible: true,
      recommendation: 'Highly Recommended',
    },
    {
      program_id: 'sch-qc-02',
      program_name: 'QC Tech Giants STEM Excellence Grant',
      code: 'STEM-EXC-2026',
      match_score: gwa <= 1.75 ? 88 : 65,
      match_reason: `Course ${formData.course || 'BSIT'} is a QC priority STEM course`,
      is_eligible: gwa <= 2.25,
      recommendation: gwa <= 1.75 ? 'Highly Recommended' : 'Recommended',
    },
    {
      program_id: 'sch-qc-03',
      program_name: 'Quezon City Honor & Leadership Bursary',
      code: 'HONOR-BUR-2026',
      match_score: 78,
      match_reason: 'Qualified under student leadership and academic performance',
      is_eligible: true,
      recommendation: 'Recommended',
    },
  ];

  // Save to localStorage for dashboard AI recommendation cards
  localStorage.setItem('student_ai_matches', JSON.stringify(matches));
  localStorage.setItem('student_submitted_application', JSON.stringify(formData));

  return matches;
};

export default api;
