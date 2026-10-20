import { describe, it, expect } from "vitest";
import { api } from "./api";

describe("API Service Interface", () => {
  it("exports required document and analysis methods", () => {
    expect(typeof api.uploadDocument).toBe("function");
    expect(typeof api.getDocuments).toBe("function");
    expect(typeof api.getDocument).toBe("function");
    expect(typeof api.triggerAnalysis).toBe("function");
    expect(typeof api.getAnalysisJob).toBe("function");
    expect(typeof api.getClauseEvaluations).toBe("function");
    expect(typeof api.createDecision).toBe("function");
    expect(typeof api.getAuditLogs).toBe("function");
  });
});
