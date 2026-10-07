import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SkuPerformanceTable from "../components/SkuPerformanceTable";

const mockSkus = [
  {
    id: "1",
    sku_code: "SKU-8842",
    product_name: "Clover Valley Potato Chips 10oz",
    sub_category: "Salty Snacks",
    sales_velocity: 4.8,
    sales_per_linear_ft: 210.0,
    linear_ft_required: 4.0,
    is_private_brand: true,
    status_badge: "GROW",
    instock_rate: 97.5,
  },
  {
    id: "2",
    sku_code: "SKU-1029",
    product_name: "Brand Name Tortilla Chips",
    sub_category: "Salty Snacks",
    sales_velocity: 2.1,
    sales_per_linear_ft: 140.0,
    linear_ft_required: 3.5,
    is_private_brand: false,
    status_badge: "SWAP",
    instock_rate: 94.0,
  },
  {
    id: "3",
    sku_code: "SKU-3321",
    product_name: "Clover Valley Pretzels 16oz",
    sub_category: "Salty Snacks",
    sales_velocity: 3.5,
    sales_per_linear_ft: 180.0,
    linear_ft_required: 3.0,
    is_private_brand: true,
    status_badge: "MAINTAIN",
    instock_rate: 98.0,
  },
  {
    id: "4",
    sku_code: "SKU-9901",
    product_name: "Slow Moving Popcorn",
    sub_category: "Specialty",
    sales_velocity: 0.8,
    sales_per_linear_ft: 65.0,
    linear_ft_required: 2.0,
    is_private_brand: false,
    status_badge: "REDUCE",
    instock_rate: 91.0,
  },
];

describe("SkuPerformanceTable", () => {
  it("renders table headers and SKU rows correctly", () => {
    render(<SkuPerformanceTable skus={mockSkus} loading={false} />);
    expect(screen.getByText("SKU-8842")).toBeInTheDocument();
    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(screen.getByText("GROW")).toBeInTheDocument();
    expect(screen.getByText("SWAP")).toBeInTheDocument();
    expect(screen.getByText("MAINTAIN")).toBeInTheDocument();
    expect(screen.getByText("REDUCE")).toBeInTheDocument();
  });

  it("filters SKUs when search input is typed", () => {
    render(<SkuPerformanceTable skus={mockSkus} loading={false} />);
    const searchInput = screen.getByPlaceholderText(/Search by SKU Code/i);
    fireEvent.change(searchInput, { target: { value: "Popcorn" } });

    expect(screen.getByText("Slow Moving Popcorn")).toBeInTheDocument();
    expect(
      screen.queryByText("Clover Valley Potato Chips 10oz"),
    ).not.toBeInTheDocument();
  });

  it("filters SKUs by status badge chip click", () => {
    render(<SkuPerformanceTable skus={mockSkus} loading={false} />);
    const growChip = screen.getByText(/GROW: 1/i);
    fireEvent.click(growChip);

    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Brand Name Tortilla Chips"),
    ).not.toBeInTheDocument();
  });
});
