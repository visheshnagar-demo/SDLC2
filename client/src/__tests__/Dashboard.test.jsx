import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  getKpis: vi.fn(),
  getSkus: vi.fn(),
  calculateScenarioImpact: vi.fn(),
  submitAssortmentApproval: vi.fn(),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.getKpis.mockResolvedValue({
      cluster_id: "small_town_value",
      sales_per_linear_ft: 185.5,
      sales_per_linear_ft_formatted: "$185.50 / ft",
      private_brand_percentage: 28.5,
      private_brand_percentage_formatted: "28.5%",
      instock_rate: 96.2,
      instock_rate_formatted: "96.2%",
      shelf_capacity_used_ft: 120,
      shelf_capacity_total_ft: 120,
      shelf_capacity_percentage: 100,
      shelf_capacity_formatted: "120 ft / 120 ft (100% Capacity)",
    });

    api.getSkus.mockResolvedValue([
      {
        id: "1",
        sku_code: "SKU-8842",
        product_name: "Clover Valley Potato Chips 10oz",
        sub_category: "Salty Snacks",
        sales_velocity: 4.8,
        sales_per_linear_ft: 210.0,
        linear_ft_required: 4.0,
        is_private_brand: true,
        status_badge: "GROW",
        instock_rate: 97.5,
      },
    ]);

    api.calculateScenarioImpact.mockResolvedValue({
      scenario_key: "balanced",
      projected_sales_lift_pct: 3.2,
      projected_sales_per_linear_ft: 191.44,
      projected_pb_share_pct: 30.0,
      projected_instock_rate_pct: 96.5,
      projected_shelf_capacity_pct: 100.0,
      sku_action_summary: {
        add_count: 2,
        keep_count: 14,
        swap_count: 3,
        remove_count: 1,
      },
      guardrails: [
        {
          name: "Minimum Private Brand % Target",
          target: ">= 25%",
          current_value: "30.0%",
          status: "PASS",
        },
        {
          name: "Shelf Capacity Ceiling",
          target: "<= 100%",
          current_value: "100.0%",
          status: "PASS",
        },
        {
          name: "Minimum In-Stock Threshold",
          target: ">= 95%",
          current_value: "96.5%",
          status: "PASS",
        },
      ],
      can_submit: true,
    });
  });

  it("renders the main consolidated canvas with header and sub-sections", async () => {
    render(<Dashboard />);

    expect(screen.getByText("Cluster Assortment Advisor")).toBeInTheDocument();
    expect(screen.getAllByText(/Small Town Value/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText("SKU-8842")).toBeInTheDocument();
      expect(screen.getByText("$185.50 / ft")).toBeInTheDocument();
      expect(screen.getByTestId("approval-review-panel")).toBeInTheDocument();
    });
  });
});
