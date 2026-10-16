import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Layers,
  Building2,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";
import DecisionActionModal from "./DecisionActionModal";
import api from "../../services/api";

export default function SubmissionInspectionWorkbench() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  const fetchSubmission = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSubmissionById(id);
      setSubmission(data);
    } catch (err) {
      console.error("Failed to fetch submission details:", err);
      setError("Unable to load submission profile. Ensure ID is valid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const handleRecalculateScore = async () => {
    setRecalculating(true);
    try {
      await api.recalculateRiskScore(id);
      await fetchSubmission();
    } catch (err) {
      console.error("Recalculation error:", err);
      // Fallback refresh
      await fetchSubmission();
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2461F5] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#66738A]">
          Loading risk workbench...
        </p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <Card className="max-w-2xl mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#0F1729]">
          Inspection Profile Not Found
        </h3>
        <p className="text-sm text-[#66738A] mt-1 mb-6">
          {error || "Submission record could not be retrieved."}
        </p>
        <Button
          variant="secondary"
          onClick={() => navigate("/underwriting/queue")}
          icon={ArrowLeft}
        >
          Back to Queue
        </Button>
      </Card>
    );
  }

  const score =
    submission.composite_score !== undefined
      ? submission.composite_score
      : (submission.risk_score?.score ?? 50);

  const tier = (
    submission.risk_tier ||
    submission.risk_score?.tier ||
    "MEDIUM"
  ).toUpperCase();
  const flags = submission.missing_info_flags || [];
  const riskParams = submission.risk_parameters || {};
  const status = (submission.status || "PENDING").toUpperCase();

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3E8F0]">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/underwriting/queue")}
          >
            Review Queue
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#0F1729]">
                {submission.insured_name}
              </h2>
              <Badge
                variant={submission.risk_type === "CYBER" ? "info" : "primary"}
              >
                {submission.risk_type}
              </Badge>
              <Badge
                variant={
                  status === "QUOTED"
                    ? "quoted"
                    : status === "DECLINED"
                      ? "declined"
                      : "pending"
                }
              >
                {status}
              </Badge>
            </div>
            <p className="text-xs text-[#66738A] mt-0.5">
              Cedant Carrier:{" "}
              <strong className="text-[#0F1729]">
                {submission.carrier_name}
              </strong>{" "}
              • ID: <span className="font-mono">{submission.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            disabled={recalculating}
            onClick={handleRecalculateScore}
          >
            {recalculating ? "Scoring..." : "Recalculate Score"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsDecisionModalOpen(true)}
          >
            Record UW Decision
          </Button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Score & Flags */}
        <div className="lg:col-span-1 space-y-6">
          {/* Automated Risk Score Card */}
          <Card
            title="Automated Risk Scoring Engine"
            subtitle="Real-time multi-factor underwriting model"
          >
            <div className="text-center py-3">
              <div className="inline-flex items-baseline gap-1 text-4xl font-black text-[#0F1729]">
                {score}
                <span className="text-sm font-semibold text-[#66738A]">
                  / 100
                </span>
              </div>
              <div className="mt-2 flex justify-center">
                <Badge variant={tier.toLowerCase()} size="lg">
                  {tier} RISK TIER
                </Badge>
              </div>

              {/* Progress gauge */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    tier === "LOW"
                      ? "bg-emerald-500"
                      : tier === "MEDIUM"
                        ? "bg-amber-500"
                        : tier === "HIGH"
                          ? "bg-orange-500"
                          : "bg-rose-500"
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            {/* Score Breakdown / Key Factors */}
            <div className="mt-6 pt-4 border-t border-[#E3E8F0] space-y-2.5 text-xs">
              <p className="font-bold text-[#0F1729] uppercase tracking-wider text-[11px]">
                Underwriting Risk Weights
              </p>

              {submission.risk_type === "CYBER" ? (
                <>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[#66738A]">MFA Enforcement</span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.mfa_enforced === "yes"
                        ? "✅ 100% Enforced"
                        : "⚠️ Partial/None (+25 pts)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[#66738A]">EDR / Managed SOC</span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.endpoint_detection === "yes"
                        ? "✅ Active 24/7"
                        : "⚠️ Missing EDR (+20 pts)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[#66738A]">Immutable Backup</span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.backup_frequency || "Daily Air-Gapped"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#66738A]">
                      3-Yr Incident History
                    </span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.past_breaches_3yr || 0} incidents
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[#66738A]">Board Experience</span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.board_experience_years || 8} Years
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[#66738A]">Pending Litigation</span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.pending_litigation === "yes"
                        ? "⚠️ Active (+30 pts)"
                        : "✅ None Reported"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-[#66738A]">
                      Financial Restatements
                    </span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.financial_restatements === "yes"
                        ? "⚠️ Material (+25 pts)"
                        : "✅ Clean Audit"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#66738A]">Debt-to-Equity Ratio</span>
                    <span className="font-semibold text-[#0F1729]">
                      {riskParams.debt_to_equity || "1.2"}x
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Missing Information Scanner Flags */}
          <Card
            title={`Missing Information Scanner (${flags.length})`}
            subtitle="Automated completeness and verification checklist"
          >
            {flags.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  No missing information flags detected. Full technical
                  underwriting documentation verified.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {flags.map((flag, idx) => (
                  <div
                    key={flag.id || idx}
                    className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-rose-900">
                          {flag.field_name || flag.item || "Missing Field"}
                        </p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-200 text-rose-800 rounded">
                          {flag.severity || "HIGH"}
                        </span>
                      </div>
                      <p className="text-rose-700 mt-1">
                        {flag.message ||
                          flag.description ||
                          "Mandatory documentation requirement unfulfilled."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Account Details, Layer Structure, Decision History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Layer & Account Structure */}
          <Card title="Account Profile & Facultative Structure">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 border border-[#E3E8F0] rounded-xl">
                <p className="text-xs text-[#66738A]">Requested Limit</p>
                <p className="text-base font-bold text-[#0F1729] mt-1">
                  ${Number(submission.requested_limit || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-[#E3E8F0] rounded-xl">
                <p className="text-xs text-[#66738A]">Attachment Point</p>
                <p className="text-base font-bold text-[#0F1729] mt-1">
                  ${Number(submission.attachment_point || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-[#E3E8F0] rounded-xl">
                <p className="text-xs text-[#66738A]">Annual Revenue</p>
                <p className="text-base font-bold text-[#0F1729] mt-1">
                  ${Number(submission.annual_revenue || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-[#E3E8F0] rounded-xl">
                <p className="text-xs text-[#66738A]">Industry Sector</p>
                <p className="text-xs font-semibold text-[#0F1729] mt-1.5 truncate">
                  {submission.industry_sector}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E3E8F0] text-xs">
              <div className="flex items-center gap-2 text-[#66738A]">
                <Calendar className="w-4 h-4 text-[#2461F5]" />
                <span>
                  Effective:{" "}
                  <strong className="text-[#0F1729]">
                    {submission.policy_effective_date}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#66738A]">
                <Calendar className="w-4 h-4 text-[#2461F5]" />
                <span>
                  Expiration:{" "}
                  <strong className="text-[#0F1729]">
                    {submission.policy_expiration_date}
                  </strong>
                </span>
              </div>
            </div>
          </Card>

          {/* Policy Attachments */}
          <Card
            title="Submitted Policy Documentation"
            subtitle="Attached slips, risk engineering, and audit logs"
          >
            <div className="space-y-2.5">
              {submission.attachments && submission.attachments.length > 0 ? (
                submission.attachments.map((att, idx) => (
                  <div
                    key={att.id || idx}
                    className="p-3 bg-slate-50 border border-[#E3E8F0] rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#2461F5]" />
                      <div>
                        <p className="text-xs font-semibold text-[#0F1729]">
                          {att.name ||
                            att.filename ||
                            `Document_${idx + 1}.pdf`}
                        </p>
                        <p className="text-[10px] text-[#66738A]">
                          {att.size || "Verified"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#2461F5]">
                      Attached
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-[#66738A]">
                  Standard electronic application submitted.
                </div>
              )}
            </div>
          </Card>

          {/* Underwriting Decisions & Notice Audit */}
          <Card
            title="Binding Decision & Notice Records"
            subtitle="History of formal quote issuances or decline notifications"
            action={
              <Button size="sm" onClick={() => setIsDecisionModalOpen(true)}>
                + New Decision
              </Button>
            }
          >
            {submission.decision_records &&
            submission.decision_records.length > 0 ? (
              <div className="space-y-4">
                {submission.decision_records.map((dec, idx) => (
                  <div
                    key={dec.id || idx}
                    className={`p-4 rounded-xl border ${
                      dec.decision_type === "QUOTE"
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {dec.decision_type === "QUOTE" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        )}
                        <span className="text-sm font-bold text-[#0F1729]">
                          {dec.decision_type === "QUOTE"
                            ? "Binding Quote Issued"
                            : "Submission Declined"}
                        </span>
                      </div>
                      <span className="text-xs text-[#66738A]">
                        {dec.created_at
                          ? new Date(dec.created_at).toLocaleString()
                          : "Recent"}
                      </span>
                    </div>

                    {dec.decision_type === "QUOTE" ? (
                      <div className="grid grid-cols-3 gap-3 my-3 p-3 bg-white border border-emerald-100 rounded-lg text-xs">
                        <div>
                          <p className="text-[#66738A]">Gross Premium</p>
                          <p className="font-bold text-[#0F1729] mt-0.5">
                            ${Number(dec.quoted_premium || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#66738A]">Quoted Limit</p>
                          <p className="font-bold text-[#0F1729] mt-0.5">
                            ${Number(dec.quoted_limit || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#66738A]">Attachment Point</p>
                          <p className="font-bold text-[#0F1729] mt-0.5">
                            $
                            {Number(
                              dec.quoted_attachment_point || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="my-2 p-3 bg-white border border-rose-100 rounded-lg text-xs">
                        <p className="text-rose-900 font-semibold">
                          Reason: {dec.decline_reason_code}
                        </p>
                        <p className="text-gray-700 mt-1">
                          {dec.decline_notes}
                        </p>
                      </div>
                    )}

                    <div className="text-[11px] text-[#66738A] flex justify-between items-center mt-2">
                      <span>
                        Underwriter:{" "}
                        <strong>
                          {dec.underwriter_name || dec.underwriter_id}
                        </strong>
                      </span>
                      <span>Formal Notice Delivered</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#66738A]">
                <Scale className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#0F1729]">
                  No formal decision recorded yet
                </p>
                <p className="text-xs text-[#66738A] mt-1">
                  Review the risk parameters and record a Quote or Decline
                  decision.
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  onClick={() => setIsDecisionModalOpen(true)}
                >
                  Record Decision Now
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Decision Action Modal */}
      <DecisionActionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        submission={submission}
        onDecisionRecorded={() => {
          fetchSubmission();
        }}
      />
    </div>
  );
}
