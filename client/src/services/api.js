import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const api = {
  // Submissions
  getSubmissions: async (params = {}) => {
    const response = await apiClient.get("/api/v1/submissions", { params });
    return response.data;
  },

  getSubmissionById: async (id) => {
    const response = await apiClient.get(`/api/v1/submissions/${id}`);
    return response.data;
  },

  createSubmission: async (payload) => {
    const response = await apiClient.post("/api/v1/submissions", payload);
    return response.data;
  },

  addAttachment: async (submissionId, attachmentPayload) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${submissionId}/attachments`,
      attachmentPayload,
    );
    return response.data;
  },

  // Underwriting Queue & Analysis
  getUnderwritingQueue: async (params = {}) => {
    const response = await apiClient.get("/api/v1/underwriting/queue", {
      params,
    });
    return response.data;
  },

  getScoreBreakdown: async (submissionId) => {
    const response = await apiClient.get(
      `/api/v1/underwriting/${submissionId}/score-breakdown`,
    );
    return response.data;
  },

  getChecklist: async (submissionId) => {
    const response = await apiClient.get(
      `/api/v1/underwriting/${submissionId}/checklist`,
    );
    return response.data;
  },

  // Decisions
  recordQuoteDecision: async (quotePayload) => {
    const response = await apiClient.post(
      "/api/v1/decisions/quote",
      quotePayload,
    );
    return response.data;
  },

  recordDeclineDecision: async (declinePayload) => {
    const response = await apiClient.post(
      "/api/v1/decisions/decline",
      declinePayload,
    );
    return response.data;
  },

  getDecisionBySubmissionId: async (submissionId) => {
    const response = await apiClient.get(`/api/v1/decisions/${submissionId}`);
    return response.data;
  },
};

export default api;
