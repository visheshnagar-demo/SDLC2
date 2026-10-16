import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Badge } from "./Badge";

describe("Badge component", () => {
  it("renders badge label correctly", () => {
    render(<Badge variant="high">HIGH RISK</Badge>);
    expect(screen.getByText("HIGH RISK")).toBeInTheDocument();
  });

  it("renders status variants", () => {
    render(<Badge variant="quoted">QUOTED</Badge>);
    expect(screen.getByText("QUOTED")).toBeInTheDocument();
  });
});
