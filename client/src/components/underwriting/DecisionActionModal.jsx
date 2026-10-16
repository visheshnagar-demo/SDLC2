import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Send,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import api from "../../services/api";

export default function DecisionActionModal({
  isOpen,
  onClose,
  submission,
  onDecisionRecorded,
}) {
  if (!submission) return null;

  const [decisionType, setDecisionType] = useState("QUOTE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [decisionForm, setDecisionForm] = useState({
    underwriter_id: "UW-ALEX-01",
    underwriter_name: "Alex Morgan",
    quoted_premium: Math.round((submission.requested_limit || 5000000) * 0.025),
    quoted_limit: submission.requested_limit || 5000000,
    quoted_attachment_point: submission.attachment_point || 1000000,
    subjectivities:
      "1. Receipt of signed warranty statement.\n2. Implementation of MFA across remaining secondary portals within 30 days.\n3. Clean claim declaration up to inception.",
    decline_reason_code: "UNACCEPTABLE_SECURITY_POSTURE",
    decline_notes:
      "Submission does not meet minimum risk guidelines due to elevated loss history and incomplete security posture controls.",
  });

  const handleChange = (field, value) => {
    setDecisionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        submission_id: submission.id,
        decision_type: decisionType,
        underwriter_id: decisionForm.underwriter_id,
        underwriter_name: decisionForm.underwriter_name,
        ...(decisionType === "QUOTE"
          ? {
              quoted_premium: parseFloat(decisionForm.quoted_premium) || 0,
              quoted_limit: parseFloat(decisionForm.quoted_limit) || 0,
              quoted_attachment_point:
                parseFloat(decisionForm.quoted_attachment_point) || 0,
              subjectivities: decisionForm.subjectivities,
            }
          : {
              decline_reason_code: decisionForm.decline_reason_code,
              decline_notes: decisionForm.decline_notes,
            }),
      };

      const result = await api.recordDecision(payload);
      if (onDecisionRecorded) {
        onDecisionRecorded(result);
      }
      onClose();
    } catch (err) {
      console.error("Decision recording failed:", err);
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "Failed to record decision.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Underwriting Decision"
      subtitle={`Submission: ${submission.insured_name} (${submission.risk_type}) - ID: ${submission.id}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Decision Type Tabs */}
        <div>
          <label className="block text-xs font-semibold text-[#0F1729] mb-2">
            Action / Decision Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecisionType("QUOTE")}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-sm font-semibold transition-all ${
                decisionType === "QUOTE"
                  ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-xs"
                  : "border-[#E3E8F0] bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Issue Binding Quote</span>
            </button>

            <button
              type="button"
              onClick={() => setDecisionType("DECLINE")}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-sm font-semibold transition-all ${
                decisionType === "DECLINE"
                  ? "border-rose-500 bg-rose-50/50 text-rose-700 shadow-xs"
                  : "border-[#E3E8F0] bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Decline Submission</span>
            </button>
          </div>
        </div>

        {/* Form fields based on decision */}
        {decisionType === "QUOTE" ? (
          <div className="space-y-4 p-4 bg-slate-50 border border-[#E3E8F0] rounded-xl">
            <h4 className="text-xs font-bold text-[#0F1729] uppercase tracking-wider">
              Binding Quote Terms
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F1729] mb-1">
                  Quoted Gross Premium ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={decisionForm.quoted_premium}
                    onChange={(e) =>
                      handleChange("quoted_premium", e.target.value)
                    }
                    className="w-full pl-7 pr-3.5 py-2 bg-white border border-[#E3E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1729] mb-1">
                  Quoted Facultative Limit ($ USD) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    required
                    min="100000"
                    step="100000"
                    value={decisionForm.quoted_limit}
                    onChange={(e) =>
                      handleChange("quoted_limit", e.target.value)
                    }
                    className="w-full pl-7 pr-3.5 py-2 bg-white border border-[#E3E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1">
                Quoted Attachment / Retention ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-xs">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="50000"
                  value={decisionForm.quoted_attachment_point}
                  onChange={(e) =>
                    handleChange("quoted_attachment_point", e.target.value)
                  }
                  className="w-full pl-7 pr-3.5 py-2 bg-white border border-[#E3E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1">
                Subjectivities & Special Conditions
              </label>
              <textarea
                rows="3"
                value={decisionForm.subjectivities}
                onChange={(e) => handleChange("subjectivities", e.target.value)}
                placeholder="Enter binding subjectivities (e.g. signed warranty statement, loss run verification)..."
                className="w-full px-3.5 py-2 bg-white border border-[#E3E8F0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-rose-50/50 border border-rose-200 rounded-xl">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Decline Justification
            </h4>

            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1">
                Decline Reason Code *
              </label>
              <select
                value={decisionForm.decline_reason_code}
                onChange={(e) =>
                  handleChange("decline_reason_code", e.target.value)
                }
                className="w-full px-3.5 py-2 bg-white border border-[#E3E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="UNACCEPTABLE_SECURITY_POSTURE">
                  Unacceptable Security / Governance Posture
                </option>
                <option value="HIGH_LOSS_FREQUENCY">
                  Adverse Loss Frequency / Severity History
                </option>
                <option value="CAPACITY_EXCEEDED">
                  Line Capacity or Aggregate Limits Exceeded
                </option>
                <option value="INADEQUATE_ATTACHMENT">
                  Attachment Point Inadequate for Risk Profile
                </option>
                <option value="RESTRICTED_INDUSTRY">
                  Restricted / Prohibited Industry Sector
                </option>
                <option value="INSUFFICIENT_INFORMATION">
                  Critical Missing Information Not Furnished
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F1729] mb-1">
                Underwriter Decline Notes / Carrier Notice *
              </label>
              <textarea
                rows="3"
                required
                value={decisionForm.decline_notes}
                onChange={(e) => handleChange("decline_notes", e.target.value)}
                placeholder="Provide detailed decline rationale for carrier notification..."
                className="w-full px-3.5 py-2 bg-white border border-[#E3E8F0] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        )}

        {/* Underwriter Identity */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#0F1729] mb-1">
              Underwriter Name
            </label>
            <input
              type="text"
              value={decisionForm.underwriter_name}
              onChange={(e) => handleChange("underwriter_name", e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-50 border border-[#E3E8F0] rounded-lg text-xs text-gray-700"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0F1729] mb-1">
              Underwriter ID
            </label>
            <input
              type="text"
              disabled
              value={decisionForm.underwriter_id}
              className="w-full px-3 py-1.5 bg-gray-50 border border-[#E3E8F0] rounded-lg text-xs text-gray-500 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E3E8F0]">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={decisionType === "QUOTE" ? "success" : "danger"}
            disabled={submitting}
            icon={Send}
          >
            {submitting
              ? "Recording Decision..."
              : decisionType === "QUOTE"
                ? "Issue Binding Quote"
                : "Confirm Decline"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
