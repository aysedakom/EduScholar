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

// Reconnection Listener: Auto-sync flush when internet connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Internet connection restored. Triggering auto-sync to cloud...');
    axios.post('http://localhost:5000/api/sync/trigger').catch(() => {});
    api.post('/sync/trigger').catch(() => {});
  });
}

export default api;