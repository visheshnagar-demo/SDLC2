import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import CarrierSubmissionForm from "./CarrierSubmissionForm";

describe("CarrierSubmissionForm Component", () => {
  it("renders form fields with default values", () => {
    render(
      <BrowserRouter>
        <CarrierSubmissionForm />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Submit Facultative Reinsurance Request/i),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Travelers Casualty/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Apex HealthTech/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Facultative Request/i }),
    ).toBeInTheDocument();
  });

  it("switches risk category when clicking D&O button", () => {
    render(
      <BrowserRouter>
        <CarrierSubmissionForm />
      </BrowserRouter>,
    );

    const doButton = screen.getByRole("button", {
      name: /Directors & Officers/i,
    });
    fireEvent.click(doButton);
    expect(
      screen.getByText(/Audited Financials & Board Disclosures/i),
    ).toBeInTheDocument();
  });
});
