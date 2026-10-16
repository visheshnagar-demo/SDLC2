import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const api = {
  // Carrier Submission Endpoints
  createSubmission: async (data) => {
    const response = await apiClient.post("/api/v1/submissions", data);
    return response.data;
  },

  getSubmissions: async (params = {}) => {
    const response = await apiClient.get("/api/v1/submissions", { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await apiClient.get(`/api/v1/submissions/${id}`);
    return response.data;
  },

  // Underwriter Queue & Workspace Endpoints
  getUnderwriterQueue: async (params = {}) => {
    const response = await apiClient.get("/api/v1/underwriting/queue", {
      params,
    });
    return response.data;
  },

  recomputeRiskScore: async (id) => {
    const response = await apiClient.post(
      `/api/v1/underwriting/submissions/${id}/score`,
    );
    return response.data;
  },

  recordDecision: async (id, decisionData) => {
    const response = await apiClient.post(
      `/api/v1/underwriting/submissions/${id}/decisions`,
      decisionData,
    );
    return response.data;
  },

  getAuditTrail: async (id) => {
    const response = await apiClient.get(
      `/api/v1/underwriting/submissions/${id}/audit`,
    );
    return response.data;
  },
};

export default api;
