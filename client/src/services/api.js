import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Carrier Submissions
  createSubmission: async (payload) => {
    const response = await apiClient.post('/api/v1/submissions', payload);
    return response.data;
  },

  getSubmissions: async (params = {}) => {
    const response = await apiClient.get('/api/v1/submissions', { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await apiClient.get(`/api/v1/submissions/${id}`);
    return response.data;
  },

  // Underwriter Review Queue
  getUnderwritingQueue: async (params = {}) => {
    const response = await apiClient.get('/api/v1/underwriting/queue', { params });
    return response.data;
  },

  recalculateRiskScore: async (id) => {
    const response = await apiClient.post(`/api/v1/underwriting/submissions/${id}/score`);
    return response.data;
  },

  recordDecision: async (id, payload) => {
    const response = await apiClient.post(`/api/v1/underwriting/submissions/${id}/decisions`, payload);
    return response.data;
  },

  getAuditTrail: async (id) => {
    const response = await apiClient.get(`/api/v1/underwriting/submissions/${id}/audit`);
    return response.data;
  },
};

export default api;
