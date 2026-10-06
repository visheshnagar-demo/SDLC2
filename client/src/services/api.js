import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const fetchKPIs = async () => {
  const response = await apiClient.get("/api/v1/kpis");
  return response.data;
};

export const fetchSKUs = async (params = {}) => {
  const response = await apiClient.get("/api/v1/skus", { params });
  return response.data;
};

export const calculateScenario = async (scenarioType) => {
  const response = await apiClient.post("/api/v1/scenarios/calculate", {
    scenario_type: scenarioType,
  });
  return response.data;
};

export const submitAssortmentPlan = async (planData) => {
  const response = await apiClient.post(
    "/api/v1/assortment-plans/submit",
    planData,
  );
  return response.data;
};

export default {
  fetchKPIs,
  fetchSKUs,
  calculateScenario,
  submitAssortmentPlan,
};
