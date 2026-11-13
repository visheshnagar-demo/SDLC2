import React from "react";
import {
  ShieldCheck,
  Layers,
  ArrowRight,
  BarChart2,
  CheckCircle2,
} from "lucide-react";

export default function RiskAssessmentView({ activeCase, onNextStage }) {
  const risk = activeCase?.riskAssessment || activeCase?.risk_assessment || {};
  const hazardScore =
    typeof risk?.hazardScore === "number"
      ? risk.hazardScore
      : typeof risk?.hazard_score === "number"
        ? risk.hazard_score
        : 24;
  const isReferral = Boolean(
    activeCase?.requiresReferral ?? activeCase?.requires_referral,
  );

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
              Stage 05: Risk & Portfolio Assessment
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Case:{" "}
              {activeCase?.caseNumber ||
                activeCase?.case_number ||
                "GEN-2026-QTB"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Underwriting Risk & Peril Accumulation
          </h2>
          <p className="text-xs text-slate-500">
            Risk Assessment Agent evaluates stochastic catastrophe loss curves,
            regional accumulation thresholds, and historical claims volatility.
          </p>
        </div>

        <button
          onClick={() => onNextStage && onNextStage("pricing")}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-sm whitespace-nowrap"
        >
          <span>Proceed to Pricing Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 3 Risk KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hazard Score Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Underwriting Hazard Score
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                hazardScore < 40
                  ? "bg-emerald-100 text-emerald-800"
                  : hazardScore < 70
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
              }`}
            >
              {hazardScore < 40
                ? "LOW RISK"
                : hazardScore < 70
                  ? "MODERATE"
                  : "HIGH EXPOSURE"}
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {hazardScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / 100 Index
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hazardScore < 40
                  ? "bg-emerald-500"
                  : hazardScore < 70
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, hazardScore))}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Multi-factor underwriting index based on loss history, territory,
            and wording.
          </span>
        </div>

        {/* Cat Modeling PML Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Catastrophe Exposure (RMS v23)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded font-mono bg-blue-100 text-blue-800">
              1-in-250 Yr
            </span>
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-slate-900">
              {risk.catExposureRMS ||
                risk.cat_exposure_rms ||
                "0.42% 250-yr AEP (Within Target)"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Stochastic simulation across 100,000 synthetic event years
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Within Risk Appetite
            Tolerances
          </div>
        </div>

        {/* Capacity Accumulation Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Regional Accumulation Ceiling
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                isReferral
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {isReferral ? "WATCHLIST" : "CLEAR"}
            </span>
          </div>
          <div className="my-2">
            <div className="text-sm font-bold text-slate-900">
              {risk.accumulationStatus ||
                risk.accumulation_status ||
                "Green (14.2% Regional Cap Utilized)"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Portfolio clash check vs Tier-1 Hurricane/Earthquake aggregate
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Sanctions:{" "}
            {risk.sanctionsResult || risk.sanctions_result || "CLEAR (0 Hits)"}
          </div>
        </div>
      </div>

      {/* Main Analysis Panels: Stochastic Curve + Loss Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Peril Breakdown Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-teal-600" />
            Modeled Peril Loss Expectation Distribution
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  Tropical Cyclone / Hurricane (Gulf & Atlantic)
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  58% Share
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-teal-600 h-2 rounded-full"
                  style={{ width: "58%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  Severe Convective Storm & Tornado (Midwest)
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  24% Share
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "24%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  Earthquake & Fault Slip (Pacific NW)
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  12% Share
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: "12%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700">
                  Wildfire & Contingent Non-Cat Perils
                </span>
                <span className="font-mono text-slate-900 font-bold">
                  6% Share
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full"
                  style={{ width: "6%" }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">
                Underwriting Recommendation:
              </span>{" "}
              {risk.underwritingVerdict ||
                risk.underwriting_verdict ||
                "Approved within Standard Authority"}
            </div>
          </div>
        </div>

        {/* Right: Portfolio Headroom & Treaty Clash Breakdown (FR-08) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            Regional Treaty Capacity & Retrocession Allocations
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">
                  Total Designated Treaty Capacity
                </span>
                <span className="text-[11px] text-slate-500">
                  Board-authorized maximum underwriting exposure
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm">
                $120,000,000
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">
                  Current Committed Exposure
                </span>
                <span className="text-[11px] text-slate-500">
                  Active bound policies in matching risk zones
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm">
                $32,500,000
              </span>
            </div>

            <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-teal-900 block">
                  Proposed Deal Allocation
                </span>
                <span className="text-[11px] text-teal-700">
                  Committed share upon binding
                </span>
              </div>
              <span className="font-mono font-bold text-teal-900 text-sm">
                {activeCase?.requestedLimit || "$10,000,000"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-emerald-900 block">
                  Remaining Headroom
                </span>
                <span className="text-[11px] text-emerald-700">
                  Available capacity for future submissions
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-900 text-sm">
                $77,500,000 (64.5%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
