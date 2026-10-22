import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DevelopmentStage from "./DevelopmentStage";

describe("DevelopmentStage Component", () => {
  const dummyProject = {
    id: "proj-123",
    status: "DESIGN_APPROVED",
    repository_url: "https://github.com/visheshnagar-demo/SDLC2",
    target_branch: "staging/ISSUE-SCRUM-462",
  };

  it("renders repository configuration and sync button", () => {
    render(
      <DevelopmentStage project={dummyProject} onProjectUpdated={vi.fn()} />,
    );

    expect(
      screen.getByText(
        /Stage 3: Code Development & Repository Synchronization/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sync Repository Commits/i }),
    ).toBeInTheDocument();
  });

  it("displays staging branch name and commit logs", () => {
    render(
      <DevelopmentStage project={dummyProject} onProjectUpdated={vi.fn()} />,
    );

    expect(screen.getByText("staging/ISSUE-SCRUM-462")).toBeInTheDocument();
    expect(screen.getByText("Synchronized Git Commits")).toBeInTheDocument();
  });
});
