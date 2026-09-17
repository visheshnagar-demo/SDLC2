import React from "react";
import PropTypes from "prop-types";
import { ShieldCheck, Scale, Zap, Check } from "lucide-react";

const SCENARIO_ICONS = {
  conservative: ShieldCheck,
  balanced: Scale,
  aggressive: Zap,
};

export default function ScenarioSelector({
  scenarios,
  activeScenarioKey,
  onSelectScenario,
  loading,
}) {
  if (loading) {
    return (
      <section aria-label="Scenario Selector" className="mb-6">
        <div className="h-4 bg-[#1E293B] rounded w-48 mb-3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 h-48 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  const scenarioList = scenarios?.scenarios || [];

  return (
    <section aria-label="Scenario Selector" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
            <span>Assortment Scenario Options</span>
            <span className="text-xs font-normal text-[#94A3B8] font-mono">
              (Select to model impacts)
            </span>
          </h2>
        </div>
        <span className="text-xs text-[#94A3B8]">
          Active:{" "}
          <strong className="text-[#FFD200] capitalize font-semibold">
            {activeScenarioKey}
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioList.map((scenario) => {
          const isSelected =
            scenario.scenario_key.toLowerCase() ===
            activeScenarioKey?.toLowerCase();
          const IconComp =
            SCENARIO_ICONS[scenario.scenario_key.toLowerCase()] || Scale;

          return (
            <div
              key={scenario.scenario_key}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => onSelectScenario(scenario.scenario_key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectScenario(scenario.scenario_key);
                }
              }}
              className={`relative bg-[#0F172A] border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 text-left shadow-lg ${
                isSelected
                  ? "border-[#FFD200] bg-[#0F172A] ring-1 ring-[#FFD200]/40 shadow-[#FFD200]/10"
                  : "border-[#334155] hover:border-[#64748B] hover:bg-[#1E293B]/40"
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#FFD200] text-[#0B132B] px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Selected
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected
                      ? "bg-[#FFD200]/20 text-[#FFD200]"
                      : "bg-[#1E293B] text-[#94A3B8]"
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    {scenario.display_name}
                  </h3>
                  <span className="text-[11px] text-[#94A3B8] block capitalize">
                    {scenario.scenario_key === "balanced"
                      ? "Balanced (Recommended)"
                      : `${scenario.scenario_key} Strategy`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#94A3B8] mt-2 mb-4 line-clamp-2 leading-relaxed">
                {scenario.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1E293B] text-xs">
                <div className="bg-[#1E293B]/60 rounded-lg p-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    Proj. Sales/Ft
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    ${Number(scenario.projected_sales_per_linear_ft).toFixed(2)}
                  </span>
                </div>
                <div className="bg-[#1E293B]/60 rounded-lg p-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    Proj. PB %
                  </span>
                  <span className="text-sm font-bold font-mono text-[#10B981]">
                    {Number(scenario.projected_private_brand_pct).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-[#1E293B]/60 rounded-lg p-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    In-Stock Rate
                  </span>
                  <span className="text-sm font-bold font-mono text-[#38BDF8]">
                    {Number(scenario.projected_in_stock_rate_pct).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-[#1E293B]/60 rounded-lg p-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    Shelf Capacity
                  </span>
                  <span className="text-sm font-bold font-mono text-[#F59E0B]">
                    {Number(scenario.projected_shelf_capacity_pct).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Action Count Badges */}
              {scenario.action_counts && (
                <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#10B981] font-semibold">
                    {scenario.action_counts.GROW} Grow
                  </span>
                  <span className="text-[#38BDF8] font-semibold">
                    {scenario.action_counts.MAINTAIN} Keep
                  </span>
                  <span className="text-[#F59E0B] font-semibold">
                    {scenario.action_counts.SWAP} Swap
                  </span>
                  <span className="text-[#F43F5E] font-semibold">
                    {scenario.action_counts.REDUCE} Cut
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

ScenarioSelector.propTypes = {
  scenarios: PropTypes.shape({
    active_default: PropTypes.string,
    scenarios: PropTypes.arrayOf(
      PropTypes.shape({
        scenario_key: PropTypes.string.isRequired,
        display_name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        projected_sales_per_linear_ft: PropTypes.number.isRequired,
        projected_private_brand_pct: PropTypes.number.isRequired,
        projected_in_stock_rate_pct: PropTypes.number.isRequired,
        projected_shelf_capacity_pct: PropTypes.number.isRequired,
        action_counts: PropTypes.shape({
          GROW: PropTypes.number,
          MAINTAIN: PropTypes.number,
          SWAP: PropTypes.number,
          REDUCE: PropTypes.number,
        }),
      }),
    ),
  }),
  activeScenarioKey: PropTypes.string,
  onSelectScenario: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
