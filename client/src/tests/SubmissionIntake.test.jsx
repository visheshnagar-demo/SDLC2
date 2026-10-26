import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import SubmissionIntakeForm from "../components/submissions/SubmissionIntakeForm";

describe("SubmissionIntakeForm Component", () => {
  it("renders step 1 with insured entity and specialty lines fields", () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <SubmissionIntakeForm />
        </BrowserRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByText(/Facultative Risk Submission Intake/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Named Insured Entity/i)).toBeInTheDocument();
    expect(screen.getByText(/Specialty Line of Business/i)).toBeInTheDocument();
  });

  it("navigates from step 1 to step 2 when continue button is clicked", async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <SubmissionIntakeForm />
        </BrowserRouter>
      </AuthProvider>,
    );

    const continueBtn = screen.getByRole("button", {
      name: /Continue to Policy Bounds/i,
    });
    fireEvent.click(continueBtn);

    expect(
      await screen.findByText(/Policy Limit Requested/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Attachment Point/i).length).toBeGreaterThan(0);
  });
});
