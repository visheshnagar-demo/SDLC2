import React from 'react';

export default function RiskScoreBadge({ score, showLabel = true, size = 'md' }) {
  const numericScore = typeof score === 'number' ? score : (score ? Number(score) : 0);

  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let tierLabel = 'Low Risk';

  if (numericScore > 70) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    tierLabel = 'High Risk';
  } else if (numericScore >= 40) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    tierLabel = 'Medium Risk';
  }

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1.5 text-base font-semibold' 
    : size === 'sm' 
    ? 'px-2 py-0.5 text-xs font-medium' 
    : 'px-2.5 py-1 text-sm font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses}`}
      data-testid="risk-score-badge"
    >
      <span className="font-bold">{numericScore}</span>
      {showLabel && <span className="opacity-80">({tierLabel})</span>}
    </span>
  );
}
