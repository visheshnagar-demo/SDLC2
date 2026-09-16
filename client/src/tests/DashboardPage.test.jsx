import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "../pages/DashboardPage";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  getClusterKpis: vi.fn(),
  getSkus: vi.fn(),
  getScenarios: vi.fn(),
  evaluateScenario: vi.fn(),
  submitPlan: vi.fn(),
  getAuditRecord: vi.fn(),
}));

describe("DashboardPage", () => {
  const mockKpis = {
    cluster_id: "STV-CLUSTER-01",
    cluster_name: "Small Town Value Cluster",
    category: "Snacks",
    sales_per_linear_ft: 125.0,
    sales_per_linear_ft_formatted: "$125.00/ft",
    private_brand_percentage: 32.0,
    in_stock_rate_percentage: 96.5,
    shelf_capacity_percentage: 88.0,
    updated_at: "2026-05-18T10:00:00Z",
  };

  const mockSkus = [
    {
      id: "sku-1",
      sku_code: "SNK-001",
      name: "DG Crave Potato Chips 10oz",
      brand_type: "PRIVATE_BRAND",
      weekly_sales_units: 450,
      sales_volume_usd: 1125.0,
      margin_percentage: 42.5,
      linear_space_inches: 12.0,
      recommended_action: "GROW",
      status_badge_color: "emerald",
    },
    {
      id: "sku-2",
      sku_code: "SNK-002",
      name: "Lay's Classic Potato Chips 8oz",
      brand_type: "NATIONAL_BRAND",
      weekly_sales_units: 620,
      sales_volume_usd: 2170.0,
      margin_percentage: 28.0,
      linear_space_inches: 18.0,
      recommended_action: "MAINTAIN",
      status_badge_color: "sky",
    },
  ];

  const mockScenarios = [
    {
      id: "sc-1",
      scenario_type: "CONSERVATIVE",
      scenario_name: "Conservative Strategy",
      description: "Preserves national brand staples.",
      is_default: false,
      sales_delta_percentage: 2.1,
      margin_delta_percentage: 1.4,
      private_brand_mix_delta: 1.2,
      shelf_capacity_projected_percentage: 84.5,
    },
    {
      id: "sc-2",
      scenario_type: "BALANCED",
      scenario_name: "Balanced Strategy",
      description: "Optimizes high-margin private brand Snacks.",
      is_default: true,
      sales_delta_percentage: 5.4,
      margin_delta_percentage: 3.8,
      private_brand_mix_delta: 3.5,
      shelf_capacity_projected_percentage: 87.2,
    },
    {
      id: "sc-3",
      scenario_type: "AGGRESSIVE",
      scenario_name: "Aggressive Strategy",
      description: "Maximizes Clover Valley & DG Crave shelf share.",
      is_default: false,
      sales_delta_percentage: 8.5,
      margin_delta_percentage: 6.2,
      private_brand_mix_delta: 5.8,
      shelf_capacity_projected_percentage: 91.0,
    },
  ];

  const mockEvaluation = {
    scenario_type: "BALANCED",
    scenario_name: "Balanced Strategy",
    projected_impact: {
      sales_delta_percentage: 5.4,
      margin_delta_percentage: 3.8,
      private_brand_mix_delta: 3.5,
      shelf_capacity_projected_percentage: 87.2,
    },
    sku_action_summary: {
      grow_count: 4,
      maintain_count: 4,
      swap_count: 3,
      reduce_count: 1,
      total_actions: 12,
    },
    guardrail_checks: [
      {
        name: "Minimum Margin Floor (>= 28.0%)",
        status: "PASSED",
        current_value: "36.3%",
        threshold: ">= 28.0%",
      },
      {
        name: "Private Brand Share Target (>= 30.0%)",
        status: "PASSED",
        current_value: "35.5%",
        threshold: ">= 30.0%",
      },
      {
        name: "Shelf Capacity Ceiling (<= 95.0%)",
        status: "PASSED",
        current_value: "87.2%",
        threshold: "<= 95.0%",
      },
    ],
    can_submit: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getClusterKpis.mockResolvedValue(mockKpis);
    api.getSkus.mockResolvedValue({ total_count: 2, skus: mockSkus });
    api.getScenarios.mockResolvedValue({
      total_count: 3,
      scenarios: mockScenarios,
    });
    api.evaluateScenario.mockResolvedValue(mockEvaluation);
  });

  it("renders dashboard title and header branding", async () => {
    render(<DashboardPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/Cluster Assortment Advisor/i);
    expect(screen.getAllByText(/Dollar General/i).length).toBeGreaterThan(0);
  });

  it("renders real-time KPI metrics in header strip", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("$125.00/ft")).toBeInTheDocument();
      expect(screen.getByText("32.0%")).toBeInTheDocument();
      expect(screen.getByText("96.5%")).toBeInTheDocument();
      expect(screen.getByText("88.0% utilized")).toBeInTheDocument();
    });
  });

  it("renders Snacks SKUs with performance metrics and status badges", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(
        screen.getByText("DG Crave Potato Chips 10oz"),
      ).toBeInTheDocument();
      expect(screen.getByText("SNK-001")).toBeInTheDocument();
      expect(
        screen.getByText("Lay's Classic Potato Chips 8oz"),
      ).toBeInTheDocument();
      expect(screen.getByText("SNK-002")).toBeInTheDocument();
    });
  });

  it("renders scenario selector cards with Balanced selected by default", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(screen.getByText("Conservative Strategy")).toBeInTheDocument();
      expect(screen.getByText("Balanced Strategy")).toBeInTheDocument();
      expect(screen.getByText("Aggressive Strategy")).toBeInTheDocument();
    });
  });

  it("updates scenario selection and review panel when clicking another card", async () => {
    api.evaluateScenario.mockResolvedValue({
      ...mockEvaluation,
      scenario_type: "AGGRESSIVE",
      scenario_name: "Aggressive Strategy",
      projected_impact: {
        sales_delta_percentage: 8.5,
        margin_delta_percentage: 6.2,
        private_brand_mix_delta: 5.8,
        shelf_capacity_projected_percentage: 91.0,
      },
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Aggressive Strategy")).toBeInTheDocument();
    });

    const aggressiveCard = screen.getByTestId("scenario-card-aggressive");
    fireEvent.click(aggressiveCard);

    await waitFor(() => {
      expect(api.evaluateScenario).toHaveBeenCalledWith(
        "AGGRESSIVE",
        "STV-CLUSTER-01",
      );
    });
  });

  it("submits plan and displays inline audit-trail confirmation", async () => {
    api.submitPlan.mockResolvedValue({
      audit_id: "AUD-2026-99482",
      submission_id: "SUB-99482",
      status: "APPROVED",
      cluster_id: "STV-CLUSTER-01",
      scenario_type: "BALANCED",
      sku_actions_committed: 12,
      guardrail_summary: "All 3 Guardrails Verified & Passed",
      submitted_by: "category_manager_dg@example.com",
      submitted_at: "2026-05-18T10:15:00Z",
      confirmation_message: "Assortment Plan Submitted Successfully!",
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Submit Assortment Plan/i }),
      ).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", {
      name: /Submit Assortment Plan/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const auditElements = screen.getAllByText("AUD-2026-99482");
      expect(auditElements.length).toBeGreaterThan(0);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
