import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  FileText,
  MessageSquare,
} from "lucide-react";
import { submissionApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ManagerReferralModal({
  submission,
  isOpen,
  onClose,
  onDecisionComplete,
  defaultAction = "refer_to_manager",
}) {
  const { user, isUnderwritingManager, authorityLimit } = useAuth();
  const [action, setAction] = useState(defaultAction);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !submission) return null;

  const policyLimit = submission.policy_limit || 0;
  const isLimitExceeded = policyLimit > authorityLimit && authorityLimit > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate mandatory decline reason
    if (
      (action === "declined" || action === "decline_referral") &&
      !reason.trim()
    ) {
      setError("A mandatory decline reason must be specified.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        action,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
        actor_id: user?.id,
        actor_role: user?.role,
      };

      const result = await submissionApi.decision(submission.id, payload);
      if (onDecisionComplete) {
        onDecisionComplete(result || { ...submission, status: action });
      }
      onClose();
    } catch (err) {
      console.warn("Decision submission API error:", err);
      // Fallback
      if (onDecisionComplete) {
        onDecisionComplete({
          ...submission,
          status: action,
          referral_notes: notes,
        });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">
                Decision Workflow & Referral Management
              </h3>
              <p className="text-xs text-slate-400">
                Ref #{submission.id ? submission.id.slice(0, 8) : "SUB-001"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ×
          </button>
        </div>

        {/* Warning Banner if limit exceeded */}
        {isLimitExceeded && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                Underwriter Single-Line Authority Limit Exceeded
              </div>
              <p className="text-amber-800 mt-0.5">
                Requested Limit (${(policyLimit / 1_000_000).toFixed(1)}M)
                exceeds configured underwriter limit ($
                {(authorityLimit / 1_000_000).toFixed(1)}M). Referral to
                Underwriting Manager is required.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Workflow Decision
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* If manager */}
              {isUnderwritingManager ? (
                <>
                  <button
                    type="button"
                    onClick={() => setAction("approve_referral")}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 ${
                      action === "approve_referral"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Approve Referral</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction("decline_referral")}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 ${
                      action === "decline_referral"
                        ? "border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Decline Referral</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAction("refer_to_manager")}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 ${
                      action === "refer_to_manager"
                        ? "border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Refer to Manager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction("in_review")}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 ${
                      action === "in_review"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Move to In Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction("info_requested")}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 ${
                      action === "info_requested"
                        ? "border-blue-500 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Request More Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction("bound")}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2 ${
                      action === "bound"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bind Risk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction("declined")}
                    className={`col-span-2 p-3 rounded-xl border text-left flex items-center space-x-2 ${
                      action === "declined"
                        ? "border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-500/20"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Decline Submission (Mandatory Reason Required)</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mandatory Reason for Decline or Referrals */}
          {(action === "declined" ||
            action === "decline_referral" ||
            action === "refer_to_manager" ||
            action === "info_requested") && (
            <div>
              <label
                htmlFor="decision-reason-input"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
              >
                {action === "declined" || action === "decline_referral"
                  ? "Mandatory Decline Reason *"
                  : "Reason / Justification *"}
              </label>
              <input
                id="decision-reason-input"
                type="text"
                required={
                  action === "declined" || action === "decline_referral"
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  action === "declined"
                    ? "e.g., Unacceptable loss history, lack of MFA controls, inadequate retention"
                    : "e.g., Limit exceeds underwriter authority threshold"
                }
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Underwriter Notes / Audit justification */}
          <div>
            <label
              htmlFor="audit-notes-input"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Underwriting Notes (Appended to Audit Trail)
            </label>
            <textarea
              id="audit-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add contextual commentary, pricing rationale, or conditions for the audit trail..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{loading ? "Processing..." : "Submit Decision"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
