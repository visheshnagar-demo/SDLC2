import React, { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function PremiumSummaryCard({ quote, onBindPolicy }) {
  const [copied, setCopied] = useState(false);
  const [bound, setBound] = useState(false);

  if (!quote) {
    return (
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/40 flex flex-col items-center justify-center text-center min-h-[260px]">
        <div className="p-3 bg-indigo-900/60 rounded-2xl border border-indigo-700/50 mb-3 text-indigo-300">
          <DollarSign className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white">
          Instant Premium Quote Summary
        </h3>
        <p className="text-xs text-indigo-200/80 max-w-sm mt-1.5 leading-relaxed">
          Fill out the motor insurance parameters on the left and click
          &quot;Calculate Premium Quote&quot; to view real-time actuarial
          pricing.
        </p>
      </div>
    );
  }

  const quoteId = quote.id || quote.quote_id || "Q-DRAFT";
  const totalPremium = Number(quote.total_premium || quote.premium || 0);
  const monthlyEstimate = (totalPremium / 12) * 1.045; // with standard 4.5% finance charge or direct /12
  const currency = quote.currency || "USD";

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(quoteId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBind = () => {
    setBound(true);
    if (onBindPolicy) onBindPolicy(quote);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-lg border border-indigo-800/50 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between pb-3 border-b border-indigo-800/60 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
            Official Actuarial Quote
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyId}
          className="text-[11px] font-mono px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-800 border border-indigo-700/60 rounded-lg text-indigo-200 hover:text-white flex items-center gap-1.5 transition-colors"
          title="Copy Quote Reference ID"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{quoteId.substring(0, 13)}...</span>
        </button>
      </div>

      {/* Big Premium Display */}
      <div className="text-center my-4">
        <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 opacity-90">
          Total Annual Premium
        </span>
        <div className="text-4xl md:text-5xl font-black tracking-tight text-white my-1.5 font-sans">
          $
          {totalPremium.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          <span className="text-sm font-medium text-indigo-300 ml-1.5 font-mono">
            {currency}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-900/90 rounded-full border border-indigo-700/50 text-xs text-indigo-200 font-medium">
          <span>Estimated Monthly Payment:</span>
          <span className="font-bold text-white font-mono">
            $
            {(totalPremium / 12).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            / mo
          </span>
        </div>
      </div>

      {/* Quote summary tags */}
      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-indigo-800/60 text-xs">
        <div className="bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-800/40">
          <span className="text-[10px] text-indigo-300 uppercase tracking-wider block">
            Vehicle
          </span>
          <span className="font-semibold text-slate-100 truncate block">
            {quote.vehicle_year || ""} {quote.vehicle_make || "Vehicle"} ($
            {Number(quote.vehicle_value || 0).toLocaleString()})
          </span>
        </div>
        <div className="bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-800/40">
          <span className="text-[10px] text-indigo-300 uppercase tracking-wider block">
            Coverage
          </span>
          <span className="font-semibold text-emerald-300 truncate block">
            {quote.coverage_type || "Comprehensive"}
          </span>
        </div>
      </div>

      {/* Binding CTA */}
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={handleBind}
          disabled={bound}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
            bound
              ? "bg-emerald-600 text-white cursor-default"
              : "bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-indigo-500/25 active:scale-[0.99]"
          }`}
        >
          {bound ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Policy Bound &amp; Issued</span>
            </>
          ) : (
            <>
              <span>Bind Policy Quote</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
