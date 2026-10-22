import React, { useState } from "react";
import { ShieldCheck, X, CheckCircle, Ban, AlertCircle } from "lucide-react";

export default function ReferralGateModal({
  isOpen,
  onClose,
  submission,
  onDecisionSubmitted,
}) {
  const [decision, setDecision] = useState("APPROVE");
  const [managerNotes, setManagerNotes] = useState("");
  const [approvedLimit, setApprovedLimit] = useState(
    submission?.policyLimit || 10000000,
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !submission) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onDecisionSubmitted({
        decision,
        managerNotes:
          managerNotes ||
          (decision === "APPROVE"
            ? "Approved within executive facultative capacity"
            : "Declined per manager authority review"),
        approvedLimit: Number(approvedLimit),
      });
      onClose();
    } catch (err) {
      console.error("Failed to submit manager referral decision:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 bg-purple-50 border-b border-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-700" />
            <h3 className="font-bold text-purple-950 text-sm">
              Manager Underwriting Authority Referral
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800">
              {submission.submissionNumber}: {submission.insuredName}
            </div>
            <div className="text-slate-600">
              Line: <strong>{submission.lineOfBusiness}</strong> | Requested
              Limit:{" "}
              <strong>
                ${Number(submission.policyLimit).toLocaleString()}
              </strong>
            </div>
            <div className="text-slate-500 text-[11px]">
              Underwriter assigned: {submission.underwriter || "Sarah Jenkins"}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Authority Decision *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision("APPROVE")}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  decision === "APPROVE"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Referral</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision("REJECT")}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  decision === "REJECT"
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Ban className="w-4 h-4" />
                <span>Reject & Decline</span>
              </button>
            </div>
          </div>

          {decision === "APPROVE" && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Approved Reinsurance Limit ($ USD)
              </label>
              <input
                type="number"
                min="1"
                value={approvedLimit}
                onChange={(e) => setApprovedLimit(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Manager Authority Notes & Executive Justification *
            </label>
            <textarea
              required
              rows={3}
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="e.g. Approved. Favorable loss ratio and comprehensive MFA/EDR security controls warrant excess capacity allocation."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-lg shadow-sm"
            >
              {submitting
                ? "Recording Decision..."
                : "Confirm Manager Authority Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
