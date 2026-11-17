import apiClient from './axios';

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
  listAuditLogs,
  exportAuditLogs,
};
