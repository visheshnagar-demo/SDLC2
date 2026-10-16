import React from "react";

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    cyber: "bg-cyan-50 text-cyan-800 border-cyan-200",
    do: "bg-purple-50 text-purple-800 border-purple-200",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1 font-medium",
    lg: "text-sm px-3 py-1 font-semibold",
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${selectedVariant} ${selectedSize} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
