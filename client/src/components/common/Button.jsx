import React from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  icon: Icon,
  onClick,
  className = "",
  ...props
}) {
  const variantStyles = {
    primary:
      "bg-[#2461F5] text-white hover:bg-[#1B4FD8] active:bg-[#0F3BB8] border-transparent shadow-sm disabled:bg-blue-300",
    secondary:
      "bg-white text-slate-700 hover:bg-slate-50 border-slate-300 shadow-sm disabled:text-slate-400 disabled:border-slate-200",
    outline:
      "bg-transparent text-[#2461F5] hover:bg-blue-50 border-[#2461F5] disabled:text-blue-300 disabled:border-blue-200",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 border-transparent shadow-sm disabled:bg-rose-300",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-sm disabled:bg-emerald-300",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 rounded-md gap-1.5",
    md: "text-sm px-4 py-2 rounded-lg gap-2",
    lg: "text-base px-5 py-2.5 rounded-lg gap-2.5",
  };

  const selectedVariant = variantStyles[variant] || variantStyles.primary;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer disabled:cursor-not-allowed ${selectedVariant} ${selectedSize} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2
          className="w-4 h-4 animate-spin shrink-0"
          data-testid="button-spinner"
        />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "danger",
    "ghost",
    "success",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  icon: PropTypes.elementType,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
