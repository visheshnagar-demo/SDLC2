import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import ScenarioSelector from "./ScenarioSelector";

describe("ScenarioSelector Component", () => {
  it("renders all three scenario cards", () => {
    render(<ScenarioSelector selectedScenario="Balanced" />);
    expect(screen.getByText("Conservative")).toBeInTheDocument();
    expect(screen.getByText("Balanced")).toBeInTheDocument();
    expect(screen.getByText("Aggressive")).toBeInTheDocument();
  });

  it("indicates pre-selected / selected scenario", () => {
    render(<ScenarioSelector selectedScenario="Balanced" />);
    expect(screen.getByText(/Pre-Selected/i)).toBeInTheDocument();
  });

  it("triggers onSelectScenario when a scenario is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <ScenarioSelector
        selectedScenario="Balanced"
        onSelectScenario={handleSelect}
      />,
    );

    const aggressiveCard = screen.getByText("Aggressive");
    fireEvent.click(aggressiveCard);

    expect(handleSelect).toHaveBeenCalledWith("Aggressive");
  });
});
