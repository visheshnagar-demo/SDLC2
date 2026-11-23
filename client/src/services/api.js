import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Bearer token from localStorage if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('identiverify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    if (response.data && response.data.token) {
      localStorage.setItem('identiverify_token', response.data.token);
      localStorage.setItem('identiverify_user', JSON.stringify(response.data.user || response.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('identiverify_token');
    localStorage.removeItem('identiverify_user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('identiverify_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};

export const verificationService = {
  initiateVerification: async (payload = {}) => {
    const response = await apiClient.post('/api/v1/verifications', payload);
    return response.data;
  },
  getStatus: async (verificationId) => {
    const response = await apiClient.get(`/api/v1/verifications/${verificationId}/status`);
    return response.data;
  }
};

export const documentService = {
  uploadDocument: async (documentData) => {
    const response = await apiClient.post('/api/v1/documents/upload', documentData);
    return response.data;
  }
};

export const biometricService = {
  livenessCheck: async (biometricData) => {
    const response = await apiClient.post('/api/v1/biometrics/liveness-check', biometricData);
    return response.data;
  }
};

export const complianceService = {
  getQueue: async () => {
    const response = await apiClient.get('/api/v1/compliance/queue');
    return response.data;
  },
  adjudicate: async (decisionData) => {
    const response = await apiClient.post('/api/v1/compliance/adjudicate', decisionData);
    return response.data;
  }
};

export const auditService = {
  getLogs: async (params = {}) => {
    const response = await apiClient.get('/api/v1/audit/logs', { params });
    return response.data;
  }
};

export default apiClient;
