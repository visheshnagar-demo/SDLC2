import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  FileText,
  ShieldAlert,
  Lock,
  ArrowRight,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { recordUnderwritingDecision } from "../../services/api";

export function UnderwritingDecisionForm({
  submission,
  onDecisionRecorded,
  hasMissingFlags = false,
}) {
  const [decisionType, setDecisionType] = useState("QUOTE"); // 'QUOTE' or 'DECLINE'
  const [underwriterId, setUnderwriterId] = useState("UW-ALEX-MORGAN");

  // Quote fields
  const [quotedPremium, setQuotedPremium] = useState(
    submission?.policy_limit_usd
      ? Math.round(submission.policy_limit_usd * 0.022)
      : 185000,
  );
  const [quotedLimit, setQuotedLimit] = useState(
    submission?.policy_limit_usd || 10000000,
  );
  const [quotedAttachment, setQuotedAttachment] = useState(
    submission?.attachment_point_usd || 5000000,
  );

  // Decline fields
  const [declineReasonCode, setDeclineReasonCode] = useState(
    "EXCEEDS_RISK_THRESHOLD",
  );
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [decisionSuccess, setDecisionSuccess] = useState(null);

  const isQuoteBlocked = decisionType === "QUOTE" && hasMissingFlags;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!underwriterId.trim()) {
      setError("Underwriter ID is required for audit logging");
      return;
    }

    if (decisionType === "QUOTE") {
      if (hasMissingFlags) {
        setError(
          "Cannot issue binding quote while mandatory missing information flags remain unresolved.",
        );
        return;
      }
      if (!quotedPremium || Number(quotedPremium) <= 0) {
        setError("Quoted premium must be a valid positive amount.");
        return;
      }
    }

    if (decisionType === "DECLINE" && !notes.trim()) {
      setError(
        "Please provide decline rationale/notes explaining the decision.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        submission_id: submission?.id || "b78a9c1e-34df-41a2-9e88-1a98e21a4401",
        underwriter_id: underwriterId,
        decision: decisionType,
        quoted_premium_usd:
          decisionType === "QUOTE" ? Number(quotedPremium) : undefined,
        quoted_limit_usd:
          decisionType === "QUOTE" ? Number(quotedLimit) : undefined,
        quoted_attachment_usd:
          decisionType === "QUOTE" ? Number(quotedAttachment) : undefined,
        decline_reason_code:
          decisionType === "DECLINE" ? declineReasonCode : undefined,
        notes:
          notes ||
          (decisionType === "QUOTE"
            ? "Quotation terms bound per treaty guidelines"
            : "Declined per underwriting criteria"),
      };

      const result = await recordUnderwritingDecision(payload);
      setDecisionSuccess(result);
      if (onDecisionRecorded) {
        onDecisionRecorded(result);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to record underwriting decision. Please check server connectivity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (decisionSuccess) {
    return (
      <div className="bg-white rounded-xl border border-emerald-200 p-6 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div>
          <Badge
            variant={
              decisionSuccess.decision === "QUOTE" ? "quoted" : "declined"
            }
            size="lg"
          >
            {decisionSuccess.decision === "QUOTE"
              ? "OFFICIAL QUOTE RECORDED"
              : "DECLINE DECISION RECORDED"}
          </Badge>
          <h4 className="text-lg font-bold text-[#0F1729] mt-2">
            Decision Audit Log Created
          </h4>
          <p className="text-xs text-[#66738A] mt-1">
            Recorded by Underwriter{" "}
            <strong className="text-slate-800">{underwriterId}</strong> on{" "}
            {new Date().toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-left text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Status Update:</span>
            <strong className="text-slate-800">
              {decisionSuccess.decision === "QUOTE" ? "QUOTED" : "DECLINED"}
            </strong>
          </div>
          {decisionSuccess.decision === "QUOTE" && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Quoted Premium:</span>
                <strong className="text-emerald-700">
                  ${Number(quotedPremium).toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quoted Layer:</span>
                <strong className="text-slate-800">
                  ${(Number(quotedLimit) / 1000000).toFixed(1)}M xs $
                  {(Number(quotedAttachment) / 1000000).toFixed(1)}M
                </strong>
              </div>
            </>
          )}
          {decisionSuccess.decision === "DECLINE" && (
            <div className="flex justify-between">
              <span className="text-slate-500">Reason Code:</span>
              <strong className="text-rose-700">{declineReasonCode}</strong>
            </div>
          )}
          {notes && (
            <div className="pt-1 border-t border-slate-200 text-slate-600 italic">
              &quot;{notes}&quot;
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDecisionSuccess(null);
            setNotes("");
          }}
        >
          Update / Re-evaluate Decision
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-[#E3E8F0] p-6 shadow-sm space-y-5"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-[#0F1729]">
            Underwriting Decision Module
          </h4>
          <p className="text-xs text-[#66738A]">
            Record binding quote terms or formal decline with immutable audit
            logging.
          </p>
        </div>
      </div>

      {/* Decision Choice Tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setDecisionType("QUOTE")}
          className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
            decisionType === "QUOTE"
              ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CheckCircle2
            className={`w-4 h-4 ${decisionType === "QUOTE" ? "text-emerald-600" : "text-slate-400"}`}
          />
          Issue Binding Quote
        </button>
        <button
          type="button"
          onClick={() => setDecisionType("DECLINE")}
          className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
            decisionType === "DECLINE"
              ? "bg-rose-50 border-rose-500 text-rose-800 shadow-sm"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
        >
          <XCircle
            className={`w-4 h-4 ${decisionType === "DECLINE" ? "text-rose-600" : "text-slate-400"}`}
          />
          Decline Submission
        </button>
      </div>

      {/* Missing Information Banner if quote blocked */}
      {isQuoteBlocked && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Quoting Restricted</strong>
            This submission has unresolved mandatory missing information flags.
            Resolve or accept document flags above before issuing a quote.
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* Underwriter ID */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Underwriter Sign-off ID *
        </label>
        <input
          type="text"
          value={underwriterId}
          onChange={(e) => setUnderwriterId(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
        />
      </div>

      {decisionType === "QUOTE" ? (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quoted Annual Premium (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs">
                  $
                </span>
                <input
                  type="number"
                  value={quotedPremium}
                  onChange={(e) => setQuotedPremium(e.target.value)}
                  step="5000"
                  className="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quoted Limit (USD)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs">
                  $
                </span>
                <input
                  type="number"
                  value={quotedLimit}
                  onChange={(e) => setQuotedLimit(e.target.value)}
                  step="500000"
                  className="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attachment Point (USD)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-400 text-xs">
                  $
                </span>
                <input
                  type="number"
                  value={quotedAttachment}
                  onChange={(e) => setQuotedAttachment(e.target.value)}
                  step="500000"
                  className="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quotation Endorsements & Underwriting Notes
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Subject to clean loss runs at binding; Ransomware sublimit applies; Cyber assessment score validated."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decline Reason Code *
            </label>
            <select
              value={declineReasonCode}
              onChange={(e) => setDeclineReasonCode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="EXCEEDS_RISK_THRESHOLD">
                Exceeds D&O / Cyber Risk Threshold
              </option>
              <option value="UNFAVORABLE_LOSS_HISTORY">
                Unfavorable Historical Loss Experience
              </option>
              <option value="INADEQUATE_SECURITY_POSTURE">
                Inadequate Security Posture / MFA Controls
              </option>
              <option value="UNACCEPTABLE_CARRIER_RATING">
                Primary Carrier Financial Rating Below Minimum
              </option>
              <option value="CAPACITY_CONSTRAINTS">
                Treaty Line Capacity Reached for Industry Sector
              </option>
              <option value="MISSING_INFORMATION_UNRESOLVED">
                Mandatory Information Not Provided by Deadline
              </option>
              <option value="OTHER">
                Other Specific Underwriting Rationale
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decline Rationale & Audit Notes *
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Industry loss frequency exceeds acceptable parameters; D&O litigation exposure in current fiscal year."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            ></textarea>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant={decisionType === "QUOTE" ? "success" : "danger"}
        disabled={isQuoteBlocked || isSubmitting}
        isLoading={isSubmitting}
        className="w-full font-bold shadow-sm"
      >
        {decisionType === "QUOTE"
          ? "Record Binding Quote Decision"
          : "Record Decline Decision"}
      </Button>
    </form>
  );
}

UnderwritingDecisionForm.propTypes = {
  submission: PropTypes.object,
  onDecisionRecorded: PropTypes.func,
  hasMissingFlags: PropTypes.bool,
};

export default UnderwritingDecisionForm;
