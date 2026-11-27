import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized and not on login/register/verify page
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register') && !path.includes('/verify-email')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },
  
  verifyEmail: async (token) => {
    // Try verify-email endpoint first, then activate endpoint if needed
    try {
      const response = await api.post('/api/v1/auth/verify-email', { token });
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const response = await api.post('/api/v1/auth/activate', { token });
        return response.data;
      }
      throw err;
    }
  },
  
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  },
  
  getToken: () => localStorage.getItem('access_token'),
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};

export const profileService = {
  getProfile: async () => {
    const response = await api.get('/api/v1/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/api/v1/profile', profileData);
    return response.data;
  },
};

export default api;
