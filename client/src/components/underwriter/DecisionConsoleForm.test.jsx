import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DecisionConsoleForm } from "./DecisionConsoleForm";

describe("DecisionConsoleForm", () => {
  it("renders quote and decline action buttons", () => {
    render(
      <DecisionConsoleForm submissionId="test-id-123" sumInsured={10000000} />,
    );

    expect(screen.getByText(/Issue Binding Quote/i)).toBeInTheDocument();
    expect(screen.getByText(/Decline Request/i)).toBeInTheDocument();
  });
});
