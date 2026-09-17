import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const getKpis = async (clusterCode = "STV-CLUSTER") => {
  const response = await apiClient.get("/api/v1/kpis", {
    params: { cluster_code: clusterCode },
  });
  return response.data;
};

export const getSkus = async (params = {}) => {
  const response = await apiClient.get("/api/v1/skus", {
    params,
  });
  return response.data;
};

export const getScenarios = async () => {
  const response = await apiClient.get("/api/v1/scenarios");
  return response.data;
};

export const evaluateScenario = async (
  scenarioCode,
  clusterCode = "STV-CLUSTER",
) => {
  const response = await apiClient.post("/api/v1/scenarios/evaluate", {
    scenario_code: scenarioCode,
    cluster_code: clusterCode,
  });
  return response.data;
};

export const submitAssortmentPlan = async (payload) => {
  const response = await apiClient.post(
    "/api/v1/assortment-plans/submit",
    payload,
  );
  return response.data;
};

export const getAssortmentPlan = async (auditId) => {
  const response = await apiClient.get(`/api/v1/assortment-plans/${auditId}`);
  return response.data;
};

export default {
  apiClient,
  getKpis,
  getSkus,
  getScenarios,
  evaluateScenario,
  submitAssortmentPlan,
  getAssortmentPlan,
};
