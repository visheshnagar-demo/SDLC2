import React from "react";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0D1322] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#2563EB] hover:bg-blue-600 text-white focus:ring-blue-500 shadow-sm",
    secondary:
      "bg-[#191F2F] hover:bg-[#20273a] text-[#F8FAFC] border border-[#33394A] focus:ring-slate-400",
    outline:
      "bg-transparent hover:bg-[#151B2B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#33394A] focus:ring-slate-400",
    danger: "bg-[#EF4444] hover:bg-red-600 text-white focus:ring-red-500",
    success:
      "bg-[#10B981] hover:bg-emerald-600 text-white focus:ring-emerald-500",
    ghost:
      "bg-transparent hover:bg-[#151B2B] text-[#94A3B8] hover:text-[#F8FAFC]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-2.5 text-base gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
