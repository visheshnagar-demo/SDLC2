import React from 'react';

export default function Badge({ variant = 'info', children, className = '' }) {
  const variantStyles = {
    success: 'bg-[#10B981]/20 text-[#34D399] border-[#10B981]/40',
    warning: 'bg-[#F59E0B]/20 text-[#FBBF24] border-[#F59E0B]/40',
    error: 'bg-[#EF4444]/20 text-[#F87171] border-[#EF4444]/40',
    info: 'bg-[#2563EB]/20 text-[#60A5FA] border-[#2563EB]/40',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  const selectedStyle = variantStyles[variant] || variantStyles.info;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${selectedStyle} ${className}`}>
      {children}
    </span>
  );
}
