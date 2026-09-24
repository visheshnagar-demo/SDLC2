import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel";

const selectedScenario = {
  id: "scen-2",
  scenario_type: "BALANCED",
  name: "Balanced Scenario",
  description: "Optimal balance",
  projected_sales_delta_pct: 5.8,
  projected_pb_shift_pct: 3.2,
  projected_space_util_pct: 88.5,
  guardrails: { overall_status: "PASSED" },
  sku_actions: { add_count: 5, keep_count: 30, swap_count: 5, remove_count: 2 },
};

describe("ApprovalReviewPanel Component", () => {
  it("renders review panel with guardrails and submit button", () => {
    const handleSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        selectedScenario={selectedScenario}
        onSubmit={handleSubmit}
        isSubmitting={false}
        submitError={null}
      />,
    );

    expect(
      screen.getByText(/Assortment Approval & Guardrail Review/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Assortment Plan/i }),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with appropriate payload", () => {
    const handleSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        selectedScenario={selectedScenario}
        onSubmit={handleSubmit}
        isSubmitting={false}
        submitError={null}
      />,
    );

    const submitBtn = screen.getByRole("button", {
      name: /Submit Assortment Plan/i,
    });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        scenario_id: "scen-2",
        scenario_type: "BALANCED",
      }),
    );
  });
});
