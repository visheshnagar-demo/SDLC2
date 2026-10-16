import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UnderwriterReviewQueue from "../UnderwriterReviewQueue";

vi.mock("../../../services/api", () => ({
  default: {
    getUnderwritingQueue: vi.fn().mockResolvedValue([
      {
        id: "SUB-101",
        insured_name: "Apex Cyber Solutions",
        carrier_name: "Travelers Insurance Group",
        risk_type: "CYBER",
        requested_limit: 10000000,
        attachment_point: 1000000,
        composite_score: 78,
        risk_tier: "HIGH",
        missing_flags_count: 2,
        status: "PENDING",
      },
    ]),
    getSubmissions: vi.fn().mockResolvedValue([]),
  },
}));

describe("UnderwriterReviewQueue", () => {
  it("renders queue KPI cards and filter controls", async () => {
    render(
      <MemoryRouter>
        <UnderwriterReviewQueue />
      </MemoryRouter>,
    );

    expect(screen.getByText("Queue Total")).toBeInTheDocument();
    expect(screen.getAllByText("Pending Review")[0]).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search by insured, carrier name/i),
    ).toBeInTheDocument();
    expect(screen.getByText("+ New Carrier Submission")).toBeInTheDocument();
  });
});
