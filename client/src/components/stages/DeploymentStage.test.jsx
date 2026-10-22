import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DeploymentStage from "./DeploymentStage";

describe("DeploymentStage Component", () => {
  const dummyProjectUnlocked = {
    id: "proj-123",
    status: "QA_PASSED",
  };

  it("renders deployment stage and live log console", () => {
    render(
      <DeploymentStage
        project={dummyProjectUnlocked}
        onProjectUpdated={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Stage 5: Cloud Deployment & Health Monitoring/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Trigger Deployment Pipeline/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Live Deployment Stream Logs/i),
    ).toBeInTheDocument();
  });

  it("shows locked gate when QA has not passed", () => {
    const dummyProjectLocked = {
      id: "proj-123",
      status: "DEVELOPMENT_COMPLETED",
    };

    render(
      <DeploymentStage
        project={dummyProjectLocked}
        onProjectUpdated={vi.fn()}
      />,
    );

    expect(screen.getByText(/Deployment Gate Locked/i)).toBeInTheDocument();
  });
});
