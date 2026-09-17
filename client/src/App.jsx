import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  RefreshCw,
  Store,
  CheckCircle2,
  Sparkles,
  Layers,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import KpiHeaderStrip from "./components/KpiHeaderStrip";
import SkuPerformanceTable from "./components/SkuPerformanceTable";
import ScenarioSelector from "./components/ScenarioSelector";
import ApprovalReviewPanel from "./components/ApprovalReviewPanel";
import ConfirmationModal from "./components/ConfirmationModal";
import {
  getKpis,
  getSkus,
  getScenarios,
  evaluateScenario,
  submitAssortmentPlan,
} from "./services/api";

export default function App() {
  const [clusterCode, setClusterCode] = useState("STV-CLUSTER");

  // KPIs state
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState(null);

  // SKUs state
  const [skus, setSkus] = useState([]);
  const [skusLoading, setSkusLoading] = useState(true);
  const [skusError, setSkusError] = useState(null);

  // Scenarios state
  const [scenarios, setScenarios] = useState([]);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [scenariosError, setScenariosError] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState("balanced");

  // Evaluation state
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);

  // Submission / Confirmation state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submittedPlan, setSubmittedPlan] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Fetch initial dashboard baseline data
  const fetchDashboardData = useCallback(async () => {
    setKpisLoading(true);
    setSkusLoading(true);
    setScenariosLoading(true);
    setKpisError(null);
    setSkusError(null);
    setScenariosError(null);

    try {
      const [kpisRes, skusRes, scenariosRes] = await Promise.allSettled([
        getKpis(clusterCode),
        getSkus({ cluster_code: clusterCode, limit: 100 }),
        getScenarios(),
      ]);

      if (kpisRes.status === "fulfilled") {
        setKpis(kpisRes.value);
      } else {
        setKpisError(kpisRes.reason?.message || "Failed to fetch KPIs");
      }

      if (skusRes.status === "fulfilled") {
        setSkus(skusRes.value.items || []);
      } else {
        setSkusError(skusRes.reason?.message || "Failed to fetch SKUs");
      }

      if (scenariosRes.status === "fulfilled") {
        const scenarioList = scenariosRes.value.scenarios || [];
        setScenarios(scenarioList);
        const defaultScen = scenarioList.find((s) => s.is_default);
        if (defaultScen) {
          setSelectedScenario(defaultScen.code);
        }
      } else {
        setScenariosError(
          scenariosRes.reason?.message || "Failed to fetch scenarios",
        );
      }
    } finally {
      setKpisLoading(false);
      setSkusLoading(false);
      setScenariosLoading(false);
    }
  }, [clusterCode]);

  // Evaluate scenario whenever selectedScenario or clusterCode changes
  const runEvaluation = useCallback(
    async (scenarioCode) => {
      if (!scenarioCode) return;
      setEvaluating(true);
      setEvalError(null);
      try {
        const result = await evaluateScenario(scenarioCode, clusterCode);
        setEvaluation(result);
      } catch (err) {
        setEvalError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to evaluate scenario",
        );
      } finally {
        setEvaluating(false);
      }
    },
    [clusterCode],
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (selectedScenario) {
      runEvaluation(selectedScenario);
    }
  }, [selectedScenario, runEvaluation]);

  // Handle scenario selection switch
  const handleSelectScenario = (scenarioCode) => {
    setSelectedScenario(scenarioCode);
  };

  // Handle assortment plan submission
  const handleSubmitPlan = async (payload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await submitAssortmentPlan(payload);
      setSubmittedPlan(response);
      setIsConfirmationOpen(true);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit assortment plan to server";
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC]">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#334155] bg-[#0F172A] sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFDD00] text-[#090D16] p-2 rounded-xl font-black text-lg tracking-tighter flex items-center justify-center shadow-md">
              DG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-[#FFDD00] tracking-tight">
                  Dollar General | Merchandising Assortment Advisor
                </h1>
                <span className="text-[10px] bg-yellow-500/10 text-[#FFDD00] border border-yellow-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Small Town Value Cluster Stores &bull; Snacks Category Space
                &amp; Assortment Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="hidden sm:flex items-center gap-2 bg-[#1E293B] border border-[#334155] px-3 py-1.5 rounded-lg text-xs text-[#94A3B8]">
              <Store className="w-3.5 h-3.5 text-[#FFDD00]" />
              <span>
                Cluster:{" "}
                <strong className="text-[#F8FAFC]">Small Town Value</strong>
              </span>
            </div>

            <button
              onClick={fetchDashboardData}
              disabled={kpisLoading || skusLoading || scenariosLoading}
              className="flex items-center gap-1.5 text-xs bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#334155] transition"
              title="Refresh all dashboard metrics from server"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#FFDD00] ${kpisLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Consolidated Dashboard Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Post-submission In-Page Banner if plan exists */}
        {submittedPlan && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#F8FAFC] shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
              <div>
                <span className="font-bold text-[#10B981] text-sm block sm:inline">
                  Assortment Plan Active ({submittedPlan.audit_id})
                </span>
                <span className="text-[#94A3B8] sm:ml-2">
                  Logged at{" "}
                  {new Date(submittedPlan.timestamp).toLocaleTimeString()} by{" "}
                  {submittedPlan.submitted_by}.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsConfirmationOpen(true)}
              className="text-xs font-semibold text-[#FFDD00] hover:underline flex items-center gap-1"
            >
              <span>View Audit Receipt</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. KPI Header Strip */}
        <KpiHeaderStrip kpis={kpis} loading={kpisLoading} error={kpisError} />

        {/* 2. Interactive Scenario Selector */}
        <ScenarioSelector
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          loading={scenariosLoading}
          error={scenariosError}
        />

        {/* 3. Approval Review Panel */}
        <ApprovalReviewPanel
          evaluation={evaluation}
          evaluating={evaluating}
          error={evalError}
          onSubmitPlan={handleSubmitPlan}
          submitting={submitting}
          submitError={submitError}
        />

        {/* 4. SKU Performance Table */}
        <SkuPerformanceTable
          skus={skus}
          loading={skusLoading}
          error={skusError}
        />
      </main>

      {/* 5. Inline Audit Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        plan={submittedPlan}
      />

      {/* Footer */}
      <footer className="border-t border-[#334155] bg-[#0F172A] py-6 px-4 text-center text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} Dollar General Merchandising
            Services. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-500">
            DG Cluster Assortment Advisor &bull; Small Town Value Cluster Model
          </p>
        </div>
      </footer>
    </div>
  );
}
