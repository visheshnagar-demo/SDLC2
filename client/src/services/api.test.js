import { describe, it, expect } from "vitest";
import { authApi, accountsApi, transfersApi, apiClient } from "./api";

describe("API Service Integration Suite", () => {
  it("exports apiClient axios instance with baseURL configuration", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults).toBeDefined();
    expect(apiClient.interceptors).toBeDefined();
  });

  it("exports authApi methods", () => {
    expect(typeof authApi.login).toBe("function");
    expect(typeof authApi.register).toBe("function");
    expect(typeof authApi.logout).toBe("function");
    expect(typeof authApi.refreshToken).toBe("function");
  });

  it("exports accountsApi methods", () => {
    expect(typeof accountsApi.getAccounts).toBe("function");
    expect(typeof accountsApi.getAccountById).toBe("function");
    expect(typeof accountsApi.getAccountTransactions).toBe("function");
  });

  it("exports transfersApi methods", () => {
    expect(typeof transfersApi.executeTransfer).toBe("function");
    expect(typeof transfersApi.getTransferById).toBe("function");
  });
});
