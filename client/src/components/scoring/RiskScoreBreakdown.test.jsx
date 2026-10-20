import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RiskScoreBreakdown from "./RiskScoreBreakdown";

describe("RiskScoreBreakdown Component", () => {
  it("renders composite score and breakdown items", () => {
    const mockScore = {
      total_score: 82,
      risk_tier: "LOW RISK / PREFERRED",
      breakdown: [
        {
          name: "Multi-Factor Authentication (MFA) Enforcement",
          category: "Cyber Controls",
          points: 20,
          maxPoints: 20,
          description: "Enforced across all accounts",
        },
      ],
    };

    render(
      <RiskScoreBreakdown
        scoreData={mockScore}
        submission={{ insured_name: "Nexus Health" }}
      />,
    );

    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("LOW RISK / PREFERRED")).toBeInTheDocument();
    expect(
      screen.getByText(/Multi-Factor Authentication/i),
    ).toBeInTheDocument();
  });
});
