import { describe, it, expect } from "vitest";
import api from "../api";

describe("API Service", () => {
  it("exports all required API methods as functions", () => {
    expect(typeof api.getSubmissions).toBe("function");
    expect(typeof api.getSubmissionById).toBe("function");
    expect(typeof api.createSubmission).toBe("function");
    expect(typeof api.getUnderwritingQueue).toBe("function");
    expect(typeof api.recalculateRiskScore).toBe("function");
    expect(typeof api.recordDecision).toBe("function");
  });
});
