import React from "react";
import {
  CheckCircle2,
  ShieldCheck,
  X,
  FileCheck,
  Calendar,
  Hash,
  User,
  Layers,
} from "lucide-react";

export const InlineConfirmationModal = ({ confirmationData, onClose }) => {
  if (!confirmationData) return null;

  const {
    audit_id = "AUD-2026-99482",
    submission_id = "SUB-99482",
    status = "APPROVED",
    cluster_id = "STV-CLUSTER-01",
    scenario_type = "BALANCED",
    sku_actions_committed = 12,
    guardrail_summary = "All 3 Guardrails Verified & Passed",
    submitted_by = "category_manager_dg@example.com",
    submitted_at = new Date().toISOString(),
    confirmation_message = "Assortment Plan Submitted Successfully!",
  } = confirmationData;

  const formattedTimestamp = (() => {
    try {
      return (
        new Date(submitted_at).toLocaleString("en-US", {
          timeZone: "UTC",
          dateStyle: "medium",
          timeStyle: "medium",
        }) + " UTC"
      );
    } catch {
      return submitted_at;
    }
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-emerald-950/40 relative overflow-hidden text-slate-100">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500"></div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Close confirmation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3
              id="confirmation-modal-title"
              className="text-lg font-bold text-slate-100"
            >
              {confirmation_message ||
                "Assortment Plan Submitted Successfully!"}
            </h3>
            <p className="text-xs text-emerald-400 font-mono">
              Status: <span className="font-bold">{status}</span> &bull; Audit
              Trail Recorded
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs font-mono mb-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" /> Audit ID:
            </span>
            <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              {audit_id}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp:
            </span>
            <span className="text-slate-200">{formattedTimestamp}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Cluster &
              Category:
            </span>
            <span className="text-slate-200">{cluster_id} &bull; Snacks</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-400" /> Scenario
              Strategy:
            </span>
            <span className="text-slate-200 font-bold uppercase">
              {scenario_type}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Submitted By:
            </span>
            <span className="text-slate-300 truncate max-w-[200px]">
              {submitted_by}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />{" "}
              Guardrails & Actions:
            </span>
            <span className="text-emerald-300 font-sans font-semibold">
              {sku_actions_committed} Actions ({guardrail_summary})
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-400/20"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineConfirmationModal;
