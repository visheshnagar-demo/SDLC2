import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button Component", () => {
  it("renders button with label", () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
  });

  it("triggers onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole("button", { name: /Click Me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button when loading or disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
