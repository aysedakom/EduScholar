// axios configuration with seamless bi-directional Railway <-> Localhost automatic failover
import axios from 'axios';

const RAILWAY_BACKEND_URL = 'https://eduscholar.up.railway.app/api';
const LOCALHOST_BACKEND_URL = 'http://localhost:5000/api';

const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor: attach token to every request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Interceptor: Bi-directional Automatic Failover between Railway & Localhost
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isNetworkOrServerError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      [502, 503, 504].includes(error.response?.status);

    if (isNetworkOrServerError && originalRequest && !originalRequest._retryFailover) {
      originalRequest._retryFailover = true;

      // Reroute between Localhost and Railway
      const currentUrl = originalRequest.baseURL || apiBaseUrl;
      const isCurrentlyLocal = currentUrl.includes('localhost') || currentUrl === '/api';
      const fallbackUrl = isCurrentlyLocal ? RAILWAY_BACKEND_URL : LOCALHOST_BACKEND_URL;

      try {
        console.warn('[Failover] Primary target (' + currentUrl + ') offline/unreachable. Rerouting request to fallback endpoint (' + fallbackUrl + ')...');
        originalRequest.baseURL = fallbackUrl;
        return await axios(originalRequest);
      } catch (fallbackErr) {
        return Promise.reject(fallbackErr);
      }
    }
    return Promise.reject(error);
  }
);

// Reconnection Listener: Auto-sync trigger when internet connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Connection] Internet connection restored. Triggering auto-sync...');
    axios.post('http://localhost:5000/api/sync/trigger').catch(() => {});
    api.post('/sync/trigger').catch(() => {});
  });
}

export default api;
