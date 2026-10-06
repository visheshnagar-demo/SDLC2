import React from "react";
import { CheckCircle2, ShieldCheck, Send, Loader2 } from "lucide-react";

const DEFAULT_ACTIONS = {
  Conservative: {
    add_private_brands: 1,
    keep_core: 15,
    swap_items: 1,
    reduce_items: 0,
  },
  Balanced: {
    add_private_brands: 3,
    keep_core: 12,
    swap_items: 2,
    reduce_items: 1,
  },
  Aggressive: {
    add_private_brands: 5,
    keep_core: 9,
    swap_items: 4,
    reduce_items: 3,
  },
};

export const ApprovalReviewPanel = ({
  selectedScenario = "Balanced",
  scenarioDetails = {},
  onSubmit,
  isSubmitting = false,
}) => {
  const actions =
    scenarioDetails.sku_action_summary ||
    DEFAULT_ACTIONS[selectedScenario] ||
    DEFAULT_ACTIONS.Balanced;

  const guardrails = scenarioDetails.guardrail_status || {
    private_brand_target_met: true,
    shelf_capacity_compliant: true,
    in_stock_sla_met: true,
  };

  return (
    <div
      className="bg-slate-900 text-white p-6 rounded-lg shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      data-testid="approval-review-panel"
    >
      <div className="flex-1 space-y-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold tracking-tight">
            Approval Review Panel
          </h2>
        </div>

        {/* SKU Action Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-yellow-400 text-slate-950 font-bold px-3 py-1 rounded-full shadow-xs">
            Selected Scenario: {selectedScenario}
          </span>
          <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-full font-medium">
            Add {actions.add_private_brands ?? 3} Private Brand
            {actions.add_private_brands === 1 ? "" : "s"}
          </span>
          <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-full font-medium">
            Keep {actions.keep_core ?? 12} Core
          </span>
          <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-full font-medium">
            Swap {actions.swap_items ?? 2} Item
            {actions.swap_items === 1 ? "" : "s"}
          </span>
          <span className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-full font-medium">
            Reduce {actions.reduce_items ?? 1} Item
            {actions.reduce_items === 1 ? "" : "s"}
          </span>
        </div>

        {/* Guardrail Checklist */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-emerald-400 font-medium pt-1">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Private Brand Target Met (&gt;=25%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Shelf Capacity Compliant (&lt;=150 LF)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>In-Stock SLA Met (&gt;=95%)</span>
          </div>
        </div>
      </div>

      {/* Submission Action */}
      <div className="w-full lg:w-auto flex justify-end">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/60 disabled:cursor-not-allowed text-slate-900 font-extrabold px-6 py-3 rounded-lg text-sm shadow-md transition-all flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              <span>Submitting Plan...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-slate-900" />
              <span>Submit Assortment Plan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ApprovalReviewPanel;
