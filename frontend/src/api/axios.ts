// axios configuration
import axios from 'axios';

const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || ((import.meta as any).env?.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Interceptor: attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;