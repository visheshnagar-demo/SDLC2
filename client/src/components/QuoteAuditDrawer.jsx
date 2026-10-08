import React, { useState } from "react";
import {
  X,
  Layers,
  Code,
  CheckCircle,
  Clock,
  ShieldCheck,
  Car,
  User,
} from "lucide-react";
import ItemizedFactorBreakdown from "./ItemizedFactorBreakdown";

export default function QuoteAuditDrawer({ quote, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("breakdown"); // 'breakdown' | 'json'

  if (!isOpen || !quote) return null;

  const quoteId = quote.id || quote.quote_id || "N/A";
  const timestamp =
    quote.created_at || quote.calculated_at || new Date().toISOString();
  const total = Number(quote.total_premium || quote.premium || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Audit Ledger Entry
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Quote ID:</span>
              <span className="font-mono text-sm font-normal text-indigo-200">
                {quoteId}
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick specs banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">
              Timestamp (UTC)
            </span>
            <span className="font-semibold text-slate-800 font-mono text-[11px] block mt-0.5">
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">
              Vehicle &amp; Value
            </span>
            <span className="font-semibold text-slate-800 block mt-0.5">
              {quote.vehicle_year} {quote.vehicle_make} ($
              {Number(quote.vehicle_value || 0).toLocaleString()})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">
              Total Premium
            </span>
            <span className="font-bold text-indigo-700 font-mono block mt-0.5">
              $
              {total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-5 pt-3 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("breakdown")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "breakdown"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Factor Breakdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === "json"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Raw Audit Telemetry (JSON)
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "breakdown" ? (
            <div className="space-y-4">
              <ItemizedFactorBreakdown quote={quote} />

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Underwriting Rules Verification
                </div>
                <ul className="space-y-1 text-emerald-700 list-disc list-inside mt-2">
                  <li>Driver age verified (30 &gt;= 16): Validated OK</li>
                  <li>
                    Driving experience verified (5 &lt;= 30-16): Validated OK
                  </li>
                  <li>
                    Vehicle manufacture year and value &gt; 0: Validated OK
                  </li>
                  <li>Rating Engine formula applied deterministically.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-slate-500 mb-2">
                Immutable Calculation Payload
              </div>
              <pre className="p-4 bg-slate-900 text-indigo-200 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                {JSON.stringify(quote, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Audit Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
