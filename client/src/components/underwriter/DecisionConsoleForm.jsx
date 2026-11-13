import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Send } from "lucide-react";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { api } from "../../services/api";

export const DecisionConsoleForm = ({
  submissionId,
  sumInsured = 10000000,
  currentDecision = null,
  onDecisionSubmitted,
}) => {
  const [decisionType, setDecisionType] = useState("QUOTE");
  const [capacityOffered, setCapacityOffered] = useState(
    String(sumInsured || 5000000),
  );
  const [rateOnLinePct, setRateOnLinePct] = useState("2.50");
  const [premiumAmount, setPremiumAmount] = useState(
    String(Math.round(((Number(sumInsured) || 5000000) * 2.5) / 100)),
  );
  const [bindingDeadline, setBindingDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [subjectivities, setSubjectivities] = useState(
    "Subject to satisfactory MFA verification and signed no-known-loss warranty.",
  );

  // Decline fields
  const [declineReasonCode, setDeclineReasonCode] = useState(
    "RISK_APPETITE_EXCEEDED",
  );
  const [declineNotes, setDeclineNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const declineReasonOptions = [
    {
      code: "RISK_APPETITE_EXCEEDED",
      label: "Risk Appetite Exceeded / Class Out of Scope",
    },
    {
      code: "UNFAVORABLE_LOSS_HISTORY",
      label: "Unfavorable Prior Loss History / Claim Severity",
    },
    {
      code: "INCOMPLETE_DATA",
      label: "Incomplete Data / Missing Documentation Disclosures",
    },
    {
      code: "INADEQUATE_ATTACHMENT",
      label: "Inadequate Attachment Point / Retention Too Low",
    },
    {
      code: "CAPACITY_UNAVAILABLE",
      label: "Reinsurance Capacity Unavailable / Limit Reached",
    },
    {
      code: "OTHER",
      label: "Other Underwriting Grounds",
    },
  ];

  useEffect(() => {
    if (sumInsured) {
      setCapacityOffered(String(sumInsured));
      const rate = Number(rateOnLinePct) || 2.5;
      setPremiumAmount(String(Math.round((Number(sumInsured) * rate) / 100)));
    }
  }, [sumInsured]);

  useEffect(() => {
    if (currentDecision) {
      if (currentDecision.decision) {
        setDecisionType(currentDecision.decision);
      }
      if (currentDecision.capacity_offered) {
        setCapacityOffered(String(currentDecision.capacity_offered));
      }
      if (currentDecision.rate_on_line_pct) {
        setRateOnLinePct(String(currentDecision.rate_on_line_pct));
      }
      if (currentDecision.premium_amount) {
        setPremiumAmount(String(currentDecision.premium_amount));
      }
      if (currentDecision.binding_deadline) {
        setBindingDeadline(currentDecision.binding_deadline);
      }
      if (currentDecision.subjectivities) {
        setSubjectivities(currentDecision.subjectivities);
      }
      if (currentDecision.decline_reason_code) {
        setDeclineReasonCode(currentDecision.decline_reason_code);
      }
      if (currentDecision.decline_notes) {
        setDeclineNotes(currentDecision.decline_notes);
      }
    }
  }, [currentDecision]);

  // Auto-calculate premium when capacity or rate changes
  const handleCapacityChange = (val) => {
    setCapacityOffered(val);
    const cap = Number(val) || 0;
    const rate = Number(rateOnLinePct) || 0;
    setPremiumAmount(String(Math.round((cap * rate) / 100)));
  };

  const handleRateChange = (val) => {
    setRateOnLinePct(val);
    const cap = Number(capacityOffered) || 0;
    const rate = Number(val) || 0;
    setPremiumAmount(String(Math.round((cap * rate) / 100)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (decisionType === "QUOTE") {
      if (!capacityOffered || Number(capacityOffered) <= 0) {
        setFormError("Offered capacity must be greater than $0.");
        return;
      }
      if (!rateOnLinePct || Number(rateOnLinePct) <= 0) {
        setFormError("Rate on line percentage must be greater than 0%.");
        return;
      }
      if (!premiumAmount || Number(premiumAmount) <= 0) {
        setFormError("Calculated premium must be greater than $0.");
        return;
      }
      if (!bindingDeadline) {
        setFormError("Please select a binding deadline date.");
        return;
      }
    } else {
      if (!declineReasonCode) {
        setFormError("A standardized decline reason code is mandatory.");
        return;
      }
      if (!declineNotes.trim()) {
        setFormError(
          "Please provide detailed underwriting rationale notes for declining.",
        );
        return;
      }
    }

    setSubmitting(true);

    const payload = {
      decision: decisionType,
      capacity_offered:
        decisionType === "QUOTE" ? Number(capacityOffered) : null,
      rate_on_line_pct: decisionType === "QUOTE" ? Number(rateOnLinePct) : null,
      premium_amount: decisionType === "QUOTE" ? Number(premiumAmount) : null,
      binding_deadline: decisionType === "QUOTE" ? bindingDeadline : null,
      subjectivities: decisionType === "QUOTE" ? subjectivities : null,
      decline_reason_code:
        decisionType === "DECLINE" ? declineReasonCode : null,
      decline_notes: decisionType === "DECLINE" ? declineNotes : null,
    };

    try {
      const result = await api.recordDecision(submissionId, payload);
      setSuccessMsg(
        decisionType === "QUOTE"
          ? "Binding Quote Terms successfully recorded and issued."
          : "Submission Decline Decision officially registered with audit trail.",
      );
      if (onDecisionSubmitted) {
        onDecisionSubmitted(result);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg =
        typeof detail === "string"
          ? detail
          : err.message || "Failed to persist decision.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title="Underwriting Decision Management Console"
      subtitle="Issue binding facultative quote terms or formal declination with audit compliance"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Decision Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-2">
            Select Underwriting Action
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setDecisionType("QUOTE");
                setFormError("");
              }}
              className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2.5 font-semibold text-sm transition-all ${
                decisionType === "QUOTE"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-gray-200 text-textSecondary hover:bg-gray-50"
              }`}
            >
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Issue Binding Quote</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDecisionType("DECLINE");
                setFormError("");
              }}
              className={`p-4 rounded-xl border-2 flex items-center justify-center gap-2.5 font-semibold text-sm transition-all ${
                decisionType === "DECLINE"
                  ? "border-red-500 bg-red-50 text-red-800 shadow-sm"
                  : "border-gray-200 text-textSecondary hover:bg-gray-50"
              }`}
            >
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Decline Request</span>
            </button>
          </div>
        </div>

        {/* Validation / Error Alert */}
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-error flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* QUOTE Form Fields */}
        {decisionType === "QUOTE" && (
          <div className="space-y-4 bg-gray-50/60 p-4 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary mb-1">
                  Facultative Capacity Offered ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={capacityOffered}
                    onChange={(e) => handleCapacityChange(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary mb-1">
                  Rate On Line (% RoL) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={rateOnLinePct}
                    onChange={(e) => handleRateChange(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface font-medium"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-xs">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textSecondary mb-1">
                  Reinsurance Premium ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={premiumAmount}
                    onChange={(e) => setPremiumAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface font-bold text-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary mb-1">
                  Binding Deadline Date *
                </label>
                <input
                  type="date"
                  value={bindingDeadline}
                  onChange={(e) => setBindingDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-textSecondary mb-1">
                  Binding Subjectivities &amp; Underwriting Warranties
                </label>
                <textarea
                  rows="3"
                  value={subjectivities}
                  onChange={(e) => setSubjectivities(e.target.value)}
                  placeholder="Specify warranties, sub-limits, or post-binding inspection conditions..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface"
                />
              </div>
            </div>
          </div>
        )}

        {/* DECLINE Form Fields */}
        {decisionType === "DECLINE" && (
          <div className="space-y-4 bg-red-50/20 p-4 rounded-xl border border-red-200">
            <div>
              <label className="block text-xs font-semibold text-textSecondary mb-1">
                Standardized Declination Reason Code *
              </label>
              <select
                value={declineReasonCode}
                onChange={(e) => setDeclineReasonCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-error bg-surface"
              >
                {declineReasonOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary mb-1">
                Underwriting Rationale &amp; Audit Notes *
              </label>
              <textarea
                rows="4"
                value={declineNotes}
                onChange={(e) => setDeclineNotes(e.target.value)}
                placeholder="Provide comprehensive reasoning for declination to be stored in compliance audit trail..."
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-error bg-surface"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant={decisionType === "QUOTE" ? "success" : "danger"}
            loading={submitting}
            icon={Send}
          >
            {decisionType === "QUOTE"
              ? "Execute Binding Quote Decision"
              : "Register Official Declination"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DecisionConsoleForm;
