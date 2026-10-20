import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DecisionPanel from "./DecisionPanel.jsx";

describe("DecisionPanel Component", () => {
  it("renders underwriting authority options and decision CTA", () => {
    render(<DecisionPanel riskId="risk-cat-apex-001" />);

    expect(
      screen.getByText(/Underwriting Authority & Decision Workbench/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Authorize & Approve/i)).toBeInTheDocument();
    expect(screen.getByText(/Refer to Committee/i)).toBeInTheDocument();
    expect(screen.getByText(/Decline Treaty/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Decision/i }),
    ).toBeInTheDocument();
  });
});
