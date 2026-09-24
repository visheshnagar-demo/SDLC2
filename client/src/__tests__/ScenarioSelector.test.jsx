import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ScenarioSelector from "../components/ScenarioSelector";

const mockScenarios = [
  {
    id: "scen-1",
    scenario_type: "CONSERVATIVE",
    name: "Conservative Scenario",
    description: "Minimal risk",
    projected_sales_delta_pct: 2.1,
    projected_pb_shift_pct: 1.2,
    projected_space_util_pct: 84.5,
    guardrails: { overall_status: "PASSED" },
    sku_actions: {
      add_count: 2,
      keep_count: 35,
      swap_count: 2,
      remove_count: 1,
    },
  },
  {
    id: "scen-2",
    scenario_type: "BALANCED",
    name: "Balanced Scenario",
    description: "Optimal balance",
    projected_sales_delta_pct: 5.8,
    projected_pb_shift_pct: 3.2,
    projected_space_util_pct: 88.5,
    guardrails: { overall_status: "PASSED" },
    sku_actions: {
      add_count: 5,
      keep_count: 30,
      swap_count: 5,
      remove_count: 2,
    },
  },
];

describe("ScenarioSelector Component", () => {
  it("renders all scenario cards", () => {
    const handleSelect = vi.fn();
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenarioId="scen-2"
        onSelectScenario={handleSelect}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Conservative Scenario")).toBeInTheDocument();
    expect(screen.getByText("Balanced Scenario")).toBeInTheDocument();
    expect(screen.getByText("+5.8%")).toBeInTheDocument();
  });

  it("triggers onSelectScenario when clicked", () => {
    const handleSelect = vi.fn();
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        selectedScenarioId="scen-2"
        onSelectScenario={handleSelect}
        isLoading={false}
      />,
    );

    const conservativeCard = screen.getByText("Conservative Scenario");
    fireEvent.click(conservativeCard);

    expect(handleSelect).toHaveBeenCalledWith(mockScenarios[0]);
  });
});
