import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

/**
 * Fetch summary KPI metrics (baseline or scenario-adjusted).
 * @param {string} [scenarioKey] - Optional scenario key (conservative, balanced, aggressive)
 * @returns {Promise<Object>} MetricsResponse
 */
export const fetchMetrics = async (scenarioKey) => {
  const params = {};
  if (scenarioKey) {
    params.scenario = scenarioKey;
  }
  const response = await apiClient.get("/api/v1/assortment/metrics", {
    params,
  });
  return response.data;
};

/**
 * Fetch SKU performance list with optional filters.
 * @param {Object} [filters]
 * @param {string} [filters.category]
 * @param {string} [filters.badge]
 * @returns {Promise<Array>} List of SKUs
 */
export const fetchSKUs = async (filters = {}) => {
  const params = {};
  if (filters.category) params.category = filters.category;
  if (filters.badge) params.badge = filters.badge;
  const response = await apiClient.get("/api/v1/assortment/skus", { params });
  return response.data;
};

/**
 * Fetch all scenario definitions and projections.
 * @returns {Promise<Object>} ScenariosResponse
 */
export const fetchScenarios = async () => {
  const response = await apiClient.get("/api/v1/assortment/scenarios");
  return response.data;
};

/**
 * Submit approved assortment plan.
 * @param {Object} payload - { scenario_key, user_id, justification_note }
 * @returns {Promise<Object>} SubmitResponse
 */
export const submitAssortmentPlan = async (payload) => {
  const response = await apiClient.post("/api/v1/assortment/submit", payload);
  return response.data;
};

/**
 * Fetch history of audit submissions.
 * @returns {Promise<Array>}
 */
export const fetchSubmissions = async () => {
  const response = await apiClient.get("/api/v1/assortment/submissions");
  return response.data;
};
