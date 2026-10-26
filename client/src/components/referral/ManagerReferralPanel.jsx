import React, { useState } from "react";
import { decideReferral } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Send,
} from "lucide-react";

export const ManagerReferralPanel = ({ submission, onReferralUpdated }) => {
  const { currentUser, isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState("APPROVED");
  const [managerNotes, setManagerNotes] = useState(
    "Reviewed risk score breakdown and technical cyber controls. Approved for up to $10.0M requested limit subject to standard terms.",
  );

  const referral = submission.referral;
  const isRequired = referral?.required;
  const requestedLimit = Number(submission.policy_limit || 0);
  const underwriterLimit = Number(submission.underwriter_limit || 5000000);

  if (!isRequired && !referral) {
    return (
      <Card
        title="Authority Parity & Referral Check"
        subtitle="Policy limit verification against underwriter signing limits."
      >
        <div className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Within Active Authority: </span>
            Requested limit (${(requestedLimit / 1000000).toFixed(2)}M) is
            within underwriter Tier-1 limit ($
            {(underwriterLimit / 1000000).toFixed(2)}M). No manager escalation
            required.
          </div>
        </div>
      </Card>
    );
  }

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await decideReferral(
        referral.id || submission.id,
        decision,
        managerNotes,
        currentUser.email,
      );
      if (onReferralUpdated) onReferralUpdated(updated);
    } catch (err) {
      console.error("Referral decision failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const status = referral?.status || "PENDING";

  return (
    <Card
      title="Manager Authority Limit Escalation"
      subtitle="Escalated to Executive Underwriting Management for capacity and limit sign-off."
      headerAction={<Badge variant={status} label={status} />}
    >
      <div className="space-y-6">
        {/* Authority Breach Alert */}
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900">
              Authority Escalation Triggered
            </h4>
            <p className="text-amber-800">
              Requested limit of{" "}
              <strong>${(requestedLimit / 1000000).toFixed(2)}M</strong> exceeds
              Underwriter Tier-1 authority limit of{" "}
              <strong>${(underwriterLimit / 1000000).toFixed(2)}M</strong>.
            </p>
            <p className="text-[11px] text-amber-700 italic">
              Reason:{" "}
              {referral?.reason ||
                "Policy limit exceeds individual underwriting limits."}
            </p>
          </div>
        </div>

        {/* Existing Manager Decision Record if Decided */}
        {status !== "PENDING" && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-600" />
                Manager Sign-Off Record
              </span>
              <span className="text-slate-500 font-mono">
                {referral.decided_at
                  ? new Date(referral.decided_at).toLocaleString()
                  : "Recently"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Decision Outcome:</span>
              <Badge
                variant={referral.manager_decision || status}
                label={referral.manager_decision || status}
                size="sm"
              />
            </div>
            {referral.manager_notes && (
              <div>
                <span className="text-slate-500 block mb-0.5">
                  Manager Review Notes:
                </span>
                <p className="p-2.5 bg-white rounded border border-slate-200 text-slate-800">
                  {referral.manager_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Manager Decision Form */}
        <form
          onSubmit={handleDecisionSubmit}
          className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-400" />
              Underwriting Manager Decision Authority
            </h4>
            {!isManager && (
              <span className="text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                Persona: Switch to Manager for live sign-off
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Manager Decision
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-700 p-2.5 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="APPROVED">
                  APPROVED (Sign-off on requested limit)
                </option>
                <option value="OVERRIDDEN">
                  OVERRIDDEN (Approved with amended terms)
                </option>
                <option value="DECLINED">DECLINED (Reject referral)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Signing Manager ID
              </label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full text-xs rounded-lg border border-slate-700 p-2.5 bg-slate-800/60 text-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Manager Review & Rationalization Notes
            </label>
            <textarea
              rows={2}
              required
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="State rationale for approving or declining excess authority..."
              className="w-full text-xs rounded-lg border border-slate-700 p-2.5 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              icon={Send}
            >
              Commit Manager Referral Decision
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default ManagerReferralPanel;
