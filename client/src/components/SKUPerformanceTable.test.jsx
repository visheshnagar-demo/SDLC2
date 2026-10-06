import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import SKUPerformanceTable from "./SKUPerformanceTable";

const mockSKUs = [
  {
    id: "1",
    sku_id: "SKU-10842",
    name: "DG Clover Valley Potato Chips 10oz",
    category: "Chips",
    sales: 14250,
    movement: 4200,
    margin_percentage: 38.5,
    velocity: 1.8,
    action: "GROW",
  },
  {
    id: "2",
    sku_id: "SKU-20911",
    name: "Brand X Crunchy Pretzels 12oz",
    category: "Pretzels",
    sales: 8100,
    movement: 1800,
    margin_percentage: 22.1,
    velocity: 0.9,
    action: "SWAP",
  },
];

describe("SKUPerformanceTable Component", () => {
  it("renders table headers and SKU items", () => {
    render(<SKUPerformanceTable skus={mockSKUs} />);
    expect(screen.getByText(/Snacks SKU Performance/i)).toBeInTheDocument();
    expect(screen.getByText("SKU-10842")).toBeInTheDocument();
    expect(
      screen.getByText("DG Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Brand X Crunchy Pretzels 12oz"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("GROW").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SWAP").length).toBeGreaterThan(0);
  });

  it("filters SKUs by search input", () => {
    render(<SKUPerformanceTable skus={mockSKUs} />);
    const searchInput = screen.getByPlaceholderText(/Search SKU or Name.../i);

    fireEvent.change(searchInput, { target: { value: "Pretzels" } });
    expect(
      screen.queryByText("DG Clover Valley Potato Chips 10oz"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Brand X Crunchy Pretzels 12oz"),
    ).toBeInTheDocument();
  });

  it("filters SKUs by action pill filter", () => {
    render(<SKUPerformanceTable skus={mockSKUs} />);
    const growFilterButton = screen.getByRole("button", { name: /^GROW$/i });

    fireEvent.click(growFilterButton);
    expect(
      screen.getByText("DG Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Brand X Crunchy Pretzels 12oz"),
    ).not.toBeInTheDocument();
  });
});
