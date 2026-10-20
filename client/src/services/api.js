import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Interceptor for attaching auth token if stored
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    const userRole = localStorage.getItem("user_role") || "underwriter";
    const userId = localStorage.getItem("user_id") || "usr-default";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Also include custom simulated headers for RBAC demo flexibility
    config.headers["X-User-Role"] = userRole;
    config.headers["X-User-Id"] = userId;
    return config;
  },
  (error) => Promise.reject(error),
);

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

  uploadSubmissionDocument: async (submissionId, formData) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${submissionId}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  calculateRiskScore: async (id, payload = {}) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${id}/score`,
      payload,
    );
    return response.data;
  },

  updateSubmissionStatus: async (id, { status, notes }) => {
    const response = await apiClient.patch(`/api/v1/submissions/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  decideReferral: async (id, { decision, notes, manager_user_id }) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${id}/referral/decision`,
      {
        decision,
        notes,
        manager_user_id,
      },
    );
    return response.data;
  },

  createQuote: async (id, quoteData) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${id}/quotes`,
      quoteData,
    );
    return response.data;
  },

  finalizeDecision: async (id, { decision, decline_reason, notes }) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${id}/decisions`,
      {
        decision,
        decline_reason,
        notes,
      },
    );
    return response.data;
  },

  getAuditTrail: async (id) => {
    const response = await apiClient.get(
      `/api/v1/submissions/${id}/audit-trail`,
    );
    return response.data;
  },

  // Analytics
  getManagerDashboardAnalytics: async () => {
    const response = await apiClient.get("/api/v1/analytics/manager-dashboard");
    return response.data;
  },

  // Config Rules
  getScoringRulesConfig: async () => {
    const response = await apiClient.get("/api/v1/config/scoring-rules");
    return response.data;
  },

  updateScoringRulesConfig: async (configData) => {
    const response = await apiClient.put(
      "/api/v1/config/scoring-rules",
      configData,
    );
    return response.data;
  },
};

export default api;
