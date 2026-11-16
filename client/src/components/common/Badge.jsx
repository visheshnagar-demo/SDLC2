import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full';

  const variants = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    primary: 'bg-primary-light text-primary border border-blue-200',
    success: 'bg-accent-light text-accent border border-green-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-red-50 text-red-800 border border-red-200',
    low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200',
    high: 'bg-rose-50 text-rose-700 border border-rose-200',
    cyber: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    d_and_o: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const selectedVariant = variants[variant.toLowerCase()] || variants.default;
  const selectedSize = sizes[size] || sizes.md;

  return (
    <span className={`${baseStyles} ${selectedVariant} ${selectedSize} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
