import React, { useState } from "react";
import { AlertOctagon, X, Ban } from "lucide-react";

const DECLINE_REASONS = [
  "Risk Profile Exceeds Underwriting Appetite",
  "Adverse Historical Loss Ratio / Frequency of Severity Claims",
  "Critical Security Controls / Governance Deficit",
  "Inadequate Pricing / Ceding Commission Margin Unfavorable",
  "Line-of-Business Aggregate Capacity Fully Allocated",
  "Jurisdictional / Legal Regulatory Exposure Concerns",
  "Other / Subjectivity Deadlines Expired",
];

export default function DeclineModal({ isOpen, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState(DECLINE_REASONS[0]);
  const [declineNotes, setDeclineNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fullReason = declineNotes.trim()
      ? `${selectedReason} - ${declineNotes.trim()}`
      : selectedReason;
    await onSubmit(fullReason);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-950 text-sm">
              Decline Facultative Reinsurance Risk
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Declining this risk is an authoritative underwriting decision. A
            formal decline notification and audit record will be logged.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mandatory Decline Reason Category *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
            >
              {DECLINE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Underwriting Commentary & Technical Justification
            </label>
            <textarea
              rows={3}
              value={declineNotes}
              onChange={(e) => setDeclineNotes(e.target.value)}
              placeholder="e.g. Unresolved security awareness deficit combined with 2 prior ransomware incidents in past 36 months."
              className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>
                {submitting ? "Recording Decline..." : "Confirm Formal Decline"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
