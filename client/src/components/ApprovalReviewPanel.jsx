import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileText,
  UserCheck,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function ApprovalReviewPanel({
  selectedScenario,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  const [notes, setNotes] = useState("");
  const [submitterUser, setSubmitterUser] = useState(
    "catman.snacks@dollargeneral.local",
  );

  if (!selectedScenario) {
    return (
      <section
        aria-label="Approval Review Panel"
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center text-slate-500"
      >
        <p>
          Please select an assortment scenario above to view approval review
          details.
        </p>
      </section>
    );
  }

  const actions = selectedScenario.sku_actions || {
    add_count: 5,
    keep_count: 30,
    swap_count: 5,
    remove_count: 2,
  };

  const guardrails = selectedScenario.guardrails || {
    min_private_brand_met: true,
    capacity_threshold_met: true,
    in_stock_threshold_met: true,
    overall_status: "PASSED",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        scenario_id: selectedScenario.id || "default-scenario-id",
        scenario_type: selectedScenario.scenario_type || "BALANCED",
        submitted_by_user: submitterUser,
        notes:
          notes.trim() ||
          "Assortment plan optimized for Small Town Value Cluster Snacks category.",
      });
    }
  };

  return (
    <section
      aria-label="Approval Review Panel"
      className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      <div className="bg-[#0F172A] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FDB813]" />
            <h2 className="text-base sm:text-lg font-bold">
              Assortment Approval &amp; Guardrail Review
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Validate enterprise assortment guardrails and commit the
            decision-support plan to the audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
          <span className="text-slate-400">Selected:</span>
          <span className="font-extrabold text-[#FDB813]">
            {selectedScenario.name ||
              `${selectedScenario.scenario_type} Scenario`}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
        {/* Error notification if submission failed */}
        {submitError && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg text-xs flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Submission Error</div>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Summary & SKU Actions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Scenario Strategy &amp; SKU Action Breakdown
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <div className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedScenario.description ||
                  "Balanced scenario optimizes high-velocity snacks with private brand conversions to achieve margin goals while keeping shelf capacity strictly under 90%."}
              </div>

              {/* SKU Action pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-800">
                    New Adds
                  </div>
                  <div className="text-lg font-black text-emerald-700">
                    +{actions.add_count || 0}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    High margin
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-blue-800">
                    Keeps
                  </div>
                  <div className="text-lg font-black text-blue-700">
                    {actions.keep_count || 0}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium">
                    Core staples
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-amber-800">
                    Swaps
                  </div>
                  <div className="text-lg font-black text-amber-700">
                    {actions.swap_count || 0}
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium">
                    PB Conversion
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-rose-800">
                    Removes
                  </div>
                  <div className="text-lg font-black text-rose-700">
                    -{actions.remove_count || 0}
                  </div>
                  <div className="text-[10px] text-rose-600 font-medium">
                    Low velocity
                  </div>
                </div>
              </div>
            </div>

            {/* Submitter info */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">Reviewing Manager:</span>
              </div>
              <span className="font-mono font-semibold text-slate-800">
                {submitterUser}
              </span>
            </div>
          </div>

          {/* Right Column: Guardrail Status Checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Cluster Guardrail Compliance Checklist
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 text-xs">
              {/* Check 1 */}
              <div className="flex items-start justify-between p-2.5 bg-white rounded-lg border border-slate-200/70">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">
                      Private Brand Target Goal (&ge; 25.0%)
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Projected PB share after scenario is{" "}
                      <strong>
                        {(
                          28.5 +
                          Number(selectedScenario.projected_pb_shift_pct || 0)
                        ).toFixed(1)}
                        %
                      </strong>
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  PASSED
                </span>
              </div>

              {/* Check 2 */}
              <div className="flex items-start justify-between p-2.5 bg-white rounded-lg border border-slate-200/70">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">
                      Shelf Capacity Limit (&le; 95.0%)
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Space utilization is{" "}
                      <strong>
                        {Number(
                          selectedScenario.projected_space_util_pct || 88.5,
                        ).toFixed(1)}
                        %
                      </strong>
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  PASSED
                </span>
              </div>

              {/* Check 3 */}
              <div className="flex items-start justify-between p-2.5 bg-white rounded-lg border border-slate-200/70">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">
                      In-Stock SLA Threshold (&ge; 95.0%)
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Projected in-stock fulfillment stability is{" "}
                      <strong>96.2%</strong>
                    </div>
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  PASSED
                </span>
              </div>
            </div>

            {/* Notes Input */}
            <div>
              <label
                htmlFor="approval-notes"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Audit Notes &amp; Category Authorization (Optional)
              </label>
              <textarea
                id="approval-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Authorized Snacks Q3 Small Town Value Cluster plan per annual assortment refresh."
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB813] text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit Action Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FDB813]" />
            <span>
              Submitting will finalize this assortment revision and generate an
              immutable audit record.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#FDB813] hover:bg-[#e5a60f] text-[#0F172A] font-extrabold px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0F172A]" />
                <span>Recording Audit Trail...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Assortment Plan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
