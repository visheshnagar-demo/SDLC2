import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CarrierDashboardTable } from "./CarrierDashboardTable";

vi.mock("../../services/api", () => ({
  api: {
    getSubmissions: vi.fn().mockResolvedValue([
      {
        id: "sub-12345678",
        submission_reference: "SUB-2026-001",
        insured_name: "Apex Corp",
        industry_segment: "Technology",
        risk_type: "CYBER",
        sum_insured: 10000000,
        attachment_point: 1000000,
        risk_tier: "LOW",
        status: "SUBMITTED",
      },
    ]),
  },
}));

describe("CarrierDashboardTable", () => {
  it("renders table and summary stats", async () => {
    render(
      <BrowserRouter>
        <CarrierDashboardTable />
      </BrowserRouter>,
    );
    expect(
      screen.getByText(/Carrier Facultative Placements/i),
    ).toBeInTheDocument();
  });
});
