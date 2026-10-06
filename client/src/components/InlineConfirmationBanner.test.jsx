import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import InlineConfirmationBanner from "./InlineConfirmationBanner";

describe("InlineConfirmationBanner Component", () => {
  it("renders confirmation text with audit ID", () => {
    render(<InlineConfirmationBanner auditId="AT-2026-89412" />);
    expect(
      screen.getByText(
        /Assortment Update Submitted Successfully. Audit Trail ID: #AT-2026-89412/i,
      ),
    ).toBeInTheDocument();
  });

  it("triggers onDismiss when close button is clicked", () => {
    const handleDismiss = vi.fn();
    render(
      <InlineConfirmationBanner auditId="AT-12345" onDismiss={handleDismiss} />,
    );

    const closeBtn = screen.getByRole("button", { name: /Dismiss banner/i });
    fireEvent.click(closeBtn);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
