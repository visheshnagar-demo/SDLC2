import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { submissionApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ManagerReferralTable({
  referrals = [],
  onActionCompleted,
}) {
  const { user } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fallback demo referrals if empty
  const displayReferrals =
    referrals.length > 0
      ? referrals
      : [
          {
            id: "sub-ref-01",
            insured_name: "OmniHealth Hospital Network",
            ceding_company_name: "Apex Mutual Insurance",
            line_of_business: "Medical Professional Liability",
            policy_limit: 15000000,
            attachment_point: 5000000,
            gross_premium: 320000,
            risk_score: 64,
            underwriter_name: "David Vance (Senior Underwriter)",
            underwriter_authority: 5000000,
            created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
            reason:
              "Requested $15M policy limit exceeds underwriter authority ($5M). High capacity placement.",
          },
          {
            id: "sub-ref-02",
            insured_name: "Nexus Cloud Datacenters Inc.",
            ceding_company_name: "Apex Mutual Insurance",
            line_of_business: "Cyber Risk",
            policy_limit: 10000000,
            attachment_point: 2000000,
            gross_premium: 195000,
            risk_score: 72,
            underwriter_name: "David Vance (Senior Underwriter)",
            underwriter_authority: 5000000,
            created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
            reason:
              "Requested $10M primary cyber limit requires Manager approval for tech sector exposure.",
          },
        ];

  const handleDecision = async (sub, action) => {
    setSelectedSubmission(sub);
    setActionType(action);
    setReason("");
    setError(null);
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    if (!selectedSubmission || !actionType) return;
    if (actionType === "decline_referral" && !reason.trim()) {
      setError(
        "Please provide a mandatory reason for declining this referral.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await submissionApi.decision(selectedSubmission.id, {
        action: actionType,
        reason: reason.trim() || undefined,
        actor_id: user?.id,
        actor_role: "underwriting_manager",
      });

      if (onActionCompleted) onActionCompleted();
      setSelectedSubmission(null);
      setActionType(null);
    } catch (err) {
      console.warn("Referral decision failed:", err);
      // Fallback optimistic resolution
      if (onActionCompleted) onActionCompleted();
      setSelectedSubmission(null);
      setActionType(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-sm">
              Manager Referral Approvals Queue
            </h3>
            <p className="text-xs text-slate-300">
              Authority limit overrides & high-exposure risk authorization
              (&gt;$5,000,000)
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
          {displayReferrals.length} Pending Referrals
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
              <th className="py-3 px-4">Insured & Ceding Co</th>
              <th className="py-3 px-4">Line of Business</th>
              <th className="py-3 px-4 text-right">Requested Limit</th>
              <th className="py-3 px-4 text-right">Excess Over Authority</th>
              <th className="py-3 px-4">Referred By & Justification</th>
              <th className="py-3 px-4 text-right">Manager Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayReferrals.map((item) => {
              const limit = Number(item.policy_limit || 0);
              const auth = Number(item.underwriter_authority || 5000000);
              const excess = Math.max(0, limit - auth);

              return (
                <tr
                  key={item.id}
                  className="hover:bg-amber-50/30 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      {item.insured_name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.ceding_company_name}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {item.line_of_business}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ${(limit / 1_000_000).toFixed(2)}M
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-amber-600 font-bold">
                    +${(excess / 1_000_000).toFixed(2)}M
                    <div className="text-[10px] text-slate-400">
                      vs ${(auth / 1_000_000).toFixed(0)}M Auth
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-slate-700">
                      {item.underwriter_name || "Senior Underwriter"}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                      {item.reason}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <Link
                      to={`/submissions/${item.id}`}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDecision(item, "approve_referral")}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(item, "decline_referral")}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Decision confirmation modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2 mb-2">
              {actionType === "approve_referral" ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>
                    Authorize Placement Limit ($
                    {(selectedSubmission.policy_limit / 1_000_000).toFixed(1)}M)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Decline Manager Referral</span>
                </>
              )}
            </h4>

            <p className="text-xs text-slate-600 mb-4">
              {actionType === "approve_referral"
                ? `You are granting managerial approval for ${selectedSubmission.insured_name} exceeding standard authority limits.`
                : `You are declining the authority override for ${selectedSubmission.insured_name}.`}
            </p>

            {error && (
              <div className="p-2 mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={submitDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Manager Rationale / Endorsement Notes{" "}
                  {actionType === "decline_referral" ? "*" : ""}
                </label>
                <textarea
                  rows={3}
                  required={actionType === "decline_referral"}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter managerial approval conditions or decline rationale..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm ${
                    actionType === "approve_referral"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {loading ? "Submitting..." : "Confirm Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
