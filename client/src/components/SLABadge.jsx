import React from "react";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SLABadge({ createdAt, hoursElapsed, status }) {
  // Compute hours elapsed if createdAt is provided
  let elapsed = hoursElapsed;
  if (elapsed === undefined && createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    elapsed = Math.max(0, Math.floor((now - createdDate) / (1000 * 60 * 60)));
  }
  elapsed = elapsed || 0;

  // Determine SLA tier based on 48h target
  // Green: < 36h
  // Amber: 36h - 48h
  // Red: > 48h (SLA Breach)
  let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let dotColor = "bg-emerald-500";
  let label = `${elapsed}h / 48h`;
  let Icon = CheckCircle2;

  if (elapsed >= 48) {
    badgeColor = "bg-rose-50 text-rose-700 border-rose-200 font-semibold";
    dotColor = "bg-rose-500 animate-pulse";
    label = `${elapsed}h (SLA Breach)`;
    Icon = AlertCircle;
  } else if (elapsed >= 36) {
    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    dotColor = "bg-amber-500";
    label = `${elapsed}h (Aging warning)`;
    Icon = Clock;
  }

  // If status is terminal (Bound, Declined, Quoted), show completed SLA
  if (
    ["Bound", "Declined", "Quoted", "bound", "declined", "quoted"].includes(
      status,
    )
  ) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <CheckCircle2 className="w-3 h-3 text-slate-400" />
        <span>Resolved ({elapsed}h)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs border ${badgeColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
}
