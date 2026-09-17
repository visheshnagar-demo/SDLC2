import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";

export default function ApprovalReviewPanel({
  activeScenario,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  const [userId, setUserId] = useState("mgr_snack_001");
  const [justificationNote, setJustificationNote] = useState("");

  if (!activeScenario) {
    return (
      <section
        aria-label="Approval Review Panel"
        className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg mb-6"
      >
        <div className="py-6 text-center text-[#94A3B8] text-sm animate-pulse">
          Loading scenario review details...
        </div>
      </section>
    );
  }

  // Guardrail evaluations
  const pbPct = Number(activeScenario.projected_private_brand_pct || 0);
  const pbPass = pbPct >= 25.0;

  const shelfCapPct = Number(activeScenario.projected_shelf_capacity_pct || 0);
  const shelfCapPass = shelfCapPct <= 98.0 && shelfCapPct >= 80.0;

  const inStockPct = Number(activeScenario.projected_in_stock_rate_pct || 0);
  const inStockPass = inStockPct >= 94.0;

  const allGuardrailsPass = pbPass && shelfCapPass && inStockPass;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    onSubmit({
      scenario_key: activeScenario.scenario_key,
      user_id: userId.trim() || "mgr_snack_001",
      justification_note: justificationNote.trim() || undefined,
    });
  };

  const actionCounts = activeScenario.action_counts || {
    GROW: 0,
    MAINTAIN: 0,
    SWAP: 0,
    REDUCE: 0,
  };

  return (
    <section
      aria-label="Approval Review Panel"
      className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg mb-6"
    >
      <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#FFD200]/10 text-[#FFD200]">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-heading text-white">
              Scenario Approval & Guardrail Review
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Review compliance checks and submit assortment plan for execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8]">Target Scenario:</span>
          <span className="px-2.5 py-1 rounded bg-[#FFD200] text-[#0B132B] font-bold text-xs uppercase">
            {activeScenario.display_name}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Error Notice if any */}
        {submitError && (
          <div
            role="alert"
            className="p-3.5 bg-red-500/10 border border-red-500/40 rounded-lg flex items-start gap-3 text-xs text-red-300"
          >
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="font-semibold text-red-200 block">
                Submission Failed
              </strong>
              <span>{submitError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Action Breakdown & Guardrails */}
          <div className="space-y-4">
            {/* Action Breakdown Cards */}
            <div>
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 font-mono">
                SKU Action Summary
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#1E293B] border border-[#10B981]/30 rounded-lg p-2.5">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">
                    GROW
                  </span>
                  <span className="text-lg font-bold font-mono text-[#10B981]">
                    {actionCounts.GROW}
                  </span>
                </div>
                <div className="bg-[#1E293B] border border-[#38BDF8]/30 rounded-lg p-2.5">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">
                    MAINTAIN
                  </span>
                  <span className="text-lg font-bold font-mono text-[#38BDF8]">
                    {actionCounts.MAINTAIN}
                  </span>
                </div>
                <div className="bg-[#1E293B] border border-[#F59E0B]/30 rounded-lg p-2.5">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">
                    SWAP
                  </span>
                  <span className="text-lg font-bold font-mono text-[#F59E0B]">
                    {actionCounts.SWAP}
                  </span>
                </div>
                <div className="bg-[#1E293B] border border-[#F43F5E]/30 rounded-lg p-2.5">
                  <span className="text-[10px] text-[#94A3B8] block uppercase">
                    REDUCE
                  </span>
                  <span className="text-lg font-bold font-mono text-[#F43F5E]">
                    {actionCounts.REDUCE}
                  </span>
                </div>
              </div>
            </div>

            {/* Guardrail Checks */}
            <div>
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2 font-mono">
                Automated Guardrail Checks
              </h3>
              <div className="space-y-2 text-xs">
                {/* Guardrail 1 */}
                <div className="flex items-center justify-between p-2.5 bg-[#1E293B]/70 rounded-lg border border-[#334155]">
                  <div className="flex items-center gap-2">
                    {pbPass ? (
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                    )}
                    <span className="text-white font-medium">
                      Minimum 25.0% Private Brand Target
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#94A3B8]">
                      {pbPct.toFixed(1)}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pbPass
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                      }`}
                    >
                      {pbPass ? "PASSED" : "FLAGGED"}
                    </span>
                  </div>
                </div>

                {/* Guardrail 2 */}
                <div className="flex items-center justify-between p-2.5 bg-[#1E293B]/70 rounded-lg border border-[#334155]">
                  <div className="flex items-center gap-2">
                    {shelfCapPass ? (
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                    )}
                    <span className="text-white font-medium">
                      Shelf Capacity Limits (80 - 98%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#94A3B8]">
                      {shelfCapPct.toFixed(1)}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        shelfCapPass
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                      }`}
                    >
                      {shelfCapPass ? "PASSED" : "FLAGGED"}
                    </span>
                  </div>
                </div>

                {/* Guardrail 3 */}
                <div className="flex items-center justify-between p-2.5 bg-[#1E293B]/70 rounded-lg border border-[#334155]">
                  <div className="flex items-center gap-2">
                    {inStockPass ? (
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-[#F59E0B]" />
                    )}
                    <span className="text-white font-medium">
                      In-Stock SLA Threshold (&gt;= 94.0%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#94A3B8]">
                      {inStockPct.toFixed(1)}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inStockPass
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30"
                          : "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30"
                      }`}
                    >
                      {inStockPass ? "PASSED" : "FLAGGED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: User Info, Justification & Action */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Category Manager ID */}
              <div>
                <label
                  htmlFor="user-id-input"
                  className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" /> Category Manager ID
                </label>
                <input
                  id="user-id-input"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="mgr_snack_001"
                  className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FFD200]"
                />
              </div>

              {/* Justification Note */}
              <div>
                <label
                  htmlFor="justification-input"
                  className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1 font-mono flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> Approval Justification /
                  Notes
                </label>
                <textarea
                  id="justification-input"
                  rows={3}
                  value={justificationNote}
                  onChange={(e) => setJustificationNote(e.target.value)}
                  placeholder="Optional notes regarding cluster shelf adjustments, private brand expansion, or swap rationale..."
                  className="w-full px-3 py-2 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FFD200]"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#FFD200] text-[#0B132B] font-bold font-heading rounded-lg text-sm hover:bg-[#ffe043] focus:outline-none focus:ring-2 focus:ring-[#FFD200]/50 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Plan to Audit Ledger...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Assortment Plan ({activeScenario.display_name})
                  </>
                )}
              </button>
              <p className="text-[11px] text-[#94A3B8] text-center mt-2">
                Submitting creates an immutable audit snapshot with SKU metrics
                and guardrail validation.
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

ApprovalReviewPanel.propTypes = {
  activeScenario: PropTypes.shape({
    scenario_key: PropTypes.string.isRequired,
    display_name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    projected_sales_per_linear_ft: PropTypes.number,
    projected_private_brand_pct: PropTypes.number,
    projected_in_stock_rate_pct: PropTypes.number,
    projected_shelf_capacity_pct: PropTypes.number,
    action_counts: PropTypes.shape({
      GROW: PropTypes.number,
      MAINTAIN: PropTypes.number,
      SWAP: PropTypes.number,
      REDUCE: PropTypes.number,
    }),
  }),
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  submitError: PropTypes.string,
};
