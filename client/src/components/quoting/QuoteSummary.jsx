import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Layers,
  DollarSign,
  Percent,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Building,
  Calendar,
} from "lucide-react";

export default function QuoteSummary({ quote }) {
  const navigate = useNavigate();

  if (!quote) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
          <Layers className="w-7 h-7 text-blue-600" />
        </div>
        <h4 className="text-base font-bold text-slate-800">
          No Active Quote Selected
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
          Submit the reinsurance pricing parameters on the left or select an
          existing synthetic quote to inspect the layer structure and pricing
          metrics.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Ready for parameter input
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const quotedPremium =
    quote.quotedPremium ??
    (quote.sumInsured * (quote.rateOnLine || quote.targetRate || 8.5)) / 100;
  const rateOnLine = quote.rateOnLine ?? quote.targetRate ?? 8.5;
  const cedingCommission = quote.cedingCommission ?? 5.0;
  const commissionAmount = (quotedPremium * cedingCommission) / 100;
  const netPremium = quotedPremium - commissionAmount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded">
              {quote.quoteNumber ||
                `QUO-${quote.id?.substring(0, 8) || "2026-001"}`}
            </span>
            <span className="text-xs text-blue-200 font-medium">
              Status:{" "}
              <span className="text-emerald-300 font-bold uppercase">
                {quote.status || "QUOTED"}
              </span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {quote.insuredName || "Apex Global Assurance Corp"}
          </h3>
          <p className="text-xs text-blue-200">
            {quote.lineOfBusiness || "Property Catastrophe"} &bull;{" "}
            {quote.structureType || "EXCESS_OF_LOSS"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-blue-200 uppercase font-semibold">
            Total Quoted Premium
          </p>
          <p className="text-2xl font-extrabold text-white font-mono">
            {formatCurrency(quotedPremium)}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Program Limit</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {formatCurrency(quote.sumInsured || 50000000)}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Rate on Line</span>
              <Percent className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-blue-700 font-mono">
              {Number(rateOnLine).toFixed(2)}%
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Ceding Comm.</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">
              {Number(cedingCommission).toFixed(1)}%{" "}
              <span className="text-[10px] text-slate-500">
                ({formatCurrency(commissionAmount)})
              </span>
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Net to Gen Re</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-sm font-bold text-emerald-700 font-mono">
              {formatCurrency(netPremium)}
            </p>
          </div>
        </div>

        {/* Reinsurance Tower Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              Layer Stack Architecture & Exposure Tower
            </span>
            <span className="text-slate-500 text-[11px]">
              Gen Re Participation: 100% Placed
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
            {/* Top Layer */}
            <div className="p-3 bg-blue-100/70 border border-blue-300 rounded-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-700 text-white font-bold rounded text-[10px]">
                  Layer 2
                </span>
                <span className="font-semibold text-slate-800">
                  Top Catastrophe Layer ($25M xs $25M)
                </span>
              </div>
              <span className="font-mono font-bold text-blue-900">
                {formatCurrency((quote.sumInsured || 50000000) * 0.5)}
              </span>
            </div>

            {/* Base Layer */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded text-[10px]">
                  Layer 1
                </span>
                <span className="font-semibold text-slate-800">
                  Working Excess Layer ($15M xs $10M)
                </span>
              </div>
              <span className="font-mono font-bold text-blue-900">
                {formatCurrency((quote.sumInsured || 50000000) * 0.3)}
              </span>
            </div>

            {/* Cedent Retention */}
            <div className="p-2.5 bg-slate-200/80 border border-slate-300 rounded-md flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-600 text-white font-bold rounded text-[10px]">
                  Retention
                </span>
                <span className="font-medium text-slate-700">
                  Cedent Underlying Retention
                </span>
              </div>
              <span className="font-mono font-semibold">
                {formatCurrency(quote.deductible || 5000000)}
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/underwriting", { state: { selectedQuote: quote } })
            }
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold text-xs shadow-sm transition"
          >
            <Layers className="w-4 h-4" />
            <span>Proceed to Risk Structuring</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/binders", { state: { selectedQuote: quote } })
            }
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs shadow-sm transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>Direct to Binding</span>
          </button>
        </div>
      </div>
    </div>
  );
}
