import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import QuotingForm from "./QuotingForm.jsx";

describe("QuotingForm Component", () => {
  it("renders quoting form inputs and pricing elements", () => {
    render(<QuotingForm />);

    // Check main elements
    expect(
      screen.getByText(/Reinsurance Submission & Pricing Calculator/i),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/Apex Global Assurance Corp/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Generate Synthetic Quote/i)).toBeInTheDocument();
  });

  it("renders structure type options", () => {
    render(<QuotingForm />);
    expect(screen.getByText(/Excess of Loss \(XOL\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Quota Share \(QS\)/i)).toBeInTheDocument();
  });
});
