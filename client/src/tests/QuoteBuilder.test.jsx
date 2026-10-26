import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import QuoteBuilder from "../components/quote/QuoteBuilder";

describe("QuoteBuilder Component", () => {
  const mockSub = {
    id: "fac-sub-001",
    submission_number: "FAC-2026-0089",
    line_of_business: "Cyber Risk",
    policy_limit: 10000000,
    attachment_point: 2000000,
    gross_premium: 180000,
    quotes: [],
  };

  it("renders quote builder form and calculated premium fields", () => {
    render(
      <AuthProvider>
        <QuoteBuilder submission={mockSub} />
      </AuthProvider>,
    );

    expect(
      screen.getByText(/Specialty Line Facultative Quote Builder/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Syndicate Participation Share/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ceding Commission Allowance/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Net Reinsurance Premium/i)).toBeInTheDocument();
  });
});
