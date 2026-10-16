import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DecisionActionModal from "../DecisionActionModal";

describe("DecisionActionModal", () => {
  const mockSubmission = {
    id: "sub-test-123",
    insured_name: "Nexus Healthcare Inc.",
    risk_type: "CYBER",
    requested_limit: 10000000,
    attachment_point: 2500000,
  };

  it("renders modal when open with quote options", () => {
    render(
      <DecisionActionModal
        isOpen={true}
        onClose={vi.fn()}
        submission={mockSubmission}
        onDecisionRecorded={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Record Underwriting Decision"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Issue Binding Quote")[0]).toBeInTheDocument();
    expect(screen.getByText("Decline Submission")).toBeInTheDocument();
    expect(screen.getByText("Binding Quote Terms")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <DecisionActionModal
        isOpen={false}
        onClose={vi.fn()}
        submission={mockSubmission}
        onDecisionRecorded={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
