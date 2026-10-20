import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("renders application navigation and layout without crashing", () => {
    render(<App />);
    expect(screen.getAllByText(/Gen Re/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Documents & Ingestion")).toBeInTheDocument();
  });
});
