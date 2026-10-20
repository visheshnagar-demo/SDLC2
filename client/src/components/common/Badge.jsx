import React from "react";

const VARIANTS = {
  default: "bg-slate-100 text-slate-800 border-slate-200",
  primary: "bg-blue-100 text-blue-800 border-blue-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-rose-100 text-rose-800 border-rose-200",
  info: "bg-sky-100 text-sky-800 border-sky-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
};

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClass} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
