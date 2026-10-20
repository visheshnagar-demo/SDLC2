import React from "react";

const VARIANTS = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-blue-300",
  secondary:
    "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm disabled:bg-slate-100 disabled:text-slate-400",
  success:
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:bg-emerald-300",
  warning:
    "bg-amber-600 hover:bg-amber-700 text-white shadow-sm disabled:bg-amber-300",
  danger:
    "bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:bg-rose-300",
  ghost:
    "bg-transparent hover:bg-slate-100 text-slate-600 disabled:text-slate-300",
};

const SIZES = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  icon: Icon,
  ...props
}) => {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
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
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className={`h-4 w-4 ${children ? "mr-2" : ""}`} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
