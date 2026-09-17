import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "../pages/Dashboard";
import KPIHeaderStrip from "../components/KPIHeaderStrip";
import ScenarioSelector from "../components/ScenarioSelector";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel";
import SKUPerformanceTable from "../components/SKUPerformanceTable";
import InlineConfirmation from "../components/InlineConfirmation";
import * as api from "../services/api";

const mockScenarios = {
  active_default: "balanced",
  scenarios: [
    {
      scenario_key: "conservative",
      display_name: "Conservative Growth",
      description:
        "Maintains high in-stock stability with minimal shelf swaps.",
      projected_sales_per_linear_ft: 440.0,
      projected_private_brand_pct: 26.0,
      projected_in_stock_rate_pct: 98.0,
      projected_shelf_capacity_pct: 90.0,
      action_counts: { GROW: 2, MAINTAIN: 18, SWAP: 1, REDUCE: 1 },
    },
    {
      scenario_key: "balanced",
      display_name: "Balanced Optimization",
      description:
        "Balances Private Brand growth with established national brands.",
      projected_sales_per_linear_ft: 465.5,
      projected_private_brand_pct: 31.5,
      projected_in_stock_rate_pct: 96.0,
      projected_shelf_capacity_pct: 92.5,
      action_counts: { GROW: 5, MAINTAIN: 12, SWAP: 3, REDUCE: 2 },
    },
    {
      scenario_key: "aggressive",
      display_name: "Aggressive PB Expansion",
      description: "Maximizes Clover Valley and private label margin gains.",
      projected_sales_per_linear_ft: 485.0,
      projected_private_brand_pct: 38.0,
      projected_in_stock_rate_pct: 94.5,
      projected_shelf_capacity_pct: 95.0,
      action_counts: { GROW: 8, MAINTAIN: 6, SWAP: 5, REDUCE: 3 },
    },
  ],
};

const mockSKUs = [
  {
    id: "sku-1",
    sku_code: "SNK-1001",
    product_name: "Clover Valley Potato Chips",
    category: "Potato Chips",
    weekly_sales: 1250.5,
    margin_pct: 36.5,
    shelf_space_ft: 3.5,
    status_badge: "GROW",
    is_private_brand: true,
  },
  {
    id: "sku-2",
    sku_code: "SNK-1002",
    product_name: "National Brand Tortilla Chips",
    category: "Tortilla Chips",
    weekly_sales: 980.0,
    margin_pct: 24.0,
    shelf_space_ft: 4.0,
    status_badge: "MAINTAIN",
    is_private_brand: false,
  },
  {
    id: "sku-3",
    sku_code: "SNK-1003",
    product_name: "Slow Mover Pretzel Bites",
    category: "Pretzels",
    weekly_sales: 210.0,
    margin_pct: 18.0,
    shelf_space_ft: 2.0,
    status_badge: "REDUCE",
    is_private_brand: false,
  },
];

const mockMetrics = {
  sales_per_linear_ft: 465.5,
  private_brand_pct: 31.5,
  in_stock_rate_pct: 96.0,
  shelf_capacity_pct: 92.5,
  is_projected: true,
};

