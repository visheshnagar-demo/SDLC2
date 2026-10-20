import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import AnalysisDetailPage from "./AnalysisDetailPage";

vi.mock("../services/api", () => ({
  api: {
    getDocuments: vi.fn().mockResolvedValue([]),
    getAnalysisJob: vi.fn().mockResolvedValue({
      id: "job-123",
      composite_risk_score: 78.5,
      summary: "Property Treaty 2026",
    }),
    getClauseEvaluations: vi.fn().mockResolvedValue([
      {
        id: "cl-1",
        clause_title: "Net Retained Lines",
        is_standard: false,
        risk_severity: "HIGH",
      },
    ]),
    getAuditLogs: vi.fn().mockResolvedValue([]),
  },
}));

describe("AnalysisDetailPage Component", () => {
  it("renders composite risk score and clause evaluation sections", () => {
    render(
      <BrowserRouter>
        <AnalysisDetailPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Composite Risk Score/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Multi-Agent Execution Audit Trail/i),
    ).toBeInTheDocument();
  });
});
