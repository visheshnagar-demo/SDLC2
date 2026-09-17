import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ApprovalReviewPanel from "../ApprovalReviewPanel";

describe("ApprovalReviewPanel component", () => {
  const mockEvaluation = {
    scenario_code: "balanced",
    scenario_name: "Balanced Strategy",
    projected_impact: {
      sales_delta_pct: 4.2,
      pb_share_pct: 2.1,
      in_stock_pct: 0.4,
      capacity_pct: 1.5,
      projected_sales_per_linear_foot: 171.1,
      baseline_sales_per_linear_foot: 164.2,
      projected_margin_pct: 35.8,
    },
    action_summary: {
      grow_count: 4,
      maintain_count: 8,
      swap_count: 2,
      reduce_count: 2,
      total_actions: 16,
    },
    guardrail_checks: [
      {
        rule_key: "min_margin",
        rule_name: "Gross Margin >= 28%",
        threshold_value: 28.0,
        comparison_operator: ">=",
        actual_value: 35.8,
        status: "PASSED",
      },
      {
        rule_key: "min_pb_share",
        rule_name: "Private Brand Share >= 30%",
        threshold_value: 30.0,
        comparison_operator: ">=",
        actual_value: 36.9,
        status: "PASSED",
      },
    ],
    is_submittable: true,
  };

  it("renders projected impact, SKU action counts, and guardrail checklist", () => {
    render(
      <ApprovalReviewPanel
        evaluation={mockEvaluation}
        evaluating={false}
        error={null}
        onSubmitPlan={() => {}}
        submitting={false}
        submitError={null}
      />,
    );

    expect(screen.getByText(/Projected Impact Summary/i)).toBeInTheDocument();
    expect(screen.getByText("$171.10")).toBeInTheDocument();
    expect(screen.getAllByText(/35\.8%/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Proposed SKU Action List/i)).toBeInTheDocument();
    expect(screen.getByText("Gross Margin >= 28%")).toBeInTheDocument();
    expect(screen.getByText("Private Brand Share >= 30%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit & Execute Assortment Plan/i }),
    ).toBeInTheDocument();
  });

  it("calls onSubmitPlan with expected payload when submit button is clicked", () => {
    const handleSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        evaluation={mockEvaluation}
        evaluating={false}
        error={null}
        onSubmitPlan={handleSubmit}
        submitting={false}
        submitError={null}
      />,
    );

    const submitBtn = screen.getByRole("button", {
      name: /Submit & Execute Assortment Plan/i,
    });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        scenario_code: "balanced",
        cluster_code: "STV-CLUSTER",
      }),
    );
  });
});
