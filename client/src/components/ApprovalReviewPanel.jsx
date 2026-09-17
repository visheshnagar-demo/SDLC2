import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  Sliders,
  TrendingUp,
  Percent,
  CheckCheck,
  Shield,
  Layers,
} from "lucide-react";

export default function ApprovalReviewPanel({
  evaluation,
  evaluating = false,
  error = null,
  onSubmitPlan,
  submitting = false,
  submitError = null,
}) {
  const [managerName, setManagerName] = useState("Category Manager - Snacks");
  const [notes, setNotes] = useState("");

  if (evaluating) {
    return (
      <section
        aria-label="Approval Review Panel"
        className="bg-[#0F172A] border border-[#334155] rounded-xl p-6 mb-6 shadow-xl animate-pulse"
      >
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-800 rounded"></div>
          <div className="h-32 bg-slate-800 rounded"></div>
          <div className="h-32 bg-slate-800 rounded"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1E293B] border border-[#F43F5E] rounded-xl p-5 mb-6 text-[#F8FAFC]">
        <p className="font-semibold text-sm text-[#F43F5E]">
          Scenario Evaluation Error
        </p>
        <p className="text-xs text-[#94A3B8]">{error}</p>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const {
    scenario_code = "balanced",
    scenario_name = "Balanced Strategy",
    projected_impact = {},
    action_summary = {},
    guardrail_checks = [],
    is_submittable = true,
  } = evaluation;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!is_submittable || submitting) return;
    onSubmitPlan({
      scenario_code,
      cluster_code: "STV-CLUSTER",
      submitted_by: managerName,
      notes: notes || undefined,
    });
  };

  const allGuardrailsPass = guardrail_checks.every(
    (g) => g.status === "PASSED" || g.status === "ACTIVE" || g.status === "MET",
  );

  return (
    <section
      aria-label="Approval Review Panel"
      className="bg-[#0F172A] border border-[#334155] rounded-xl p-6 mb-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 border-b border-[#334155] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#FFDD00]" />
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              Approval Review &amp; Guardrail Compliance &bull;{" "}
              <span className="text-[#FFDD00]">{scenario_name}</span>
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Verify automated guardrails and projected financial thresholds
            before committing the plan to the supply chain.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${
              allGuardrailsPass
                ? "bg-emerald-500/15 text-[#10B981] border-emerald-500/30"
                : "bg-amber-500/15 text-[#F59E0B] border-amber-500/30"
            }`}
          >
            {allGuardrailsPass ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Guardrails Compliant
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                Review Warnings
              </>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Financial & Operational Projections */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#FFDD00]" />
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              Projected Impact Summary
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-[#334155]/60">
              <span className="text-[#94A3B8]">Sales / Linear Foot</span>
              <div className="text-right">
                <span className="font-bold text-[#F8FAFC]">
                  $
                  {Number(
                    projected_impact.projected_sales_per_linear_foot || 0,
                  ).toFixed(2)}
                </span>
                <span className="text-[10px] text-[#10B981] ml-1.5">
                  ({projected_impact.sales_delta_pct > 0 ? "+" : ""}
                  {Number(projected_impact.sales_delta_pct || 0).toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#334155]/60">
              <span className="text-[#94A3B8]">Category Gross Margin</span>
              <div className="text-right">
                <span className="font-bold text-[#10B981]">
                  {Number(projected_impact.projected_margin_pct || 0).toFixed(
                    1,
                  )}
                  %
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#334155]/60">
              <span className="text-[#94A3B8]">Private Brand Share</span>
              <div className="text-right">
                <span className="font-bold text-[#F8FAFC]">
                  {projected_impact.pb_share_pct > 0 ? "+" : ""}
                  {Number(projected_impact.pb_share_pct || 0).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-[#334155]/60">
              <span className="text-[#94A3B8]">In-Stock Rate Delta</span>
              <div className="text-right">
                <span className="font-bold text-[#F8FAFC]">
                  {projected_impact.in_stock_pct > 0 ? "+" : ""}
                  {Number(projected_impact.in_stock_pct || 0).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#94A3B8]">Shelf Space Delta</span>
              <div className="text-right">
                <span className="font-bold text-[#F8FAFC]">
                  {projected_impact.capacity_pct > 0 ? "+" : ""}
                  {Number(projected_impact.capacity_pct || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Proposed SKU Action Breakdown */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#FFDD00]" />
            <h3 className="text-sm font-semibold text-[#F8FAFC]">
              Proposed SKU Action List
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-emerald-500/20 text-center">
              <span className="text-[11px] text-emerald-400 font-bold block">
                GROW
              </span>
              <span className="text-xl font-extrabold text-[#F8FAFC]">
                {action_summary.grow_count ?? 0}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">
                SKUs expanded
              </span>
            </div>

            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-sky-500/20 text-center">
              <span className="text-[11px] text-sky-400 font-bold block">
                MAINTAIN
              </span>
              <span className="text-xl font-extrabold text-[#F8FAFC]">
                {action_summary.maintain_count ?? 0}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">
                SKUs stable
              </span>
            </div>

            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-amber-500/20 text-center">
              <span className="text-[11px] text-[#F59E0B] font-bold block">
                SWAP
              </span>
              <span className="text-xl font-extrabold text-[#F8FAFC]">
                {action_summary.swap_count ?? 0}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">
                SKUs replaced
              </span>
            </div>

            <div className="bg-[#0F172A] p-2.5 rounded-lg border border-rose-500/20 text-center">
              <span className="text-[11px] text-[#F43F5E] font-bold block">
                REDUCE
              </span>
              <span className="text-xl font-extrabold text-[#F8FAFC]">
                {action_summary.reduce_count ?? 0}
              </span>
              <span className="text-[10px] text-[#94A3B8] block">
                SKUs reduced
              </span>
            </div>
          </div>

          <div className="text-xs text-center text-[#94A3B8] bg-[#0F172A] py-1.5 rounded-md border border-[#334155]">
            Total Assortment Decisions:{" "}
            <span className="font-bold text-[#F8FAFC]">
              {action_summary.total_actions ?? 0}
            </span>
          </div>
        </div>

        {/* Column 3: Guardrail Compliance Checklist & Commit Action */}
        <div className="bg-[#1E293B] border border-[#334155] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[#FFDD00]" />
              <h3 className="text-sm font-semibold text-[#F8FAFC]">
                Guardrail Policy Checklist
              </h3>
            </div>

            <div className="space-y-2 mb-4">
              {guardrail_checks.map((check) => {
                const passed =
                  check.status === "PASSED" ||
                  check.status === "ACTIVE" ||
                  check.status === "MET";

                return (
                  <div
                    key={check.rule_key}
                    className="flex items-center justify-between text-xs bg-[#0F172A] p-2 rounded-lg border border-[#334155]"
                  >
                    <div className="flex items-center gap-2">
                      {passed ? (
                        <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                      )}
                      <span className="text-[#F8FAFC] font-medium">
                        {check.rule_name}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        passed
                          ? "bg-emerald-500/10 text-[#10B981]"
                          : "bg-amber-500/10 text-[#F59E0B]"
                      }`}
                    >
                      {Number(check.actual_value).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission Form */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-[#334155] pt-3"
          >
            {submitError && (
              <div className="mb-2 p-2 bg-rose-500/10 border border-[#F43F5E] rounded text-[11px] text-[#F43F5E]">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={!is_submittable || submitting}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                !is_submittable || submitting
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-[#FFDD00] text-[#090D16] hover:bg-yellow-400 hover:shadow-yellow-500/20 active:scale-[0.98]"
              }`}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#090D16] border-t-transparent rounded-full animate-spin"></span>
                  <span>Submitting &amp; Logging Audit...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit &amp; Execute Assortment Plan</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-[#94A3B8] mt-1.5">
              Generates cryptographic audit receipt and updates replenishment
              orders.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
