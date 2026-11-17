import apiClient from './axios';

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

export default {
  registerUser,
  loginUser,
  getMe,
  refreshTokens,
};
