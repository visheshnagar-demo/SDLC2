import React, { useState, useEffect, useCallback } from "react";
import {
  Store,
  RefreshCw,
  ShoppingBag,
  Sliders,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { KpiHeaderStrip } from "../components/KpiHeaderStrip";
import { SkuPerformanceTable } from "../components/SkuPerformanceTable";
import { ScenarioSelectorCards } from "../components/ScenarioSelectorCards";
import { ApprovalReviewPanel } from "../components/ApprovalReviewPanel";
import { InlineConfirmationModal } from "../components/InlineConfirmationModal";
import {
  getClusterKpis,
  getSkus,
  getScenarios,
  evaluateScenario,
  submitPlan,
} from "../services/api";

export const DashboardPage = () => {
  const [clusterId, setClusterId] = useState("STV-CLUSTER-01");
  const [selectedScenario, setSelectedScenario] = useState("BALANCED");

  // Data states
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState(null);

  const [skus, setSkus] = useState([]);
  const [skusLoading, setSkusLoading] = useState(true);
  const [skusError, setSkusError] = useState(null);

  const [scenarios, setScenarios] = useState([]);
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);
  const [recentAuditBanner, setRecentAuditBanner] = useState(null);

  // Fetch initial data
  const loadDashboardData = useCallback(async () => {
    setKpisLoading(true);
    setSkusLoading(true);
    setKpisError(null);
    setSkusError(null);

    try {
      const kpisRes = await getClusterKpis(clusterId);
      setKpis(kpisRes);
    } catch (err) {
      console.error("Error fetching KPIs:", err);
      setKpisError(
        err?.response?.data?.detail || err.message || "Failed to fetch KPIs",
      );
    } finally {
      setKpisLoading(false);
    }

    try {
      const skusRes = await getSkus({ clusterId });
      setSkus(skusRes.skus || []);
    } catch (err) {
      console.error("Error fetching SKUs:", err);
      setSkusError(
        err?.response?.data?.detail || err.message || "Failed to fetch SKUs",
      );
    } finally {
      setSkusLoading(false);
    }

    try {
      const scenariosRes = await getScenarios();
      setScenarios(scenariosRes.scenarios || []);
    } catch (err) {
      console.error("Error fetching scenarios:", err);
    }
  }, [clusterId]);

  // Evaluate selected scenario
  useEffect(() => {
    let isMounted = true;
    const runEvaluation = async () => {
      setEvaluating(true);
      try {
        const evalRes = await evaluateScenario(selectedScenario, clusterId);
        if (isMounted) {
          setEvaluationData(evalRes);
        }
      } catch (err) {
        console.error("Error evaluating scenario:", err);
      } finally {
        if (isMounted) {
          setEvaluating(false);
        }
      }
    };

    runEvaluation();
    return () => {
      isMounted = false;
    };
  }, [selectedScenario, clusterId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSelectScenario = (scenarioType) => {
    setSelectedScenario(scenarioType);
  };

  // Handle plan submission
  const handleSubmitPlan = async ({ scenarioType, submittedBy, notes }) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await submitPlan({
        scenarioType,
        clusterId,
        submittedBy,
        notes,
      });

      setConfirmationData(response);
      setRecentAuditBanner({
        auditId: response.audit_id,
        timestamp: response.submitted_at,
        scenarioType: response.scenario_type,
      });
    } catch (err) {
      console.error("Error submitting plan:", err);
      const errMsg =
        err?.response?.data?.detail ||
        err?.message ||
        "An error occurred during assortment plan submission.";
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-400/20">
              DG
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Cluster Assortment Advisor
                <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Decision Support
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-sans">
                Dollar General &bull; Small Town Value Cluster Optimization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Target:</span>
              <span className="text-slate-200 font-semibold">
                Small Town Value (STV-01)
              </span>
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Refresh Dashboard Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Canvas Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Inline Audit Confirmation Banner (if recently submitted) */}
        {recentAuditBanner && (
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-4 text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-emerald-200 shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                Plan submitted &amp; committed! Audit ID:{" "}
                <strong className="text-amber-400">
                  {recentAuditBanner.auditId}
                </strong>{" "}
                ({recentAuditBanner.scenarioType})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setConfirmationData(confirmationData)}
              className="text-xs text-emerald-300 underline hover:text-white font-sans"
            >
              View Full Audit Modal
            </button>
          </div>
        )}

        {/* Section 1: KPI Header Strip */}
        <KpiHeaderStrip kpis={kpis} loading={kpisLoading} error={kpisError} />

        {/* Section 2: Scenario Selector Cards */}
        <ScenarioSelectorCards
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          loading={evaluating}
        />

        {/* Section 3 & 4: Two-Column Workspace (SKU Table + Approval Review Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): SKU Performance Table */}
          <section
            className="lg:col-span-7 xl:col-span-8"
            aria-label="SKU Performance Section"
          >
            <SkuPerformanceTable
              skus={skus}
              loading={skusLoading}
              error={skusError}
            />
          </section>

          {/* Right Column (4-5 cols): Approval Review Panel */}
          <section
            className="lg:col-span-5 xl:col-span-4"
            aria-label="Approval Review Panel"
          >
            <ApprovalReviewPanel
              selectedScenario={selectedScenario}
              evaluationData={evaluationData}
              evaluating={evaluating}
              onSubmitPlan={handleSubmitPlan}
              submitting={submitting}
              submitError={submitError}
            />
          </section>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmationData && (
        <InlineConfirmationModal
          confirmationData={confirmationData}
          onClose={() => setConfirmationData(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-3 text-center text-xs text-slate-500 font-mono">
        Dollar General Category Management &bull; Small Town Value Cluster
        Assortment Advisor &bull; v1.0
      </footer>
    </div>
  );
};

export default DashboardPage;
