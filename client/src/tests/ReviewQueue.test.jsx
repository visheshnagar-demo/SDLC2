import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import ReviewQueueTable from "../components/queue/ReviewQueueTable";

describe("ReviewQueueTable Component", () => {
  it("renders queue header and KPI cards", async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <ReviewQueueTable />
        </BrowserRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByText(/Underwriter Review & Triage Queue/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Pending Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Exposure Cap/i)).toBeInTheDocument();
  });

  it("renders table columns for risk review", async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <ReviewQueueTable />
        </BrowserRouter>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Submission #/i)).toBeInTheDocument();
      expect(screen.getByText(/Ceding Insurer & Insured/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Line of Business/i).length).toBeGreaterThan(
        0,
      );
    });
  });
});
