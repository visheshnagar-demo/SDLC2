import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import RiskScoringBreakdown from "../components/scoring/RiskScoringBreakdown";

describe("RiskScoringBreakdown Component", () => {
  const mockSub = {
    id: "fac-sub-001",
    line_of_business: "Cyber Risk",
    risk_score: {
      composite_score: 85,
      risk_grade: "LOW_RISK",
      evaluated_at: new Date().toISOString(),
      factors: [
        {
          name: "MFA Enforcement across All Endpoints",
          category: "Security Controls",
          score: 25,
          max_score: 25,
          status: "PASS",
          notes: "FIDO2 enabled.",
        },
        {
          name: "Endpoint Detection & Response (EDR)",
          category: "Security Controls",
          score: 20,
          max_score: 20,
          status: "PASS",
          notes: "CrowdStrike active.",
        },
      ],
    },
  };

  it("renders composite score gauge and factors breakdown", () => {
    render(
      <AuthProvider>
        <RiskScoringBreakdown submission={mockSub} />
      </AuthProvider>,
    );

    expect(
      screen.getByText(/Rules-Based Risk Scoring Engine/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/85/i)).toBeInTheDocument();
    expect(screen.getByText(/LOW RISK/i)).toBeInTheDocument();
    expect(
      screen.getByText(/MFA Enforcement across All Endpoints/i),
    ).toBeInTheDocument();
  });
});
