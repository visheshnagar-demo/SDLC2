import React from "react";
import { Clock, AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";

export const SLAAgingIndicator = ({ createdAt, status }) => {
  if (["BOUND", "DECLINED"].includes(status)) {
    return (
      <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
        <CheckCircle2 className="w-3 h-3 mr-1 text-slate-400" /> Closed
      </span>
    );
  }

  const createdTime = new Date(createdAt || Date.now()).getTime();
  const diffHours = Math.max(0, (Date.now() - createdTime) / (1000 * 3600));

  let tier = "ON_TRACK";
  let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let icon = <Clock className="w-3 h-3 mr-1 text-emerald-600" />;
  let label = "On Track";

  if (diffHours > 48) {
    tier = "BREACHED";
    badgeClass =
      "bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse";
    icon = <AlertOctagon className="w-3 h-3 mr-1 text-rose-600" />;
    label = "SLA Breach";
  } else if (diffHours > 24) {
    tier = "WARNING";
    badgeClass = "bg-amber-50 text-amber-700 border-amber-200 font-medium";
    icon = <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />;
    label = "Aging SLA";
  }

  const formattedHours = diffHours < 1 ? "<1h" : `${Math.floor(diffHours)}h`;

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span
        className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border ${badgeClass}`}
      >
        {icon}
        <span>
          {formattedHours} ({label})
        </span>
      </span>
      <span className="text-[10px] text-slate-500 ml-1">SLA Target: 24h</span>
    </div>
  );
};

export default SLAAgingIndicator;
