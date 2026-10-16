import React from "react";

export function KpiCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </div>
        {change && (
          <span
            className={`text-xs font-semibold flex items-center ${
              trend === "down" ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}

export default KpiCard;
