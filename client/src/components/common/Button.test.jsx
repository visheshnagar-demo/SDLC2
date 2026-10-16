import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders button text correctly", () => {
    render(<Button>Submit Request</Button>);
    expect(
      screen.getByRole("button", { name: /Submit Request/i }),
    ).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(<Button disabled>Disabled Action</Button>);
    const btn = screen.getByRole("button", { name: /Disabled Action/i });
    expect(btn).toBeDisabled();
  });
});
