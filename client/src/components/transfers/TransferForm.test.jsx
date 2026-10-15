import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TransferForm from "./TransferForm";

describe("TransferForm Component", () => {
  const mockAccounts = [
    {
      id: "1",
      accountNumber: "ACC-1001",
      type: "CHECKING",
      balance: 5000.0,
      currency: "USD",
    },
    {
      id: "2",
      accountNumber: "ACC-2002",
      type: "SAVINGS",
      balance: 12500.0,
      currency: "USD",
    },
  ];

  it("renders form inputs correctly", () => {
    render(<TransferForm accounts={mockAccounts} onSubmit={vi.fn()} />);
    expect(screen.getByText(/Transfer Configuration/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. ACC-2002/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Proceed to Transfer/i }),
    ).toBeInTheDocument();
  });

  it("shows insufficient funds alert when amount exceeds balance", () => {
    render(<TransferForm accounts={mockAccounts} onSubmit={vi.fn()} />);

    const amountInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(amountInput, { target: { value: "999999" } });

    expect(screen.getByText(/Insufficient funds/i)).toBeInTheDocument();
  });

  it("submits valid transfer payload", () => {
    const handleSubmit = vi.fn();
    render(<TransferForm accounts={mockAccounts} onSubmit={handleSubmit} />);

    const destInput = screen.getByPlaceholderText(/e.g. ACC-2002/i);
    const amountInput = screen.getByPlaceholderText("0.00");

    fireEvent.change(destInput, { target: { value: "ACC-2002" } });
    fireEvent.change(amountInput, { target: { value: "250.00" } });

    const submitBtn = screen.getByRole("button", {
      name: /Proceed to Transfer/i,
    });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationAccountNumber: "ACC-2002",
        amount: 250.0,
      }),
    );
  });
});
