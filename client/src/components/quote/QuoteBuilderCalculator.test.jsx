import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import QuoteBuilderCalculator from "./QuoteBuilderCalculator";

const mockSubmission = {
  id: "sub-test-1",
  submissionNumber: "SUB-TEST-1",
  insuredName: "Apex Cybernetics",
  lineOfBusiness: "Cyber Risk",
  policyLimit: 10000000,
  grossPremium: 150000,
  managerApproved: false,
};

describe("QuoteBuilderCalculator component", () => {
  it("renders pricing calculator with participation sliders", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <QuoteBuilderCalculator submission={mockSubmission} />
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Reinsurance Pricing & Participation Calculator/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Facultative Share Offered \(%\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Ceding Commission \(%\)/i)).toBeInTheDocument();
  });
});
