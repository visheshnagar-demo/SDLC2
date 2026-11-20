import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (storedRefreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: storedRefreshToken,
          });
          const newAccessToken = res.data.access_token;
          localStorage.setItem('access_token', newAccessToken);
          if (res.data.refresh_token) {
            localStorage.setItem('refresh_token', res.data.refresh_token);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          return Promise.reject(refreshErr);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const registerUser = async (data) => {
  const response = await apiClient.post('/api/v1/auth/register', data);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/api/v1/auth/login', credentials);
  return response.data;
};

export const refreshAuthToken = async (refreshToken) => {
  const response = await apiClient.post('/api/v1/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

export const logoutUser = async (refreshToken) => {
  const response = await apiClient.post('/api/v1/auth/logout', {
    refresh_token: refreshToken || localStorage.getItem('refresh_token'),
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/v1/auth/me');
  return response.data;
};

// Document & OCR Services
export const uploadDocument = async (formDataOrFile, documentType = 'PASSPORT') => {
  let body = formDataOrFile;
  if (formDataOrFile instanceof File) {
    body = new FormData();
    body.append('file', formDataOrFile);
    if (documentType) {
      body.append('documentType', documentType);
    }
  }
  const response = await apiClient.post('/api/v1/documents/upload', body, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await apiClient.get(`/api/v1/documents/${id}`);
  return response.data;
};

export const getMyDocuments = async () => {
  const response = await apiClient.get('/api/v1/documents/me');
  return response.data;
};

export default {
  registerUser,
  loginUser,
  refreshAuthToken,
  logoutUser,
  getCurrentUser,
  uploadDocument,
  getDocumentById,
  getMyDocuments,
};
