import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('veritas_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 & token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('veritas_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newAccessToken = res.data.access_token;
          localStorage.setItem('veritas_access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('veritas_access_token');
          localStorage.removeItem('veritas_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

/* =========================================================================
   AUTH SERVICE (SCRUM-491)
========================================================================= */
export const registerUser = async (userData) => {
  const response = await apiClient.post('/api/v1/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/api/v1/auth/login', credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/api/v1/auth/me');
  return response.data;
};

export const refreshTokens = async (refreshToken) => {
  const response = await apiClient.post('/api/v1/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

/* =========================================================================
   DOCUMENT OCR SERVICE (SCRUM-492)
========================================================================= */
export const uploadDocument = async (formDataOrPayload) => {
  // Support both multipart/form-data and JSON with base64
  const isFormData = typeof FormData !== 'undefined' && formDataOrPayload instanceof FormData;
  const response = await apiClient.post('/api/v1/documents/upload', formDataOrPayload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const getDocumentDetails = async (documentId) => {
  const response = await apiClient.get(`/api/v1/documents/${documentId}`);
  return response.data;
};

export const listUserDocuments = async (userId) => {
  const response = await apiClient.get('/api/v1/documents', {
    params: { user_id: userId },
  });
  return response.data;
};

/* =========================================================================
   BIOMETRICS & LIVENESS SERVICE (SCRUM-493)
========================================================================= */
export const verifyBiometrics = async (payload) => {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  const response = await apiClient.post('/api/v1/biometrics/verify', payload, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const getBiometricStatus = async (biometricId) => {
  const response = await apiClient.get('/api/v1/biometrics/status', {
    params: biometricId ? { id: biometricId } : {},
  });
  return response.data;
};

/* =========================================================================
   COMPLIANCE REVIEW SERVICE (SCRUM-494)
========================================================================= */
export const listComplianceApplications = async (params = {}) => {
  const response = await apiClient.get('/api/v1/compliance/applications', { params });
  return response.data;
};

export const getComplianceApplication = async (applicationId) => {
  const response = await apiClient.get(`/api/v1/compliance/applications/${applicationId}`);
  return response.data;
};

export const submitComplianceDecision = async (applicationId, decisionPayload) => {
  const response = await apiClient.post(
    `/api/v1/compliance/applications/${applicationId}/decision`,
    decisionPayload
  );
  return response.data;
};

/* =========================================================================
   ADMIN AUDIT TRAIL SERVICE (SCRUM-495)
========================================================================= */
export const listAuditLogs = async (params = {}) => {
  const response = await apiClient.get('/api/v1/admin/audit-logs', { params });
  return response.data;
};

export const exportAuditLogs = async (params = {}) => {
  const response = await apiClient.get('/api/v1/admin/audit-logs/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export default {
  apiClient,
  registerUser,
  loginUser,
  getMe,
  refreshTokens,
  uploadDocument,
  getDocumentDetails,
  listUserDocuments,
  verifyBiometrics,
  getBiometricStatus,
  listComplianceApplications,
  getComplianceApplication,
  submitComplianceDecision,
  listAuditLogs,
  exportAuditLogs,
};
