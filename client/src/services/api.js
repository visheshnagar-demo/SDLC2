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
  // Carrier endpoints
  createSubmission: async (payload) => {
    const response = await apiClient.post("/api/v1/submissions", payload);
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

  uploadAttachment: async (submissionId, formData) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${submissionId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // Underwriting endpoints
  getUnderwritingQueue: async (params = {}) => {
    const response = await apiClient.get("/api/v1/underwriting/queue", {
      params,
    });
    return response.data;
  },

  getUnderwritingSubmissionDetail: async (submissionId) => {
    const response = await apiClient.get(
      `/api/v1/underwriting/submissions/${submissionId}`,
    );
    return response.data;
  },

  toggleSubmissionLock: async (submissionId, action = "lock") => {
    const response = await apiClient.post(
      `/api/v1/underwriting/submissions/${submissionId}/lock`,
      {
        action,
      },
    );
    return response.data;
  },

  recordDecision: async (submissionId, decisionData) => {
    const response = await apiClient.post(
      `/api/v1/underwriting/submissions/${submissionId}/decisions`,
      decisionData,
    );
    return response.data;
  },
};

export default api;
