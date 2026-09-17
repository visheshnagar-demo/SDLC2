import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  CheckCircle2,
  Copy,
  Check,
  X,
  ShieldCheck,
  Clock,
  User,
  Sparkles,
} from "lucide-react";

export default function InlineConfirmation({ confirmationData, onDismiss }) {
  const [copied, setCopied] = useState(false);

  if (!confirmationData) return null;

  const {
    audit_confirmation_id,
    submitted_at,
    scenario_name,
    user_id,
    guardrail_status,
    summary,
  } = confirmationData;

  const handleCopy = () => {
    if (audit_confirmation_id && navigator?.clipboard) {
      navigator.clipboard.writeText(audit_confirmation_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = submitted_at
    ? new Date(submitted_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
      })
    : new Date().toISOString();

  return (
    <div
      role="region"
      aria-label="Assortment Plan Submission Confirmation"
      className="bg-emerald-950/40 border-2 border-[#10B981] rounded-xl p-5 shadow-2xl mb-6 relative overflow-hidden transition-all duration-300"
    >
      {/* Background Glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#10B981]/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 mt-0.5 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold font-heading text-white">
                Assortment Plan Successfully Submitted & Audited
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                <ShieldCheck className="w-3 h-3" />
                Guardrails: {guardrail_status || "PASSED"}
              </span>
            </div>

            <p className="text-xs text-emerald-200/90 mt-1">
              Assortment plan decision snapshot has been permanently recorded in
              the DG Audit Ledger.
            </p>

            {/* Audit Details Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-emerald-800/40 text-xs">
              {/* Audit Confirmation ID */}
              <div className="bg-[#0F172A]/80 border border-emerald-900/60 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block font-mono">
                    Audit Confirmation ID
                  </span>
                  <span className="font-mono font-bold text-[#FFD200] text-sm">
                    {audit_confirmation_id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Confirmation ID"
                  className="p-1.5 rounded hover:bg-[#1E293B] text-[#94A3B8] hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Scenario */}
              <div className="bg-[#0F172A]/80 border border-emerald-900/60 rounded-lg p-2.5">
                <span className="text-[10px] text-[#94A3B8] uppercase block font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FFD200]" /> Scenario
                </span>
                <span className="font-semibold text-white">
                  {scenario_name || "Balanced"}
                </span>
              </div>

              {/* Submitted By */}
              <div className="bg-[#0F172A]/80 border border-emerald-900/60 rounded-lg p-2.5">
                <span className="text-[10px] text-[#94A3B8] uppercase block font-mono flex items-center gap-1">
                  <User className="w-3 h-3 text-[#38BDF8]" /> Submitted By
                </span>
                <span className="font-mono text-white">
                  {user_id || "mgr_snack_001"}
                </span>
              </div>

              {/* Timestamp */}
              <div className="bg-[#0F172A]/80 border border-emerald-900/60 rounded-lg p-2.5">
                <span className="text-[10px] text-[#94A3B8] uppercase block font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Timestamp
                </span>
                <span
                  className="text-[11px] text-[#94A3B8] block truncate"
                  title={formattedDate}
                >
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Summary Metrics */}
            {summary && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-200">
                <span>
                  Projected Sales/Ft:{" "}
                  <strong className="font-mono text-white">
                    ${Number(summary.projected_sales_per_linear_ft).toFixed(2)}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Projected PB Share:{" "}
                  <strong className="font-mono text-white">
                    {Number(summary.projected_private_brand_pct).toFixed(1)}%
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Total SKUs Evaluated:{" "}
                  <strong className="font-mono text-white">
                    {summary.total_skus_reviewed}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close confirmation banner"
          className="p-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-900 text-emerald-300 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

InlineConfirmation.propTypes = {
  confirmationData: PropTypes.shape({
    audit_confirmation_id: PropTypes.string.isRequired,
    submitted_at: PropTypes.string,
    scenario_name: PropTypes.string.isRequired,
    user_id: PropTypes.string.isRequired,
    guardrail_status: PropTypes.string,
    summary: PropTypes.shape({
      projected_sales_per_linear_ft: PropTypes.number,
      projected_private_brand_pct: PropTypes.number,
      total_skus_reviewed: PropTypes.number,
    }),
  }),
  onDismiss: PropTypes.func.isRequired,
};
