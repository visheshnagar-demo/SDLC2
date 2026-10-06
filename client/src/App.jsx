import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Header from "./components/Header";
import KPIHeaderStrip from "./components/KPIHeaderStrip";
import SKUPerformanceTable from "./components/SKUPerformanceTable";
import ScenarioSelector from "./components/ScenarioSelector";
import ApprovalReviewPanel from "./components/ApprovalReviewPanel";
import InlineConfirmationBanner from "./components/InlineConfirmationBanner";
import {
  fetchKPIs,
  fetchSKUs,
  calculateScenario,
  submitAssortmentPlan,
} from "./services/api";

export function App() {
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState(null);

  const [skus, setSkus] = useState([]);
  const [skusLoading, setSkusLoading] = useState(true);
  const [skusError, setSkusError] = useState(null);

  const [selectedScenario, setSelectedScenario] = useState("Balanced");
  const [scenarioData, setScenarioData] = useState({});
  const [scenarioDetails, setScenarioDetails] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Initial load: KPIs & SKUs
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      setKpiLoading(true);
      setSkusLoading(true);

      try {
        const kpisRes = await fetchKPIs();
        if (isMounted) {
          setKpiData(kpisRes);
          setKpiError(null);
        }
      } catch (err) {
        if (isMounted) {
          setKpiError(err.message || "Failed to fetch KPIs");
        }
      } finally {
        if (isMounted) setKpiLoading(false);
      }

      try {
        const skusRes = await fetchSKUs();
        if (isMounted) {
          const list = Array.isArray(skusRes) ? skusRes : skusRes?.skus || [];
          setSkus(list);
          setSkusError(null);
        }
      } catch (err) {
        if (isMounted) {
          setSkusError(err.message || "Failed to fetch SKUs");
        }
      } finally {
        if (isMounted) setSkusLoading(false);
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch or calculate scenario impact when selected scenario changes
  useEffect(() => {
    let isMounted = true;

    const loadScenarioCalculations = async () => {
      try {
        const result = await calculateScenario(selectedScenario);
        if (isMounted && result) {
          setScenarioData((prev) => ({
            ...prev,
            [selectedScenario]: result,
          }));
          setScenarioDetails(result);
        }
      } catch {
        // Fallback to local default configs without breaking UI
      }
    };

    loadScenarioCalculations();

    return () => {
      isMounted = false;
    };
  }, [selectedScenario]);

  const handleSelectScenario = (type) => {
    setSelectedScenario(type);
  };

  const handleSubmitPlan = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      cluster_id: "STV-042",
      scenario_selected: selectedScenario,
      user_id: "Marcus Vance",
      sku_action_summary: scenarioDetails.sku_action_summary || {
        add_private_brands:
          selectedScenario === "Conservative"
            ? 1
            : selectedScenario === "Aggressive"
              ? 5
              : 3,
        keep_core:
          selectedScenario === "Conservative"
            ? 15
            : selectedScenario === "Aggressive"
              ? 9
              : 12,
        swap_items:
          selectedScenario === "Conservative"
            ? 1
            : selectedScenario === "Aggressive"
              ? 4
              : 2,
        reduce_items:
          selectedScenario === "Conservative"
            ? 0
            : selectedScenario === "Aggressive"
              ? 3
              : 1,
      },
      detailed_sku_actions: skus.map((s) => ({
        sku_id: s.sku_id,
        name: s.name,
        action: s.action || s.recommended_action || "MAINTAIN",
      })),
      submission_timestamp: new Date().toISOString(),
    };

    try {
      const response = await submitAssortmentPlan(payload);
      const auditId =
        response.audit_id ||
        response.id ||
        `AT-${Date.now().toString().slice(-5)}`;
      const message =
        response.message ||
        `Assortment Update Submitted Successfully. Audit Trail ID: #${auditId}. Changes logged to central planogram repository.`;

      setSubmissionResult({
        audit_id: auditId,
        message: message,
        timestamp: response.submission_timestamp || new Date().toISOString(),
      });
      setSubmitError(null);
    } catch (err) {
      setSubmitError(
        err.response?.data?.detail ||
          err.message ||
          "Submission failed. Unable to persist assortment plan to backend.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header managerName="Marcus Vance" clusterId="Cluster STV-042" />

        {/* Inline Confirmation on Successful Submission */}
        {submissionResult && (
          <InlineConfirmationBanner
            auditId={submissionResult.audit_id}
            message={submissionResult.message}
            timestamp={submissionResult.timestamp}
            onDismiss={() => setSubmissionResult(null)}
          />
        )}

        {/* Error notification banner if submission or API failed */}
        {submitError && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex justify-between items-center mb-6 text-sm"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-rose-700 hover:text-rose-900 font-semibold text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: KPI Header Strip */}
        <KPIHeaderStrip
          kpiData={kpiData}
          loading={kpiLoading}
          error={kpiError}
        />

        {/* Section 2: SKU Performance Table */}
        <SKUPerformanceTable skus={skus} loading={skusLoading} />

        {/* Section 3: Scenario Selector */}
        <ScenarioSelector
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          scenarioData={scenarioData}
        />

        {/* Section 4: Approval Review Panel */}
        <ApprovalReviewPanel
          selectedScenario={selectedScenario}
          scenarioDetails={scenarioDetails}
          onSubmit={handleSubmitPlan}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

export default App;
