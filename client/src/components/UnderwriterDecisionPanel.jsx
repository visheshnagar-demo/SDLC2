import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  FileCheck,
  ShieldAlert,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

export default function UnderwriterDecisionPanel({
  submissionId,
  existingDecision,
  requestedLimit = 5000000,
  onDecisionRecorded,
}) {
  const [decisionType, setDecisionType] = useState("QUOTE");
  const [quotedCapacity, setQuotedCapacity] = useState(requestedLimit);
  const [premiumRatePct, setPremiumRatePct] = useState(2.85);
  const [quotedPremium, setQuotedPremium] = useState(
    (requestedLimit * 0.0285).toFixed(2),
  );
  const [quoteValidityDays, setQuoteValidityDays] = useState(30);
  const [declineReasonCode, setDeclineReasonCode] = useState(
    "UNFAVORABLE_LOSS_HISTORY",
  );
  const [underwriterNotes, setUnderwriterNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(!existingDecision);

  useEffect(() => {
    if (requestedLimit && !existingDecision) {
      setQuotedCapacity(requestedLimit);
      setQuotedPremium(
        (Number(requestedLimit) * (Number(premiumRatePct) / 100)).toFixed(2),
      );
    }
  }, [requestedLimit]);

  const handleCapacityChange = (val) => {
    const num = Number(val) || 0;
    setQuotedCapacity(num);
    setQuotedPremium((num * (Number(premiumRatePct) / 100)).toFixed(2));
  };

  const handleRateChange = (val) => {
    const rate = Number(val) || 0;
    setPremiumRatePct(rate);
    setQuotedPremium((Number(quotedCapacity) * (rate / 100)).toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        decision_type: decisionType,
        underwriter_notes:
          underwriterNotes ||
          (decisionType === "QUOTE"
            ? "Standard facultative terms approved subject to policy wording."
            : "Risk does not meet underwriting guidelines."),
      };

      if (decisionType === "QUOTE") {
        payload.quoted_capacity = Number(quotedCapacity);
        payload.premium_rate_pct = Number(premiumRatePct);
        payload.quoted_premium = Number(quotedPremium);
        payload.quote_validity_days = Number(quoteValidityDays);
      } else {
        payload.decline_reason_code = declineReasonCode;
      }

      const res = await api.recordDecision(submissionId, payload);
      setSuccessMessage(
        `Underwriting decision (${decisionType}) recorded successfully!`,
      );
      setIsEditing(false);
      if (onDecisionRecorded) {
        onDecisionRecorded(res);
      }
    } catch (err) {
      console.error("Decision submission error:", err);
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to record decision.";
      setErrorMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingDecision && !isEditing) {
    const isQuote = existingDecision.decision_type === "QUOTE";
    return (
      <div
        className={`p-6 rounded-lg border shadow-sm ${isQuote ? "bg-emerald-50/60 border-emerald-300" : "bg-red-50/60 border-red-300"}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {isQuote ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Decision Recorded: {existingDecision.decision_type}
              </h3>
              <p className="text-xs text-slate-500">
                Logged on{" "}
                {new Date(
                  existingDecision.created_at || Date.now(),
                ).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            Revise Decision
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          {isQuote ? (
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded border border-emerald-200">
              <div>
                <span className="text-xs text-slate-500 block">
                  Quoted Capacity
                </span>
                <span className="font-bold text-slate-900">
                  $
                  {Number(
                    existingDecision.quoted_capacity || 0,
                  ).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Premium Rate
                </span>
                <span className="font-bold text-slate-900">
                  {existingDecision.premium_rate_pct}%
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Quoted Premium
                </span>
                <span className="font-bold text-emerald-700">
                  $
                  {Number(
                    existingDecision.quoted_premium || 0,
                  ).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Quote Validity
                </span>
                <span className="font-bold text-slate-900">
                  {existingDecision.quote_validity_days || 30} Days
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-3 rounded border border-red-200">
              <span className="text-xs text-slate-500 block">
                Decline Reason Code
              </span>
              <span className="font-bold text-red-700">
                {existingDecision.decline_reason_code ||
                  "UNFAVORABLE_LOSS_HISTORY"}
              </span>
            </div>
          )}

          {existingDecision.underwriter_notes && (
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="text-xs text-slate-500 block font-medium mb-1">
                Underwriter Subjectivities & Notes
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-line">
                {existingDecision.underwriter_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="pb-4 border-b border-slate-100 mb-5">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          Underwriter Decision Workspace
        </h3>
        <p className="text-xs text-slate-500">
          Issue binding quote terms or record decline rationale
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Decision Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecisionType("QUOTE")}
              className={`py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition ${
                decisionType === "QUOTE"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              FORMAL QUOTE
            </button>
            <button
              type="button"
              onClick={() => setDecisionType("DECLINE")}
              className={`py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition ${
                decisionType === "DECLINE"
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <XCircle className="w-4 h-4" />
              DECLINE RISK
            </button>
          </div>
        </div>

        {decisionType === "QUOTE" ? (
          <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quoted Capacity Limit ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    value={quotedCapacity}
                    onChange={(e) => handleCapacityChange(e.target.value)}
                    required
                    min="1000"
                    step="1000"
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Premium Rate (% on capacity)
                </label>
                <input
                  type="number"
                  value={premiumRatePct}
                  onChange={(e) => handleRateChange(e.target.value)}
                  required
                  step="0.01"
                  min="0.01"
                  max="100"
                  className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quoted Annual Premium ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="number"
                    value={quotedPremium}
                    onChange={(e) => setQuotedPremium(e.target.value)}
                    required
                    min="100"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 text-sm font-semibold text-emerald-800 bg-white border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Quote Validity Window
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  <select
                    value={quoteValidityDays}
                    onChange={(e) =>
                      setQuoteValidityDays(Number(e.target.value))
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days (Standard)</option>
                    <option value={45}>45 Days</option>
                    <option value={60}>60 Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Underwriter Subjectivities & Special Conditions
              </label>
              <textarea
                rows={3}
                value={underwriterNotes}
                onChange={(e) => setUnderwriterNotes(e.target.value)}
                placeholder="e.g., Subject to receipt of signed cyber incident warranty; exclusion of legacy ERP endpoints; 7-day notice of claim..."
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-red-50/50 p-4 rounded-lg border border-red-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Decline Rationale Code
              </label>
              <select
                value={declineReasonCode}
                onChange={(e) => setDeclineReasonCode(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="UNFAVORABLE_LOSS_HISTORY">
                  Unfavorable 3-Year Loss History / High Severity Claims
                </option>
                <option value="INADEQUATE_CYBER_CONTROLS">
                  Inadequate Cybersecurity Safeguards (MFA / EDR deficient)
                </option>
                <option value="ATTACHMENT_TOO_LOW">
                  Attachment Point Insufficient for Requested Risk Layer
                </option>
                <option value="PENDING_LITIGATION">
                  Active Regulatory Investigation / Shareholder Class Action
                </option>
                <option value="CAPACITY_EXHAUSTED">
                  Line of Business Underwriting Capacity Limit Reached
                </option>
                <option value="SECTOR_EXCLUSION">
                  Industry Sector Excluded from Risk Appetite
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Detailed Underwriting Explanation
              </label>
              <textarea
                rows={3}
                value={underwriterNotes}
                onChange={(e) => setUnderwriterNotes(e.target.value)}
                required
                placeholder="Detail specific factors resulting in risk decline decision for carrier records..."
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {existingDecision && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2 text-sm font-bold text-white rounded-md transition disabled:opacity-50 ${
              decisionType === "QUOTE"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting
              ? "Recording Decision..."
              : `Confirm & Record ${decisionType}`}
          </button>
        </div>
      </form>
    </div>
  );
}
