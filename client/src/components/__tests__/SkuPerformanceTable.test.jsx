import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import SkuPerformanceTable from "../SkuPerformanceTable";

describe("SkuPerformanceTable component", () => {
  const mockSkus = [
    {
      id: "1",
      sku_code: "SKU-001",
      name: "Clover Valley Potato Chips 10oz",
      subcategory: "Salty Snacks",
      brand_tier: "Private Brand",
      sales_per_lin_ft: 185.2,
      margin_pct: 38.5,
      weekly_unit_velocity: 48.0,
      in_stock_pct: 98.2,
      shelf_linear_ft: 4.0,
      status_badge: "GROW",
    },
    {
      id: "2",
      sku_code: "SKU-002",
      name: "Lay's Classic Potato Chips 8oz",
      subcategory: "Salty Snacks",
      brand_tier: "National Brand",
      sales_per_lin_ft: 210.0,
      margin_pct: 30.5,
      weekly_unit_velocity: 65.0,
      in_stock_pct: 97.0,
      shelf_linear_ft: 6.0,
      status_badge: "MAINTAIN",
    },
    {
      id: "3",
      sku_code: "SKU-003",
      name: "Brand X Pretzel Twists 16oz",
      subcategory: "Salty Snacks",
      brand_tier: "National Brand",
      sales_per_lin_ft: 65.0,
      margin_pct: 28.0,
      weekly_unit_velocity: 12.0,
      in_stock_pct: 95.0,
      shelf_linear_ft: 3.0,
      status_badge: "SWAP",
    },
    {
      id: "4",
      sku_code: "SKU-004",
      name: "Slow-Moving Hard Candy Assortment 12oz",
      subcategory: "Candy & Sweet",
      brand_tier: "National Brand",
      sales_per_lin_ft: 42.0,
      margin_pct: 28.0,
      weekly_unit_velocity: 8.0,
      in_stock_pct: 95.0,
      shelf_linear_ft: 2.5,
      status_badge: "REDUCE",
    },
  ];

  it("renders SKU items and status badges properly", () => {
    render(
      <SkuPerformanceTable skus={mockSkus} loading={false} error={null} />,
    );

    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lay's Classic Potato Chips 8oz"),
    ).toBeInTheDocument();
    expect(screen.getByText("Brand X Pretzel Twists 16oz")).toBeInTheDocument();
    expect(
      screen.getByText("Slow-Moving Hard Candy Assortment 12oz"),
    ).toBeInTheDocument();

    // Check status badges
    expect(screen.getAllByText("GROW").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("MAINTAIN").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("SWAP").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("REDUCE").length).toBeGreaterThanOrEqual(1);
  });

  it("filters SKUs when search input is typed", () => {
    render(
      <SkuPerformanceTable skus={mockSkus} loading={false} error={null} />,
    );

    const searchInput = screen.getByPlaceholderText(/Search SKU name/i);
    fireEvent.change(searchInput, { target: { value: "Clover Valley" } });

    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Lay's Classic Potato Chips 8oz"),
    ).not.toBeInTheDocument();
  });
});
