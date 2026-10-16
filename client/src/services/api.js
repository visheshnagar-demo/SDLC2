import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Submit a facultative reinsurance request (Cyber or D&O)
 * @param {Object} payload - ReinsuranceSubmissionCreate
 * @returns {Promise<Object>}
 */
export async function submitReinsuranceRequest(payload) {
  const response = await apiClient.post(
    "/api/v1/reinsurance-requests",
    payload,
  );
  return response.data;
}

/**
 * Fetch the underwriter review queue with filters, sorting, and pagination
 * @param {Object} [params] - Query parameters (skip, limit, risk_category, status, priority, sort_by, sort_order, search)
 * @returns {Promise<Array<Object>|Object>}
 */
export async function getUnderwritingQueue(params = {}) {
  const response = await apiClient.get("/api/v1/underwriting/queue", {
    params,
  });
  return response.data;
}

/**
 * Calculate or preview risk scoring and score breakdown
 * @param {Object} payload - Risk parameters (risk_category, policy_limit_usd, attachment_point_usd, carrier_rating, industry_sector, prior_loss_amount_usd)
 * @returns {Promise<Object>}
 */
export async function calculateRiskScore(payload) {
  const response = await apiClient.post("/api/v1/underwriting/score", payload);
  return response.data;
}

/**
 * Record a binding underwriter decision (QUOTE or DECLINE)
 * @param {Object} payload - UnderwritingDecisionCreate
 * @returns {Promise<Object>}
 */
export async function recordUnderwritingDecision(payload) {
  const response = await apiClient.post(
    "/api/v1/underwriting/decisions",
    payload,
  );
  return response.data;
}

/**
 * Fetch submission detail by ID. If dedicated endpoint exists, uses it; otherwise fetches from queue.
 * @param {string} id - UUID or submission ID
 * @returns {Promise<Object>}
 */
export async function getSubmissionById(id) {
  try {
    const response = await apiClient.get(`/api/v1/reinsurance-requests/${id}`);
    return response.data;
  } catch (error) {
    // Fallback: try finding in queue list
    const queueData = await getUnderwritingQueue();
    const list = Array.isArray(queueData)
      ? queueData
      : queueData?.items || queueData?.submissions || [];
    const found = list.find(
      (item) => item.id === id || item.submission_reference === id,
    );
    if (found) {
      return found;
    }
    throw error;
  }
}

export default {
  submitReinsuranceRequest,
  getUnderwritingQueue,
  calculateRiskScore,
  recordUnderwritingDecision,
  getSubmissionById,
};
