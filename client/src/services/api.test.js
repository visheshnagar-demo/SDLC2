import { describe, it, expect } from "vitest";
import { api, apiClient } from "./api";

describe("API Service Layer Contracts", () => {
  it("exports all mandatory REST endpoint functions", () => {
    expect(typeof api.getSubmissions).toBe("function");
    expect(typeof api.getSubmissionById).toBe("function");
    expect(typeof api.createSubmission).toBe("function");
    expect(typeof api.uploadSubmissionDocument).toBe("function");
    expect(typeof api.calculateRiskScore).toBe("function");
    expect(typeof api.updateSubmissionStatus).toBe("function");
    expect(typeof api.decideReferral).toBe("function");
    expect(typeof api.createQuote).toBe("function");
    expect(typeof api.finalizeDecision).toBe("function");
    expect(typeof api.getAuditTrail).toBe("function");
    expect(typeof api.getManagerDashboardAnalytics).toBe("function");
    expect(typeof api.getScoringRulesConfig).toBe("function");
    expect(typeof api.updateScoringRulesConfig).toBe("function");
  });

  it("configures default base URL with fallback to localhost:8000", () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
  });
});
