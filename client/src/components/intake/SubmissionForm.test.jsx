import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { SubmissionProvider } from "../../context/SubmissionContext";
import SubmissionForm from "./SubmissionForm";

describe("SubmissionForm component", () => {
  it("renders intake form with essential input fields", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SubmissionProvider>
            <SubmissionForm />
          </SubmissionProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Facultative Reinsurance Submission Intake/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Apex Cybernetics Corp/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Submit Risk for Underwriter Review/i),
    ).toBeInTheDocument();
  });
});
