import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginForm from "./LoginForm";

describe("LoginForm Component", () => {
  it("renders login form inputs and test credentials info", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByText(/Test account:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("test@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Sign In/i }),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with user inputs when submitted", () => {
    const handleSubmit = vi.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    const submitButton = screen.getByRole("button", { name: /Sign In/i });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "test@example.com",
        password: "testpassword",
      }),
    );
  });

  it("displays error message when error prop is provided", () => {
    render(
      <LoginForm onSubmit={vi.fn()} error="Invalid banking credentials" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid banking credentials",
    );
  });
});
