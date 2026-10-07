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
 * Fetch baseline KPIs for the cluster
 * @param {string} clusterId
 */
export async function getKpis(clusterId = "small_town_value") {
  const response = await apiClient.get("/api/v1/assortment/kpis", {
    params: { cluster_id: clusterId },
  });
  return response.data;
}

/**
 * Fetch SKUs with performance metrics and badges
 * @param {string} clusterId
 */
export async function getSkus(clusterId = "small_town_value") {
  const response = await apiClient.get("/api/v1/assortment/skus", {
    params: { cluster_id: clusterId },
  });
  return response.data;
}

/**
 * Calculate scenario impact & guardrails
 * @param {string} clusterId
 * @param {string} scenarioKey ('conservative' | 'balanced' | 'aggressive')
 * @param {AbortSignal} [signal]
 */
export async function calculateScenarioImpact(
  clusterId = "small_town_value",
  scenarioKey = "balanced",
  signal = null,
) {
  const response = await apiClient.post(
    "/api/v1/assortment/scenario-impact",
    {
      cluster_id: clusterId,
      scenario_key: scenarioKey,
    },
    { signal },
  );
  return response.data;
}

/**
 * Submit scenario assortment approval
 * @param {Object} approvalData
 */
export async function submitAssortmentApproval(approvalData) {
  const response = await apiClient.post(
    "/api/v1/assortment/approvals",
    approvalData,
  );
  return response.data;
}

export default {
  getKpis,
  getSkus,
  calculateScenarioImpact,
  submitAssortmentApproval,
};
