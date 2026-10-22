import { describe, it, expect } from "vitest";
import api from "./api";

describe("API Service", () => {
  it("exports expected SDLC lifecycle endpoint methods", () => {
    expect(typeof api.getProjects).toBe("function");
    expect(typeof api.createProject).toBe("function");
    expect(typeof api.getProject).toBe("function");
    expect(typeof api.submitRequirements).toBe("function");
    expect(typeof api.generateDesign).toBe("function");
    expect(typeof api.approveDesign).toBe("function");
    expect(typeof api.syncDevelopment).toBe("function");
    expect(typeof api.executeTests).toBe("function");
    expect(typeof api.triggerDeployment).toBe("function");
    expect(typeof api.getAuditLogs).toBe("function");
  });
});
