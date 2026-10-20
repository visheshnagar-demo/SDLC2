import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import UnderwriterReviewQueue from "./UnderwriterReviewQueue";

const MOCK_SUBS = [
  {
    id: "SUB-101",
    ceding_company_name: "Hartford General",
    insured_name: "Test Insured Corp",
    line_of_business: "CYBER",
    policy_limit: 10000000,
    attachment_point: 2000000,
    status: "IN_REVIEW",
    created_at: new Date().toISOString(),
    risk_score: { total_score: 85 },
  },
];

describe("UnderwriterReviewQueue Component", () => {
  it("renders table headers and submission row", () => {
    render(
      <BrowserRouter>
        <UnderwriterReviewQueue submissions={MOCK_SUBS} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Sub ID/i)).toBeInTheDocument();
    expect(screen.getByText("SUB-101")).toBeInTheDocument();
    expect(screen.getByText("Test Insured Corp")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Review & Score/i }),
    ).toBeInTheDocument();
  });
});
