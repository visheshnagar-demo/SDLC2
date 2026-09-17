import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ConfirmationModal from "../ConfirmationModal";

describe("ConfirmationModal component", () => {
  const mockPlan = {
    id: "plan-123",
    audit_id: "AUD-2026-98412",
    status: "APPROVED",
    submitted_by: "Category Manager - Snacks",
    timestamp: "2026-09-17T12:00:00Z",
    guardrail_status: "COMPLIANT",
    total_sku_actions: 16,
    audit_trail_summary: {
      action_breakdown: {
        GROW: 4,
        MAINTAIN: 8,
        SWAP: 2,
        REDUCE: 2,
      },
    },
  };

  it("renders modal with audit ID and status when open", () => {
    render(
      <ConfirmationModal isOpen={true} onClose={() => {}} plan={mockPlan} />,
    );

    expect(
      screen.getByText("Assortment Plan Submitted & Approved"),
    ).toBeInTheDocument();
    expect(screen.getByText("AUD-2026-98412")).toBeInTheDocument();
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
    expect(screen.getByText("COMPLIANT")).toBeInTheDocument();
    expect(screen.getByText("Category Manager - Snacks")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <ConfirmationModal isOpen={false} onClose={() => {}} plan={mockPlan} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("calls onClose when close button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <ConfirmationModal isOpen={true} onClose={handleClose} plan={mockPlan} />,
    );

    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
