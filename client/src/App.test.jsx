import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import App from "./App";
import * as api from "./services/api";

vi.mock("./services/api", () => ({
  fetchKPIs: vi.fn(),
  fetchSKUs: vi.fn(),
  calculateScenario: vi.fn(),
  submitAssortmentPlan: vi.fn(),
  default: {
    fetchKPIs: vi.fn(),
    fetchSKUs: vi.fn(),
    calculateScenario: vi.fn(),
    submitAssortmentPlan: vi.fn(),
  },
}));

describe("App Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchKPIs.mockResolvedValue([
      {
        id: "1",
        metric_name: "Sales per Linear Ft",
        metric_value: 428.5,
        unit: "$",
        status_text: "+8.2% vs target",
      },
    ]);
    api.fetchSKUs.mockResolvedValue([
      {
        id: "1",
        sku_id: "SKU-10842",
        name: "DG Clover Valley Potato Chips 10oz",
        category: "Chips",
        sales: 14250,
        movement: 4200,
        margin_percentage: 38.5,
        velocity: 1.8,
        action: "GROW",
      },
    ]);
    api.calculateScenario.mockResolvedValue({
      scenario_type: "Balanced",
      projected_sales_increase_pct: 7.8,
      private_brand_change_pct: 1.5,
      shelf_utilization_pct: 95.0,
      sku_action_summary: {
        add_private_brands: 3,
        keep_core: 12,
        swap_items: 2,
        reduce_items: 1,
      },
    });
    api.submitAssortmentPlan.mockResolvedValue({
      audit_id: "AT-2026-89412",
      message:
        "Assortment Update Submitted Successfully. Audit Trail ID: #AT-2026-89412. Changes logged to central planogram repository.",
      submission_timestamp: "2026-10-06T12:00:00Z",
    });
  });

  it("renders the complete DG Cluster Assortment Advisor dashboard", async () => {
    render(<App />);

    expect(screen.getByText(/DOLLAR GENERAL/i)).toBeInTheDocument();
    expect(
      screen.getByText(/DG Cluster Assortment Advisor/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Sales per Linear Ft/i)).toBeInTheDocument();
      expect(screen.getByText("SKU-10842")).toBeInTheDocument();
    });

    expect(screen.getByText("Conservative")).toBeInTheDocument();
    expect(screen.getByText("Balanced")).toBeInTheDocument();
    expect(screen.getByText("Aggressive")).toBeInTheDocument();
    expect(screen.getByText("Approval Review Panel")).toBeInTheDocument();
  });

  it("handles scenario selection and submits assortment plan successfully", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("SKU-10842")).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole("button", {
      name: /Submit Assortment Plan/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.submitAssortmentPlan).toHaveBeenCalledTimes(1);
      expect(
        screen.getByTestId("inline-confirmation-banner"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Audit Trail ID: #AT-2026-89412/i),
      ).toBeInTheDocument();
    });
  });
});
