import React from "react";
import PropTypes from "prop-types";

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className = "",
}) {
  const iconVariants = {
    default: "bg-blue-50 text-[#2461F5]",
    primary: "bg-blue-50 text-[#2461F5]",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-rose-50 text-rose-600",
    success: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const selectedIconStyle = iconVariants[variant] || iconVariants.default;

  return (
    <div
      className={`bg-white rounded-xl border border-[#E3E8F0] p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#66738A]">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${selectedIconStyle}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold text-[#0F1729] tracking-tight mb-1">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 text-xs text-[#66738A]">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.direction === "up"
                    ? "text-emerald-600"
                    : trend.direction === "down"
                      ? "text-rose-600"
                      : "text-slate-600"
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

KpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.elementType,
  trend: PropTypes.shape({
    value: PropTypes.string,
    direction: PropTypes.oneOf(["up", "down", "neutral"]),
  }),
  variant: PropTypes.string,
  className: PropTypes.string,
};

export default KpiCard;
