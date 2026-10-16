import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "./Badge";

describe("Badge Component", () => {
  it("renders children text correctly", () => {
    render(<Badge>Active Status</Badge>);
    expect(screen.getByText("Active Status")).toBeInTheDocument();
  });

  it("renders with cyber variant styling", () => {
    render(<Badge variant="cyber">Cyber Risk</Badge>);
    const badge = screen.getByText("Cyber Risk");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-indigo-700");
  });

  it("renders with danger / high priority variant", () => {
    render(<Badge variant="high">HIGH PRIORITY</Badge>);
    const badge = screen.getByText("HIGH PRIORITY");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-rose-700");
  });
});
