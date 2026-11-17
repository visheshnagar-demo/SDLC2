import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to add auth token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Carrier endpoints
  getSubmissions: async (params = {}) => {
    const response = await apiClient.get('/api/v1/submissions', { params });
    return response.data;
  },

  createSubmission: async (payload) => {
    const response = await apiClient.post('/api/v1/submissions', payload);
    return response.data;
  },

  uploadAttachment: async (submissionId, formData) => {
    const response = await apiClient.post(`/api/v1/submissions/${submissionId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Underwriter endpoints
  getUnderwriterQueue: async (params = {}) => {
    const response = await apiClient.get('/api/v1/underwriting/queue', { params });
    return response.data;
  },

  getSubmissionDetail: async (submissionId) => {
    const response = await apiClient.get(`/api/v1/underwriting/submissions/${submissionId}`);
    return response.data;
  },

  toggleLock: async (submissionId, action = 'acquire') => {
    const response = await apiClient.post(`/api/v1/underwriting/submissions/${submissionId}/lock`, { action });
    return response.data;
  },

  recordDecision: async (submissionId, decisionPayload) => {
    const response = await apiClient.post(`/api/v1/underwriting/submissions/${submissionId}/decisions`, decisionPayload);
    return response.data;
  },

  getDeclineReasons: async () => {
    try {
      const response = await apiClient.get('/api/v1/underwriting/decline-reasons');
      return response.data;
    } catch {
      // Return null to let the component use standard catalogue
      return null;
    }
  },
};

export default api;
