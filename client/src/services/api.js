import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const api = {
  // Document endpoints
  uploadDocument: async (formData) => {
    const response = await apiClient.post(
      "/api/v1/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  getDocuments: async (params = {}) => {
    const response = await apiClient.get("/api/v1/documents", { params });
    return response.data;
  },

  getDocument: async (docId) => {
    const response = await apiClient.get(`/api/v1/documents/${docId}`);
    return response.data;
  },

  // Analysis endpoints
  triggerAnalysis: async (documentId) => {
    const response = await apiClient.post("/api/v1/analysis/trigger", {
      document_id: documentId,
    });
    return response.data;
  },

  getAnalysisJob: async (jobId) => {
    const response = await apiClient.get(`/api/v1/analysis/${jobId}`);
    return response.data;
  },

  getClauseEvaluations: async (jobId) => {
    const response = await apiClient.get(`/api/v1/analysis/${jobId}/clauses`);
    return response.data;
  },

  // Underwriting decision endpoints
  createDecision: async (decisionData) => {
    const response = await apiClient.post("/api/v1/decisions", decisionData);
    return response.data;
  },

  // Audit log endpoints
  getAuditLogs: async (jobId) => {
    const response = await apiClient.get(`/api/v1/audit/logs/${jobId}`);
    return response.data;
  },
};

export default apiClient;
