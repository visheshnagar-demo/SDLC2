import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// Normalize base URL so it points to the root server or api prefix
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_ROOT = cleanBaseUrl.endsWith('/api/v1')
  ? cleanBaseUrl
  : cleanBaseUrl.endsWith('/api')
  ? `${cleanBaseUrl}/v1`
  : `${cleanBaseUrl}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Submissions
  getSubmissions: async (params = {}) => {
    const response = await apiClient.get('/submissions', { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await apiClient.get(`/submissions/${id}`);
    return response.data;
  },

  createSubmission: async (payload) => {
    const response = await apiClient.post('/submissions', payload);
    return response.data;
  },

  getSubmissionFlags: async (id) => {
    const response = await apiClient.get(`/submissions/${id}/flags`);
    return response.data;
  },

  // Decisions
  createDecision: async (id, decisionPayload) => {
    const response = await apiClient.post(`/submissions/${id}/decisions`, decisionPayload);
    return response.data;
  },

  // Master Data / Reasons
  getDeclineReasons: async () => {
    const response = await apiClient.get('/underwriting/reasons');
    return response.data;
  },
};

export default api;
