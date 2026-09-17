import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import App from "../App";
import * as api from "../services/api";

vi.mock("../services/api");

describe("App root dashboard integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    api.getKpis.mockResolvedValue({
      sales_per_linear_foot: 164.2,
      private_brand_percentage: 34.8,
      in_stock_rate: 96.8,
      shelf_capacity: 88.5,
      cluster_code: "STV-CLUSTER",
      cluster_name: "Small Town Value Cluster",
      total_linear_feet: 120,
      used_linear_feet: 106.2,
      total_skus_count: 18,
    });

    api.getSkus.mockResolvedValue({
      items: [
        {
          id: "1",
          sku_code: "SKU-001",
          name: "Clover Valley Potato Chips 10oz",
          subcategory: "Salty Snacks",
          brand_tier: "Private Brand",
          sales_per_lin_ft: 185.2,
          margin_pct: 38.5,
          weekly_unit_velocity: 48.0,
          in_stock_pct: 98.2,
          shelf_linear_ft: 4.0,
          status_badge: "GROW",
        },
      ],
      total: 1,
      skip: 0,
      limit: 100,
    });

    api.getScenarios.mockResolvedValue({
      scenarios: [
        {
          id: "1",
          code: "balanced",
          name: "Balanced",
          description:
            "Optimal mix of margin growth and private brand expansion.",
          is_default: true,
          projected_sales_delta_pct: 4.2,
          projected_pb_share_pct: 2.1,
          projected_in_stock_pct: 0.4,
          projected_capacity_pct: 1.5,
        },
      ],
    });

    api.evaluateScenario.mockResolvedValue({
      scenario_code: "balanced",
      scenario_name: "Balanced Strategy",
      projected_impact: {
        sales_delta_pct: 4.2,
        pb_share_pct: 2.1,
        in_stock_pct: 0.4,
        capacity_pct: 1.5,
        projected_sales_per_linear_foot: 171.1,
        baseline_sales_per_linear_foot: 164.2,
        projected_margin_pct: 35.8,
      },
      action_summary: {
        grow_count: 4,
        maintain_count: 8,
        swap_count: 2,
        reduce_count: 2,
        total_actions: 16,
      },
      guardrail_checks: [
        {
          rule_key: "min_margin",
          rule_name: "Gross Margin >= 28%",
          threshold_value: 28.0,
          comparison_operator: ">=",
          actual_value: 35.8,
          status: "PASSED",
        },
      ],
      is_submittable: true,
    });
  });

  it("mounts and renders the main header, KPI section, and scenario cards", async () => {
    render(<App />);

    expect(
      screen.getByText(/Dollar General \| Merchandising Assortment Advisor/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Clover Valley Potato Chips 10oz"),
      ).toBeInTheDocument();
      expect(screen.getByText("Balanced Strategy")).toBeInTheDocument();
    });
  });
});
