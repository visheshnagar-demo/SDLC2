import React from "react";
import {
  CheckCircle2,
  Shield,
  Calendar,
  User,
  FileText,
  X,
  ArrowRight,
  Check,
} from "lucide-react";

export default function ConfirmationModal({ isOpen, onClose, plan }) {
  if (!isOpen || !plan) return null;

  const {
    audit_id = "AUD-2026-00000",
    status = "APPROVED",
    submitted_by = "Category Manager",
    timestamp = new Date().toISOString(),
    guardrail_status = "COMPLIANT",
    total_sku_actions = 0,
    audit_trail_summary = {},
  } = plan;

  const actionBreakdown = audit_trail_summary?.action_breakdown || {
    GROW: 4,
    MAINTAIN: 8,
    SWAP: 2,
    REDUCE: 2,
  };

  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-[#0F172A] border border-[#FFDD00] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-[#F8FAFC]">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-1 rounded-lg bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#334155] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-[#334155] pb-4">
          <div className="p-3 bg-emerald-500/15 text-[#10B981] rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-[#F8FAFC]">
              Assortment Plan Submitted &amp; Approved
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Execution directive successfully logged in the central Dollar
              General merchandising registry.
            </p>
          </div>
        </div>

        {/* Audit ID Highlight Strip */}
        <div className="bg-[#1E293B] border border-[#FFDD00]/40 rounded-xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-semibold">
              Immutable Audit ID
            </span>
            <span className="text-lg font-mono font-bold text-[#FFDD00] tracking-wide">
              {audit_id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-500/15 text-[#10B981] border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              {status}
            </span>
            <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-bold">
              {guardrail_status}
            </span>
          </div>
        </div>

        {/* Audit Details Grid */}
        <div className="space-y-3 mb-6 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-[#1E293B] p-3 rounded-xl border border-[#334155]">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Calendar className="w-4 h-4 text-[#FFDD00]" />
              <div>
                <span className="text-[10px] uppercase block">
                  Timestamp (UTC)
                </span>
                <span className="text-[#F8FAFC] font-medium">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#94A3B8]">
              <User className="w-4 h-4 text-[#FFDD00]" />
              <div>
                <span className="text-[10px] uppercase block">
                  Submitted By
                </span>
                <span className="text-[#F8FAFC] font-medium">
                  {submitted_by}
                </span>
              </div>
            </div>
          </div>

          {/* Action Breakdown Summary */}
          <div className="bg-[#1E293B] p-3 rounded-xl border border-[#334155]">
            <span className="text-[10px] uppercase text-[#94A3B8] font-semibold block mb-2">
              Action Execution Summary ({total_sku_actions} Total SKU
              Modifications)
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#0F172A] p-2 rounded-lg border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 block">
                  GROW
                </span>
                <span className="text-sm font-extrabold text-[#F8FAFC]">
                  {actionBreakdown.GROW ?? actionBreakdown.grow_count ?? 0}
                </span>
              </div>
              <div className="bg-[#0F172A] p-2 rounded-lg border border-sky-500/20">
                <span className="text-xs font-bold text-sky-400 block">
                  MAINTAIN
                </span>
                <span className="text-sm font-extrabold text-[#F8FAFC]">
                  {actionBreakdown.MAINTAIN ??
                    actionBreakdown.maintain_count ??
                    0}
                </span>
              </div>
              <div className="bg-[#0F172A] p-2 rounded-lg border border-amber-500/20">
                <span className="text-xs font-bold text-[#F59E0B] block">
                  SWAP
                </span>
                <span className="text-sm font-extrabold text-[#F8FAFC]">
                  {actionBreakdown.SWAP ?? actionBreakdown.swap_count ?? 0}
                </span>
              </div>
              <div className="bg-[#0F172A] p-2 rounded-lg border border-rose-500/20">
                <span className="text-xs font-bold text-[#F43F5E] block">
                  REDUCE
                </span>
                <span className="text-sm font-extrabold text-[#F8FAFC]">
                  {actionBreakdown.REDUCE ?? actionBreakdown.reduce_count ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-[#334155] pt-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FFDD00] text-[#090D16] font-bold text-xs hover:bg-yellow-400 transition"
          >
            Acknowledge &amp; Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
