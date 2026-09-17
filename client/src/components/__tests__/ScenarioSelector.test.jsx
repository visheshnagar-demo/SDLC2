import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ScenarioSelector from "../ScenarioSelector";

describe("ScenarioSelector component", () => {
  const mockScenarios = [
    {
      id: "1",
      code: "conservative",
      name: "Conservative",
      description: "Low-risk adjustments focusing on core top velocity items.",
      is_default: false,
      projected_sales_delta_pct: 1.8,
      projected_pb_share_pct: 0.5,
      projected_in_stock_pct: 1.2,
      projected_capacity_pct: -2.0,
    },
    {
      id: "2",
      code: "balanced",
      name: "Balanced",
      description: "Optimal mix of margin growth and private brand expansion.",
      is_default: true,
      projected_sales_delta_pct: 4.2,
      projected_pb_share_pct: 2.1,
      projected_in_stock_pct: 0.4,
      projected_capacity_pct: 1.5,
    },
    {
      id: "3",
      code: "aggressive",
      name: "Aggressive",
      description:
        "High-growth strategy introducing margin-accretive private brands.",
      is_default: false,
      projected_sales_delta_pct: 8.5,
      projected_pb_share_pct: 4.5,
      projected_in_stock_pct: -1.0,
      projected_capacity_pct: 6.0,
    },
  ];

  it("renders all three scenario cards with projected metrics", () => {
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario="balanced"
        onSelectScenario={() => {}}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText("Conservative")).toBeInTheDocument();
    expect(screen.getByText("Balanced")).toBeInTheDocument();
    expect(screen.getByText("Aggressive")).toBeInTheDocument();
    expect(screen.getByText("+4.2%")).toBeInTheDocument();
    expect(screen.getByText("+8.5%")).toBeInTheDocument();
  });

  it("calls onSelectScenario when a scenario card is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenario="balanced"
        onSelectScenario={handleSelect}
        loading={false}
        error={null}
      />,
    );

    const aggressiveCard = screen.getByText("Aggressive");
    fireEvent.click(aggressiveCard);

    expect(handleSelect).toHaveBeenCalledWith("aggressive");
  });
});
