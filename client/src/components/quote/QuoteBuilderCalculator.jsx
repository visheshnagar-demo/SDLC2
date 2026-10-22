import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  Calculator,
  ShieldAlert,
  CheckCircle2,
  Lock,
  FileCheck,
  ArrowRight,
  DollarSign,
  Percent,
} from "lucide-react";

export default function QuoteBuilderCalculator({ submission, onQuoteSaved }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const policyLimit = Number(submission.policyLimit) || 10000000;
  const grossPremium = Number(submission.grossPremium) || 150000;
  const isOverAuthority = policyLimit > 5000000 && !submission.managerApproved;

  const [shareOffered, setShareOffered] = useState(50.0);
  const [cedingCommission, setCedingCommission] = useState(20.0);
  const [subjectivities, setSubjectivities] = useState(
    "Subject to receipt and satisfactory underwriter review of updated loss runs and cyber warranty statement.",
  );
  const [conditions, setConditions] = useState(
    `${shareOffered}% quota share participation; Claims notice required within 48 hours; Follow-the-fortunes standard clause.`,
  );
  const [exclusions, setExclusions] = useState(
    "War and civil commotion; Unencrypted portable media; Known prior cyber breaches or securities investigations.",
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Financial calculations
  const cededLimit = (policyLimit * shareOffered) / 100;
  const calculatedCededPremium = (grossPremium * shareOffered) / 100;
  const commissionAmount = (calculatedCededPremium * cedingCommission) / 100;
  const netReinsurancePremium = calculatedCededPremium - commissionAmount;

  const handleShareChange = (val) => {
    const num = Math.min(100, Math.max(1, Number(val) || 0));
    setShareOffered(num);
    setConditions(
      `${num}% quota share participation; Claims notice required within 48 hours; Follow-the-fortunes standard clause.`,
    );
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const quotePayload = {
        shareOfferedPercentage: shareOffered,
        cedingCommissionPercentage: cedingCommission,
        cededLimit,
        calculatedReinsurancePremium: calculatedCededPremium,
        netReinsurancePremium,
        subjectivities,
        conditions,
        exclusions,
        author: currentUser.email,
      };

      const result = await api.createQuote(submission.id, quotePayload);
      setSuccess(true);
      if (onQuoteSaved) onQuoteSaved(result);
      setTimeout(() => {
        navigate(`/submissions/${submission.id}`);
      }, 1200);
    } catch (err) {
      console.error("Failed to create quote:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            <span>Reinsurance Pricing & Participation Calculator</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Formulate facultative reinsurance terms, quota share participation,
            and net premium yields.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Underwriter Limit:</span>
          <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
            $5,000,000
          </span>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Quote successfully formatted and recorded! Redirecting...</span>
        </div>
      )}

      <form
        onSubmit={handleSaveQuote}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left: Sliders & Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Share Offered Slider */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-primary" />
                <span>Facultative Share Offered (%)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={shareOffered}
                  onChange={(e) => handleShareChange(e.target.value)}
                  className="w-20 px-2 py-1 text-right font-mono font-bold text-sm border border-slate-300 rounded focus:ring-2 focus:ring-primary bg-white"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={shareOffered}
              onChange={(e) => handleShareChange(e.target.value)}
              className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10% Min</span>
              <span>25%</span>
              <span>50% Standard</span>
              <span>75%</span>
              <span>100% Full Layer</span>
            </div>
          </div>

          {/* Ceding Commission Slider */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ceding Commission (%)</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={cedingCommission}
                  onChange={(e) =>
                    setCedingCommission(Number(e.target.value) || 0)
                  }
                  className="w-20 px-2 py-1 text-right font-mono font-bold text-sm border border-slate-300 rounded focus:ring-2 focus:ring-primary bg-white"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={cedingCommission}
              onChange={(e) => setCedingCommission(Number(e.target.value) || 0)}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% Net</span>
              <span>15%</span>
              <span>20% Market</span>
              <span>25%</span>
              <span>35% Max</span>
            </div>
          </div>

          {/* Conditions & Exclusions */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Subjectivities
              </label>
              <textarea
                rows={2}
                value={subjectivities}
                onChange={(e) => setSubjectivities(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Standard Conditions
              </label>
              <textarea
                rows={2}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Policy Exclusions
              </label>
              <textarea
                rows={2}
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Right: Calculated Yield Summary & Authority Gate (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Pricing Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-200 flex items-center justify-between">
              <span>Calculated Pricing Schedule</span>
              <span className="font-mono text-emerald-400 font-bold">
                LIVE MODEL
              </span>
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-slate-300">Underlying Policy Limit:</span>
                <span className="font-mono font-bold">
                  ${policyLimit.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-slate-300">
                  Underlying Gross Premium:
                </span>
                <span className="font-mono font-bold">
                  ${grossPremium.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-blue-200 font-semibold">
                  Ceded Reinsurance Capacity:
                </span>
                <span className="font-mono font-bold text-blue-300">
                  ${cededLimit.toLocaleString()} ({shareOffered}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-blue-200 font-semibold">
                  Gross Ceded Premium:
                </span>
                <span className="font-mono font-bold text-blue-300">
                  ${calculatedCededPremium.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-slate-300">
                  Ceding Commission Deduction:
                </span>
                <span className="font-mono font-medium text-amber-300">
                  - ${commissionAmount.toLocaleString()} ({cedingCommission}%)
                </span>
              </div>

              {/* Net Yield */}
              <div className="bg-white/10 rounded-xl p-3.5 mt-2 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-blue-200 font-semibold uppercase tracking-wide">
                    Net Reinsurance Premium
                  </div>
                  <div className="text-xs text-slate-300">
                    Payable to Reinsurer
                  </div>
                </div>
                <div className="font-mono font-extrabold text-xl text-emerald-400">
                  ${netReinsurancePremium.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Referral Authority Gate */}
          {isOverAuthority ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-xs">
                    Manager Authority Limit Exceeded
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-1">
                    Requested limit (
                    <strong>${policyLimit.toLocaleString()}</strong>) exceeds
                    your delegated underwriter limit of $5,000,000.
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-amber-700 bg-white/70 p-2.5 rounded border border-amber-200">
                This quote will be routed to the{" "}
                <strong>Underwriting Manager</strong> referral queue for
                sign-off.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {submitting
                    ? "Submitting Referral..."
                    : "Submit Quote for Manager Referral 🔒"}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {submission.managerApproved
                    ? "Manager referral approved. Authority cleared."
                    : "Risk within $5,000,000 standard authority. Ready to quote."}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <FileCheck className="w-4 h-4" />
                <span>
                  {submitting
                    ? "Generating Quote..."
                    : "Finalize & Issue Reinsurance Quote ➔"}
                </span>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
