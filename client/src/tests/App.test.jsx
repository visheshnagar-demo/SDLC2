import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import App from "../App";

describe("App Root Integration", () => {
  it("renders application branding and header elements", () => {
    render(<App />);
    expect(screen.getAllByText(/ApexRe/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Facultative Underwriting Portal/i),
    ).toBeInTheDocument();
  });

  it("renders sidebar navigation links", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: /New Risk Intake/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Underwriter Queue/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Executive Analytics/i }),
    ).toBeInTheDocument();
  });
});
