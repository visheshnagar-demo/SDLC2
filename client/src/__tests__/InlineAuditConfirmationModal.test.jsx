import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import InlineAuditConfirmationModal from "../components/InlineAuditConfirmationModal";

describe("InlineAuditConfirmationModal", () => {
  const mockApproval = {
    approval_id: "app-12345",
    audit_reference_id: "AUD-2026-STV-9941",
    cluster_id: "small_town_value",
    approved_scenario: "balanced",
    status: "APPROVED",
    approved_at: "2026-10-07T12:00:00Z",
    manager_user_id: "MGR-5821",
    manager_email: "manager@dollargeneral.com",
    sku_action_metrics: {
      add_count: 2,
      keep_count: 14,
      swap_count: 3,
      remove_count: 1,
    },
  };

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <InlineAuditConfirmationModal
        isOpen={false}
        approvalResult={mockApproval}
        onClose={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders audit reference ID and approved status when open", () => {
    render(
      <InlineAuditConfirmationModal
        isOpen={true}
        approvalResult={mockApproval}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("AUD-2026-STV-9941")).toBeInTheDocument();
    expect(
      screen.getByText(/Assortment Approval Confirmed & Locked/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/STATUS: APPROVED/i)).toBeInTheDocument();
    expect(screen.getByText(/MGR-5821/i)).toBeInTheDocument();
  });

  it("calls onClose when close button or acknowledge is clicked", () => {
    const handleClose = vi.fn();
    render(
      <InlineAuditConfirmationModal
        isOpen={true}
        approvalResult={mockApproval}
        onClose={handleClose}
      />,
    );

    const ackBtn = screen.getByRole("button", {
      name: /Acknowledge & Return to Dashboard/i,
    });
    fireEvent.click(ackBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
