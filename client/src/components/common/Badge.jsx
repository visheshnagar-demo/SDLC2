import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full';

  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    // Risk tiers
    LOW: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-800 border border-amber-300',
    HIGH: 'bg-rose-100 text-rose-800 border border-rose-300',
    // Submissions Statuses
    DRAFT: 'bg-slate-100 text-slate-700 border border-slate-300',
    SUBMITTED: 'bg-blue-100 text-blue-800 border border-blue-300',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800 border border-purple-300',
    QUOTED: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    DECLINED: 'bg-rose-100 text-rose-800 border border-rose-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
