import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CarrierIntakeForm from "../CarrierIntakeForm";
import api from "../../services/api";

vi.mock("../../services/api", () => ({
  default: {
    createSubmission: vi.fn(),
  },
  api: {
    createSubmission: vi.fn(),
  },
}));

describe("CarrierIntakeForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders intake form with default fields correctly", () => {
    render(<CarrierIntakeForm />);

    expect(
      screen.getByText(/Facultative Reinsurance Placement Intake/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Cyber Risk/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Directors & Officers \(D&O\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/Apex Global Financial Corp/i),
    ).toBeInTheDocument();
  });

  it("allows toggling between Cyber and D&O risk types", () => {
    render(<CarrierIntakeForm />);

    // Initially Cyber risk profile section is shown
    expect(
      screen.getByText(/Cybersecurity Posture & Controls/i),
    ).toBeInTheDocument();

    // Click on D&O card heading
    const dAndOHeading = screen.getByRole("heading", {
      name: /Directors & Officers \(D&O\)/i,
    });
    fireEvent.click(dAndOHeading);

    // D&O controls should now appear
    expect(
      screen.getByText(/Corporate Governance & D&O Disclosures/i),
    ).toBeInTheDocument();
  });

  it("renders documentation checklist with attach/detach toggles", () => {
    render(<CarrierIntakeForm />);

    expect(
      screen.getByText(/Underwriting Documentation Checklist/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 YEAR LOSS RUNS/i)).toBeInTheDocument();
  });

  it("submits facultative request and triggers api.createSubmission", async () => {
    const mockCreated = {
      id: "sub-test-123",
      tracking_number: "FAC-2026-CY-TEST",
      insured_name: "Apex Global Financial Corp",
      risk_type: "CYBER",
      requested_reinsurance_limit: 5000000,
      status: "PENDING_REVIEW",
    };

    api.createSubmission.mockResolvedValueOnce(mockCreated);
    const successCallback = vi.fn();

    render(<CarrierIntakeForm onSubmissionSuccess={successCallback} />);

    const submitBtn = screen.getByRole("button", {
      name: /Submit Facultative Request/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createSubmission).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText(/Facultative Reinsurance Submission Received/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/FAC-2026-CY-TEST/i)).toBeInTheDocument();
      expect(successCallback).toHaveBeenCalledWith(mockCreated);
    });
  });
});
