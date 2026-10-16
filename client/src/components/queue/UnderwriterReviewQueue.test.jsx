import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import UnderwriterReviewQueue from "./UnderwriterReviewQueue";

describe("UnderwriterReviewQueue Component", () => {
  it("renders queue header and filter controls", async () => {
    render(
      <BrowserRouter>
        <UnderwriterReviewQueue />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Underwriter Review Queue/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search by Carrier/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total Submissions/i)).toBeInTheDocument();
  });
});
