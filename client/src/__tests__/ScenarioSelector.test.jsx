import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScenarioSelector from "../components/ScenarioSelector";

describe("ScenarioSelector", () => {
  it("renders all three scenario cards with Conservative, Balanced, Aggressive", () => {
    render(
      <ScenarioSelector
        selectedScenario="balanced"
        onSelectScenario={() => {}}
      />,
    );
    expect(
      screen.getByTestId("scenario-card-conservative"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("scenario-card-balanced")).toBeInTheDocument();
    expect(screen.getByTestId("scenario-card-aggressive")).toBeInTheDocument();
  });

  it("triggers onSelectScenario when a scenario card is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <ScenarioSelector
        selectedScenario="balanced"
        onSelectScenario={handleSelect}
      />,
    );

    const aggressiveCard = screen.getByTestId("scenario-card-aggressive");
    fireEvent.click(aggressiveCard);

    expect(handleSelect).toHaveBeenCalledWith("aggressive");
  });

  it("shows active indicator for selected scenario", () => {
    render(
      <ScenarioSelector
        selectedScenario="conservative"
        onSelectScenario={() => {}}
      />,
    );
    const conservativeCard = screen.getByTestId("scenario-card-conservative");
    expect(conservativeCard).toHaveTextContent("Active Scenario");
  });
});
