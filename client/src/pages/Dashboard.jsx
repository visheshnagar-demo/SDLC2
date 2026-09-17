import React, { useState, useEffect, useCallback } from "react";
import {
  fetchMetrics,
  fetchSKUs,
  fetchScenarios,
  submitAssortmentPlan,
  fetchSubmissions,
} from "../services/api";
import KPIHeaderStrip from "../components/KPIHeaderStrip";
import SKUPerformanceTable from "../components/SKUPerformanceTable";
import ScenarioSelector from "../components/ScenarioSelector";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel";
import InlineConfirmation from "../components/InlineConfirmation";
import { RefreshCw, Store, History, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  // Application State
  const [activeScenarioKey, setActiveScenarioKey] = useState("balanced");
  const [scenariosData, setScenariosData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [skus, setSKUs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Status & Loading States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Post-submit Confirmation State
  const [confirmationData, setConfirmationData] = useState(null);

  // Load initial dataset (Scenarios, Baseline/Balanced Metrics, SKUs)
  const loadInitialData = useCallback(async () => {
    setLoadingInitial(true);
    setApiError(null);
    try {
      const [scenariosRes, skusRes] = await Promise.all([
        fetchScenarios(),
        fetchSKUs(),
      ]);

      setScenariosData(scenariosRes);
      setSKUs(skusRes);

      const defaultScenario = scenariosRes.active_default || "balanced";
      setActiveScenarioKey(defaultScenario);

      // Load initial scenario metrics
      const metricsRes = await fetchMetrics(defaultScenario);
      setMetrics(metricsRes);
    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to connect to Assortment Advisor API backend.",
      );
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load metrics when active scenario changes
  const handleSelectScenario = async (scenarioKey) => {
    setActiveScenarioKey(scenarioKey);
    setLoadingMetrics(true);
    setSubmitError(null);
    try {
      const metricsRes = await fetchMetrics(scenarioKey);
      setMetrics(metricsRes);
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail || "Failed to update scenario metrics.",
      );
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Submit Assortment Plan Handler
  const handleSubmitPlan = async (payload) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await submitAssortmentPlan(payload);
      setConfirmationData(response);

      // Refresh submissions history if available
      try {
        const historyRes = await fetchSubmissions();
        setSubmissions(historyRes);
      } catch (_historyErr) {
        // Non-blocking history refresh
      }

      // Scroll smoothly to confirmation banner at top
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit assortment plan.";
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle submission audit history
  const handleToggleHistory = async () => {
    if (!showHistory && submissions.length === 0) {
      try {
        const res = await fetchSubmissions();
        setSubmissions(res);
      } catch (_e) {
        // history fetch error handled in UI
      }
    }
    setShowHistory((prev) => !prev);
  };

  // Active scenario detail object
  const activeScenario =
    scenariosData?.scenarios?.find(
      (s) => s.scenario_key.toLowerCase() === activeScenarioKey.toLowerCase(),
    ) || scenariosData?.scenarios?.[0];

  return (
    <div className="min-h-screen bg-[#0B132B] text-[#FFFFFF] font-sans pb-16 selection:bg-[#FFD200] selection:text-[#0B132B]">
      {/* Top Application Header */}
      <header className="bg-[#0F172A] border-b border-[#334155] sticky top-0 z-30 shadow-md backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FFD200] text-[#0B132B] font-extrabold font-heading px-2.5 py-1 rounded text-lg tracking-wider shadow-sm">
              DG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-heading text-white tracking-tight">
                  DG Cluster Assortment Advisor
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-[#1E293B] text-[#FFD200] border border-[#334155]">
                  <Store className="w-3 h-3" /> Small Town Value Cluster
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Category Decision Support — Snacks Department
              </p>
            </div>
          </div>

          {/* Quick Actions / Cluster Meta */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] text-xs font-medium text-[#94A3B8] hover:text-white rounded-lg border border-[#334155] transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>{showHistory ? "Hide Audit Log" : "Audit Log"}</span>
            </button>

            <button
              type="button"
              onClick={loadInitialData}
              disabled={loadingInitial}
              title="Refresh Data"
              className="p-2 bg-[#1E293B] hover:bg-[#334155] text-[#94A3B8] hover:text-white rounded-lg border border-[#334155] transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingInitial ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Page Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Global Connection Error Banner */}
        {apiError && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-900/30 border-2 border-red-500/60 rounded-xl flex items-start gap-3 text-red-200"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">
                Backend Connection Notice
              </h3>
              <p className="text-xs text-red-300 mt-1">{apiError}</p>
              <button
                type="button"
                onClick={loadInitialData}
                className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded text-xs font-semibold text-white transition-colors"
              >
                Retry Loading
              </button>
            </div>
          </div>
        )}

        {/* Inline Submission Confirmation Banner */}
        {confirmationData && (
          <InlineConfirmation
            confirmationData={confirmationData}
            onDismiss={() => setConfirmationData(null)}
          />
        )}

        {/* 1. KPI Header Strip */}
        <KPIHeaderStrip
          metrics={metrics}
          loading={loadingInitial || loadingMetrics}
          activeScenarioName={activeScenario?.display_name}
        />

        {/* 2. Interactive Scenario Selector */}
        <ScenarioSelector
          scenarios={scenariosData}
          activeScenarioKey={activeScenarioKey}
          onSelectScenario={handleSelectScenario}
          loading={loadingInitial}
        />

        {/* 3. Approval Review Panel */}
        <ApprovalReviewPanel
          activeScenario={activeScenario}
          onSubmit={handleSubmitPlan}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        {/* 4. SKU Performance Matrix */}
        <SKUPerformanceTable skus={skus} loading={loadingInitial} />

        {/* 5. Submissions Audit History (Collapsible Panel) */}
        {showHistory && (
          <section
            aria-label="Audit History Section"
            className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg mb-6"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B] mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#FFD200]" />
                <h3 className="text-sm font-bold font-heading text-white">
                  Past Submission Audit Trail
                </h3>
              </div>
              <span className="text-xs text-[#94A3B8] font-mono">
                {submissions.length} recorded submissions
              </span>
            </div>

            {submissions.length === 0 ? (
              <p className="text-xs text-[#94A3B8] py-4 text-center">
                No prior assortment submissions recorded in this session.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#94A3B8] font-mono uppercase text-[11px] border-b border-[#334155]">
                      <th className="py-2 px-3">Audit ID</th>
                      <th className="py-2 px-3">Scenario</th>
                      <th className="py-2 px-3">User</th>
                      <th className="py-2 px-3">Guardrails</th>
                      <th className="py-2 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {submissions.map((sub) => (
                      <tr key={sub.id || sub.audit_confirmation_id}>
                        <td className="py-2 px-3 font-mono text-[#FFD200] font-semibold">
                          {sub.audit_confirmation_id}
                        </td>
                        <td className="py-2 px-3 text-white font-medium">
                          {sub.scenario_name}
                        </td>
                        <td className="py-2 px-3 font-mono text-[#94A3B8]">
                          {sub.user_id}
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                            {sub.guardrail_status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[#94A3B8] font-mono">
                          {sub.created_at
                            ? new Date(sub.created_at).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
