import React, { useState } from "react";
import {
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  Send,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
} from "lucide-react";

export const ApprovalReviewPanel = ({
  selectedScenario = "BALANCED",
  evaluationData = null,
  evaluating = false,
  onSubmitPlan,
  submitting = false,
  submitError = null,
}) => {
  const [notes, setNotes] = useState("");
  const [submittedBy, setSubmittedBy] = useState(
    "category_manager_dg@example.com",
  );

  const scenarioName =
    evaluationData?.scenario_name || `${selectedScenario} Strategy`;
  const impact = evaluationData?.projected_impact || {
    sales_delta_percentage:
      selectedScenario === "AGGRESSIVE"
        ? 8.5
        : selectedScenario === "CONSERVATIVE"
          ? 2.1
          : 5.4,
    margin_delta_percentage:
      selectedScenario === "AGGRESSIVE"
        ? 6.2
        : selectedScenario === "CONSERVATIVE"
          ? 1.4
          : 3.8,
    private_brand_mix_delta:
      selectedScenario === "AGGRESSIVE"
        ? 5.8
        : selectedScenario === "CONSERVATIVE"
          ? 1.2
          : 3.5,
    shelf_capacity_projected_percentage:
      selectedScenario === "AGGRESSIVE"
        ? 91.0
        : selectedScenario === "CONSERVATIVE"
          ? 84.5
          : 87.2,
  };

  const actionSummary = evaluationData?.sku_action_summary || {
    total_actions: 12,
    grow_count:
      selectedScenario === "AGGRESSIVE"
        ? 5
        : selectedScenario === "CONSERVATIVE"
          ? 2
          : 4,
    maintain_count:
      selectedScenario === "AGGRESSIVE"
        ? 3
        : selectedScenario === "CONSERVATIVE"
          ? 7
          : 4,
    swap_count:
      selectedScenario === "AGGRESSIVE"
        ? 3
        : selectedScenario === "CONSERVATIVE"
          ? 2
          : 3,
    reduce_count:
      selectedScenario === "AGGRESSIVE"
        ? 1
        : selectedScenario === "CONSERVATIVE"
          ? 1
          : 1,
  };

  const guardrails = evaluationData?.guardrail_checks || [
    {
      name: "Minimum Margin Floor (>= 28.0%)",
      status: "PASSED",
      current_value: `${(32.5 + (impact.margin_delta_percentage || 0)).toFixed(1)}%`,
      threshold: ">= 28.0%",
    },
    {
      name: "Private Brand Share Target (>= 30.0%)",
      status: "PASSED",
      current_value: `${(32.0 + (impact.private_brand_mix_delta || 0)).toFixed(1)}%`,
      threshold: ">= 30.0%",
    },
    {
      name: "Shelf Capacity Ceiling (<= 95.0%)",
      status: "PASSED",
      current_value: `${(impact.shelf_capacity_projected_percentage || 87.2).toFixed(1)}%`,
      threshold: "<= 95.0%",
    },
  ];

  const allGuardrailsPassed = guardrails.every(
    (g) =>
      g.status?.toUpperCase() === "PASSED" || g.status?.toUpperCase() === "OK",
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitPlan && !submitting) {
      onSubmitPlan({
        scenarioType: selectedScenario,
        submittedBy,
        notes,
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl p-5 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Assortment Approval Review
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-mono font-semibold uppercase">
            {selectedScenario}
          </span>
        </div>

        {/* Active Scenario Overview */}
        <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800/80">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-mono mb-1">
            Target Strategy
          </p>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-100">{scenarioName}</h4>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              +{impact.sales_delta_percentage?.toFixed(1) ?? "0.0"}% Projected
              Sales
            </span>
          </div>
        </div>

        {/* SKU Action Summary List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              SKU Actions ({actionSummary.total_actions} total)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded p-2">
              <span className="text-[10px] text-emerald-400 block font-semibold">
                GROW
              </span>
              <span className="text-base font-bold text-emerald-300">
                {actionSummary.grow_count}
              </span>
            </div>
            <div className="bg-sky-950/40 border border-sky-800/40 rounded p-2">
              <span className="text-[10px] text-sky-400 block font-semibold">
                MAINTAIN
              </span>
              <span className="text-base font-bold text-sky-300">
                {actionSummary.maintain_count}
              </span>
            </div>
            <div className="bg-amber-950/40 border border-amber-800/40 rounded p-2">
              <span className="text-[10px] text-amber-400 block font-semibold">
                SWAP
              </span>
              <span className="text-base font-bold text-amber-300">
                {actionSummary.swap_count}
              </span>
            </div>
            <div className="bg-rose-950/40 border border-rose-800/40 rounded p-2">
              <span className="text-[10px] text-rose-400 block font-semibold">
                REDUCE
              </span>
              <span className="text-base font-bold text-rose-300">
                {actionSummary.reduce_count}
              </span>
            </div>
          </div>
        </div>

        {/* Automated Guardrail Status Checks */}
        <div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono block mb-2">
            Automated Guardrail Checks
          </span>
          <div className="space-y-2">
            {guardrails.map((check, idx) => {
              const isPassed =
                check.status?.toUpperCase() === "PASSED" ||
                check.status?.toUpperCase() === "OK";
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                    isPassed
                      ? "bg-emerald-950/20 border-emerald-800/30 text-slate-200"
                      : "bg-rose-950/30 border-rose-800/40 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isPassed ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="font-medium">{check.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-400">
                      Val: {check.current_value}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        isPassed
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submission Inputs */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Reviewer Identity:
            </label>
            <input
              type="text"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              placeholder="category_manager_dg@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Approval Notes (Optional):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-400 placeholder-slate-600 resize-none"
              placeholder="Add rationale for scenario approval..."
            />
          </div>
        </div>

        {/* Error message if submit failed */}
        {submitError && (
          <div className="bg-rose-950/60 border border-rose-800 rounded-lg p-3 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Submission Failed</p>
              <p className="text-[11px] text-rose-300">{submitError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Action Button */}
      <div className="pt-4 border-t border-slate-800 mt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || evaluating || !allGuardrailsPassed}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            !allGuardrailsPassed
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : submitting
                ? "bg-amber-500/80 text-slate-950 cursor-wait"
                : "bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-amber-400/20 active:scale-[0.99]"
          }`}
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting Assortment Plan...</span>
            </>
          ) : (
            <>
              <span>Submit Assortment Plan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ApprovalReviewPanel;
