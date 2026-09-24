import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import InlineConfirmationBanner from "../components/InlineConfirmationBanner";

const sampleResult = {
  submission_id: "sub-101",
  audit_reference: "AUD-2026-9942",
  submitted_at: "2026-05-18T10:15:00Z",
  submitted_by_user: "catman.snacks@dollargeneral.local",
  target_cluster: "Small Town Value Cluster",
  scenario_type: "Balanced Scenario",
  guardrail_status: "PASSED",
  checksum: "sha256:8f4b2a991c08d4e7f2b5a123c8901ef45bc7982a",
  sku_action_summary: {
    add_count: 5,
    keep_count: 30,
    swap_count: 5,
    remove_count: 2,
  },
};

describe("InlineConfirmationBanner Component", () => {
  it("renders confirmation modal with audit reference and metadata", () => {
    const handleDismiss = vi.fn();
    render(
      <InlineConfirmationBanner
        submissionResult={sampleResult}
        onDismiss={handleDismiss}
      />,
    );

    expect(
      screen.getByText(/Assortment Plan Submitted Successfully/i),
    ).toBeInTheDocument();
    expect(screen.getByText("AUD-2026-9942")).toBeInTheDocument();
    expect(
      screen.getByText("catman.snacks@dollargeneral.local"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Done \/ Return to Dashboard/i }),
    ).toBeInTheDocument();
  });

  it("triggers onDismiss when close button is clicked", () => {
    const handleDismiss = vi.fn();
    render(
      <InlineConfirmationBanner
        submissionResult={sampleResult}
        onDismiss={handleDismiss}
      />,
    );

    const closeBtn = screen.getByRole("button", {
      name: /Done \/ Return to Dashboard/i,
    });
    fireEvent.click(closeBtn);

    expect(handleDismiss).toHaveBeenCalled();
  });
});
