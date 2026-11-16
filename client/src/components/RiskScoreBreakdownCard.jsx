import React from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, BarChart3, Info } from 'lucide-react';

export default function RiskScoreBreakdownCard({ riskScore, onRecalculate, isRecalculating }) {
  if (!riskScore && riskScore !== 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500 text-sm">
        <p>No risk scoring data computed yet.</p>
        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isRecalculating ? 'Calculating...' : 'Compute Risk Score'}
          </button>
        )}
      </div>
    );
  }

  const scoreObj = typeof riskScore === 'object' ? riskScore : { overall_risk_score: riskScore };
  const overall = Number(scoreObj.overall_risk_score ?? scoreObj.composite_score ?? 0);
  const tier = scoreObj.risk_tier || (overall < 40 ? 'LOW' : overall <= 70 ? 'MODERATE' : 'ELEVATED');
  
  const completeness = Number(scoreObj.completeness_score ?? 85);
  const exposure = Number(scoreObj.exposure_score ?? 60);
  const lossHistory = Number(scoreObj.loss_history_score ?? 40);
  const governance = Number(scoreObj.governance_score ?? scoreObj.controls_score ?? 75);

  const getTierColor = (t) => {
    switch (t?.toUpperCase()) {
      case 'LOW':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'MODERATE':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-red-700 bg-red-100 border-red-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Automated Risk Score Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic rating evaluating exposure, data completeness, loss history, and security controls.
          </p>
        </div>

        {onRecalculate && (
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Recomputing...' : 'Re-score'}
          </button>
        )}
      </div>

      {/* Primary Score Dial */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 p-5 rounded-lg border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white shadow-inner">
            <span className="text-2xl font-black text-slate-900">{overall.toFixed(1)}</span>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">Composite Score</div>
            <div className="text-lg font-bold text-slate-800">0 - 100 Scale</div>
            <div className="text-xs text-slate-400">Lower indicates cleaner underwriting profile</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-semibold text-slate-500 mb-1">Underwriting Tier</div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getTierColor(tier)}`}>
            {tier} RISK TIER
          </span>
        </div>
      </div>

      {/* Sub-Score Progress Bars */}
      <div className="space-y-3.5">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Data Completeness & Quality</span>
            <span className="font-semibold">{completeness.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(completeness, 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Limit Exposure & Attachment Risk</span>
            <span className="font-semibold">{exposure.toFixed(0)} / 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(exposure, 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Loss History & Prior Claims Impact</span>
            <span className="font-semibold">{lossHistory.toFixed(0)} / 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(lossHistory, 100)}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
            <span>Controls & Governance Factor</span>
            <span className="font-semibold">{governance.toFixed(0)} / 100</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min(governance, 100)}%` }} />
          </div>
        </div>
      </div>

      {scoreObj.scoring_notes && (
        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>{scoreObj.scoring_notes}</span>
        </div>
      )}
    </div>
  );
}
