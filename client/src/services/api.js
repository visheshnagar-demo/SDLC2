import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTasks = async () => {
  const response = await apiClient.get('/api/v1/tasks');
  return response.data;
};

export const createTask = async (title) => {
  const response = await apiClient.post('/api/v1/tasks', { title });
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await apiClient.patch(`/api/v1/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await apiClient.delete(`/api/v1/tasks/${id}`);
  return response.data;
};

export default apiClient;
