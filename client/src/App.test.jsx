import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

describe("App Root Component", () => {
  it("renders application header and main navigation", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(
        /Facultative Reinsurance Submission & Underwriting Portal/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/New Risk Intake/i)).toBeInTheDocument();
    expect(screen.getByText(/Underwriter Queue/i)).toBeInTheDocument();
  });
});
