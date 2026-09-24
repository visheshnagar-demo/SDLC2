import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SKUPerformanceTable from "../components/SKUPerformanceTable";

const mockSkus = [
  {
    id: "sku-1",
    sku_code: "SNK-CV-101",
    product_name: "Clover Valley Potato Chips 10oz",
    brand_name: "Clover Valley",
    is_private_brand: true,
    sub_category: "Chips & Crisps",
    sales_per_linear_ft: 188.4,
    linear_feet_allocated: 3.0,
    in_stock_rate: 98.2,
    status_badge: "GROW",
  },
  {
    id: "sku-2",
    sku_code: "SNK-LAY-202",
    product_name: "Lay's Classic Chips 8oz",
    brand_name: "Lay's",
    is_private_brand: false,
    sub_category: "Chips & Crisps",
    sales_per_linear_ft: 165.2,
    linear_feet_allocated: 3.5,
    in_stock_rate: 97.0,
    status_badge: "MAINTAIN",
  },
];

describe("SKUPerformanceTable Component", () => {
  it("renders table headers and SKU rows", () => {
    render(<SKUPerformanceTable skus={mockSkus} isLoading={false} />);

    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(screen.getByText("Lay's Classic Chips 8oz")).toBeInTheDocument();
    expect(screen.getAllByText("GROW").length).toBeGreaterThan(0);
    expect(screen.getAllByText("MAINTAIN").length).toBeGreaterThan(0);
  });

  it("filters SKUs when searching", () => {
    render(<SKUPerformanceTable skus={mockSkus} isLoading={false} />);

    const searchInput = screen.getByPlaceholderText(/Search SKU code/i);
    fireEvent.change(searchInput, { target: { value: "Clover" } });

    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Lay's Classic Chips 8oz"),
    ).not.toBeInTheDocument();
  });
});
