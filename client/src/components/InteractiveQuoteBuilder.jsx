import React, { useState, useEffect } from "react";
import {
  Calculator,
  Percent,
  DollarSign,
  Plus,
  Trash2,
  FileCheck2,
  CheckCircle,
  AlertCircle,
  FileSignature,
} from "lucide-react";
import { quoteApi } from "../services/api";

export default function InteractiveQuoteBuilder({
  submission,
  existingQuote,
  onQuoteSaved,
}) {
  const grossPremium = submission?.gross_premium || 100000;
  const policyLimit = submission?.policy_limit || 5000000;

  const [offeredSharePct, setOfferedSharePct] = useState(
    existingQuote?.offered_share_pct ?? 50,
  );
  const [cedingCommissionPct, setCedingCommissionPct] = useState(
    existingQuote?.ceding_commission_pct ?? 15,
  );
  const [conditions, setConditions] = useState(
    existingQuote?.conditions || [
      "Subject to satisfactory cyber warranty confirmation",
      "Follow-the-fortunes claims settlement clause",
      "Premium payment within 60 days of inception",
    ],
  );
  const [exclusions, setExclusions] = useState(
    existingQuote?.exclusions || [
      "War, Terrorism and Hostile Cyber Acts endorsement (LMA5431)",
      "Unencrypted portable storage devices exclusion",
      "Prior acts / known incidents prior to retroactive date",
    ],
  );

  const [newCondition, setNewCondition] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Sync state if existingQuote changes
  useEffect(() => {
    if (existingQuote) {
      if (existingQuote.offered_share_pct !== undefined)
        setOfferedSharePct(existingQuote.offered_share_pct);
      if (existingQuote.ceding_commission_pct !== undefined)
        setCedingCommissionPct(existingQuote.ceding_commission_pct);
      if (existingQuote.conditions) setConditions(existingQuote.conditions);
      if (existingQuote.exclusions) setExclusions(existingQuote.exclusions);
    }
  }, [existingQuote]);

  // Derived financial math
  const shareDecimal = (parseFloat(offeredSharePct) || 0) / 100;
  const commDecimal = (parseFloat(cedingCommissionPct) || 0) / 100;

  const cededPremium = grossPremium * shareDecimal;
  const commissionAmount = cededPremium * commDecimal;
  const netPremium = cededPremium - commissionAmount;
  const limitExposed = policyLimit * shareDecimal;

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setConditions([...conditions, newCondition.trim()]);
    setNewCondition("");
  };

  const handleRemoveCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    setExclusions([...exclusions, newExclusion.trim()]);
    setNewExclusion("");
  };

  const handleRemoveExclusion = (index) => {
    setExclusions(exclusions.filter((_, i) => i !== index));
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);

    if (offeredSharePct <= 0 || offeredSharePct > 100) {
      setError("Offered Share must be between 1% and 100%");
      return;
    }
    if (cedingCommissionPct < 0 || cedingCommissionPct > 60) {
      setError("Ceding Commission must be between 0% and 60%");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        offered_share_pct: parseFloat(offeredSharePct),
        ceding_commission_pct: parseFloat(cedingCommissionPct),
        ceded_premium: Math.round(cededPremium),
        net_premium: Math.round(netPremium),
        limit_exposed: Math.round(limitExposed),
        conditions,
        exclusions,
      };

      const res = await quoteApi.createOrUpdate(submission.id, payload);
      setSaveSuccess(true);
      if (onQuoteSaved) onQuoteSaved(res || payload);
    } catch (err) {
      console.warn("Quote save API failed:", err);
      setError(
        err?.response?.data?.detail || "Failed to save quote via backend API",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Calculator className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-semibold text-sm">
              Interactive Facultative Quote Builder
            </h3>
            <p className="text-xs text-slate-400">
              Calculate participation, ceding commission & pricing terms
            </p>
          </div>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-indigo-300 px-2.5 py-1 rounded border border-slate-700">
          Gross: ${grossPremium.toLocaleString()}
        </span>
      </div>

      {error && (
        <div className="m-5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="m-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>
            Quote generated and saved to submission records successfully.
          </span>
        </div>
      )}

      <form onSubmit={handleSaveQuote} className="p-5 space-y-6">
        {/* Sliders & Percentage Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {/* Offered Share */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="offered-share-input"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Reinsurer Share Offered (%)
              </label>
              <div className="flex items-center space-x-1">
                <input
                  id="offered-share-input"
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={offeredSharePct}
                  onChange={(e) => setOfferedSharePct(e.target.value)}
                  className="w-16 px-2 py-1 text-right text-xs font-bold font-mono border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={offeredSharePct}
              onChange={(e) => setOfferedSharePct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Quota Share: 1%</span>
              <span>Full Line: 100%</span>
            </div>
          </div>

          {/* Ceding Commission */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="ceding-commission-input"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Ceding Commission (%)
              </label>
              <div className="flex items-center space-x-1">
                <input
                  id="ceding-commission-input"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={cedingCommissionPct}
                  onChange={(e) => setCedingCommissionPct(e.target.value)}
                  className="w-16 px-2 py-1 text-right text-xs font-bold font-mono border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="0.5"
              value={cedingCommissionPct}
              onChange={(e) => setCedingCommissionPct(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (Net)</span>
              <span>Standard 15-25%</span>
              <span>50% Max</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-xl">
            <span className="text-[11px] font-semibold text-indigo-700 uppercase">
              Ceded Premium
            </span>
            <div className="text-lg font-bold text-indigo-950 font-mono mt-0.5">
              ${Math.round(cededPremium).toLocaleString()}
            </div>
            <span className="text-[10px] text-indigo-600">
              ({offeredSharePct}% of ${grossPremium.toLocaleString()})
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
            <span className="text-[11px] font-semibold text-amber-700 uppercase">
              Commission Due
            </span>
            <div className="text-lg font-bold text-amber-950 font-mono mt-0.5">
              ${Math.round(commissionAmount).toLocaleString()}
            </div>
            <span className="text-[10px] text-amber-600">
              ({cedingCommissionPct}% ceding comm)
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase">
              Net Reinsurance Prem
            </span>
            <div className="text-lg font-bold text-emerald-950 font-mono mt-0.5">
              ${Math.round(netPremium).toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600">
              Net payable to Apex Re
            </span>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-700 uppercase">
              Capacity Exposure
            </span>
            <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
              ${Math.round(limitExposed).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">
              of ${(policyLimit / 1_000_000).toFixed(1)}M Policy Limit
            </span>
          </div>
        </div>

        {/* Conditions & Exclusions Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Conditions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="new-condition-input"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Special Conditions ({conditions.length})</span>
              </label>
            </div>
            <div className="flex space-x-2">
              <input
                id="new-condition-input"
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCondition();
                  }
                }}
                placeholder="Add underwriting condition..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <ul className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {conditions.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700"
                >
                  <span className="truncate pr-2">• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                    title="Remove condition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="new-exclusion-input"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Policy Exclusions ({exclusions.length})</span>
              </label>
            </div>
            <div className="flex space-x-2">
              <input
                id="new-exclusion-input"
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddExclusion();
                  }
                }}
                placeholder="Add exclusion clause..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={handleAddExclusion}
                className="px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-rose-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <ul className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {exclusions.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700"
                >
                  <span className="truncate pr-2">• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExclusion(idx)}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                    title="Remove exclusion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <FileSignature className="w-4 h-4" />
            <span>
              {saving ? "Saving Quote..." : "Save & Publish Formal Quote"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
