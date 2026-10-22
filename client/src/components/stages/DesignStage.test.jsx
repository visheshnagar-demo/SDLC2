import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DesignStage from "./DesignStage";

describe("DesignStage Component", () => {
  const dummyProject = {
    id: "proj-123",
    status: "READY_FOR_DESIGN",
  };

  it("renders stage heading and generation button", () => {
    render(<DesignStage project={dummyProject} onProjectUpdated={vi.fn()} />);

    expect(
      screen.getByText(/Stage 2: Architecture & Design Document Generation/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Generate HLD Specification/i }),
    ).toBeInTheDocument();
  });

  it("displays system components overview", () => {
    render(<DesignStage project={dummyProject} onProjectUpdated={vi.fn()} />);

    expect(screen.getByText("SDLC Orchestration Engine")).toBeInTheDocument();
    expect(
      screen.getByText("Database Schema (JPA / PostgreSQL)"),
    ).toBeInTheDocument();
  });
});
