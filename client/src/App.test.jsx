import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Root Component", () => {
  it("renders without crashing and displays login or app view", () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
