import React from "react";
import { Clock, AlertTriangle, CheckCircle2, AlertOctagon } from "lucide-react";

export default function SlaAgingBadge({ hours = 0, status = "In Review" }) {
  if (status === "Bound" || status === "Declined") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <CheckCircle2 className="w-3 h-3 text-slate-500" />
        Completed
      </span>
    );
  }

  // SLA Thresholds: Green < 24h, Yellow 24-48h, Red Alert > 48h
  if (hours > 48) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 animate-pulse">
        <AlertOctagon className="w-3 h-3 text-red-600" />
        🔴 {hours}h (Red Alert)
      </span>
    );
  }

  if (hours >= 24) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        🟡 {hours}h (Warning)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
      <Clock className="w-3 h-3 text-emerald-600" />
      🟢 {hours}h (On Target)
    </span>
  );
}
