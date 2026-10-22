import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TestingStage from "./TestingStage";

describe("TestingStage Component", () => {
  const dummyProject = {
    id: "proj-123",
    status: "DEVELOPMENT_COMPLETED",
  };

  it("renders testing stage heading and metric cards", () => {
    render(<TestingStage project={dummyProject} onProjectUpdated={vi.fn()} />);

    expect(
      screen.getByText(
        /Stage 4: Automated Test Suite Execution & QA Dashboard/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total Test Cases/i)).toBeInTheDocument();
    expect(screen.getByText(/Passed Tests/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Execute QA Test Suite/i }),
    ).toBeInTheDocument();
  });
});
