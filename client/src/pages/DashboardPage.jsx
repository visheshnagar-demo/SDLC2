import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import KPIHeaderStrip from "../components/KPIHeaderStrip";
import SKUPerformanceTable from "../components/SKUPerformanceTable";
import ScenarioSelector from "../components/ScenarioSelector";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel";
import InlineConfirmationBanner from "../components/InlineConfirmationBanner";
import {
  getKPIs,
  getSKUs,
  getScenarios,
  submitAssortmentPlan,
} from "../services/api";
import { Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

// Default / fallback dataset adhering to requirements
const DEFAULT_KPIS = {
  sales_per_linear_foot: 142.5,
  sales_delta_pct: 4.2,
  private_brand_percentage: 28.5,
  in_stock_rate_percentage: 96.2,
  shelf_capacity_utilization_percentage: 88.0,
  cluster_name: "Small Town Value Cluster",
  category: "Snacks",
};

const DEFAULT_SKUS = [
  {
    id: "sku-001",
    sku_code: "SNK-CV-101",
    product_name: "Clover Valley Classic Potato Chips 10oz",
    brand_name: "Clover Valley",
    is_private_brand: true,
    sub_category: "Chips & Crisps",
    sales_per_linear_ft: 188.4,
    linear_feet_allocated: 3.0,
    in_stock_rate: 98.2,
    status_badge: "GROW",
    action_recommendation:
      "Expand facing +0.5 ft to capture high margin volume.",
  },
  {
    id: "sku-002",
    sku_code: "SNK-LAY-202",
    product_name: "Lay's Classic Potato Chips 8oz",
    brand_name: "Lay's",
    is_private_brand: false,
    sub_category: "Chips & Crisps",
    sales_per_linear_ft: 165.2,
    linear_feet_allocated: 3.5,
    in_stock_rate: 97.0,
    status_badge: "MAINTAIN",
    action_recommendation:
      "Maintain primary anchor facing for national brand shoppers.",
  },
  {
    id: "sku-003",
    sku_code: "SNK-CV-103",
    product_name: "Clover Valley Sour Cream & Onion Chips 9.5oz",
    brand_name: "Clover Valley",
    is_private_brand: true,
    sub_category: "Chips & Crisps",
    sales_per_linear_ft: 154.0,
    linear_feet_allocated: 2.0,
    in_stock_rate: 96.5,
    status_badge: "GROW",
    action_recommendation: "Increase allocation to meet value demand.",
  },
  {
    id: "sku-004",
    sku_code: "SNK-DOR-301",
    product_name: "Doritos Nacho Cheese Tortilla Chips 9.25oz",
    brand_name: "Doritos",
    is_private_brand: false,
    sub_category: "Chips & Crisps",
    sales_per_linear_ft: 172.8,
    linear_feet_allocated: 3.0,
    in_stock_rate: 96.8,
    status_badge: "MAINTAIN",
    action_recommendation: "Maintain standard assortment allocation.",
  },
  {
    id: "sku-005",
    sku_code: "SNK-PRN-401",
    product_name: "Pringles Original Potato Crisps 5.2oz",
    brand_name: "Pringles",
    is_private_brand: false,
    sub_category: "Chips & Crisps",
    sales_per_linear_ft: 98.4,
    linear_feet_allocated: 2.0,
    in_stock_rate: 94.1,
    status_badge: "SWAP",
    action_recommendation:
      "Swap lower canister SKU for Clover Valley Stax canister.",
  },
  {
    id: "sku-006",
    sku_code: "SNK-CV-106",
    product_name: "Clover Valley Pretzel Twists 16oz",
    brand_name: "Clover Valley",
    is_private_brand: true,
    sub_category: "Pretzels & Popcorn",
    sales_per_linear_ft: 142.1,
    linear_feet_allocated: 2.5,
    in_stock_rate: 97.4,
    status_badge: "GROW",
    action_recommendation: "Grow shelf presence in Small Town cluster.",
  },
  {
    id: "sku-007",
    sku_code: "SNK-SNY-501",
    product_name: "Snyder's of Hanover Mini Pretzels 12oz",
    brand_name: "Snyder's",
    is_private_brand: false,
    sub_category: "Pretzels & Popcorn",
    sales_per_linear_ft: 122.5,
    linear_feet_allocated: 2.0,
    in_stock_rate: 95.8,
    status_badge: "MAINTAIN",
    action_recommendation: "Retain key brand recognition facing.",
  },
  {
    id: "sku-008",
    sku_code: "SNK-CV-108",
    product_name: "Clover Valley Butter Popcorn 6ct Box",
    brand_name: "Clover Valley",
    is_private_brand: true,
    sub_category: "Pretzels & Popcorn",
    sales_per_linear_ft: 139.7,
    linear_feet_allocated: 2.0,
    in_stock_rate: 96.1,
    status_badge: "GROW",
    action_recommendation: "Top value family pack — promote to eye-level.",
  },
  {
    id: "sku-009",
    sku_code: "SNK-PLT-601",
    product_name: "Planters Dry Roasted Peanuts 16oz",
    brand_name: "Planters",
    is_private_brand: false,
    sub_category: "Nuts & Seeds",
    sales_per_linear_ft: 134.2,
    linear_feet_allocated: 2.0,
    in_stock_rate: 95.0,
    status_badge: "MAINTAIN",
    action_recommendation: "Hold facing allocation for brand loyalists.",
  },
  {
    id: "sku-010",
    sku_code: "SNK-CV-110",
    product_name: "Clover Valley Salted Peanuts 16oz Jar",
    brand_name: "Clover Valley",
    is_private_brand: true,
    sub_category: "Nuts & Seeds",
    sales_per_linear_ft: 162.9,
    linear_feet_allocated: 2.0,
    in_stock_rate: 98.0,
    status_badge: "GROW",
    action_recommendation: "Strong margin driver in value tier.",
  },
  {
    id: "sku-011",
    sku_code: "SNK-ORE-701",
    product_name: "OREO Chocolate Sandwich Cookies 13.29oz",
    brand_name: "OREO",
    is_private_brand: false,
    sub_category: "Cookies & Crackers",
    sales_per_linear_ft: 178.5,
    linear_feet_allocated: 3.0,
    in_stock_rate: 97.6,
    status_badge: "MAINTAIN",
    action_recommendation: "Core category anchor — maintain shelf facings.",
  },
  {
    id: "sku-012",
    sku_code: "SNK-CHZ-801",
    product_name: "Cheez-It Original Baked Crackers 7oz",
    brand_name: "Cheez-It",
    is_private_brand: false,
    sub_category: "Cookies & Crackers",
    sales_per_linear_ft: 160.0,
    linear_feet_allocated: 2.5,
    in_stock_rate: 96.2,
    status_badge: "MAINTAIN",
    action_recommendation: "Maintain core facing.",
  },
  {
    id: "sku-013",
    sku_code: "SNK-GEN-901",
    product_name: "Generic Butter Toffee Popcorn 5oz",
    brand_name: "Value Pantry",
    is_private_brand: false,
    sub_category: "Pretzels & Popcorn",
    sales_per_linear_ft: 52.1,
    linear_feet_allocated: 1.5,
    in_stock_rate: 89.2,
    status_badge: "REDUCE",
    action_recommendation: "Delist — bottom 5% velocity in Small Town cluster.",
  },
  {
    id: "sku-014",
    sku_code: "SNK-SLW-902",
    product_name: "Specialty Artisan Crisp Crackers 4.5oz",
    brand_name: "Artisan Oven",
    is_private_brand: false,
    sub_category: "Cookies & Crackers",
    sales_per_linear_ft: 61.4,
    linear_feet_allocated: 1.5,
    in_stock_rate: 91.0,
    status_badge: "REDUCE",
    action_recommendation: "Delist due to low velocity in value stores.",
  },
];

const DEFAULT_SCENARIOS = [
  {
    id: "scen-conservative",
    scenario_type: "CONSERVATIVE",
    name: "Conservative Scenario",
    description:
      "Low-risk adjustments with minimal shelf disruption, preserving top national brands.",
    is_default: false,
    projected_sales_delta_pct: 2.1,
    projected_pb_shift_pct: 1.2,
    projected_space_util_pct: 84.5,
    guardrails: {
      min_private_brand_met: true,
      capacity_threshold_met: true,
      in_stock_threshold_met: true,
      overall_status: "PASSED",
    },
    sku_actions: {
      add_count: 2,
      keep_count: 35,
      swap_count: 2,
      remove_count: 1,
    },
  },
  {
    id: "scen-balanced",
    scenario_type: "BALANCED",
    name: "Balanced Scenario",
    description:
      "Optimal balance of gross sales lift, space optimization, and private brand expansion.",
    is_default: true,
    projected_sales_delta_pct: 5.8,
    projected_pb_shift_pct: 3.2,
    projected_space_util_pct: 88.5,
    guardrails: {
      min_private_brand_met: true,
      capacity_threshold_met: true,
      in_stock_threshold_met: true,
      overall_status: "PASSED",
    },
    sku_actions: {
      add_count: 5,
      keep_count: 30,
      swap_count: 5,
      remove_count: 2,
    },
  },
  {
    id: "scen-aggressive",
    scenario_type: "AGGRESSIVE",
    name: "Aggressive Scenario",
    description:
      "High-margin private brand focus, aggressive delisting of slow-moving secondary national brands.",
    is_default: false,
    projected_sales_delta_pct: 9.4,
    projected_pb_shift_pct: 5.8,
    projected_space_util_pct: 93.2,
    guardrails: {
      min_private_brand_met: true,
      capacity_threshold_met: true,
      in_stock_threshold_met: true,
      overall_status: "PASSED",
    },
    sku_actions: {
      add_count: 8,
      keep_count: 24,
      swap_count: 8,
      remove_count: 4,
    },
  },
];

export default function DashboardPage() {
  const [clusterId, setClusterId] = useState("cluster-04");
  const [kpis, setKpis] = useState(DEFAULT_KPIS);
  const [skus, setSkus] = useState(DEFAULT_SKUS);
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState(
    DEFAULT_SCENARIOS[1],
  ); // Balanced is pre-selected

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Fetch initial data
  const loadDashboardData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setLoadError(null);

      try {
        // Parallel API calls
        const [kpiRes, skuRes, scenRes] = await Promise.allSettled([
          getKPIs(clusterId),
          getSKUs(clusterId),
          getScenarios(clusterId),
        ]);

        if (kpiRes.status === "fulfilled" && kpiRes.value) {
          setKpis(kpiRes.value);
        }
        if (
          skuRes.status === "fulfilled" &&
          Array.isArray(skuRes.value) &&
          skuRes.value.length > 0
        ) {
          setSkus(skuRes.value);
        }
        if (
          scenRes.status === "fulfilled" &&
          Array.isArray(scenRes.value) &&
          scenRes.value.length > 0
        ) {
          setScenarios(scenRes.value);
          // Find default or keep current
          const defaultScen =
            scenRes.value.find(
              (s) => s.is_default || s.scenario_type === "BALANCED",
            ) || scenRes.value[0];
          setSelectedScenario(defaultScen);
        }
      } catch (err) {
        console.warn(
          "Could not fetch all endpoints from backend, using default cluster baseline:",
          err,
        );
        setLoadError("Using cached cluster metrics.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [clusterId],
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Scenario Selection
  const handleSelectScenario = (scenario) => {
    setSelectedScenario(scenario);
    setSubmitError(null);
  };

  // Handle Form Submission
  const handleSubmitAssortment = async (payload) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitAssortmentPlan(clusterId, payload);
      // Validated 2xx response from API
      setSubmissionResult(result);
    } catch (err) {
      console.error("Submission failed:", err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to submit assortment plan. Please check backend connection and retry.";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onRefresh={() => loadDashboardData(true)}
        isRefreshing={isRefreshing}
        clusterId={clusterId}
      />

      {/* Main Consolidated Dashboard Canvas */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6 sm:space-y-8">
        {/* Section 1: Top-line KPI Header Strip */}
        <KPIHeaderStrip kpis={kpis} isLoading={isLoading} error={loadError} />

        {/* Section 2: SKU Performance Table */}
        <SKUPerformanceTable
          skus={skus}
          isLoading={isLoading}
          error={loadError}
        />

        {/* Section 3: Scenario Selector Cards */}
        <ScenarioSelector
          scenarios={scenarios}
          selectedScenarioId={
            selectedScenario?.id || selectedScenario?.scenario_type
          }
          onSelectScenario={handleSelectScenario}
          isLoading={isLoading}
        />

        {/* Section 4: Approval Review Panel */}
        <ApprovalReviewPanel
          selectedScenario={selectedScenario}
          onSubmit={handleSubmitAssortment}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </main>

      {/* Section 5: Inline Confirmation Modal / Banner State */}
      {submissionResult && (
        <InlineConfirmationBanner
          submissionResult={submissionResult}
          onDismiss={() => setSubmissionResult(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#FDB813]">DG</span>
            <span>
              Dollar General Decision-Support Platform &mdash; Cluster
              Assortment Advisor
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Cluster 04 | Snacks Category Plan | Confidential Internal Tool
          </div>
        </div>
      </footer>
    </div>
  );
}
