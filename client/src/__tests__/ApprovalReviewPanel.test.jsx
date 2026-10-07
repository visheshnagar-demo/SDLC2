import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel";

describe("ApprovalReviewPanel", () => {
  const mockImpact = {
    scenario_key: "balanced",
    projected_sales_lift_pct: 3.2,
    projected_sales_per_linear_ft: 191.44,
    projected_pb_share_pct: 30.0,
    projected_instock_rate_pct: 96.5,
    projected_shelf_capacity_pct: 100.0,
    sku_action_summary: {
      add_count: 2,
      keep_count: 14,
      swap_count: 3,
      remove_count: 1,
    },
    guardrails: [
      {
        name: "Minimum Private Brand % Target",
        target: ">= 25%",
        current_value: "30.0%",
        status: "PASS",
      },
      {
        name: "Shelf Capacity Ceiling",
        target: "<= 100%",
        current_value: "100.0%",
        status: "PASS",
      },
      {
        name: "Minimum In-Stock Threshold",
        target: ">= 95%",
        current_value: "96.5%",
        status: "PASS",
      },
    ],
    can_submit: true,
  };

  it("renders guardrail checks with PASS status and impact metrics", () => {
    render(
      <ApprovalReviewPanel
        selectedScenario="balanced"
        impactData={mockImpact}
        onSubmitApproval={() => {}}
      />,
    );

    expect(screen.getByText(/Balanced Strategy/i)).toBeInTheDocument();
    expect(screen.getByText(/\+3.2%/i)).toBeInTheDocument();
    expect(screen.getAllByText("PASS").length).toBe(3);
    expect(
      screen.getByRole("button", { name: /Submit Approval/i }),
    ).not.toBeDisabled();
  });

  it("submits form with manager credentials when Submit Approval is clicked", () => {
    const handleSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        selectedScenario="balanced"
        impactData={mockImpact}
        onSubmitApproval={handleSubmit}
      />,
    );

    const submitBtn = screen.getByRole("button", { name: /Submit Approval/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster_id: "small_town_value",
        scenario_key: "balanced",
        manager_user_id: "MGR-5821",
        manager_email: "manager@dollargeneral.com",
      }),
    );
  });

  it("disables submit button when guardrails fail", () => {
    const failingImpact = {
      ...mockImpact,
      can_submit: false,
      guardrails: [
        {
          name: "Minimum Private Brand % Target",
          target: ">= 25%",
          current_value: "22.0%",
          status: "FAIL",
        },
        {
          name: "Shelf Capacity Ceiling",
          target: "<= 100%",
          current_value: "100.0%",
          status: "PASS",
        },
        {
          name: "Minimum In-Stock Threshold",
          target: ">= 95%",
          current_value: "96.5%",
          status: "PASS",
        },
      ],
    };

    render(
      <ApprovalReviewPanel
        selectedScenario="balanced"
        impactData={failingImpact}
        onSubmitApproval={() => {}}
      />,
    );

    expect(screen.getByText("FAIL")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Approval/i }),
    ).toBeDisabled();
  });
});
