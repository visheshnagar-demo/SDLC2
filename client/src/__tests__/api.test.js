import { describe, it, expect } from "vitest";
import * as api from "../services/api";

describe("API Service Contracts", () => {
  it("exports expected API functions", () => {
    expect(typeof api.getKpis).toBe("function");
    expect(typeof api.getSkus).toBe("function");
    expect(typeof api.calculateScenarioImpact).toBe("function");
    expect(typeof api.submitAssortmentApproval).toBe("function");
  });

  it("configures default axios client with JSON content type", () => {
    expect(api.apiClient.defaults.headers["Content-Type"]).toBe(
      "application/json",
    );
  });
});
