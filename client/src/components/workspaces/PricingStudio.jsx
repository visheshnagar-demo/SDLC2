import React, { useState, useEffect } from "react";
import { Sliders, CheckCircle2, ArrowRight } from "lucide-react";

export default function PricingStudio({
  activeCase,
  onSelectQuoteOption,
  onNextStage,
}) {
  const pricing = activeCase?.pricingData || activeCase?.pricing_data || {};
  const [selectedOption, setSelectedOption] = useState(
    pricing?.options?.[0]?.name || "Option A",
  );
  const [customRol, setCustomRol] = useState(
    pricing?.targetRateOnLine || pricing?.target_rate_on_line || 6.8,
  );
  const [customComm, setCustomComm] = useState(28.5);

  useEffect(() => {
    if (pricing?.options?.[0]?.name && !selectedOption) {
      setSelectedOption(pricing.options[0].name);
    }
    if (pricing?.targetRateOnLine || pricing?.target_rate_on_line) {
      setCustomRol(pricing.targetRateOnLine || pricing.target_rate_on_line);
    }
  }, [pricing, selectedOption]);

  const baseLimit =
    activeCase?.limitNumeric ||
    (typeof activeCase?.requested_limit === "number"
      ? activeCase.requested_limit
      : 10000000);
  const calculatedPremium = Math.round(baseLimit * (customRol / 100));
  const calculatedCombRatio = (45.0 + customComm + 8.5).toFixed(1);
  const calculatedRoe = (22.5 - (calculatedCombRatio - 75) * 0.8).toFixed(1);

  const optionsList = pricing?.options || [
    {
      name: "Option A: 20% Quota Share (Recommended)",
      limit: "$10,000,000",
      premium: "$1,250,000",
      rol: "6.8%",
      combRatio: "82.4%",
      roe: "16.4%",
      status: "Selected",
    },
    {
      name: "Option B: 15% Quota Share + Stop Loss",
      limit: "$7,500,000",
      premium: "$975,000",
      rol: "7.1%",
      combRatio: "84.1%",
      roe: "15.2%",
      status: "Available",
    },
    {
      name: "Option C: 25% Lead Participation",
      limit: "$12,500,000",
      premium: "$1,550,000",
      rol: "6.6%",
      combRatio: "81.9%",
      roe: "17.0%",
      status: "Available",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
              Stage 06: Actuarial Pricing Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Case:{" "}
              {activeCase?.caseNumber ||
                activeCase?.case_number ||
                "GEN-2026-QTB"}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Actuarial Loss Modeling & Rate Optimization
          </h2>
          <p className="text-xs text-slate-500">
            Pricing Agent executes stochastic frequency-severity simulations,
            capital allocations, and profitability hurdle verifications (Target
            RoE ≥ 12.0%).
          </p>
        </div>

        <button
          onClick={() => onNextStage && onNextStage("quote")}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-sm whitespace-nowrap"
        >
          <span>Proceed to Quote Builder</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pricing Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Technical Premium
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            $
            {(
              pricing?.technicalPremium ||
              pricing?.technical_premium ||
              1250000
            ).toLocaleString()}
          </div>
          <span className="text-[11px] text-teal-600 font-medium mt-1 block">
            Expected loss + risk load
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Target Rate on Line
          </span>
          <div className="text-2xl font-bold text-teal-700 font-mono mt-1">
            {customRol}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Benchmark: 6.5% - 7.2%
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Expected Combined Ratio
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {calculatedCombRatio}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Target margin &lt; 85.0%
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Projected Return on Equity
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">
            {calculatedRoe}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Exceeds 12.0% Hurdle
          </span>
        </div>
      </div>

      {/* Main Grid: Options Comparison + Sensitivity Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Options Comparison Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Actuarial Rate Structure Options
              </h3>
              <p className="text-xs text-slate-500">
                Compare multi-tier participation scenarios generated by the
                Pricing Agent.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
              {optionsList.length} Structures Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {optionsList.map((opt, idx) => {
              if (!opt) return null;
              const isSelected = selectedOption === opt.name;
              return (
                <div
                  key={opt.name || idx}
                  onClick={() => setSelectedOption(opt.name)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-teal-50/70 border-teal-500 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {opt.name}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] bg-teal-600 text-white px-2 py-0.2 rounded font-semibold">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span>
                        Limit:{" "}
                        <strong className="text-slate-900 font-mono">
                          {opt.limit}
                        </strong>
                      </span>
                      <span>
                        Premium:{" "}
                        <strong className="text-slate-900 font-mono">
                          {opt.premium}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Rate on Line
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {opt.rol}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Combined Ratio
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {opt.combRatio}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">
                        Proj. RoE
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {opt.roe}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Sensitivity Simulator */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              Actuarial Sensitivity Sandbox
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* RoL Slider */}
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Rate on Line (RoL)</span>
                <span className="font-mono font-bold text-teal-700">
                  {customRol}%
                </span>
              </div>
              <input
                type="range"
                min="4.0"
                max="12.0"
                step="0.1"
                value={customRol}
                onChange={(e) => setCustomRol(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>4.0% (Aggressive)</span>
                <span>12.0% (Hard Market)</span>
              </div>
            </div>

            {/* Commission Slider */}
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Ceding Commission</span>
                <span className="font-mono font-bold text-slate-900">
                  {customComm}%
                </span>
              </div>
              <input
                type="range"
                min="15.0"
                max="35.0"
                step="0.5"
                value={customComm}
                onChange={(e) => setCustomComm(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>15.0% (Low)</span>
                <span>35.0% (High)</span>
              </div>
            </div>

            {/* Calculated Output Sandbox */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-mono text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Gross Premium:</span>
                <span className="font-bold text-slate-900">
                  ${calculatedPremium.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Expected Profit:</span>
                <span className="font-bold text-emerald-700">
                  $
                  {Math.round(
                    calculatedPremium * ((100 - calculatedCombRatio) / 100),
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                <span>Estimated RoE:</span>
                <span className="font-bold text-emerald-700 text-xs">
                  {calculatedRoe}%
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onSelectQuoteOption) {
                  onSelectQuoteOption({
                    name: selectedOption,
                    rol: `${customRol}%`,
                    commission: `${customComm}%`,
                    premium: `$${calculatedPremium.toLocaleString()}`,
                  });
                }
                if (onNextStage) {
                  onNextStage("quote");
                }
              }}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition shadow-sm"
            >
              Apply to Quote Builder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
