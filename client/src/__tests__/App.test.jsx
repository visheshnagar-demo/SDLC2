import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("App Component", () => {
  it("renders the DG Cluster Assortment Advisor dashboard", () => {
    render(<App />);

    expect(
      screen.getAllByText(/Cluster Assortment Advisor/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Small Town Value Cluster/i).length,
    ).toBeGreaterThan(0);
  });
});
