import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = 'primary' }) {
  const borderVariants = {
    primary: 'border-blue-500/30',
    accent: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    danger: 'border-red-500/30'
  };

  const selectedBorder = borderVariants[variant] || borderVariants.primary;

  return (
    <div className={`bg-[#171F33] p-5 rounded-lg border ${selectedBorder} shadow-lg transition-all hover:border-opacity-60`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-md bg-[#0B1326] border border-slate-700/60 text-blue-400">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-2">
        <div className="text-2xl font-bold text-[#DAE2FD] tracking-tight">{value}</div>
        {trend && (
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
