import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KpiHeaderStrip from "../components/KpiHeaderStrip";

describe("KpiHeaderStrip", () => {
  it("renders loading skeleton when loading is true", () => {
    render(<KpiHeaderStrip loading={true} />);
    expect(screen.getByTestId("kpi-skeleton")).toBeInTheDocument();
  });

  it("renders error message when error is provided", () => {
    render(<KpiHeaderStrip error="Network failure" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network failure");
  });

  it("renders all 4 KPI cards when data is provided", () => {
    const mockKpiData = {
      cluster_id: "small_town_value",
      sales_per_linear_ft: 185.5,
      sales_per_linear_ft_formatted: "$185.50 / ft",
      private_brand_percentage: 28.5,
      private_brand_percentage_formatted: "28.5%",
      instock_rate: 96.2,
      instock_rate_formatted: "96.2%",
      shelf_capacity_used_ft: 120,
      shelf_capacity_total_ft: 120,
      shelf_capacity_percentage: 100,
      shelf_capacity_formatted: "120 ft / 120 ft (100% Capacity)",
    };

    render(<KpiHeaderStrip kpiData={mockKpiData} loading={false} />);

    expect(
      screen.getByTestId("kpi-card-sales-per-linear-ft"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("kpi-card-private-brand-pct"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-instock-rate")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-card-shelf-capacity")).toBeInTheDocument();

    expect(screen.getByText("$185.50 / ft")).toBeInTheDocument();
    expect(screen.getByText("28.5%")).toBeInTheDocument();
    expect(screen.getByText("96.2%")).toBeInTheDocument();
    expect(
      screen.getByText("120 ft / 120 ft (100% Capacity)"),
    ).toBeInTheDocument();
  });
});
