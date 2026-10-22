import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import { SubmissionProvider } from "../../context/SubmissionContext";
import UnderwriterQueueTable from "./UnderwriterQueueTable";

describe("UnderwriterQueueTable component", () => {
  it("renders queue filters and summary status tabs", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SubmissionProvider>
            <UnderwriterQueueTable />
          </SubmissionProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(
      screen.getByPlaceholderText(/Search by insured, ID, cedent/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Active Queue/i)).toBeInTheDocument();
  });
});
