import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App.jsx";

describe("Gen Re Quote-To-Bind App Component", () => {
  it("renders the header with brand and active case information", async () => {
    render(<App />);

    expect(screen.getByText("GEN RE")).toBeInTheDocument();
    expect(screen.getByText("Quote-to-Bind")).toBeInTheDocument();
    expect(
      screen.getByText(/10-Minute Executive Demonstration/i),
    ).toBeInTheDocument();
  });

  it("renders the 12-stage workflow stepper", async () => {
    render(<App />);

    expect(
      screen.getByText(/End-to-End QTB Lifecycle Pipeline/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Cedent Submission/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Contract Handoff/i).length).toBeGreaterThan(0);
  });

  it("renders the left navigation workspaces", async () => {
    render(<App />);

    expect(screen.getByText(/Executive Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Submission Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Extracted Data Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Underwriting & Risk View/i)).toBeInTheDocument();
    expect(screen.getByText(/Actuarial Pricing Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Quote Builder & Terms/i)).toBeInTheDocument();
    expect(screen.getByText(/Approval & Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/Bind Readiness & Handoff/i)).toBeInTheDocument();
  });

  it("allows switching views via left navigation", async () => {
    render(<App />);

    const pricingBtn = screen.getByText("Actuarial Pricing Studio");
    fireEvent.click(pricingBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Actuarial Loss Modeling & Rate Optimization/i),
      ).toBeInTheDocument();
    });
  });

  it("allows opening the agent reasoning console", async () => {
    render(<App />);

    const consoleBtn = screen.getByText("Agent Console");
    fireEvent.click(consoleBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Master Orchestrator • Agent Reasoning Stream/i),
      ).toBeInTheDocument();
    });
  });
});
