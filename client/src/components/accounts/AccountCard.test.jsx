import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import AccountCard from "./AccountCard";

describe("AccountCard Component", () => {
  const mockAccount = {
    id: "acc-1",
    accountNumber: "ACC-1001",
    type: "CHECKING",
    balance: 5000.0,
    currency: "USD",
    status: "ACTIVE",
  };

  it("renders account details and balance properly", () => {
    render(
      <BrowserRouter>
        <AccountCard account={mockAccount} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/CHECKING ACCOUNT/i)).toBeInTheDocument();
    expect(screen.getByText("ACC-1001")).toBeInTheDocument();
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("triggers onSelect when statement button is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <BrowserRouter>
        <AccountCard account={mockAccount} onSelect={handleSelect} />
      </BrowserRouter>,
    );

    const btn = screen.getByRole("button", { name: /View Statement/i });
    fireEvent.click(btn);
    expect(handleSelect).toHaveBeenCalledWith(mockAccount);
  });
});
