import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";
import Badge from "./components/common/Badge";
import Button from "./components/common/Button";
import KpiCard from "./components/common/KpiCard";
import RiskScoringBreakdown from "./components/underwriting/RiskScoringBreakdown";
import ChecklistValidationPanel from "./components/underwriting/ChecklistValidationPanel";

// Mock API service calls to avoid real network traffic in unit tests
vi.mock("./services/api", () => ({
  default: {
    getSubmissions: vi.fn().mockResolvedValue([
      {
        id: "sub-test-01",
        insured_name: "Cyber Corp Test",
        carrier_name: "Test Carrier Mutual",
        risk_type: "Cyber",
        limit_requested: 5000000,
        attachment_point: 1000000,
        risk_score: 82,
        status: "In Review",
      },
    ]),
    getUnderwritingQueue: vi.fn().mockResolvedValue([
      {
        id: "sub-test-01",
        insured_name: "Cyber Corp Test",
        carrier_name: "Test Carrier Mutual",
        risk_type: "Cyber",
        limit_requested: 5000000,
        attachment_point: 1000000,
        risk_score: 82,
        status: "In Review",
      },
    ]),
    getScoreBreakdown: vi.fn().mockResolvedValue({
      submission_id: "sub-test-01",
      risk_score: 82,
      risk_tier: "Low Risk",
      scoring_factors: [],
    }),
    getChecklist: vi.fn().mockResolvedValue([]),
    createSubmission: vi.fn().mockResolvedValue({ id: "sub-new-123" }),
    recordQuoteDecision: vi.fn().mockResolvedValue({ status: "QUOTED" }),
    recordDeclineDecision: vi.fn().mockResolvedValue({ status: "DECLINED" }),
  },
  api: {
    getSubmissions: vi.fn().mockResolvedValue([]),
    getUnderwritingQueue: vi.fn().mockResolvedValue([]),
  },
}));

describe("Facultative Reinsurance Portal Frontend Suite", () => {
  it("renders application navigation and root shell without crashing", async () => {
    render(<App />);
    expect(screen.getByText(/AEGIS \/\/ RE/i)).toBeInTheDocument();
    expect(screen.getByText(/Underwriter Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Carrier Portal/i)).toBeInTheDocument();
  });

  it("renders Badge component with appropriate styling and text", () => {
    render(<Badge variant="cyber">Cyber Risk</Badge>);
    expect(screen.getByText("Cyber Risk")).toBeInTheDocument();
  });

  it("renders Button component and triggers onClick handler", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit Quote</Button>);
    const btn = screen.getByRole("button", { name: /Submit Quote/i });
    expect(btn).toBeInTheDocument();
    btn.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders KpiCard with title, value, and description", () => {
    render(
      <KpiCard
        title="Active Requests"
        value="142"
        description="Pending review items"
      />,
    );
    expect(screen.getByText("Active Requests")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
    expect(screen.getByText("Pending review items")).toBeInTheDocument();
  });

  it("renders RiskScoringBreakdown component with score gauge", () => {
    render(
      <RiskScoringBreakdown
        scoreData={{ risk_score: 78, risk_tier: "Low Risk" }}
        riskType="Cyber"
      />,
    );
    expect(
      screen.getByText(/Automated Risk Scoring Engine/i),
    ).toBeInTheDocument();
    expect(screen.getByText("78")).toBeInTheDocument();
  });

  it("renders ChecklistValidationPanel with missing document rules", () => {
    render(<ChecklistValidationPanel checklist={[]} riskType="Cyber" />);
    expect(
      screen.getByText(/Missing Information & Checklist Rules/i),
    ).toBeInTheDocument();
  });
});
