import React from "react";

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full";

  const variants = {
    default: "bg-[#191F2F] text-[#94A3B8] border border-[#33394A]",
    primary: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30",
    info: "bg-sky-500/10 text-sky-400 border border-sky-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
