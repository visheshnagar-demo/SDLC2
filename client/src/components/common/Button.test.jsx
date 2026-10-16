import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button Component", () => {
  it("renders button with label and responds to clicks", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit Request</Button>);

    const btn = screen.getByRole("button", { name: /Submit Request/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders loading spinner and disables button when isLoading is true", () => {
    render(<Button isLoading>Processing</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
  });
});
