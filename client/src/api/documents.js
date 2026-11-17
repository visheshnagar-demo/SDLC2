import apiClient from './axios';

export const uploadDocument = async (formDataOrPayload) => {
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
    params: userId ? { user_id: userId } : {},
  });
  return response.data;
};

export default {
  uploadDocument,
  getDocumentDetails,
  listUserDocuments,
};
