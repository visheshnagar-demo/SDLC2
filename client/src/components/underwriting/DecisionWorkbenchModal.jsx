import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  FileText,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import api from "../../services/api";

export function DecisionWorkbenchModal({
  submission,
  onDecisionSuccess,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("quote"); // 'quote' | 'decline'
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Quote form state
  const [quoteTerms, setQuoteTerms] = useState({
    premium_amount: "",
    capacity_offered: submission?.limit_requested || "",
    deductible_retention: submission?.retention || "",
    subjectivities:
      "1. Receipt of signed warranty statement.\n2. Confirmation of zero prior cyber/litigation losses to date.\n3. MFA fully enforced on all remote endpoints.",
    expiration_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  // Decline form state
  const [declineTerms, setDeclineTerms] = useState({
    decline_reason_code: "out_of_appetite",
    notes:
      "Risk profile exceeds underwriting threshold for requested limit and industry sector.",
  });

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Acceptance criteria edge-case validation:
    if (!quoteTerms.premium_amount || Number(quoteTerms.premium_amount) <= 0) {
      setErrorMsg("Please enter a valid binding premium amount.");
      return;
    }
    if (
      !quoteTerms.capacity_offered ||
      Number(quoteTerms.capacity_offered) <= 0
    ) {
      setErrorMsg(
        "Please specify the capacity offered for facultative placement.",
      );
      return;
    }
    if (!quoteTerms.expiration_date) {
      setErrorMsg("Quote expiration date is mandatory.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        submission_id: submission.id,
        premium_amount: Number(quoteTerms.premium_amount),
        capacity_offered: Number(quoteTerms.capacity_offered),
        deductible_retention: Number(quoteTerms.deductible_retention || 0),
        subjectivities: quoteTerms.subjectivities,
        expiration_date: quoteTerms.expiration_date,
      };

      const result = await api.recordQuoteDecision(payload);
      setSuccessMsg(
        "Binding quote successfully recorded and status updated to Quoted.",
      );
      if (onDecisionSuccess) {
        setTimeout(() => onDecisionSuccess("QUOTED", result), 800);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          "Failed to record quote decision. Please check backend.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!declineTerms.decline_reason_code) {
      setErrorMsg("Please select a standardized declination reason code.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        submission_id: submission.id,
        decline_reason_code: declineTerms.decline_reason_code,
        notes: declineTerms.notes,
      };

      const result = await api.recordDeclineDecision(payload);
      setSuccessMsg(
        "Formal declination recorded and status updated to Declined.",
      );
      if (onDecisionSuccess) {
        setTimeout(() => onDecisionSuccess("DECLINED", result), 800);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          "Failed to record declination decision.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Underwriting Decision Workbench
          </h3>
          <p className="text-xs text-slate-500">
            Record final binding terms or formal declination
          </p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("quote")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "quote"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Issue Quote
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("decline")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "decline"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Decline Risk
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {activeTab === "quote" ? (
        <form onSubmit={handleQuoteSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Offered Capacity ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={quoteTerms.capacity_offered}
                onChange={(e) =>
                  setQuoteTerms({
                    ...quoteTerms,
                    capacity_offered: e.target.value,
                  })
                }
                placeholder="e.g. 5000000"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Premium ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={quoteTerms.premium_amount}
                onChange={(e) =>
                  setQuoteTerms({
                    ...quoteTerms,
                    premium_amount: e.target.value,
                  })
                }
                placeholder="e.g. 45000"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Retention / Deductible ($)
              </label>
              <input
                type="number"
                value={quoteTerms.deductible_retention}
                onChange={(e) =>
                  setQuoteTerms({
                    ...quoteTerms,
                    deductible_retention: e.target.value,
                  })
                }
                placeholder="e.g. 100000"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quote Expiration Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={quoteTerms.expiration_date}
                onChange={(e) =>
                  setQuoteTerms({
                    ...quoteTerms,
                    expiration_date: e.target.value,
                  })
                }
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Underwriting Subjectivities & Binding Conditions
            </label>
            <textarea
              rows="3"
              value={quoteTerms.subjectivities}
              onChange={(e) =>
                setQuoteTerms({ ...quoteTerms, subjectivities: e.target.value })
              }
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            {onClose && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? "Recording Quote..." : "Record Binding Quote"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleDeclineSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Declination Reason{" "}
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={declineTerms.decline_reason_code}
              onChange={(e) =>
                setDeclineTerms({
                  ...declineTerms,
                  decline_reason_code: e.target.value,
                })
              }
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:bg-white"
            >
              <option value="out_of_appetite">
                Out of Appetite / Restricted Industry Class
              </option>
              <option value="high_risk_score">
                High Risk Score / Inadequate Security Controls
              </option>
              <option value="inadequate_data">
                Inadequate or Missing Underwriting Information
              </option>
              <option value="loss_history_excessive">
                Excessive Prior Loss Frequency / Severity
              </option>
              <option value="capacity_constrained">
                Reinsurer Capacity Limit Reached
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Underwriter Declination Rationale
            </label>
            <textarea
              rows="3"
              value={declineTerms.notes}
              onChange={(e) =>
                setDeclineTerms({ ...declineTerms, notes: e.target.value })
              }
              placeholder="State rationale for audit log..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Declination will formally close this submission and notify the
              carrier representative.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            {onClose && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={submitting}
            >
              {submitting ? "Declining..." : "Record Declination"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default DecisionWorkbenchModal;
