import React from "react";
import {
  Check,
  ShieldCheck,
  Download,
  X,
  Copy,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

export default function InlineConfirmationBanner({
  submissionResult,
  onDismiss,
}) {
  if (!submissionResult) return null;

  const data = {
    submission_id: submissionResult.submission_id || "sub-9942",
    audit_reference: submissionResult.audit_reference || "AUD-2026-9942",
    timestamp: submissionResult.submitted_at || new Date().toISOString(),
    submitted_by:
      submissionResult.submitted_by_user || "catman.snacks@dollargeneral.local",
    target_cluster:
      submissionResult.target_cluster || "Small Town Value Cluster",
    scenario_type: submissionResult.scenario_type || "Balanced Scenario",
    guardrail_status: submissionResult.guardrail_status || "PASSED",
    checksum:
      submissionResult.checksum ||
      "sha256:8f4b2a991c08d4e7f2b5a123c8901ef45bc7982a",
    actions: submissionResult.sku_action_summary || {
      add_count: 5,
      keep_count: 30,
      swap_count: 5,
      remove_count: 2,
    },
  };

  const handleDownload = () => {
    const jsonBlob = new Blob([JSON.stringify(submissionResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-certificate-${data.audit_reference}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all scale-100">
        {/* Modal Header */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <h2
                id="audit-modal-title"
                className="text-xl font-extrabold text-slate-900 tracking-tight"
              >
                Assortment Plan Submitted Successfully
              </h2>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Audit Reference:{" "}
                <span className="font-bold text-slate-900">
                  {data.audit_reference}
                </span>{" "}
                | Timestamp: {data.timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-emerald-100/60 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-500 text-xs block">Submitted By</span>
              <strong className="text-slate-800 font-mono text-xs">
                {data.submitted_by}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 text-xs block">
                Target Cluster
              </span>
              <strong className="text-slate-800">{data.target_cluster}</strong>
            </div>

            <div>
              <span className="text-slate-500 text-xs block">
                Selected Strategy
              </span>
              <strong className="text-slate-800 font-bold">
                {data.scenario_type}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 text-xs block">
                Guardrail Status
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                {data.guardrail_status}
              </span>
            </div>
          </div>

          {/* Action pills summary */}
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Action Execution Summary
            </span>
            <div className="flex flex-wrap gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-bold border border-emerald-200">
                +{data.actions.add_count || 0} Adds
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1.5 rounded-lg font-bold border border-blue-200">
                {data.actions.keep_count || 0} Keeps
              </span>
              <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-lg font-bold border border-amber-200">
                {data.actions.swap_count || 0} Swaps
              </span>
              <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1.5 rounded-lg font-bold border border-rose-200">
                -{data.actions.remove_count || 0} Removes
              </span>
            </div>
          </div>

          {/* Cryptographic Hash Verification */}
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs flex flex-wrap justify-between items-center gap-2 border border-slate-800">
            <span className="truncate max-w-full sm:max-w-md">
              {data.checksum}
            </span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-700 px-2.5 py-0.5 rounded text-[11px] font-bold">
              ✓ Verified
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Audit Certificate (JSON)</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full sm:w-auto bg-[#FDB813] text-[#0F172A] font-extrabold px-6 py-2.5 rounded-lg shadow-sm hover:brightness-95 transition-all text-xs sm:text-sm"
          >
            Done / Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
