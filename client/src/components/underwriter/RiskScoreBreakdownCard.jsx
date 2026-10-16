import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  AlertTriangle,
  Award,
} from "lucide-react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";

export const RiskScoreBreakdownCard = ({
  score = 50,
  tier = "MEDIUM",
  breakdowns = [],
  riskType = "CYBER",
}) => {
  const getTierColor = (t) => {
    switch (String(t).toUpperCase()) {
      case "HIGH":
        return "text-error bg-red-50 border-red-200";
      case "LOW":
        return "text-success bg-emerald-50 border-emerald-200";
      default:
        return "text-amber-700 bg-amber-50 border-amber-200";
    }
  };

  const getScoreProgressColor = (s) => {
    if (s >= 70) return "bg-error";
    if (s >= 40) return "bg-warning";
    return "bg-success";
  };

  return (
    <Card
      title="Automated Risk Scoring Engine Analysis"
      subtitle={`Algorithmic risk severity evaluation for ${
        riskType === "CYBER" ? "Cyber Liability" : "Directors & Officers"
      }`}
    >
      <div className="space-y-6">
        {/* Risk Score Summary Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-200 gap-4">
          <div className="flex items-center space-x-4">
            <div
              className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold text-xl border shadow-sm ${getTierColor(
                tier,
              )}`}
            >
              <span>{score}</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold">
                / 100
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-textPrimary">
                  Calculated Risk Index: {score}/100
                </h4>
                <Badge variant={tier}>{tier} Risk Tier</Badge>
              </div>
              <p className="text-xs text-textSecondary mt-0.5">
                {tier === "HIGH"
                  ? "Elevated loss probability & hazard exposure — requires underwriting subjectivities or sub-limits."
                  : tier === "LOW"
                    ? "Favorable risk profile meeting standard treaty and facultative underwriting guidelines."
                    : "Standard risk characteristics with moderate technical loss potential."}
              </p>
            </div>
          </div>

          {/* Mini Gauge Bar */}
          <div className="w-full sm:w-48 space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-textSecondary">
              <span>0 (Low)</span>
              <span>100 (Critical)</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreProgressColor(
                  score,
                )}`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Rule-by-Rule Scoring Breakdown */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-textSecondary mb-3">
            Scoring Factors &amp; Rule Deductions
          </h4>

          {breakdowns && breakdowns.length > 0 ? (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-surface">
              {breakdowns.map((rule, idx) => {
                const delta = rule.score_delta ?? rule.points ?? 0;
                const isPositive = delta > 0;
                const isNegative = delta < 0;

                return (
                  <div
                    key={rule.rule_key || idx}
                    className="p-3.5 flex items-start justify-between gap-4 hover:bg-gray-50/60 transition-colors text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-textPrimary">
                          {rule.rule_name ||
                            rule.rule_key ||
                            "Risk Rule Factor"}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {rule.rule_key}
                        </span>
                      </div>
                      <p className="text-textSecondary text-[11px]">
                        {rule.rationale ||
                          rule.description ||
                          "Evaluation rule applied."}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 font-bold text-xs">
                      {isPositive ? (
                        <div className="flex items-center text-error bg-red-50 px-2 py-1 rounded border border-red-200">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                          <span>+{delta} pts</span>
                        </div>
                      ) : isNegative ? (
                        <div className="flex items-center text-success bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                          <span>{delta} pts</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                          <span>0 pts</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-textSecondary text-center">
              Standard algorithmic baseline score applied with neutral rule
              factors.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RiskScoreBreakdownCard;
