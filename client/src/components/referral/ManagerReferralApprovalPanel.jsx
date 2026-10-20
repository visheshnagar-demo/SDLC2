import React, { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { useAuth, ROLES } from "../../context/AuthContext";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export const ManagerReferralApprovalPanel = ({
  submission,
  onReferralDecision,
  isLoading = false,
}) => {
  const { currentRole, currentUser } = useAuth();
  const [notes, setNotes] = useState("");
  const [declineReason, setDeclineReason] = useState(
    "AGGREGATE_EXPOSURE_CAP_EXCEEDED",
  );

  const policyLimit = submission?.policy_limit || 10000000;
  const underwriterLimit = 5000000;
  const isOverAuthority = policyLimit > underwriterLimit;
  const isManager = currentRole === ROLES.MANAGER;

  const handleDecision = (decision) => {
    onReferralDecision?.({
      decision,
      notes: notes || `Referral exception ${decision} by ${currentUser.name}`,
      decline_reason: decision === "REJECTED" ? declineReason : undefined,
      manager_user_id: currentUser.id,
      manager_name: currentUser.name,
    });
  };

  const formatCurrency = (val) => `$${(val / 1000000).toFixed(1)}M`;

  return (
    <Card
      title="Managerial Referral & Authority Governance"
      subtitle="Oversight workflow for high-limit facultative risks exceeding underwriter authority limits"
      className="border-amber-200"
    >
      <div className="space-y-4">
        {/* Authority Limit Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <h4 className="font-bold text-sm text-amber-950">
              Authority Limit Threshold Check ({formatCurrency(policyLimit)} vs{" "}
              {formatCurrency(underwriterLimit)})
            </h4>
            <p>
              Requested policy limit of{" "}
              <strong>{formatCurrency(policyLimit)}</strong> exceeds the
              standard reinsurance underwriter individual authority ceiling of{" "}
              <strong>{formatCurrency(underwriterLimit)}</strong>.
            </p>
            <p className="text-amber-800">
              This risk requires Chief Underwriting Officer (CUO) / Underwriting
              Manager review and formal sign-off.
            </p>
          </div>
        </div>

        {/* Prior Approval Badge if already approved */}
        {submission?.referral_status === "APPROVED" && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <h5 className="font-bold text-sm text-emerald-950">
                Referral Exception Granted by{" "}
                {submission?.approved_by_manager || "Eleanor Vance (CUO)"}
              </h5>
              <p className="text-emerald-800 mt-0.5">
                Note:{" "}
                {submission?.referral_notes ||
                  "Approved high-limit facultative exception based on top-tier MFA/EDR posture."}
              </p>
            </div>
          </div>
        )}

        {/* Manager Decision Input (Active if role is Manager or for demonstration) */}
        <div className="pt-2 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Managerial Governance Notes / Stipulations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Granted exception provided offered share is capped at 50% and Cyber terrorism clause is attached."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>
                Acting as: <strong>{currentUser.name}</strong> (
                {currentUser.roleTitle})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="success"
                size="md"
                onClick={() => handleDecision("APPROVED")}
                loading={isLoading}
                icon={CheckCircle}
              >
                Approve Referral Exception
              </Button>

              <Button
                variant="danger"
                size="md"
                onClick={() => handleDecision("REJECTED")}
                loading={isLoading}
                icon={XCircle}
              >
                Decline Referral
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ManagerReferralApprovalPanel;
