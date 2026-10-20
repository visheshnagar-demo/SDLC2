import React from "react";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export const SLAIndicatorBadge = ({ createdAt, slaHours = 24 }) => {
  if (!createdAt) {
    return (
      <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3 mr-1 text-slate-400" />
        SLA Active
      </span>
    );
  }

  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedHours = (now - createdTime) / (1000 * 60 * 60);
  const remainingHours = slaHours - elapsedHours;

  if (remainingHours <= 0) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
        <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
        SLA Breached ({Math.abs(Math.round(remainingHours))}h over)
      </span>
    );
  }

  if (remainingHours <= 8) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 mr-1 text-amber-600 animate-pulse" />
        {Math.round(remainingHours)}h left (Urgent)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
      {Math.round(remainingHours)}h left (On Track)
    </span>
  );
};

export default SLAIndicatorBadge;