describe("DG Cluster Assortment Advisor Dashboard Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "fetchScenarios").mockResolvedValue(mockScenarios);
    vi.spyOn(api, "fetchSKUs").mockResolvedValue(mockSKUs);
    vi.spyOn(api, "fetchMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(api, "fetchSubmissions").mockResolvedValue([]);
    vi.spyOn(api, "submitAssortmentPlan").mockResolvedValue({
      status: "SUCCESS",
      audit_confirmation_id: "AUD-2026-88123",
      submitted_at: "2026-05-18T14:30:00Z",
      scenario_name: "Balanced Optimization",
      user_id: "mgr_snack_001",
      guardrail_status: "PASSED",
      summary: {
        projected_sales_per_linear_ft: 465.5,
        projected_private_brand_pct: 31.5,
        total_skus_reviewed: 3,
      },
    });
  });

  it("renders Dashboard heading and core panels without throwing", async () => {
    render(<Dashboard />);

    expect(
      screen.getByText("DG Cluster Assortment Advisor"),
    ).toBeInTheDocument();
    expect(screen.getByText("Small Town Value Cluster")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Snacks SKU Performance Matrix"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Assortment Scenario Options"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Scenario Approval & Guardrail Review"),
      ).toBeInTheDocument();
    });
  });

  it("renders KPIHeaderStrip component with metric values", () => {
    render(
      <KPIHeaderStrip
        metrics={mockMetrics}
        loading={false}
        activeScenarioName="Balanced Optimization"
      />,
    );

    expect(screen.getByText(/Sales per Linear Foot/i)).toBeInTheDocument();
    expect(screen.getByText("$465.50 / ft")).toBeInTheDocument();
    expect(screen.getByText("31.5%")).toBeInTheDocument();
    expect(screen.getByText("96.0%")).toBeInTheDocument();
    expect(screen.getByText("92.5%")).toBeInTheDocument();
  });

  it("renders ScenarioSelector and triggers callback on option click", () => {
    const onSelect = vi.fn();
    render(
      <ScenarioSelector
        scenarios={mockScenarios}
        activeScenarioKey="balanced"
        onSelectScenario={onSelect}
        loading={false}
      />,
    );

    expect(screen.getByText("Balanced Optimization")).toBeInTheDocument();
    expect(screen.getByText("Conservative Growth")).toBeInTheDocument();
    expect(screen.getByText("Aggressive PB Expansion")).toBeInTheDocument();

    // Click on Aggressive scenario card
    fireEvent.click(screen.getByText("Aggressive PB Expansion"));
    expect(onSelect).toHaveBeenCalledWith("aggressive");
  });

  it("renders SKUPerformanceTable and allows filtering by search term", () => {
    render(<SKUPerformanceTable skus={mockSKUs} loading={false} />);

    expect(screen.getByText("Clover Valley Potato Chips")).toBeInTheDocument();
    expect(
      screen.getByText("National Brand Tortilla Chips"),
    ).toBeInTheDocument();
    expect(screen.getByText("Slow Mover Pretzel Bites")).toBeInTheDocument();

    // Filter by search
    const searchInput = screen.getByPlaceholderText(/Search SKU, product.../i);
    fireEvent.change(searchInput, { target: { value: "Pretzel" } });

    expect(screen.getByText("Slow Mover Pretzel Bites")).toBeInTheDocument();
    expect(
      screen.queryByText("Clover Valley Potato Chips"),
    ).not.toBeInTheDocument();
  });

  it("renders ApprovalReviewPanel and submits scenario plan", async () => {
    const onSubmit = vi.fn();
    render(
      <ApprovalReviewPanel
        activeScenario={mockScenarios.scenarios[1]}
        onSubmit={onSubmit}
        isSubmitting={false}
        submitError={null}
      />,
    );

    expect(
      screen.getByText("Scenario Approval & Guardrail Review"),
    ).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", {
      name: /Submit Assortment Plan/i,
    });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledWith({
      scenario_key: "balanced",
      user_id: "mgr_snack_001",
      justification_note: undefined,
    });
  });

  it("renders InlineConfirmation banner with audit confirmation details", () => {
    const onDismiss = vi.fn();
    const confirmationData = {
      audit_confirmation_id: "AUD-2026-88123",
      submitted_at: "2026-05-18T14:30:00Z",
      scenario_name: "Balanced Optimization",
      user_id: "mgr_snack_001",
      guardrail_status: "PASSED",
      summary: {
        projected_sales_per_linear_ft: 465.5,
        projected_private_brand_pct: 31.5,
        total_skus_reviewed: 3,
      },
    };

    render(
      <InlineConfirmation
        confirmationData={confirmationData}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText("AUD-2026-88123")).toBeInTheDocument();
    expect(
      screen.getByText(/Assortment Plan Successfully Submitted & Audited/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Guardrails: PASSED")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText(/Close confirmation banner/i);
    fireEvent.click(closeBtn);
    expect(onDismiss).toHaveBeenCalled();
  });
});
