import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const getClusterKpis = async (clusterId = "STV-CLUSTER-01") => {
  const response = await apiClient.get("/api/v1/cluster/kpis", {
    params: { cluster_id: clusterId },
  });
  return response.data;
};

export const getSkus = async (params = {}) => {
  const response = await apiClient.get("/api/v1/skus", {
    params: {
      cluster_id: params.clusterId || "STV-CLUSTER-01",
      search: params.search || undefined,
      brand_type: params.brandType || undefined,
      action: params.action || undefined,
      skip: params.skip || 0,
      limit: params.limit || 50,
    },
  });
  return response.data;
};

export const getScenarios = async () => {
  const response = await apiClient.get("/api/v1/scenarios");
  return response.data;
};

export const evaluateScenario = async (
  scenarioType,
  clusterId = "STV-CLUSTER-01",
) => {
  const response = await apiClient.post("/api/v1/scenarios/evaluate", {
    cluster_id: clusterId,
    scenario_type: scenarioType,
  });
  return response.data;
};

export const submitPlan = async ({
  scenarioType,
  clusterId = "STV-CLUSTER-01",
  submittedBy = "category_manager_dg@example.com",
  notes = "",
}) => {
  const response = await apiClient.post("/api/v1/plans/submit", {
    cluster_id: clusterId,
    scenario_type: scenarioType,
    submitted_by: submittedBy,
    notes: notes || undefined,
  });
  return response.data;
};

export const getAuditRecord = async (auditId) => {
  const response = await apiClient.get(`/api/v1/plans/audit/${auditId}`);
  return response.data;
};

export default apiClient;
