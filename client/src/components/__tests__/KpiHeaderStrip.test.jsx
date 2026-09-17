import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import KpiHeaderStrip from "../KpiHeaderStrip";

describe("KpiHeaderStrip component", () => {
  const mockKpis = {
    sales_per_linear_foot: 164.2,
    private_brand_percentage: 34.8,
    in_stock_rate: 96.8,
    shelf_capacity: 88.5,
    cluster_code: "STV-CLUSTER",
    cluster_name: "Small Town Value Cluster",
    total_linear_feet: 120,
    used_linear_feet: 106.2,
    total_skus_count: 18,
  };

  it("renders correctly with KPI values", () => {
    render(<KpiHeaderStrip kpis={mockKpis} loading={false} error={null} />);

    expect(screen.getByText(/Sales per Linear Foot/i)).toBeInTheDocument();
    expect(screen.getByText("$164.20")).toBeInTheDocument();
    expect(screen.getByText(/Private Brand Share/i)).toBeInTheDocument();
    expect(screen.getByText("34.8%")).toBeInTheDocument();
    expect(screen.getByText(/In-Stock Rate/i)).toBeInTheDocument();
    expect(screen.getByText("96.8%")).toBeInTheDocument();
    expect(screen.getByText(/Shelf Capacity Utilization/i)).toBeInTheDocument();
    expect(screen.getByText("88.5%")).toBeInTheDocument();
  });

  it("renders loading skeleton when loading is true", () => {
    const { container } = render(
      <KpiHeaderStrip kpis={null} loading={true} error={null} />,
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error message when error is provided", () => {
    render(
      <KpiHeaderStrip kpis={null} loading={false} error="Network timeout" />,
    );
    expect(
      screen.getByText(/Failed to load cluster KPI metrics/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
  });
});
