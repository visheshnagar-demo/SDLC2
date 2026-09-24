import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KPIHeaderStrip from "../components/KPIHeaderStrip";

describe("KPIHeaderStrip Component", () => {
  it("renders all 4 KPI cards with metric labels", () => {
    const sampleKpis = {
      sales_per_linear_foot: 142.5,
      sales_delta_pct: 4.2,
      private_brand_percentage: 28.5,
      in_stock_rate_percentage: 96.2,
      shelf_capacity_utilization_percentage: 88.0,
    };

    render(<KPIHeaderStrip kpis={sampleKpis} isLoading={false} />);

    expect(screen.getByText(/Sales per Linear Ft/i)).toBeInTheDocument();
    expect(screen.getByText(/Private Brand Share/i)).toBeInTheDocument();
    expect(screen.getByText(/In-Stock Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Shelf Capacity Utilization/i)).toBeInTheDocument();
    expect(screen.getByText("$142.50")).toBeInTheDocument();
    expect(screen.getByText("28.5%")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    const { container } = render(<KPIHeaderStrip isLoading={true} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });
});
