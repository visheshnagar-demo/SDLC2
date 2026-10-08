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
 * Calculate motor insurance premium
 * @param {Object} payload - { vehicle_make, vehicle_year, vehicle_value, driver_age, driving_experience, coverage_type }
 */
export const calculateQuote = async (payload) => {
  const response = await apiClient.post("/api/v1/quotes/calculate", payload);
  return response.data;
};

/**
 * Get quote details by quote ID
 * @param {string} quoteId
 */
export const getQuoteById = async (quoteId) => {
  const response = await apiClient.get(`/api/v1/quotes/${quoteId}`);
  return response.data;
};

/**
 * List quote history / audit trail
 * @param {Object} [params] - { skip, limit, search }
 */
export const listQuotes = async (params = {}) => {
  try {
    const response = await apiClient.get("/api/v1/quotes", { params });
    return response.data;
  } catch (err) {
    // If list endpoint isn't supported or fails, rethrow cleanly
    throw err;
  }
};

/**
 * Health check endpoint
 */
export const checkHealth = async () => {
  const response = await apiClient.get("/api/v1/health");
  return response.data;
};

export default {
  calculateQuote,
  getQuoteById,
  listQuotes,
  checkHealth,
};
