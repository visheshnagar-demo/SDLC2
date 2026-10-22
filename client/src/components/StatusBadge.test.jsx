import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "./StatusBadge";

describe("StatusBadge Component", () => {
  it("renders default status badge properly", () => {
    render(<StatusBadge status="NOT_STARTED" />);
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    expect(screen.getByText("Not Started")).toBeInTheDocument();
  });

  it("renders READY_FOR_DESIGN status", () => {
    render(<StatusBadge status="READY_FOR_DESIGN" />);
    expect(screen.getByText("Ready for Design")).toBeInTheDocument();
  });

  it("renders QA_PASSED status", () => {
    render(<StatusBadge status="QA_PASSED" />);
    expect(screen.getByText("QA Passed")).toBeInTheDocument();
  });

  it("renders DEPLOYED_SUCCESS status", () => {
    render(<StatusBadge status="DEPLOYED_SUCCESS" />);
    expect(screen.getByText("Deployed (Live)")).toBeInTheDocument();
  });
});
