import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CertificatePreview from "./CertificatePreview.jsx";

describe("CertificatePreview Component", () => {
  it("renders official reinsurance binder certificate details", () => {
    const mockBinder = {
      id: "bind-001",
      policyReferenceId: "GENRE-2026-POL-9921",
      insuredName: "Apex Global Assurance Corp",
      lineOfBusiness: "Property Catastrophe Excess of Loss",
      effectiveDate: "2026-07-01",
      expiryDate: "2027-06-30",
      grossPremium: 4250000,
      limit: 50000000,
      attachmentPoint: 10000000,
      boundBy: "Aarchi Jain, FCAS",
      status: "BOUND",
    };

    render(<CertificatePreview binderData={mockBinder} />);

    expect(
      screen.getByText(/Official Reinsurance Binder Certificate/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/GENRE-2026-POL-9921/i)).toBeInTheDocument();
    expect(screen.getByText(/CONFIRMED & BOUND/i)).toBeInTheDocument();
  });
});
