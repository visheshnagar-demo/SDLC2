import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { CarrierSubmissionForm } from "./CarrierSubmissionForm";

describe("CarrierSubmissionForm", () => {
  it("renders step 1 inputs and radio options", () => {
    render(
      <BrowserRouter>
        <CarrierSubmissionForm />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Step 1: Risk Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Cyber Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/Directors & Officers/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Insured Legal Entity Name/i),
    ).toBeInTheDocument();
  });
});
