import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { RiskScoreBreakdownCard } from "./RiskScoreBreakdownCard";

describe("RiskScoreBreakdownCard", () => {
  it("renders score and risk tier correctly", () => {
    const mockBreakdowns = [
      {
        rule_key: "PRIOR_CLAIMS",
        rule_name: "Prior Loss Severity",
        score_delta: 20,
        rationale: "Ransomware loss incurred in past 2 years.",
      },
    ];

    render(
      <RiskScoreBreakdownCard
        score={85}
        tier="HIGH"
        breakdowns={mockBreakdowns}
        riskType="CYBER"
      />,
    );

    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("HIGH Risk Tier")).toBeInTheDocument();
    expect(screen.getByText("Prior Loss Severity")).toBeInTheDocument();
    expect(screen.getByText("+20 pts")).toBeInTheDocument();
  });
});
