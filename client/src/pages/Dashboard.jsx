import React, { useState, useEffect, useRef } from "react";
import { RotateCw, CheckCircle2, Shield, Store, Layers } from "lucide-react";
import {
  getKpis,
  getSkus,
  calculateScenarioImpact,
  submitAssortmentApproval,
} from "../services/api";
import KpiHeaderStrip from "../components/KpiHeaderStrip";
import SkuPerformanceTable from "../components/SkuPerformanceTable";
import ScenarioSelector from "../components/ScenarioSelector";
import ApprovalReviewPanel from "../components/ApprovalReviewPanel";
import InlineAuditConfirmationModal from "../components/InlineAuditConfirmationModal";

export default function Dashboard() {
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState(null);

  const [skus, setSkus] = useState([]);
  const [skusLoading, setSkusLoading] = useState(true);
  const [skusError, setSkusError] = useState(null);

  const [selectedScenario, setSelectedScenario] = useState("balanced");
  const [impactData, setImpactData] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [approvalResult, setApprovalResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const abortControllerRef = useRef(null);

  const loadInitialData = async () => {
    setKpiLoading(true);
    setSkusLoading(true);
    setKpiError(null);
    setSkusError(null);

    try {
      const kpis = await getKpis("small_town_value");
      setKpiData(kpis);
    } catch (err) {
      setKpiError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load KPI metrics",
      );
    } finally {
      setKpiLoading(false);
    }

    try {
      const skuList = await getSkus("small_town_value");
      setSkus(Array.isArray(skuList) ? skuList : skuList.items || []);
    } catch (err) {
      setSkusError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load Snacks SKUs",
      );
    } finally {
      setSkusLoading(false);
    }
  };

  const loadScenarioImpact = async (scenarioKey) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setImpactLoading(true);
    setImpactError(null);

    try {
      const data = await calculateScenarioImpact(
        "small_town_value",
        scenarioKey,
        controller.signal,
      );
      setImpactData(data);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setImpactError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to calculate scenario impact",
        );
      }
    } finally {
      setImpactLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadScenarioImpact(selectedScenario);
  }, [selectedScenario]);

  const handleScenarioChange = (newScenario) => {
    setSelectedScenario(newScenario);
  };

  const handleSubmitApproval = async (payload) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitAssortmentApproval(payload);
      setApprovalResult(res);
      setIsModalOpen(true);
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to record assortment approval";
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans pb-16">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="bg-yellow-400 text-black px-2.5 py-1 font-black text-sm tracking-tighter rounded shadow-sm">
              DG
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <span>Cluster Assortment Advisor</span>
              </h1>
              <span className="text-[11px] text-slate-400">
                Merchandising & Planogram Decision Support Canvas
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                Cluster: <strong>Small Town Value</strong>
              </span>
            </span>
            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                Category: <strong>Snacks</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                loadInitialData();
                loadScenarioImpact(selectedScenario);
              }}
              title="Refresh Cluster Metrics"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Consolidated Dashboard Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Approved Audit Notification Banner if locked */}
        {approvalResult && (
          <div
            className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 animate-fadeIn"
            role="status"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">
                    Assortment Approved & Locked
                  </h3>
                  <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                    {approvalResult.status}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">
                  Audit Ref:{" "}
                  <strong>{approvalResult.audit_reference_id}</strong> &bull;
                  Scenario:{" "}
                  <strong>
                    {approvalResult.approved_scenario?.toUpperCase()}
                  </strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              View Full Audit Ledger
            </button>
          </div>
        )}

        {/* 1. KPI Header Strip */}
        <KpiHeaderStrip
          kpiData={kpiData}
          loading={kpiLoading}
          error={kpiError}
        />

        {/* 2. SKU Performance Table */}
        <SkuPerformanceTable
          skus={skus}
          loading={skusLoading}
          error={skusError}
        />

        {/* 3. Scenario Selector */}
        <ScenarioSelector
          selectedScenario={selectedScenario}
          onSelectScenario={handleScenarioChange}
          loading={impactLoading}
        />

        {/* 4. Approval Review Panel */}
        <ApprovalReviewPanel
          selectedScenario={selectedScenario}
          impactData={impactData}
          loadingImpact={impactLoading}
          onSubmitApproval={handleSubmitApproval}
          submitting={submitting}
          submitError={submitError}
        />

        {/* 5. Inline Audit Confirmation Modal */}
        <InlineAuditConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          approvalResult={approvalResult}
        />
      </main>
    </div>
  );
}
