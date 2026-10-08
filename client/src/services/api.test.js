import { describe, it, expect } from "vitest";
import api, {
  calculateQuote,
  getQuoteById,
  listQuotes,
  checkHealth,
} from "./api";

describe("api service exports and structures", () => {
  it("exports all expected API functions", () => {
    expect(typeof calculateQuote).toBe("function");
    expect(typeof getQuoteById).toBe("function");
    expect(typeof listQuotes).toBe("function");
    expect(typeof checkHealth).toBe("function");
    expect(typeof api.calculateQuote).toBe("function");
  });
});
