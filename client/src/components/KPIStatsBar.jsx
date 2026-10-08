import React from "react";
import { TrendingUp, Clock, ShieldCheck, Zap } from "lucide-react";

export default function KPIStatsBar({ quoteCount = 0, averagePremium = 1200 }) {
  const stats = [
    {
      label: "Quotes Today",
      value: `${quoteCount}`,
      subtext: "Instant agent calculations",
      icon: TrendingUp,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      label: "Avg Quote Value",
      value: `$${Number(averagePremium).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      subtext: "Market median motor tariff",
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Calculation Latency",
      value: "< 150ms",
      subtext: "Down from 15-20 min manual lookup",
      icon: Zap,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Underwriting Guardrails",
      value: "Active",
      subtext: "Real-time rule engine & audit trail",
      icon: Clock,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={`kpi-${idx}`}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {stat.label}
              </span>
              <div className="text-xl font-black text-slate-900 my-0.5 font-sans">
                {stat.value}
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {stat.subtext}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl border ${stat.color} shrink-0`}>
              <IconComponent className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
