import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReferralGateModal from "../quote/ReferralGateModal";
import {
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function ReferralApprovalCenter({
  pendingReferrals = [],
  onReferralDecided,
}) {
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenDecision = (sub) => {
    setSelectedSub(sub);
    setModalOpen(true);
  };

  const handleDecisionComplete = (decisionData) => {
    if (onReferralDecided) {
      onReferralDecided(selectedSub.id, decisionData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Manager Authority Referral Queue</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submissions exceeding delegated underwriter limit ($5,000,000)
            requiring VP sign-off.
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
          {pendingReferrals.length} Pending
        </span>
      </div>

      {pendingReferrals.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No pending referrals</p>
          <p className="text-slate-400">
            All submissions are within standard delegated authority.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {pendingReferrals.map((sub) => (
            <div
              key={sub.id}
              className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary">
                    {sub.submissionNumber}
                  </span>
                  <span className="font-bold text-slate-900">
                    {sub.insuredName}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                    {sub.lineOfBusiness}
                  </span>
                </div>
                <div className="text-slate-500 flex items-center gap-3">
                  <span>
                    Cedent: <strong>{sub.cedingCompanyName}</strong>
                  </span>
                  <span>
                    Requested Limit:{" "}
                    <strong className="text-slate-800">
                      ${Number(sub.policyLimit).toLocaleString()}
                    </strong>
                  </span>
                  <span>
                    Score:{" "}
                    <strong className="text-emerald-700">
                      {sub.riskScore}/100
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  to={`/submissions/${sub.id}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  View Details
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenDecision(sub)}
                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-xs"
                >
                  Review & Decide ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSub && (
        <ReferralGateModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          submission={selectedSub}
          onDecisionSubmitted={handleDecisionComplete}
        />
      )}
    </div>
  );
}
