import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import KPIHeaderStrip from "./KPIHeaderStrip";

describe("KPIHeaderStrip Component", () => {
  it("renders default KPI metric cards", () => {
    render(<KPIHeaderStrip />);
    expect(screen.getByText(/Sales per Linear Ft/i)).toBeInTheDocument();
    expect(screen.getByText(/Private Brand %/i)).toBeInTheDocument();
    expect(screen.getByText(/In-Stock Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Shelf Capacity/i)).toBeInTheDocument();
  });

  it("renders custom array KPI data correctly", () => {
    const customKPIs = [
      {
        id: "kpi-1",
        metric_name: "Custom Sales",
        metric_value: 500,
        unit: "$",
        status_text: "+10% target",
      },
      {
        id: "kpi-2",
        metric_name: "Custom PB",
        metric_value: 30,
        unit: "%",
        status_text: "Goal: 30%",
      },
    ];

    render(<KPIHeaderStrip kpiData={customKPIs} />);
    expect(screen.getByText("Custom Sales")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
    expect(screen.getByText("Custom PB")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("renders loading state without throwing", () => {
    const { container } = render(<KPIHeaderStrip loading={true} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });
});
