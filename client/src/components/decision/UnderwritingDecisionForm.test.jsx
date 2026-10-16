import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UnderwritingDecisionForm from "./UnderwritingDecisionForm";

describe("UnderwritingDecisionForm Component", () => {
  const mockSubmission = {
    id: "sub-1234",
    policy_limit_usd: 10000000,
    attachment_point_usd: 5000000,
  };

  it("renders quote option and form fields", () => {
    render(<UnderwritingDecisionForm submission={mockSubmission} />);

    expect(
      screen.getByText(/Underwriting Decision Module/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Issue Binding Quote/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Decline Submission/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Record Binding Quote Decision/i }),
    ).toBeInTheDocument();
  });

  it("switches to decline view when decline tab is clicked", () => {
    render(<UnderwritingDecisionForm submission={mockSubmission} />);

    const declineBtn = screen.getByRole("button", {
      name: /Decline Submission/i,
    });
    fireEvent.click(declineBtn);

    expect(screen.getByText(/Decline Reason Code/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Record Decline Decision/i }),
    ).toBeInTheDocument();
  });

  it("displays warning when quoting is gated by missing flags", () => {
    render(
      <UnderwritingDecisionForm
        submission={mockSubmission}
        hasMissingFlags={true}
      />,
    );

    expect(screen.getByText(/Quoting Restricted/i)).toBeInTheDocument();
  });
});
