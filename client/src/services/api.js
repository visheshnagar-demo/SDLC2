import axios from 'axios';

// Port from tech_stack.backend: 8000 for FastAPI/Python
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL.slice(0, -1) : RAW_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor for JWT auth token if stored in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Submissions (Carrier & Underwriter)
  async getSubmissions(params = {}) {
    const res = await apiClient.get('/api/v1/submissions', { params });
    return res.data;
  },

  async getSubmissionById(id) {
    const res = await apiClient.get(`/api/v1/submissions/${id}`);
    return res.data;
  },

  async createSubmission(payload) {
    const res = await apiClient.post('/api/v1/submissions', payload);
    return res.data;
  },

  async updateSubmission(id, payload) {
    const res = await apiClient.put(`/api/v1/submissions/${id}`, payload);
    return res.data;
  },

  async uploadAttachment(submissionId, formData) {
    const res = await apiClient.post(
      `/api/v1/submissions/${submissionId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  // Underwriting Queue & Review
  async getUnderwritingQueue(params = {}) {
    try {
      const res = await apiClient.get('/api/v1/underwriting/queue', { params });
      return res.data;
    } catch (err) {
      // Fallback if endpoint is aliased to /api/v1/underwrite/queue
      if (err.response && err.response.status === 404) {
        const fallbackRes = await apiClient.get('/api/v1/underwrite/queue', { params });
        return fallbackRes.data;
      }
      throw err;
    }
  },

  async getUnderwritingSubmissionDetail(id) {
    try {
      const res = await apiClient.get(`/api/v1/underwriting/submissions/${id}`);
      return res.data;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        const fallbackRes = await apiClient.get(`/api/v1/submissions/${id}`);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  async lockSubmission(id, action = 'lock') {
    const res = await apiClient.post(`/api/v1/underwriting/submissions/${id}/lock`, { action });
    return res.data;
  },

  async recordDecision(id, decisionPayload) {
    const res = await apiClient.post(
      `/api/v1/underwriting/submissions/${id}/decisions`,
      decisionPayload
    );
    return res.data;
  },

  async getDeclineReasons() {
    try {
      const res = await apiClient.get('/api/v1/submissions/decline-reasons');
      return res.data;
    } catch {
      try {
        const fallbackRes = await apiClient.get('/api/v1/underwriting/decline-reasons');
        return fallbackRes.data;
      } catch {
        // Standard standardized decline reasons catalogue
        return [
          { code: 'HIGH_EXPOSURE_AGGREGATION', label: 'High Exposure Aggregation across portfolio' },
          { code: 'POOR_SECURITY_GOVERNANCE', label: 'Inadequate Security Controls or Governance Score' },
          { code: 'EXCESSIVE_CLAIM_HISTORY', label: 'Excessive Prior Claim Frequency or Severity' },
          { code: 'INADEQUATE_ATTACHMENT_POINT', label: 'Attachment Point Below Minimum Underwriting Guidelines' },
          { code: 'APPETITE_RESTRICTION', label: 'Restricted Industry Segment or Risk Class' },
          { code: 'UNRESOLVED_SUBJECTIVITIES', label: 'Incomplete Audit Disclosures or Unresolved Subjectivities' },
        ];
      }
    }
  },
};

export default api;
