import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ItemizedFactorBreakdown from "./ItemizedFactorBreakdown";

describe("ItemizedFactorBreakdown", () => {
  it("renders placeholder message when quote is null", () => {
    render(<ItemizedFactorBreakdown quote={null} />);
    expect(
      screen.getByText(/Factor breakdown will appear here/i),
    ).toBeInTheDocument();
  });

  it("renders itemized factors with positive and negative amounts correctly", () => {
    const mockQuote = {
      base_premium: 500,
      total_premium: 1200,
      factors: [
        {
          factor_name: "Base Tariff Premium",
          description: "Standard baseline motor liability tariff",
          amount: 500,
          factor_type: "base",
        },
        {
          factor_name: "Vehicle Value Loading (1.2%)",
          description: "Asset value replacement risk loading",
          amount: 300,
          factor_type: "loading",
        },
        {
          factor_name: "Driving Experience Discount (5 yrs)",
          description: "Discount for experienced driver",
          amount: -100,
          factor_type: "discount",
        },
      ],
    };

    render(<ItemizedFactorBreakdown quote={mockQuote} />);

    expect(
      screen.getByText("Itemized Factor Price Breakdown"),
    ).toBeInTheDocument();
    expect(screen.getByText("Base Tariff Premium")).toBeInTheDocument();
    expect(
      screen.getByText("Vehicle Value Loading (1.2%)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Driving Experience Discount (5 yrs)"),
    ).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
    expect(screen.getByText("+$300.00")).toBeInTheDocument();
    expect(screen.getByText("-$100.00")).toBeInTheDocument();
  });
});
