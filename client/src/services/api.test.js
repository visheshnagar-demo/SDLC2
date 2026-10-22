import { describe, it, expect } from "vitest";
import api, { computeRiskScore } from "./api";

describe("API Service and Risk Scoring Engine", () => {
  it("computes correct risk score and factor breakdown for Cyber Risk", () => {
    const cyberResult = computeRiskScore("Cyber Risk", {
      mfaEnforced: true,
      edrDeployed: true,
      immutableBackups: true,
      securityTraining: true,
    });

    expect(cyberResult.score).toBe(100);
    expect(cyberResult.riskTier).toBe("Low Risk Tier");
    expect(cyberResult.breakdown.length).toBe(5);
  });

  it("computes deficit risk score for Cyber Risk when controls are missing", () => {
    const deficitResult = computeRiskScore("Cyber Risk", {
      mfaEnforced: false,
      edrDeployed: false,
      immutableBackups: false,
      securityTraining: false,
    });

    expect(deficitResult.score).toBe(30);
    expect(deficitResult.riskTier).toBe("High Risk Tier");
  });

  it("provides getSubmissions method returning submissions list", async () => {
    const res = await api.getSubmissions();
    expect(res).toBeDefined();
    expect(Array.isArray(res.items)).toBe(true);
    expect(res.items.length).toBeGreaterThan(0);
  });

  it("creates a new submission with generated audit trail", async () => {
    const newSub = await api.createSubmission({
      insuredName: "Test BioTech Corp",
      lineOfBusiness: "Medical Professional Liability",
      policyLimit: 8000000,
      attachmentPoint: 2000000,
      retention: 200000,
      grossPremium: 180000,
      effectiveDate: "2026-06-01",
      expiryDate: "2027-06-01",
      industry: "Healthcare",
      revenueBand: "$50M - $250M",
      jurisdiction: "US - California",
    });

    expect(newSub.id).toBeDefined();
    expect(newSub.insuredName).toBe("Test BioTech Corp");
    expect(newSub.isReferred).toBe(true); // > 5M limit
    expect(newSub.auditTrail.length).toBeGreaterThanOrEqual(2);
  });
});
