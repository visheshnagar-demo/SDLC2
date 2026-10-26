import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import ManagerDashboardPage from "../pages/ManagerDashboardPage";

describe("ManagerDashboardPage Component", () => {
  it("renders executive dashboard KPI metrics", async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <ManagerDashboardPage />
        </BrowserRouter>
      </AuthProvider>,
    );

    const title = await screen.findByText(
      /Underwriting Manager Executive Dashboard/i,
      {},
      { timeout: 4000 },
    );
    expect(title).toBeInTheDocument();
    expect(screen.getAllByText(/Total Submissions/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bound Policies/i).length).toBeGreaterThan(0);
  });
});
