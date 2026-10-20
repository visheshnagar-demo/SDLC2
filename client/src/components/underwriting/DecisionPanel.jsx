import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { riskApi } from "../../services/api.js";

export default function DecisionPanel({ riskId, onDecisionSubmitted }) {
  const [decision, setDecision] = useState("APPROVED");
  const [underwriterId, setUnderwriterId] = useState("UW-8842-JAIN");
  const [reviewNotes, setReviewNotes] = useState(
    "Pricing ROL of 8.50% meets North American CAT return threshold. Layer structure aligns with 2026 treaty portfolio limits.",
  );
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const decisions = [
    {
      id: "APPROVED",
      label: "Authorize & Approve",
      badge: "RECOMMENDED",
      desc: "Treaty is within appetite. Authorize issuance of binding authority.",
      icon: ShieldCheck,
      color:
        "border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-emerald-500",
      activeColor: "bg-emerald-600 text-white",
    },
    {
      id: "REFERRED",
      label: "Refer to Committee",
      badge: "ESCALATION",
      desc: "Exceeds single-risk PML guideline. Requires Senior Underwriting signoff.",
      icon: AlertTriangle,
      color: "border-amber-500 bg-amber-50/50 text-amber-900 ring-amber-500",
      activeColor: "bg-amber-600 text-white",
    },
    {
      id: "DECLINED",
      label: "Decline Treaty",
      badge: "UNACCEPTABLE",
      desc: "Pricing does not compensate for catastrophe modeled tail risk.",
      icon: XCircle,
      color: "border-rose-500 bg-rose-50/50 text-rose-900 ring-rose-500",
      activeColor: "bg-rose-600 text-white",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!underwriterId.trim()) {
      setErrorMessage("Underwriter Authority ID is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        decision,
        underwriterId,
        reviewNotes,
      };

      const res = await riskApi.submitDecision(
        riskId || "mock-risk-001",
        payload,
      );
      setStatusMessage(
        `Underwriting decision '${decision}' successfully recorded in the audit ledger.`,
      );
      if (onDecisionSubmitted) {
        onDecisionSubmitted(res);
      }
    } catch (err) {
      console.error("Failed to submit decision:", err);
      const errMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to record underwriting decision. Please verify backend service.";
      setErrorMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-700" />
            Underwriting Authority & Decision Workbench
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit definitive binding decisions and treaty covenant sign-offs.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
          Level 3 Underwriting Mandate
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Status Messages */}
        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-sm text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Decision Recorded</p>
              <p className="text-xs text-emerald-700 mt-0.5">{statusMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-sm text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Submission Failed</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Decision Selection Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Treaty Decision *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {decisions.map((item) => {
              const Icon = item.icon;
              const isSelected = decision === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setDecision(item.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? `${item.color} ring-1 shadow-sm`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold tracking-tight px-2 py-0.5 rounded bg-white/80 border text-slate-800">
                        {item.badge}
                      </span>
                      <Icon
                        className={`w-5 h-5 ${isSelected ? "text-blue-700" : "text-slate-400"}`}
                      />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {isSelected ? "Selected" : "Select"}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Underwriter Authority ID *
            </label>
            <input
              type="text"
              value={underwriterId}
              onChange={(e) => setUnderwriterId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs font-mono focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              required
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Underwriting Rationale & Technical Covenants
            </label>
            <textarea
              rows="2"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter underwriting notes, special warranty requirements, or rate adequacy comments..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
          </div>
        </div>

        {/* Portfolio CAT Aggregation Tracker */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              North American Property CAT Portfolio Capacity
            </span>
            <span className="font-mono text-slate-800 font-bold">
              $420M / $500M (84% Utilized)
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: "84%" }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            This treaty adds $42.5M simulated PML to aggregate catastrophe
            commitments.
          </p>
        </div>

        {/* Submit CTA */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Decisions are cryptographically timestamped and transmitted to the
            policy ledger.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-sm shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recording Decision...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Decision</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
