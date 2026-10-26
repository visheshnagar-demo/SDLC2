import React, { useState } from "react";
import { createQuote } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";
import Button from "../common/Button";
import Badge from "../common/Badge";
import {
  Calculator,
  Percent,
  DollarSign,
  ShieldAlert,
  FileCheck2,
  Send,
  Layers,
  FileText,
} from "lucide-react";

export const QuoteBuilder = ({ submission, onQuoteCreated }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successQuote, setSuccessQuote] = useState(null);

  const defaultLimit = submission?.policy_limit || 10000000;
  const defaultGross = submission?.gross_premium || 180000;

  const [quoteForm, setQuoteForm] = useState({
    layer_limit: String(defaultLimit),
    share_offered_pct: 50.0,
    ceding_commission_pct: 15.0,
    subjectivities:
      "Subject to receipt and satisfactory review of 3-year certified loss runs and audited FY2025 financial statements prior to inception.",
    conditions:
      "Claims-made policy form; 24-hour mandatory cyber incident notification clause; aggregate reinstatement at 100% additional premium.",
    exclusions:
      "War, hostile acts by foreign nation-states, unpatched known critical vulnerabilities older than 90 days.",
  });

  const sharePct = Number(quoteForm.share_offered_pct) || 0;
  const commPct = Number(quoteForm.ceding_commission_pct) || 0;
  const grossCeded = defaultGross * (sharePct / 100);
  const commissionAmount = grossCeded * (commPct / 100);
  const netPremium = grossCeded - commissionAmount;

  const handleIssueQuote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await createQuote(
        submission.id,
        {
          ...quoteForm,
          layer_limit: Number(quoteForm.layer_limit),
          gross_ceded_premium: grossCeded,
          net_reinsurance_premium: netPremium,
        },
        currentUser.email,
      );
      setSuccessQuote(created);
      if (onQuoteCreated) onQuoteCreated(created);
    } catch (err) {
      console.error("Failed to issue quote:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Specialty Line Facultative Quote Builder"
      subtitle="Interactive layer pricing, syndicate participation %, ceding commission, and subjectivity builder."
      headerAction={
        <div className="flex items-center space-x-2">
          <Badge variant="IN_REVIEW" label="Pricing Mode" />
        </div>
      }
    >
      <form onSubmit={handleIssueQuote} className="space-y-6">
        {/* Layer Parameters & Financial Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reinsurance Layer Limit ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono">
                $
              </span>
              <input
                type="number"
                value={quoteForm.layer_limit}
                onChange={(e) =>
                  setQuoteForm({ ...quoteForm, layer_limit: e.target.value })
                }
                className="w-full text-sm rounded-lg border border-slate-300 pl-8 pr-3 py-2 bg-white font-mono focus:ring-2 focus:ring-sky-200 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Underlying attachment: $
              {Number(submission?.attachment_point || 0).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Syndicate Participation Share (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                step="0.5"
                value={quoteForm.share_offered_pct}
                onChange={(e) =>
                  setQuoteForm({
                    ...quoteForm,
                    share_offered_pct: e.target.value,
                  })
                }
                className="w-full text-sm rounded-lg border border-slate-300 pl-3 pr-8 py-2 bg-white font-mono focus:ring-2 focus:ring-sky-200 focus:outline-none"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 font-mono">
                %
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={quoteForm.share_offered_pct}
              onChange={(e) =>
                setQuoteForm({
                  ...quoteForm,
                  share_offered_pct: Number(e.target.value),
                })
              }
              className="w-full mt-2 accent-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Ceding Commission Allowance (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                step="0.25"
                value={quoteForm.ceding_commission_pct}
                onChange={(e) =>
                  setQuoteForm({
                    ...quoteForm,
                    ceding_commission_pct: e.target.value,
                  })
                }
                className="w-full text-sm rounded-lg border border-slate-300 pl-3 pr-8 py-2 bg-white font-mono focus:ring-2 focus:ring-sky-200 focus:outline-none"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 font-mono">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cedent acquisition cost allowance
            </p>
          </div>
        </div>

        {/* Real-time Calculation Ticker */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Gross Ceded Premium
            </span>
            <div className="text-xl font-bold font-mono mt-1 text-slate-100">
              $
              {grossCeded.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="text-[10px] text-slate-400">
              {sharePct}% of ${defaultGross.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Ceding Commission Total
            </span>
            <div className="text-xl font-bold font-mono mt-1 text-amber-400">
              -$
              {commissionAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="text-[10px] text-slate-400">
              {commPct}% allowance to cedent
            </span>
          </div>

          <div className="p-4 bg-emerald-950 text-emerald-100 rounded-xl border border-emerald-800 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              Net Reinsurance Premium
            </span>
            <div className="text-2xl font-extrabold font-mono mt-1 text-emerald-300">
              $
              {netPremium.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <span className="text-[10px] text-emerald-400">
              Net premium payable to ApexRe
            </span>
          </div>
        </div>

        {/* Wording, Subjectivities & Exclusions */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
              Underwriting Subjectivities (Conditions Precedent to Inception)
            </label>
            <textarea
              rows={2}
              value={quoteForm.subjectivities}
              onChange={(e) =>
                setQuoteForm({ ...quoteForm, subjectivities: e.target.value })
              }
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Policy Endorsements & Warranty Conditions
            </label>
            <textarea
              rows={2}
              value={quoteForm.conditions}
              onChange={(e) =>
                setQuoteForm({ ...quoteForm, conditions: e.target.value })
              }
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              Specific Layer Exclusions & Sub-limits
            </label>
            <textarea
              rows={2}
              value={quoteForm.exclusions}
              onChange={(e) =>
                setQuoteForm({ ...quoteForm, exclusions: e.target.value })
              }
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </div>

        {/* Existing Quote Slips if Any */}
        {submission?.quotes && submission.quotes.length > 0 && (
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Previous Quotes Issued
            </h4>
            <div className="space-y-2">
              {submission.quotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-sky-700">
                      Quote #{q.id}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{q.share_offered_pct}% Share</span>
                    <span className="mx-2">•</span>
                    <span className="font-mono font-semibold text-emerald-700">
                      Net: ${Number(q.net_reinsurance_premium).toLocaleString()}
                    </span>
                  </div>
                  <Badge variant={q.status} label={q.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={Send}
            size="lg"
          >
            Issue Formal Facultative Quote
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuoteBuilder;
