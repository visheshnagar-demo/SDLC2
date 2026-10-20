import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import DashboardPage from "./DashboardPage";

// Mock api calls
vi.mock("../services/api", () => ({
  api: {
    getDocuments: vi.fn().mockResolvedValue([
      {
        id: "doc-test-1",
        file_name: "Property_Cat_Treaty_2026.pdf",
        file_type: "PDF",
        status: "COMPLETED",
        composite_risk_score: 68.4,
      },
    ]),
    triggerAnalysis: vi.fn().mockResolvedValue({ id: "job-123" }),
  },
}));

describe("DashboardPage Component", () => {
  it("renders metric cards and treaty table", async () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Active Treaties/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Composite Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Flagged Non-Std Clauses/i)).toBeInTheDocument();
    expect(screen.getByText(/Agent Jobs Completed/i)).toBeInTheDocument();
  });
});
