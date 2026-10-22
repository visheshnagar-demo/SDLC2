import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import StageStepper from "./StageStepper";

describe("StageStepper Component", () => {
  const dummyProject = {
    id: "proj-123",
    status: "READY_FOR_DESIGN",
  };

  it("renders all 5 SDLC stages", () => {
    render(
      <StageStepper
        activeStage="requirements"
        onSelectStage={vi.fn()}
        project={dummyProject}
      />,
    );

    expect(screen.getByText("Requirements")).toBeInTheDocument();
    expect(screen.getByText("Architecture & Design")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Automated QA")).toBeInTheDocument();
    expect(screen.getByText("Cloud Deployment")).toBeInTheDocument();
  });

  it("triggers onSelectStage callback when clicked", () => {
    const handleSelect = vi.fn();
    render(
      <StageStepper
        activeStage="requirements"
        onSelectStage={handleSelect}
        project={dummyProject}
      />,
    );

    fireEvent.click(screen.getByText("Development"));
    expect(handleSelect).toHaveBeenCalledWith("development");
  });
});
