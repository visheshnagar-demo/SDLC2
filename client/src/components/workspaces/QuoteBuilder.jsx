import React, { useState } from "react";
import {
  FileSpreadsheet,
  GitCompare,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Send,
  FileText,
} from "lucide-react";

export default function QuoteBuilder({ activeCase, onSaveQuote, onNextStage }) {
  const [limit, setLimit] = useState(
    activeCase?.requestedLimit || "$10,000,000",
  );
  const [retention, setRetention] = useState(
    activeCase?.attachmentPoint || "$2,500,000",
  );
  const [premium, setPremium] = useState(
    activeCase?.grossPremium || "$1,250,000",
  );
  const [commission, setCommission] = useState(
    activeCase?.cedingCommission || "28.5%",
  );
  const [reinstatements, setReinstatements] = useState(
    "1 @ 100% additional premium",
  );
  const [isSaved, setIsSaved] = useState(false);

  const negotiation = activeCase?.negotiation || {};

  const handleSaveAndProceed = () => {
    onSaveQuote({
      limit,
      retention,
      premium,
      commission,
      reinstatements,
    });
    setIsSaved(true);
    setTimeout(() => {
      onNextStage("approval");
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
              Stage 07 & 09: Quote Structuring & Negotiation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Case: {activeCase?.caseNumber}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Structured Quote Builder & Terms Negotiation
          </h2>
          <p className="text-xs text-slate-500">
            Quote Agent formats formal treaty terms, evaluates broker
            counter-proposals, and prepares the endorsement schedule for
            approval routing.
          </p>
        </div>

        <button
          onClick={handleSaveAndProceed}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-sm whitespace-nowrap"
        >
          <span>Route for Governance Approval</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Quote Terms Form + Negotiation Comparison Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quote Builder Form (FR-09) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              Contract Terms Configuration
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Binding Treaty Slip v2.1
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-600 font-medium block mb-1">
                Cedent / Reinsured
              </label>
              <input
                type="text"
                disabled
                value={activeCase?.cedentName || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Occurrence Limit
                </label>
                <input
                  type="text"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Attachment / Retention
                </label>
                <input
                  type="text"
                  value={retention}
                  onChange={(e) => setRetention(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Gross Subject Premium
                </label>
                <input
                  type="text"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Ceding Commission
                </label>
                <input
                  type="text"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">
                Reinstatement Provisions
              </label>
              <input
                type="text"
                value={reinstatements}
                onChange={(e) => setReinstatements(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg flex items-center justify-between">
              <span className="text-teal-900 font-medium text-xs">
                Authority Level Required:
              </span>
              <span className="font-mono font-bold text-teal-800 text-xs">
                {activeCase?.requiresReferral
                  ? "Senior CUO Referral ($50M+)"
                  : "Standard Underwriter ($15M)"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Negotiation Comparison Tracker (FR-11) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-purple-600" />
              Broker Negotiation & Revisions Matrix
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-semibold">
              {negotiation.status || "TERMS_AGREED"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {negotiation?.rounds?.map((rnd) => (
              <div
                key={rnd.round}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                      {rnd.round}
                    </span>
                    <span className="font-bold text-slate-900">
                      {rnd.source}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {rnd.date}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase block">
                      Rate on Line
                    </span>
                    <span className="font-bold text-slate-800">{rnd.rol}</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase block">
                      Commission
                    </span>
                    <span className="font-bold text-slate-800">
                      {rnd.commission}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase block">
                      Status
                    </span>
                    <span className="font-bold text-teal-700">
                      {rnd.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
              <span className="font-semibold block mb-0.5">
                Negotiation Agent Commentary:
              </span>
              <p className="text-[11px] leading-relaxed text-purple-800">
                {negotiation.concessionNotes ||
                  "Concessions remain strictly within actuarial profitability boundary."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
