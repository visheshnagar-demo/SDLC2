import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import QuoteBuilderCalculator from "./QuoteBuilderCalculator";

describe("QuoteBuilderCalculator Component", () => {
  it("renders terms calculator and subjectivities checklist", () => {
    const mockSub = {
      id: "SUB-8841",
      policy_limit: 10000000,
      proposed_premium: 350000,
    };

    render(
      <QuoteBuilderCalculator submission={mockSub} onSaveQuote={vi.fn()} />,
    );

    expect(
      screen.getByText(/Facultative Terms & Pricing Waterfall/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Net Reinsurance Premium/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /Generate & Issue Quote/i }),
    ).toBeInTheDocument();
  });

  it("triggers onSaveQuote callback with calculated values", () => {
    const handleSave = vi.fn();
    const mockSub = {
      id: "SUB-8841",
      policy_limit: 10000000,
      proposed_premium: 350000,
    };

    render(
      <QuoteBuilderCalculator submission={mockSub} onSaveQuote={handleSave} />,
    );
    const issueBtn = screen.getByRole("button", {
      name: /Generate & Issue Quote/i,
    });
    fireEvent.click(issueBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        share_offered_pct: 50,
        ceding_commission_pct: 20,
        reinsurance_premium: 140000,
      }),
    );
  });
});
