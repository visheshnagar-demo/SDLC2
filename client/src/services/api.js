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
  // Project endpoints
  getProjects: async () => {
    const response = await apiClient.get("/api/v1/sdlc/projects");
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await apiClient.post("/api/v1/sdlc/projects", projectData);
    return response.data;
  },

  getProject: async (projectId) => {
    const response = await apiClient.get(`/api/v1/sdlc/projects/${projectId}`);
    return response.data;
  },

  // Requirements stage
  submitRequirements: async (projectId, payload) => {
    const response = await apiClient.post(
      `/api/v1/sdlc/projects/${projectId}/requirements`,
      payload,
    );
    return response.data;
  },

  // Design stage
  generateDesign: async (projectId) => {
    const response = await apiClient.post(
      `/api/v1/sdlc/projects/${projectId}/designs/generate`,
    );
    return response.data;
  },

  approveDesign: async (projectId, designId, payload = {}) => {
    const response = await apiClient.post(
      `/api/v1/sdlc/projects/${projectId}/designs/${designId}/approve`,
      payload,
    );
    return response.data;
  },

  // Development stage
  syncDevelopment: async (projectId, payload = {}) => {
    const response = await apiClient.post(
      `/api/v1/sdlc/projects/${projectId}/development/sync`,
      payload,
    );
    return response.data;
  },

  // Testing stage
  executeTests: async (projectId, payload = {}) => {
    const response = await apiClient.post(
      `/api/v1/sdlc/projects/${projectId}/testing/execute`,
      payload,
    );
    return response.data;
  },

  // Deployment stage
  triggerDeployment: async (projectId, payload = {}) => {
    const response = await apiClient.post(
      `/api/v1/sdlc/projects/${projectId}/deployment/deploy`,
      payload,
    );
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (projectId) => {
    const response = await apiClient.get(
      `/api/v1/sdlc/projects/${projectId}/audit-logs`,
    );
    return response.data;
  },
};

export default api;
