import React, { useState } from "react";
import {
  Gauge,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Award,
  Info,
} from "lucide-react";

export default function RiskScoreBreakdownCard({
  scoreData,
  onRecompute,
  isRecomputing = false,
}) {
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  const compositeScore =
    scoreData?.overall_score ?? scoreData?.composite_score ?? 62.5;
  const tier =
    scoreData?.risk_tier ||
    (compositeScore >= 75
      ? "HIGH_RISK"
      : compositeScore >= 50
        ? "MODERATE_RISK"
        : "LOW_RISK");

  const subScores = [
    {
      name: "Limit & Exposure Risk",
      weight: "30%",
      score: scoreData?.exposure_score ?? scoreData?.limit_exposure_score ?? 68,
      description:
        "Capacity ratio vs. primary attachment point & insured revenue",
    },
    {
      name: "Loss History & Incident Track Record",
      weight: "25%",
      score:
        scoreData?.loss_history_score ??
        scoreData?.incident_history_score ??
        55,
      description: "Prior 3-year claims, cyber events or D&O restatements",
    },
    {
      name: "Governance & Security Controls",
      weight: "25%",
      score: scoreData?.governance_score ?? scoreData?.controls_score ?? 72,
      description:
        "MFA/EDR enforcement, independent board oversight, incident response readiness",
    },
    {
      name: "Submission Completeness & Veracity",
      weight: "20%",
      score: scoreData?.completeness_score ?? 60,
      description:
        "Mandatory documentation provided vs. automated verification checks",
    },
  ];

  const getTierColor = (t) => {
    switch (t) {
      case "LOW_RISK":
      case "LOW":
        return {
          badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
          text: "text-emerald-700",
          bar: "bg-emerald-600",
        };
      case "MODERATE_RISK":
      case "MEDIUM":
      case "MODERATE":
        return {
          badge: "bg-blue-100 text-blue-800 border-blue-300",
          text: "text-blue-700",
          bar: "bg-blue-600",
        };
      case "ELEVATED_RISK":
      case "ELEVATED":
        return {
          badge: "bg-amber-100 text-amber-800 border-amber-300",
          text: "text-amber-800",
          bar: "bg-amber-500",
        };
      case "HIGH_RISK":
      case "HIGH":
      case "CRITICAL":
      default:
        return {
          badge: "bg-red-100 text-red-800 border-red-300",
          text: "text-red-700",
          bar: "bg-red-600",
        };
    }
  };

  const tierColors = getTierColor(tier);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Automated Risk Scoring Engine
            </h3>
            <p className="text-xs text-slate-500">
              Composite algorithmic score evaluated against underwriting
              guidelines
            </p>
          </div>
        </div>

        {onRecompute && (
          <button
            type="button"
            onClick={onRecompute}
            disabled={isRecomputing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRecomputing ? "animate-spin text-blue-600" : ""}`}
            />
            {isRecomputing ? "Recomputing..." : "Recompute Score"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-center">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Composite Score
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-900">
              {compositeScore}
            </span>
            <span className="text-sm text-slate-400 font-medium">/ 100</span>
          </div>
          <div
            className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${tierColors.badge}`}
          >
            {tier.replace("_", " ")}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3.5">
          {subScores.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700">
                  {item.name}{" "}
                  <span className="text-slate-400 font-normal">
                    ({item.weight})
                  </span>
                </span>
                <span className="font-bold text-slate-900">
                  {item.score}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.score >= 75
                      ? "bg-red-500"
                      : item.score >= 50
                        ? "bg-blue-600"
                        : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, item.score))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Algorithm: Multi-Factor Weighted Risk Calibration v2.4
        </span>
        <button
          type="button"
          onClick={() => setShowFormulaInfo(!showFormulaInfo)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
        >
          <Info className="w-3.5 h-3.5" />
          {showFormulaInfo ? "Hide Criteria" : "View Criteria"}
        </button>
      </div>

      {showFormulaInfo && (
        <div className="mt-3 p-3 bg-slate-50 rounded text-xs text-slate-600 space-y-1 border border-slate-200">
          <p className="font-semibold text-slate-800">
            Risk Scoring Framework:
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
            <li>
              <strong>Score &lt; 50:</strong> Low Risk Tier (Fast-Track
              Underwriting Eligible).
            </li>
            <li>
              <strong>Score 50 - 74:</strong> Moderate Risk Tier (Standard
              Underwriter Evaluation & Term Negotiation).
            </li>
            <li>
              <strong>Score &ge; 75:</strong> Elevated Risk Tier (Senior UW
              Approval Required or Strict Decline Referral).
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
