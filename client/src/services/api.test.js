import { describe, it, expect } from "vitest";
import api, {
  authApi,
  submissionApi,
  quoteApi,
  rulesApi,
  analyticsApi,
} from "./api";

describe("API Services Module", () => {
  it("exports structured API endpoint groups", () => {
    expect(authApi).toBeDefined();
    expect(typeof authApi.login).toBe("function");
    expect(typeof authApi.getMe).toBe("function");

    expect(submissionApi).toBeDefined();
    expect(typeof submissionApi.list).toBe("function");
    expect(typeof submissionApi.create).toBe("function");
    expect(typeof submissionApi.getById).toBe("function");
    expect(typeof submissionApi.decision).toBe("function");
    expect(typeof submissionApi.reScore).toBe("function");

    expect(quoteApi).toBeDefined();
    expect(typeof quoteApi.createOrUpdate).toBe("function");
    expect(typeof quoteApi.getCurrent).toBe("function");

    expect(rulesApi).toBeDefined();
    expect(typeof rulesApi.getScoringMatrix).toBe("function");
    expect(typeof rulesApi.updateScoringMatrix).toBe("function");

    expect(analyticsApi).toBeDefined();
    expect(typeof analyticsApi.getManagerDashboard).toBe("function");
  });

  it("exports default aggregated api object", () => {
    expect(api.auth).toBe(authApi);
    expect(api.submissions).toBe(submissionApi);
    expect(api.quotes).toBe(quoteApi);
    expect(api.rules).toBe(rulesApi);
    expect(api.analytics).toBe(analyticsApi);
  });
});
