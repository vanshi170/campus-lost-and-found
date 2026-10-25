import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: '', // Uses Vite dev server proxy or same-origin in production
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foundit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if already attempting login or checking me
      const isAuthUrl = error.config.url.includes('/api/auth/login') ||
                        error.config.url.includes('/api/auth/register');

      if (!isAuthUrl) {
        localStorage.removeItem('foundit_token');
        localStorage.removeItem('foundit_user');
        // Dispatch custom event to notify AuthContext to synchronize
        window.dispatchEvent(new Event('foundit:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
