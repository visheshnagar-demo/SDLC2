import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const token = window.localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/api/v1/auth/login", {
      email,
      password,
    });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get("/api/v1/auth/me");
    return response.data;
  },
};

export const submissionApi = {
  list: async (params = {}) => {
    const response = await apiClient.get("/api/v1/submissions", { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/api/v1/submissions/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post("/api/v1/submissions", data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.patch(`/api/v1/submissions/${id}`, data);
    return response.data;
  },
  uploadDocument: async (id, file, docType) => {
    const formData = new FormData();
    formData.append("file", file);
    if (docType) {
      formData.append("doc_type", docType);
    }
    const response = await apiClient.post(
      `/api/v1/submissions/${id}/documents`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
  downloadDocument: async (submissionId, docId) => {
    const response = await apiClient.get(
      `/api/v1/submissions/${submissionId}/documents/${docId}/download`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  },
  reScore: async (id) => {
    const response = await apiClient.post(`/api/v1/submissions/${id}/re-score`);
    return response.data;
  },
  decision: async (id, data) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${id}/decision`,
      data,
    );
    return response.data;
  },
  getAuditTrail: async (id) => {
    const response = await apiClient.get(
      `/api/v1/submissions/${id}/audit-trail`,
    );
    return response.data;
  },
};

export const quoteApi = {
  createOrUpdate: async (submissionId, data) => {
    const response = await apiClient.post(
      `/api/v1/submissions/${submissionId}/quotes`,
      data,
    );
    return response.data;
  },
  getCurrent: async (submissionId) => {
    const response = await apiClient.get(
      `/api/v1/submissions/${submissionId}/quotes/current`,
    );
    return response.data;
  },
};

export const rulesApi = {
  getScoringMatrix: async () => {
    const response = await apiClient.get("/api/v1/rules/scoring-matrix");
    return response.data;
  },
  updateScoringMatrix: async (data) => {
    const response = await apiClient.put("/api/v1/rules/scoring-matrix", data);
    return response.data;
  },
};

export const analyticsApi = {
  getManagerDashboard: async () => {
    const response = await apiClient.get("/api/v1/analytics/manager-dashboard");
    return response.data;
  },
};

export default {
  auth: authApi,
  submissions: submissionApi,
  quotes: quoteApi,
  rules: rulesApi,
  analytics: analyticsApi,
};
