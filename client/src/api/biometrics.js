import apiClient from './axios';

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

export default {
  verifyBiometrics,
  getBiometricStatus,
};
