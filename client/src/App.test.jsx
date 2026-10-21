import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Smoke and Navigation Tests", () => {
  it("renders application brand title in navigation bar", () => {
    render(<App />);
    const brandElements = screen.getAllByText(/APEX RE/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it("renders primary navigation links", () => {
    render(<App />);
    const intakeLinks = screen.getAllByText(/Intake/i);
    expect(intakeLinks.length).toBeGreaterThan(0);
    const queueLinks = screen.getAllByText(/Queue/i);
    expect(queueLinks.length).toBeGreaterThan(0);
  });
});
