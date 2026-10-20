import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "./Badge";

describe("Badge Component", () => {
  it("renders children correctly", () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("applies variant styling", () => {
    const { container } = render(<Badge variant="success">Active</Badge>);
    expect(container.firstChild).toHaveClass("bg-emerald-100");
  });
});
