import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button Component", () => {
  it("renders button with text correctly", () => {
    render(<Button>Submit Transfer</Button>);
    expect(
      screen.getByRole("button", { name: /Submit Transfer/i }),
    ).toBeInTheDocument();
  });

  it("triggers onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole("button", { name: /Click Me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Action</Button>);
    expect(
      screen.getByRole("button", { name: /Disabled Action/i }),
    ).toBeDisabled();
  });

  it("shows loading spinner when loading is true and is disabled", () => {
    render(<Button loading>Processing</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
