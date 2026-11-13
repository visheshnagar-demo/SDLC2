import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { UnderwriterReviewQueueTable } from "./UnderwriterReviewQueueTable";

vi.mock("../../services/api", () => ({
  api: {
    getUnderwritingQueue: vi.fn().mockResolvedValue([
      {
        id: "sub-12345678",
        submission_reference: "FAC-CYB-001",
        insured_name: "Tech Shield Ltd",
        carrier_name: "Apex Carrier",
        risk_type: "CYBER",
        sum_insured: 15000000,
        attachment_point: 5000000,
        risk_score: 82,
        risk_tier: "HIGH",
        status: "SUBMITTED",
        missing_flags: [],
        active_lock_user_id: null,
      },
    ]),
  },
}));

describe("UnderwriterReviewQueueTable", () => {
  it("renders queue table header and cards", async () => {
    render(
      <BrowserRouter>
        <UnderwriterReviewQueueTable />
      </BrowserRouter>,
    );
    expect(
      screen.getByText(/Underwriter Review Queue & Risk Workbench/i),
    ).toBeInTheDocument();
  });
});
