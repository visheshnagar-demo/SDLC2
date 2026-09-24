import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const getKPIs = async (clusterId = "cluster-04") => {
  const response = await apiClient.get(`/api/v1/clusters/${clusterId}/kpis`);
  return response.data;
};

export const getSKUs = async (clusterId = "cluster-04", params = {}) => {
  const response = await apiClient.get(`/api/v1/clusters/${clusterId}/skus`, {
    params,
  });
  return response.data;
};

export const getScenarios = async (clusterId = "cluster-04") => {
  const response = await apiClient.get(
    `/api/v1/clusters/${clusterId}/scenarios`,
  );
  return response.data;
};

export const submitAssortmentPlan = async (
  clusterId = "cluster-04",
  payload,
) => {
  const response = await apiClient.post(
    `/api/v1/clusters/${clusterId}/submissions`,
    payload,
  );
  return response.data;
};

export default {
  getKPIs,
  getSKUs,
  getScenarios,
  submitAssortmentPlan,
};
