import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SubmissionIntakeForm from "./SubmissionIntakeForm";

describe("SubmissionIntakeForm Component", () => {
  it("renders intake form with default fields", () => {
    render(<SubmissionIntakeForm onSubmit={vi.fn()} />);
    expect(screen.getAllByText(/Ceding Insurer/i).length).toBeGreaterThan(0);
    expect(
      screen.getByDisplayValue(/Nexus Health Systems Inc./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Submit Risk for Underwriting Review/i,
      }),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with form data when submitted", () => {
    const handleSubmit = vi.fn();
    render(<SubmissionIntakeForm onSubmit={handleSubmit} />);
    const submitBtn = screen.getByRole("button", {
      name: /Submit Risk for Underwriting Review/i,
    });
    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        insured_name: "Nexus Health Systems Inc.",
        line_of_business: "CYBER",
        policy_limit: 10000000,
        attachment_point: 2000000,
      }),
    );
  });
});
