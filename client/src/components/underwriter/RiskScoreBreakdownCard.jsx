import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, FileWarning } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const RiskScoreBreakdownCard = ({
  riskScore = 0,
  riskTier = 'LOW',
  riskBreakdowns = [],
  missingFlags = [],
}) => {
  const getTierColor = (tier) => {
    switch (tier) {
      case 'HIGH':
        return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'LOW':
      default:
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const getScoreBarColor = (score) => {
    if (score >= 70) return 'bg-rose-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Risk Score Summary Banner */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-bold shadow-sm ${getTierColor(riskTier)}`}>
              <span className="text-2xl leading-none">{riskScore}</span>
              <span className="text-[10px] uppercase font-semibold mt-0.5">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Automated Risk Score</h3>
                <Badge variant={riskTier} size="md">
                  {riskTier} RISK TIER
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Evaluated against revenue exposure, loss history, security posture, and industry sector risk baselines.
              </p>
            </div>
          </div>

          {/* Progress Bar Gauge */}
          <div className="w-full md:w-64 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Risk Severity</span>
              <span>{riskScore}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(riskScore)}`}
                style={{ width: `${Math.min(Math.max(riskScore, 5), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 (Low)</span>
              <span>50 (Medium)</span>
              <span>100 (High)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Missing Information / Completeness Flags */}
      {missingFlags && missingFlags.length > 0 && (
        <Card
          title="Missing Information & Document Completeness Flags"
          subtitle="Automatic detection of missing disclosures or attachments"
          className="border-amber-200/80 bg-amber-50/10"
        >
          <div className="space-y-2.5">
            {missingFlags.map((flag, idx) => (
              <div
                key={flag.id || idx}
                className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900"
              >
                <FileWarning className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">
                      {flag.flag_name || flag.field_name || 'Missing Information Flag'}
                    </span>
                    <Badge variant={flag.severity === 'BLOCKING' ? 'danger' : 'warning'} size="sm">
                      {flag.severity || 'WARNING'}
                    </Badge>
                  </div>
                  <p className="text-amber-800 mt-0.5">
                    {flag.description || flag.rationale || 'Required disclosure or document is not attached.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Rule-by-Rule Scoring Breakdown */}
      <Card
        title="Risk Scoring Engine Rules & Rationales"
        subtitle="Transparent algorithmic score calculation breakdown"
      >
        {riskBreakdowns && riskBreakdowns.length > 0 ? (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-y border-slate-200 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-6">Rule Key / Factor</th>
                  <th className="py-2.5 px-4">Evaluation Factor Name</th>
                  <th className="py-2.5 px-4">Score Impact</th>
                  <th className="py-2.5 px-6">Scoring Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {riskBreakdowns.map((rule, idx) => (
                  <tr key={rule.id || rule.rule_key || idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 font-mono text-slate-700">{rule.rule_key || `RULE_${idx + 1}`}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{rule.rule_name || rule.factor}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          (rule.score_delta || rule.points || 0) > 0
                            ? 'text-rose-600'
                            : (rule.score_delta || rule.points || 0) < 0
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {(rule.score_delta || rule.points || 0) > 0 ? '+' : ''}
                        {rule.score_delta || rule.points || 0} pts
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-600 max-w-xs">{rule.rationale || rule.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            <Info className="w-5 h-5 mx-auto mb-1 text-slate-300" />
            Standard scoring model applied based on revenue and loss history attributes.
          </div>
        )}
      </Card>
    </div>
  );
};

export default RiskScoreBreakdownCard;
