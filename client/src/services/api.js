import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const quoteApi = {
  getQuotes: async (params = {}) => {
    const response = await apiClient.get("/api/v1/quotes", { params });
    return response.data;
  },
  getQuoteById: async (id) => {
    const response = await apiClient.get(`/api/v1/quotes/${id}`);
    return response.data;
  },
  createQuote: async (quoteData) => {
    const response = await apiClient.post("/api/v1/quotes", quoteData);
    return response.data;
  },
};

export const riskApi = {
  getRisks: async (params = {}) => {
    const response = await apiClient.get("/api/v1/risks", { params });
    return response.data;
  },
  submitDecision: async (id, decisionData) => {
    const response = await apiClient.patch(
      `/api/v1/risks/${id}/decision`,
      decisionData,
    );
    return response.data;
  },
};

export const binderApi = {
  getBinders: async (params = {}) => {
    const response = await apiClient.get("/api/v1/binders", { params });
    return response.data;
  },
  getBinderById: async (id) => {
    const response = await apiClient.get(`/api/v1/binders/${id}`);
    return response.data;
  },
  createBinder: async (binderData) => {
    const response = await apiClient.post("/api/v1/binders", binderData);
    return response.data;
  },
};

export const healthApi = {
  checkHealth: async () => {
    const response = await apiClient.get("/api/v1/health");
    return response.data;
  },
};

export default apiClient;
