import { describe, it, expect } from "vitest";
import { qtbApi } from "./api";
import { INITIAL_SCENARIOS, PERSONAS, STAGES } from "./mockData";

describe("qtbApi Service & Mock Fixtures", () => {
  it("should export all required api methods", () => {
    expect(typeof qtbApi.getScenarios).toBe("function");
    expect(typeof qtbApi.loadScenario).toBe("function");
    expect(typeof qtbApi.getCaseDetails).toBe("function");
    expect(typeof qtbApi.getCaseStages).toBe("function");
    expect(typeof qtbApi.executeStage).toBe("function");
    expect(typeof qtbApi.submitOverride).toBe("function");
    expect(typeof qtbApi.calculatePricing).toBe("function");
    expect(typeof qtbApi.saveQuote).toBe("function");
    expect(typeof qtbApi.submitApproval).toBe("function");
    expect(typeof qtbApi.getBindReadiness).toBe("function");
    expect(typeof qtbApi.executeBind).toBe("function");
    expect(typeof qtbApi.getAuditLogs).toBe("function");
    expect(typeof qtbApi.resetScenarioState).toBe("function");
  });

  it("should load scenario A successfully with default values", async () => {
    const scenario = await qtbApi.loadScenario("scenario_a");
    expect(scenario.id).toBe("scenario_a");
    expect(scenario.caseNumber).toBe("GEN-2026-QTB-8841");
    expect(scenario.cedentName).toBe("Pacific Mutual Reinsurance Partners");
    expect(scenario.limitNumeric).toBe(10000000);
    expect(scenario.bindChecklist.length).toBe(6);
  });

  it("should load scenario B with completeness exceptions", async () => {
    const scenario = await qtbApi.loadScenario("scenario_b");
    expect(scenario.id).toBe("scenario_b");
    expect(scenario.status).toBe("Completeness Exception");
    expect(scenario.completenessCheck.status).toBe("ACTION_REQUIRED");
  });

  it("should load scenario C with referral required", async () => {
    const scenario = await qtbApi.loadScenario("scenario_c");
    expect(scenario.id).toBe("scenario_c");
    expect(scenario.requiresReferral).toBe(true);
    expect(scenario.limitNumeric).toBe(25000000);
  });

  it("should define all 6 required personas with authority limits", () => {
    expect(Object.keys(PERSONAS)).toEqual([
      "underwriter",
      "actuary",
      "portfolio_manager",
      "legal",
      "operations",
      "executive",
    ]);
    expect(PERSONAS.underwriter.authorityAmount).toBe(15000000);
    expect(PERSONAS.executive.authorityAmount).toBe(100000000);
  });

  it("should define all 12 stages in the QTB lifecycle", () => {
    expect(STAGES.length).toBe(12);
    expect(STAGES[0].key).toBe("intake");
    expect(STAGES[11].key).toBe("handoff");
  });
});
