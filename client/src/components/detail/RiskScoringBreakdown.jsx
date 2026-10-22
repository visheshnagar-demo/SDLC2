import React, { useState } from "react";
import api from "../../services/api";
import {
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  Award,
} from "lucide-react";

export default function RiskScoringBreakdown({ submission, onScoreUpdated }) {
  const [calculating, setCalculating] = useState(false);

  const handleRecalculate = async () => {
    setCalculating(true);
    try {
      const res = await api.calculateScore(submission.id);
      if (onScoreUpdated) onScoreUpdated(res);
    } catch (err) {
      console.error("Failed to recalculate score:", err);
    } finally {
      setCalculating(false);
    }
  };

  const score = submission.riskScore ?? 75;
  const tier =
    submission.riskTier ||
    (score >= 80
      ? "Low Risk Tier"
      : score >= 50
        ? "Moderate Risk Tier"
        : "High Risk Tier");
  const factors = submission.factorBreakdown || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header & Score Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Rules-Based Risk Scoring Engine
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {submission.lineOfBusiness}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated factor scoring evaluated against specialty underwriting
            appetite guidelines.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRecalculate}
          disabled={calculating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${calculating ? "animate-spin" : ""}`}
          />
          <span>{calculating ? "Recalculating..." : "Re-Run Scoring"}</span>
        </button>
      </div>

      {/* Score Metric Card */}
      <div className="bg-gradient-to-br from-blue-50/70 to-slate-50 rounded-xl p-5 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-mono shadow-sm ${
              score >= 80
                ? "bg-emerald-600 text-white"
                : score >= 50
                  ? "bg-amber-500 text-white"
                  : "bg-red-600 text-white"
            }`}
          >
            <span className="text-2xl font-extrabold leading-none">
              {score}
            </span>
            <span className="text-[10px] font-medium opacity-90 mt-1">
              / 100 PTS
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  score >= 80
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : score >= 50
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {tier}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {score >= 80
                  ? "Preferred Underwriting Risk"
                  : score >= 50
                    ? "Standard Referral Terms"
                    : "High Risk / Severe Deficit"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 max-w-md">
              Score is computed from quantitative underwriting checks, loss
              runs, and control attestations.
            </p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-4 text-center border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
          <div>
            <div className="text-xs text-slate-500">Factors Passed</div>
            <div className="text-lg font-bold text-emerald-600">
              {factors.filter((f) => f.status === "pass").length} /{" "}
              {factors.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Deficits Flagged</div>
            <div className="text-lg font-bold text-amber-600">
              {factors.filter((f) => f.status !== "pass").length}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Factor Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Factor Score Itemization & Control Deficits
        </h4>

        <div className="space-y-2.5">
          {factors.map((factor, idx) => {
            const isPass = factor.status === "pass" && factor.pointsEarned > 0;
            const percentage = Math.round(
              (factor.pointsEarned / factor.maxPoints) * 100,
            );

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  isPass
                    ? "bg-white border-slate-200"
                    : "bg-amber-50/40 border-amber-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertOctagon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">
                      {factor.factorName}
                    </span>
                  </div>
                  <div className="font-mono font-bold text-slate-800">
                    <span
                      className={isPass ? "text-emerald-700" : "text-amber-700"}
                    >
                      {factor.pointsEarned}
                    </span>
                    <span className="text-slate-400">
                      {" "}
                      / {factor.maxPoints} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full ${isPass ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>{factor.description}</span>
                  {!isPass && (
                    <span className="font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded text-[10px]">
                      Underwriting Deficit
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
