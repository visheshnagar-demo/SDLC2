import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SubmissionInspectionWorkbench from "../SubmissionInspectionWorkbench";

vi.mock("../../../services/api", () => ({
  default: {
    getSubmissionById: vi.fn().mockResolvedValue({
      id: "sub-test-uuid",
      insured_name: "Starlight Fintech Corp",
      carrier_name: "Chubb Global Risk",
      risk_type: "CYBER",
      industry_sector: "Financial Services & Banking",
      annual_revenue: 85000000,
      requested_limit: 5000000,
      attachment_point: 1000000,
      policy_effective_date: "2026-11-01",
      policy_expiration_date: "2027-11-01",
      composite_score: 64,
      risk_tier: "HIGH",
      status: "PENDING",
      risk_parameters: {
        mfa_enforced: "yes",
        endpoint_detection: "no",
        backup_frequency: "daily",
        past_breaches_3yr: "1",
      },
      missing_info_flags: [
        {
          id: "flag-1",
          field_name: "Penetration Testing Audit",
          severity: "HIGH",
          message:
            "Third-party penetration testing report required for requested limit > $5M.",
        },
      ],
      attachments: [],
      decision_records: [],
    }),
    recalculateRiskScore: vi.fn().mockResolvedValue({}),
  },
}));

describe("SubmissionInspectionWorkbench", () => {
  it("renders workbench details and scoring overview", async () => {
    render(
      <MemoryRouter
        initialEntries={["/underwriting/submissions/sub-test-uuid"]}
      >
        <Routes>
          <Route
            path="/underwriting/submissions/:id"
            element={<SubmissionInspectionWorkbench />}
          />
        </Routes>
      </MemoryRouter>,
    );

    // Initial loading or loaded elements
    expect(
      await screen.findByText("Starlight Fintech Corp"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Automated Risk Scoring Engine"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Missing Information Scanner/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Record UW Decision")).toBeInTheDocument();
  });
});
