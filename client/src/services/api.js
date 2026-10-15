import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const token = window.localStorage.getItem("apex_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // storage unavailable
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      try {
        if (
          typeof window !== "undefined" &&
          window.localStorage &&
          window.location.pathname !== "/login"
        ) {
          window.localStorage.removeItem("apex_token");
          window.localStorage.removeItem("apex_user");
        }
      } catch {
        // storage unavailable
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post("/api/v1/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await apiClient.post("/api/v1/auth/register", userData);
    return response.data;
  },
  logout: async () => {
    try {
      const response = await apiClient.post("/api/v1/auth/logout");
      return response.data;
    } catch {
      return { message: "Logged out locally" };
    }
  },
  refreshToken: async () => {
    const response = await apiClient.post("/api/v1/auth/refresh");
    return response.data;
  },
};

export const accountsApi = {
  getAccounts: async () => {
    const response = await apiClient.get("/api/v1/accounts");
    return response.data;
  },
  getAccountById: async (id) => {
    const response = await apiClient.get(`/api/v1/accounts/${id}`);
    return response.data;
  },
  getAccountTransactions: async (id, params = {}) => {
    const response = await apiClient.get(
      `/api/v1/accounts/${id}/transactions`,
      { params },
    );
    return response.data;
  },
};

export const transfersApi = {
  executeTransfer: async (transferPayload) => {
    const response = await apiClient.post("/api/v1/transfers", transferPayload);
    return response.data;
  },
  getTransferById: async (id) => {
    const response = await apiClient.get(`/api/v1/transfers/${id}`);
    return response.data;
  },
};

export default apiClient;
