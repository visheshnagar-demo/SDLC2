import React from "react";
import { Columns, ShieldAlert, CheckCircle, FileText } from "lucide-react";

export default function SideBySideClauseDiff({
  clause,
  standardWording,
  proposedWording,
}) {
  const defaultStandard =
    standardWording ||
    `1. Net Retained Lines: The Reinsured warrants that it shall retain net for its own account not less than 10% of the maximum line on any one risk, subject to a minimum of USD $5,000,000.
2. Hours Clause: 72 hours for Earthquake and Seaquake; 168 hours for Named Windstorm / Tropical Cyclone.
3. Currency & Loss Settlement: All calculations and claim settlements in USD within 30 days of proof of loss.`;

  const defaultProposed =
    proposedWording ||
    clause?.clause_text ||
    `1. Net Retained Lines: The Reinsured warrants net retention of 5% of maximum line, or USD $2,500,000 whichever is less (DEVIATION).
2. Hours Clause: 96 hours for Earthquake; 168 hours for Named Windstorm (EXTENDED COVERAGE).
3. Currency & Loss Settlement: Settled in local currency converted at prevailing spot rate within 60 days.`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Columns className="w-5 h-5 text-[#0F2744]" />
          <div>
            <h3 className="text-sm font-bold text-[#0F2744]">
              {clause?.clause_title
                ? `Clause Comparison: ${clause.clause_title}`
                : "Side-by-Side Clause Wording Comparison"}
            </h3>
            <p className="text-[11px] text-slate-500">
              Compare Gen Re Standard Baseline Wording against Proposed Treaty
              Slip Wording
            </p>
          </div>
        </div>
        {clause?.risk_severity && (
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
            {clause.risk_severity} SEVERITY
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Baseline Box */}
        <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Gen Re Standard Baseline Wording
            </h4>
          </div>
          <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap min-h-[140px]">
            {defaultStandard}
          </div>
          <p className="text-[11px] text-emerald-700 italic">
            Standard treaty guidelines approved by Chief Underwriting Officer
            (CUO).
          </p>
        </div>

        {/* Proposed Slip Box */}
        <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-2">
          <div className="flex items-center space-x-2 text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Proposed Treaty Slip Wording
            </h4>
          </div>
          <div className="bg-white p-3 rounded-lg border border-amber-100 text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap min-h-[140px]">
            {defaultProposed}
          </div>
          <p className="text-[11px] text-amber-700 italic">
            Extracted from uploaded treaty slip. Non-standard variations
            highlighted for review.
          </p>
        </div>
      </div>

      {clause?.deviation_analysis && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
          <span className="font-bold text-[#0F2744]">
            AI Deviation Summary:{" "}
          </span>
          <span>{clause.deviation_analysis}</span>
        </div>
      )}
    </div>
  );
}
