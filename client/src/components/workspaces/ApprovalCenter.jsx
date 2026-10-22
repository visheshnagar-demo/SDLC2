import React, { useState } from "react";
import {
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lock,
  Unlock,
} from "lucide-react";
import { PERSONAS } from "../../services/mockData";

export default function ApprovalCenter({
  activeCase,
  currentPersonaKey,
  onSubmitApproval,
  onNextStage,
}) {
  const activePersona = PERSONAS[currentPersonaKey] || PERSONAS.underwriter;
  const [approvalComments, setApprovalComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const dealLimitNumeric = activeCase?.limitNumeric || 10000000;
  const userAuthorityNumeric = activePersona.authorityAmount || 0;
  const hasAuthority = userAuthorityNumeric >= dealLimitNumeric;

  const handleApprove = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitApproval({
        decision: "APPROVED",
        comments:
          approvalComments || "Authorized terms per governance standards.",
        approverName: activePersona.name,
      });
      setIsSubmitting(false);
      setActionMessage({
        type: "success",
        text: `Deal successfully authorized by ${activePersona.name} (${activePersona.shortRole}).`,
      });
    }, 500);
  };

  const handleReject = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitApproval({
        decision: "REJECTED",
        comments:
          approvalComments || "Declined due to exposure / terms mismatch.",
        approverName: activePersona.name,
      });
      setIsSubmitting(false);
      setActionMessage({
        type: "error",
        text: `Deal declined by ${activePersona.name}.`,
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
              Stage 08: Review & Approval Center
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Case: {activeCase?.caseNumber}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Human-In-The-Loop Governance & Authority Check
          </h2>
          <p className="text-xs text-slate-500">
            Enforces corporate binding authority limits (BR-02 & BR-04) ensuring
            high-exposure contracts receive required executive and legal
            concurrence.
          </p>
        </div>

        <button
          onClick={() => onNextStage("bind")}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-sm whitespace-nowrap"
        >
          <span>Proceed to Bind Readiness</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-300"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Authority Status + Sign-Off Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Persona Authority Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-teal-600" />
            Active Underwriter Authority
          </h3>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${activePersona.badgeColor}`}
              >
                {activePersona.avatar}
              </span>
              <div>
                <div className="font-bold text-slate-900">
                  {activePersona.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {activePersona.role}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Individual Authority:</span>
                <span className="font-bold text-slate-900">
                  {activePersona.authorityLimit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deal Limit Required:</span>
                <span className="font-bold text-teal-800">
                  {activeCase?.requestedLimit}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              {hasAuthority ? (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  <span>Authority Cleared (Within Limit)</span>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-amber-700 font-semibold text-xs">
                  <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Referral Required: Deal limit exceeds {activePersona.name}'s
                    authority ({activePersona.authorityLimit}). Switch to CUO
                    (Michael Sterling) or submit referral.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Approval Authorization Action Panel (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Governance Authorization Form</span>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded">
              Gate #6 Verification
            </span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="text-[11px] text-slate-500 block">
                  Treaty Identifier
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {activeCase?.caseNumber}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">
                  Gross Reinsurance Premium
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {activeCase?.grossPremium}
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1.5">
                Approver Notes & Conditions (Appended to Binder & Audit Log):
              </label>
              <textarea
                rows={4}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="e.g. Terms reviewed and authorized in accordance with Gen Re Underwriting Guidelines 2026. Loss model within target tolerances..."
                className="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Decline / Reject Deal</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm ${
                  hasAuthority
                    ? "bg-teal-600 hover:bg-teal-500"
                    : "bg-amber-600 hover:bg-amber-500"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {hasAuthority
                    ? "Authorize & Grant Binding Authority"
                    : "Override & Authorize as Executive"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
