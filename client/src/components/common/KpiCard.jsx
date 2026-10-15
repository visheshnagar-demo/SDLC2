import React from "react";

export const KpiCard = ({
  title,
  value,
  trend,
  trendType = "up",
  subtitle,
  icon: Icon,
  className = "",
}) => {
  return (
    <div
      className={`bg-[#151B2B] p-5 rounded-xl border border-[#33394A]/60 flex flex-col justify-between shadow-sm hover:border-[#33394A] transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-[#191F2F] text-[#0EA5E9] border border-[#33394A]/40">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
          {value}
        </div>
        {(trend || subtitle) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${
                  trendType === "up"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : trendType === "down"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-slate-500/10 text-slate-400"
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && <span className="text-[#94A3B8]">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
