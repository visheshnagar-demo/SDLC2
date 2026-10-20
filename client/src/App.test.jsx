import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App.jsx";

describe("App Component", () => {
  it("renders application navigation and layout without crashing", () => {
    render(<App />);
    expect(screen.getByText(/Gen Re QTB/i)).toBeInTheDocument();
    expect(screen.getByText(/Quoting & Pricing/i)).toBeInTheDocument();
    expect(screen.getByText(/Risk Structuring/i)).toBeInTheDocument();
    expect(screen.getByText(/Policy Binding/i)).toBeInTheDocument();
  });
});
