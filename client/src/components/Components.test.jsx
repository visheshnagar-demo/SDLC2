import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SLABadge from "./SLABadge";
import CompletenessCheckBadge from "./CompletenessCheckBadge";
import RiskScoringBreakdown from "./RiskScoringBreakdown";
import InteractiveQuoteBuilder from "./InteractiveQuoteBuilder";

describe("SLABadge Component", () => {
  it("renders normal aging hours when under target", () => {
    render(<SLABadge hoursElapsed={12} status="In Review" />);
    expect(screen.getByText(/12h \/ 48h/i)).toBeInTheDocument();
  });

  it("renders breach warning when over 48 hours", () => {
    render(<SLABadge hoursElapsed={52} status="In Review" />);
    expect(screen.getByText(/52h \(SLA Breach\)/i)).toBeInTheDocument();
  });

  it("renders resolved status for terminal submission state", () => {
    render(<SLABadge hoursElapsed={24} status="Bound" />);
    expect(screen.getByText(/Resolved \(24h\)/i)).toBeInTheDocument();
  });
});

describe("CompletenessCheckBadge Component", () => {
  it("renders incomplete badge when mandatory documents are missing", () => {
    render(
      <CompletenessCheckBadge
        lineOfBusiness="Cyber Risk"
        documents={[{ doc_type: "application" }]}
        detailed={false}
      />,
    );
    expect(screen.getByText(/33% Complete/i)).toBeInTheDocument();
  });

  it("renders 100% complete badge when all mandatory documents are present", () => {
    render(
      <CompletenessCheckBadge
        lineOfBusiness="Cyber Risk"
        documents={[
          { doc_type: "application" },
          { doc_type: "loss_runs" },
          { doc_type: "security_controls" },
        ]}
        detailed={false}
      />,
    );
    expect(screen.getByText(/Docs Complete \(100%\)/i)).toBeInTheDocument();
  });
});

describe("RiskScoringBreakdown Component", () => {
  it("renders composite score and factor details", () => {
    const mockSubmission = {
      id: "sub-1",
      line_of_business: "Cyber Risk",
      risk_score: 85,
      risk_tier: "Low Risk",
      risk_factors: [
        { name: "MFA Enforced", impact: 20, category: "Technical Controls" },
      ],
    };

    render(<RiskScoringBreakdown submission={mockSubmission} />);
    expect(screen.getByText(/85 \/ 100 Points/i)).toBeInTheDocument();
    expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/MFA Enforced/i)).toBeInTheDocument();
  });
});

describe("InteractiveQuoteBuilder Component", () => {
  it("renders quote calculation inputs and pricing figures", () => {
    const mockSubmission = {
      id: "sub-1",
      gross_premium: 100000,
      policy_limit: 10000000,
    };

    render(<InteractiveQuoteBuilder submission={mockSubmission} />);
    expect(
      screen.getByText(/Interactive Facultative Quote Builder/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ceded Premium/i)).toBeInTheDocument();
    expect(screen.getByText(/Net Reinsurance Prem/i)).toBeInTheDocument();
  });
});
