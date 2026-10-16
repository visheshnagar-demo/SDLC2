import React from "react";
import PropTypes from "prop-types";

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    cyber: "bg-indigo-50 text-indigo-700 border-indigo-200",
    do: "bg-purple-50 text-purple-700 border-purple-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    high: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    in_review: "bg-amber-50 text-amber-700 border-amber-200",
    quoted: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
    declined: "bg-slate-100 text-slate-600 border-slate-300",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const selectedVariant =
    variantStyles[variant.toLowerCase()] || variantStyles.default;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border transition-colors ${selectedVariant} ${selectedSize} ${className}`}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default Badge;
