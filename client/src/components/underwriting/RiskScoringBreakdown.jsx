import React from "react";
import {
  Shield,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Cpu,
  Award,
} from "lucide-react";
import Badge from "../common/Badge";

export function RiskScoringBreakdown({ scoreData = null, riskType = "Cyber" }) {
  const score = scoreData?.risk_score ?? scoreData?.score ?? 75;
  const tier =
    scoreData?.risk_tier ||
    (score >= 80 ? "Low Risk" : score >= 60 ? "Moderate Risk" : "High Risk");

  const getTierVariant = (t) => {
    const lower = t.toLowerCase();
    if (lower.includes("low")) return "success";
    if (lower.includes("mod")) return "warning";
    return "danger";
  };

  const factors = scoreData?.scoring_factors || [
    {
      name: "Loss History & Prior Claims",
      score: 85,
      weight: "30%",
      status: "Clean 5-year loss record with zero historical limits breached.",
    },
    {
      name: "Requested Limit vs. Attachment Ratio",
      score: 70,
      weight: "25%",
      status: "Attachment point exceeds 10% of underlying policy value.",
    },
    {
      name: riskType.toLowerCase().includes("cyber")
        ? "Security Posture & MFA Coverage"
        : "Governance & Regulatory Compliance",
      score: 80,
      weight: "25%",
      status: riskType.toLowerCase().includes("cyber")
        ? "100% MFA across identity providers; endpoint detection active."
        : "Clear SEC/regulatory filings with independent audit committee.",
    },
    {
      name: "Sector / Industry Risk Index",
      score: 65,
      weight: "20%",
      status: "Moderate exposure index based on industry benchmark.",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Automated Risk Scoring Engine
            </h3>
            <p className="text-xs text-slate-500">
              Real-time composite algorithmic assessment
            </p>
          </div>
        </div>
        <Badge variant={getTierVariant(tier)} size="lg">
          {tier}
        </Badge>
      </div>

      {/* Main Score Hero */}
      <div className="bg-slate-900 rounded-xl p-5 text-white flex items-center justify-between mb-6 shadow-inner">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Composite Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {score}
            </span>
            <span className="text-slate-400 text-sm font-medium">/ 100</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Recommendation:{" "}
            {score >= 70
              ? "Favorable for facultative quotation"
              : "Requires referral or stricter subjectivities"}
          </p>
        </div>

        <div className="w-24 h-24 relative flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <path
              className="text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={
                score >= 75
                  ? "text-emerald-400"
                  : score >= 60
                    ? "text-amber-400"
                    : "text-rose-400"
              }
              strokeDasharray={`${score}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute text-xs font-bold text-white">{score}%</div>
        </div>
      </div>

      {/* Breakdown Factors */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Evaluation Factors
        </h4>
        {factors.map((factor, idx) => (
          <div
            key={idx}
            className="border border-slate-100 rounded-lg p-3 bg-slate-50/50"
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-800">
                {factor.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Weight: {factor.weight}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {factor.score}/100
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${
                  factor.score >= 75
                    ? "bg-emerald-500"
                    : factor.score >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
                style={{ width: `${factor.score}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-600">{factor.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskScoringBreakdown;
