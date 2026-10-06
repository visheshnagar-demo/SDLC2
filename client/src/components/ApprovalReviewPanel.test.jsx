import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ApprovalReviewPanel from "./ApprovalReviewPanel";

describe("ApprovalReviewPanel Component", () => {
  it("renders review panel heading, selected scenario badge and guardrails", () => {
    render(<ApprovalReviewPanel selectedScenario="Balanced" />);
    expect(screen.getByText("Approval Review Panel")).toBeInTheDocument();
    expect(
      screen.getByText(/Selected Scenario: Balanced/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Private Brand Target Met/i)).toBeInTheDocument();
    expect(screen.getByText(/Shelf Capacity Compliant/i)).toBeInTheDocument();
    expect(screen.getByText(/In-Stock SLA Met/i)).toBeInTheDocument();
  });

  it("calls onSubmit when Submit Assortment Plan button is clicked", () => {
    const handleSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        selectedScenario="Balanced"
        onSubmit={handleSubmit}
        isSubmitting={false}
      />,
    );

    const submitBtn = screen.getByRole("button", {
      name: /Submit Assortment Plan/i,
    });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables submit button and shows loading state during submission", () => {
    render(
      <ApprovalReviewPanel selectedScenario="Balanced" isSubmitting={true} />,
    );
    const submitBtn = screen.getByRole("button", {
      name: /Submitting Plan.../i,
    });
    expect(submitBtn).toBeDisabled();
  });
});
