import apiClient from './axios';

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

export default {
  listComplianceApplications,
  getComplianceApplication,
  submitComplianceDecision,
};
