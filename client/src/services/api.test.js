import { describe, it, expect } from "vitest";
import api, {
  submitReinsuranceRequest,
  getUnderwritingQueue,
  calculateRiskScore,
  recordUnderwritingDecision,
  getSubmissionById,
  apiClient,
} from "./api";

describe("API Service Module", () => {
  it("exports all required API integration functions", () => {
    expect(typeof submitReinsuranceRequest).toBe("function");
    expect(typeof getUnderwritingQueue).toBe("function");
    expect(typeof calculateRiskScore).toBe("function");
    expect(typeof recordUnderwritingDecision).toBe("function");
    expect(typeof getSubmissionById).toBe("function");
  });

  it("configures apiClient with fallback default base URL and timeout", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.timeout).toBe(15000);
  });
});
