import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CarrierSubmissionWizard from "../CarrierSubmissionWizard";

describe("CarrierSubmissionWizard", () => {
  it("renders carrier and insured step fields correctly", () => {
    render(
      <MemoryRouter>
        <CarrierSubmissionWizard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Carrier & Insured Details")).toBeInTheDocument();
    expect(screen.getByText(/Submitting Carrier/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e.g. Acme Global Enterprises Inc./i),
    ).toBeInTheDocument();
    expect(screen.getByText("Next: Policy Structure")).toBeInTheDocument();
  });

  it("renders intake scanner feedback panel alongside wizard", () => {
    render(
      <MemoryRouter>
        <CarrierSubmissionWizard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Intake Scanner")).toBeInTheDocument();
    expect(screen.getByText("Estimated Risk Score")).toBeInTheDocument();
    expect(screen.getByText("Intake Completeness")).toBeInTheDocument();
  });
});
