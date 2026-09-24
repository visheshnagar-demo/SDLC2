import React from "react";
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Sliders,
  ArrowRight,
} from "lucide-react";

export default function ScenarioSelector({
  scenarios = [],
  selectedScenarioId,
  onSelectScenario,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse"
          >
            <div className="h-5 bg-slate-200 rounded w-28 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
            <div className="h-16 bg-slate-200 rounded mb-4"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section aria-label="Scenario Selector" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-700" />
            <span>Assortment Optimization Scenarios</span>
          </h2>
          <p className="text-xs text-slate-500">
            Select a simulation strategy below. Balanced scenario is
            pre-selected and recommended for Small Town Value Cluster.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const isSelected =
            selectedScenarioId === scenario.id ||
            selectedScenarioId === scenario.scenario_type;
          const isDefault =
            scenario.is_default || scenario.scenario_type === "BALANCED";
          const actions = scenario.sku_actions || {
            add_count: 5,
            keep_count: 30,
            swap_count: 5,
            remove_count: 2,
          };
          const guardrails = scenario.guardrails || {
            overall_status: "PASSED",
          };

          return (
            <div
              key={scenario.id || scenario.scenario_type}
              onClick={() => onSelectScenario(scenario)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectScenario(scenario);
                }
              }}
              className={`relative bg-white rounded-xl p-5 border-2 transition-all cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? "border-[#FDB813] ring-4 ring-[#FDB813]/20 shadow-lg bg-gradient-to-b from-amber-50/20 to-white"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {scenario.name || `${scenario.scenario_type} Scenario`}
                    </h3>
                    {isDefault && (
                      <span className="bg-[#FDB813] text-[#0F172A] font-black text-[10px] px-2 py-0.5 rounded tracking-wide uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {scenario.description ||
                      "Targeted optimization balance for sales and space."}
                  </p>
                </div>

                {/* Radio selection indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? "border-[#FDB813] bg-[#0F172A]"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#FDB813]"></div>
                  )}
                </div>
              </div>

              {/* Projected Impact Metrics Box */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 mb-4 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Projected Cluster Impact
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">
                      Sales Lift
                    </div>
                    <div className="text-sm font-extrabold text-emerald-600 mt-0.5">
                      +
                      {Number(scenario.projected_sales_delta_pct || 0).toFixed(
                        1,
                      )}
                      %
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">
                      PB Shift
                    </div>
                    <div className="text-sm font-extrabold text-indigo-600 mt-0.5">
                      +{Number(scenario.projected_pb_shift_pct || 0).toFixed(1)}
                      %
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium">
                      Shelf Util
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                      {Number(scenario.projected_space_util_pct || 0).toFixed(
                        1,
                      )}
                      %
                    </div>
                  </div>
                </div>
              </div>

              {/* SKU Actions & Guardrails Footer */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">SKU Plan:</span>
                  <div className="flex gap-1.5 font-semibold text-[11px]">
                    <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      +{actions.add_count || 0} Add
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      {actions.keep_count || 0} Keep
                    </span>
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      {actions.swap_count || 0} Swap
                    </span>
                    <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                      -{actions.remove_count || 0} Delist
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    Guardrail Audit:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      guardrails.overall_status === "PASSED"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{guardrails.overall_status || "PASSED"}</span>
                  </span>
                </div>
              </div>

              {/* Select Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectScenario(scenario);
                }}
                className={`w-full mt-4 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  isSelected
                    ? "bg-[#0F172A] text-[#FDB813] shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>
                  {isSelected ? "Currently Selected" : "Select This Scenario"}
                </span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
