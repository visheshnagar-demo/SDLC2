import React from "react";
import {
  CheckCircle2,
  ShieldCheck,
  FileText,
  Calendar,
  User,
  Hash,
  X,
  Sparkles,
} from "lucide-react";

export default function InlineAuditConfirmationModal({
  isOpen = false,
  onClose,
  approvalResult = null,
}) {
  if (!isOpen || !approvalResult) return null;

  const auditRef = approvalResult.audit_reference_id || "AUD-2026-STV-9941";
  const timestamp = approvalResult.approved_at || new Date().toISOString();
  const managerId = approvalResult.manager_user_id || "MGR-5821";
  const managerEmail =
    approvalResult.manager_email || "manager@dollargeneral.com";
  const scenario = (
    approvalResult.approved_scenario || "Balanced"
  ).toUpperCase();
  const status = approvalResult.status || "APPROVED";

  const actions = approvalResult.sku_action_metrics || {
    add_count: 2,
    keep_count: 14,
    swap_count: 3,
    remove_count: 1,
  };

  const impact = approvalResult.projected_impact || {
    sales_lift_pct: 3.2,
    pb_share_pct: 30.0,
    instock_rate_pct: 96.5,
    shelf_capacity_pct: 100.0,
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      data-testid="inline-audit-confirmation-modal"
    >
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 relative transform transition-all">
        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Confirmation Modal"
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1">
              STATUS: {status}
            </span>
            <h2
              id="audit-modal-title"
              className="text-xl sm:text-2xl font-bold text-slate-900"
            >
              Assortment Approval Confirmed & Locked
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-6">
          The Snacks product assortment for the{" "}
          <strong>Small Town Value Cluster</strong> has been officially
          approved. The audit trail record has been cryptographically locked in
          the planogram repository.
        </p>

        {/* Audit ID Box */}
        <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-yellow-400 font-semibold tracking-wider uppercase block">
              Official Audit Reference Identifier
            </span>
            <span className="text-lg sm:text-xl font-mono font-bold text-white tracking-wide">
              {auditRef}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable Ledger Record</span>
          </div>
        </div>

        {/* Audit Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px] mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp
              (UTC)
            </span>
            <span className="font-mono text-slate-900 font-medium">
              {timestamp}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px] mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Approving Manager
            </span>
            <span className="font-medium text-slate-900">
              {managerId} ({managerEmail})
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px] mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Selected
              Strategy Preset
            </span>
            <span className="font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300">
              {scenario}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px] mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Cluster Scope
            </span>
            <span className="font-medium text-slate-900">
              Small Town Value (Snacks Category)
            </span>
          </div>
        </div>

        {/* Action Metrics & Impact Summary */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 mb-6">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Approved SKU Planogram Actions
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white border border-emerald-200 p-2 rounded-lg">
              <span className="text-[10px] text-emerald-700 font-semibold block">
                ADDED
              </span>
              <span className="text-sm font-bold text-emerald-900">
                {actions.add_count ?? 2} SKUs
              </span>
            </div>
            <div className="bg-white border border-blue-200 p-2 rounded-lg">
              <span className="text-[10px] text-blue-700 font-semibold block">
                KEPT
              </span>
              <span className="text-sm font-bold text-blue-900">
                {actions.keep_count ?? 14} SKUs
              </span>
            </div>
            <div className="bg-white border border-amber-200 p-2 rounded-lg">
              <span className="text-[10px] text-amber-700 font-semibold block">
                SWAPPED
              </span>
              <span className="text-sm font-bold text-amber-900">
                {actions.swap_count ?? 3} SKUs
              </span>
            </div>
            <div className="bg-white border border-rose-200 p-2 rounded-lg">
              <span className="text-[10px] text-rose-700 font-semibold block">
                REDUCED
              </span>
              <span className="text-sm font-bold text-rose-900">
                {actions.remove_count ?? 1} SKUs
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
          >
            Acknowledge & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
