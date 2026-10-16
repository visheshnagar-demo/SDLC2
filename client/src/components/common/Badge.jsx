import React from "react";

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  const variantStyles = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    primary: "bg-blue-50 text-primary border border-blue-200",
    success: "bg-emerald-50 text-success border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-red-50 text-error border border-red-200",
    low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border border-amber-200",
    high: "bg-red-50 text-red-700 border border-red-200",
    cyber: "bg-purple-50 text-purple-700 border border-purple-200",
    d_and_o: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  };

  const getVariant = () => {
    const v = String(variant).toLowerCase();
    if (variantStyles[v]) return variantStyles[v];
    if (v === "quoted") return variantStyles.success;
    if (v === "declined") return variantStyles.danger;
    if (v === "under_review") return variantStyles.primary;
    if (v === "submitted") return variantStyles.warning;
    if (v === "draft") return variantStyles.default;
    return variantStyles.default;
  };

  return (
    <span
      className={`inline-flex items-center rounded-full uppercase tracking-wider font-medium ${sizeStyles[size] || sizeStyles.md} ${getVariant()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
