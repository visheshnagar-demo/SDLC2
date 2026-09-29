import { describe, it, expect } from "vitest";
import client, {
  apiClient,
  getKPIs,
  getSKUs,
  getScenarios,
  submitAssortmentPlan,
} from "../api/client";

describe("API Client exports", () => {
  it("exports apiClient and helper methods", () => {
    expect(apiClient).toBeDefined();
    expect(typeof getKPIs).toBe("function");
    expect(typeof getSKUs).toBe("function");
    expect(typeof getScenarios).toBe("function");
    expect(typeof submitAssortmentPlan).toBe("function");
    expect(typeof client.getKPIs).toBe("function");
  });
});
