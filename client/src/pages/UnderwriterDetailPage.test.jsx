import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { UnderwriterDetailPage } from "./UnderwriterDetailPage";

vi.mock("../services/api", () => ({
  api: {
    getUnderwritingSubmissionDetail: vi.fn().mockResolvedValue({
      id: "test-id-12345",
      submission_reference: "FAC-2026-CYB-1001",
      insured_name: "Apex Global Tech",
      risk_type: "CYBER",
      status: "SUBMITTED",
      risk_tier: "HIGH",
      risk_score: 75,
      sum_insured: 10000000,
      attachment_point: 5000000,
      annual_revenue: 50000000,
      policy_start_date: "2026-06-01",
      policy_end_date: "2027-06-01",
      prior_claims_count: 2,
      prior_claims_total: 250000,
      security_governance_score: 65,
      missing_flags: [],
      risk_score_breakdowns: [],
      attachments: [],
      audit_logs: [],
    }),
    getSubmissionById: vi.fn().mockResolvedValue({
      id: "test-id-12345",
      submission_reference: "FAC-2026-CYB-1001",
      insured_name: "Apex Global Tech",
      risk_type: "CYBER",
      status: "SUBMITTED",
      risk_tier: "HIGH",
      risk_score: 75,
      sum_insured: 10000000,
      attachment_point: 5000000,
      annual_revenue: 50000000,
      policy_start_date: "2026-06-01",
      policy_end_date: "2027-06-01",
      prior_claims_count: 2,
      prior_claims_total: 250000,
      security_governance_score: 65,
      missing_flags: [],
      risk_score_breakdowns: [],
      attachments: [],
      audit_logs: [],
    }),
    toggleSubmissionLock: vi.fn().mockResolvedValue({ locked: true }),
    uploadAttachment: vi.fn().mockResolvedValue({}),
    recordDecision: vi.fn().mockResolvedValue({}),
  },
  default: {
    getUnderwritingSubmissionDetail: vi.fn().mockResolvedValue({
      id: "test-id-12345",
      submission_reference: "FAC-2026-CYB-1001",
      insured_name: "Apex Global Tech",
      risk_type: "CYBER",
      status: "SUBMITTED",
      risk_tier: "HIGH",
      risk_score: 75,
      sum_insured: 10000000,
      attachment_point: 5000000,
      annual_revenue: 50000000,
      policy_start_date: "2026-06-01",
      policy_end_date: "2027-06-01",
      prior_claims_count: 2,
      prior_claims_total: 250000,
      security_governance_score: 65,
      missing_flags: [],
      risk_score_breakdowns: [],
      attachments: [],
      audit_logs: [],
    }),
  },
}));

describe("UnderwriterDetailPage", () => {
  it("renders detail page cleanly after fetching submission", async () => {
    render(
      <MemoryRouter initialEntries={["/underwriter/submissions/test-id-12345"]}>
        <Routes>
          <Route
            path="/underwriter/submissions/:id"
            element={<UnderwriterDetailPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      const elements = screen.getAllByText("Apex Global Tech");
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
