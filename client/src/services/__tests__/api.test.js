import { describe, it, expect } from "vitest";
import api, {
  getKpis,
  getSkus,
  getScenarios,
  evaluateScenario,
  submitAssortmentPlan,
  getAssortmentPlan,
  apiClient,
} from "../api";

describe("api service module", () => {
  it("exports all expected API methods and client instance", () => {
    expect(typeof getKpis).toBe("function");
    expect(typeof getSkus).toBe("function");
    expect(typeof getScenarios).toBe("function");
    expect(typeof evaluateScenario).toBe("function");
    expect(typeof submitAssortmentPlan).toBe("function");
    expect(typeof getAssortmentPlan).toBe("function");
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("default export contains all methods", () => {
    expect(api.getKpis).toBe(getKpis);
    expect(api.getSkus).toBe(getSkus);
    expect(api.getScenarios).toBe(getScenarios);
    expect(api.evaluateScenario).toBe(evaluateScenario);
    expect(api.submitAssortmentPlan).toBe(submitAssortmentPlan);
    expect(api.getAssortmentPlan).toBe(getAssortmentPlan);
  });
});
