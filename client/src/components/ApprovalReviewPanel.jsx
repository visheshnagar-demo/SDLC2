import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Send,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

export default function ApprovalReviewPanel({
  selectedScenario = "balanced",
  impactData = null,
  loadingImpact = false,
  onSubmitApproval,
  submitting = false,
  submitError = null,
}) {
  const [managerId, setManagerId] = useState("MGR-5821");
  const [managerEmail, setManagerEmail] = useState("manager@dollargeneral.com");
  const [approvalNotes, setApprovalNotes] = useState(
    "Snacks spring reset assortment alignment for Small Town Value cluster.",
  );

  // Parse scenario label
  const scenarioDisplayName =
    selectedScenario.charAt(0).toUpperCase() +
    selectedScenario.slice(1).toLowerCase();

  // Guardrails
  const guardrails = impactData?.guardrails || [
    {
      name: "Minimum Private Brand % Target",
      target: ">= 25%",
      current_value:
        impactData?.projected_pb_share_pct != null
          ? `${impactData.projected_pb_share_pct}%`
          : "30.0%",
      status:
        (impactData?.projected_pb_share_pct ?? 30.0) >= 25 ? "PASS" : "FAIL",
    },
    {
      name: "Shelf Capacity Ceiling",
      target: "<= 100%",
      current_value:
        impactData?.projected_shelf_capacity_pct != null
          ? `${impactData.projected_shelf_capacity_pct}%`
          : "100.0%",
      status:
        (impactData?.projected_shelf_capacity_pct ?? 100.0) <= 100
          ? "PASS"
          : "FAIL",
    },
    {
      name: "Minimum In-Stock Threshold",
      target: ">= 95%",
      current_value:
        impactData?.projected_instock_rate_pct != null
          ? `${impactData.projected_instock_rate_pct}%`
          : "96.5%",
      status:
        (impactData?.projected_instock_rate_pct ?? 96.5) >= 95
          ? "PASS"
          : "FAIL",
    },
  ];

  const allGuardrailsPass = guardrails.every((g) => g.status === "PASS");
  const canSubmit =
    (impactData?.can_submit !== undefined
      ? impactData.can_submit
      : allGuardrailsPass) && allGuardrailsPass;

  // SKU Actions breakdown
  const skuActions = impactData?.sku_action_summary || {
    add_count:
      selectedScenario === "aggressive"
        ? 4
        : selectedScenario === "conservative"
          ? 1
          : 2,
    keep_count:
      selectedScenario === "aggressive"
        ? 12
        : selectedScenario === "conservative"
          ? 16
          : 14,
    swap_count:
      selectedScenario === "aggressive"
        ? 5
        : selectedScenario === "conservative"
          ? 1
          : 3,
    remove_count:
      selectedScenario === "aggressive"
        ? 2
        : selectedScenario === "conservative"
          ? 0
          : 1,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    onSubmitApproval({
      cluster_id: "small_town_value",
      scenario_key: selectedScenario,
      manager_user_id: managerId.trim() || "MGR-5821",
      manager_email: managerEmail.trim() || "manager@dollargeneral.com",
      notes: approvalNotes.trim(),
    });
  };

  return (
    <section
      className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-8"
      data-testid="approval-review-panel"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-black font-bold text-xs px-2 py-0.5 rounded">
              STEP 4
            </span>
            <h2 className="text-lg font-bold">
              Assortment Approval & Guardrail Review Panel
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Validate business constraints and lock the recommended assortment
            strategy into the cluster planogram.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Selected Scenario:</span>
          <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {scenarioDisplayName} Strategy
          </span>
        </div>
      </div>

      <div className="p-6">
        {submitError && (
          <div
            className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800"
            role="alert"
          >
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Submission Error</h4>
              <p className="text-xs mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Scenario Impact Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Projected Performance Lift
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                <span className="text-slate-600">Projected Sales Lift:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {impactData?.projected_sales_lift_pct != null
                    ? `+${impactData.projected_sales_lift_pct}%`
                    : "+3.2%"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                <span className="text-slate-600">Sales / Linear Foot:</span>
                <span className="font-bold text-slate-900">
                  $
                  {Number(
                    impactData?.projected_sales_per_linear_ft || 191.44,
                  ).toFixed(2)}
                  /ft
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                <span className="text-slate-600">
                  Private Brand Penetration:
                </span>
                <span className="font-bold text-yellow-700">
                  {impactData?.projected_pb_share_pct != null
                    ? `${impactData.projected_pb_share_pct}%`
                    : "30.0%"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/60">
                <span className="text-slate-600">Projected In-Stock Rate:</span>
                <span className="font-bold text-slate-900">
                  {impactData?.projected_instock_rate_pct != null
                    ? `${impactData.projected_instock_rate_pct}%`
                    : "96.5%"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-600">
                  Shelf Capacity Utilization:
                </span>
                <span className="font-bold text-slate-900">
                  {impactData?.projected_shelf_capacity_pct != null
                    ? `${impactData.projected_shelf_capacity_pct}%`
                    : "100.0%"}
                </span>
              </div>
            </div>

            {/* SKU Action Summary Counters */}
            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">
                SKU Action Breakdown
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-emerald-100/70 border border-emerald-200 p-1.5 rounded">
                  <span className="block text-[10px] text-emerald-800 font-medium">
                    ADD
                  </span>
                  <span className="text-xs font-bold text-emerald-900">
                    {skuActions.add_count ?? 2}
                  </span>
                </div>
                <div className="bg-blue-100/70 border border-blue-200 p-1.5 rounded">
                  <span className="block text-[10px] text-blue-800 font-medium">
                    KEEP
                  </span>
                  <span className="text-xs font-bold text-blue-900">
                    {skuActions.keep_count ?? 14}
                  </span>
                </div>
                <div className="bg-amber-100/70 border border-amber-200 p-1.5 rounded">
                  <span className="block text-[10px] text-amber-800 font-medium">
                    SWAP
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {skuActions.swap_count ?? 3}
                  </span>
                </div>
                <div className="bg-rose-100/70 border border-rose-200 p-1.5 rounded">
                  <span className="block text-[10px] text-rose-800 font-medium">
                    REMOVE
                  </span>
                  <span className="text-xs font-bold text-rose-900">
                    {skuActions.remove_count ?? 1}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Guardrail Status Checks */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Operational Guardrails
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    allGuardrailsPass
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-rose-100 text-rose-800 border border-rose-300"
                  }`}
                >
                  {allGuardrailsPass
                    ? "All Checks Passed"
                    : "Constraint Violated"}
                </span>
              </div>

              <div className="space-y-3">
                {guardrails.map((g, idx) => {
                  const isPass = g.status === "PASS";
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs ${
                        isPass
                          ? "bg-white border-emerald-200"
                          : "bg-rose-50/80 border-rose-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isPass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800">
                            {g.name}
                          </span>
                        </div>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            isPass
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {g.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1 pl-6">
                        <span>Target: {g.target}</span>
                        <span className="font-medium text-slate-700">
                          Projected: {g.current_value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {!allGuardrailsPass && (
              <div className="mt-3 p-2.5 bg-rose-100 border border-rose-300 rounded text-rose-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>
                  One or more guardrail checks failed. Submission is blocked.
                </span>
              </div>
            )}
          </div>

          {/* Column 3: Manager Sign-off & Submit Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col h-full justify-between"
            >
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-600" /> Manager
                  Sign-Off
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Category Manager ID
                    </label>
                    <input
                      type="text"
                      value={managerId}
                      onChange={(e) => setManagerId(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Manager Email
                    </label>
                    <input
                      type="email"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Default: manager@dollargeneral.com
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Approval / Planogram Notes
                    </label>
                    <textarea
                      rows={2}
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={!canSubmit || submitting || loadingImpact}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                    canSubmit && !submitting && !loadingImpact
                      ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300 hover:shadow active:scale-[0.99] cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                      <span>Locking Approval...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Approval</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-1.5">
                  Records an immutable audit trail in cluster planogram
                  database.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
