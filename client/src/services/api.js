import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const api = {
  // Submissions
  getSubmissions: async (params = {}) => {
    const response = await apiClient.get("/api/v1/reinsurance/submissions", {
      params,
    });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await apiClient.get(
      `/api/v1/reinsurance/submissions/${id}`,
    );
    return response.data;
  },

  createSubmission: async (submissionData) => {
    const response = await apiClient.post(
      "/api/v1/reinsurance/submissions",
      submissionData,
    );
    return response.data;
  },

  // Underwriting Queue & Review
  getUnderwritingQueue: async (params = {}) => {
    const response = await apiClient.get(
      "/api/v1/reinsurance/underwriting/queue",
      { params },
    );
    return response.data;
  },

  recalculateRiskScore: async (id) => {
    const response = await apiClient.post(
      `/api/v1/reinsurance/underwriting/score/${id}`,
    );
    return response.data;
  },

  recordDecision: async (decisionData) => {
    const response = await apiClient.post(
      "/api/v1/reinsurance/underwriting/decisions",
      decisionData,
    );
    return response.data;
  },
};

export default api;
