import React from "react";
import { TrendingUp, ShieldCheck, Zap, Sparkles, Check } from "lucide-react";

export const ScenarioSelectorCards = ({
  scenarios = [],
  selectedScenario = "BALANCED",
  onSelectScenario,
  loading = false,
}) => {
  // Fallback scenario data if loading or empty
  const defaultScenarios = [
    {
      scenario_type: "CONSERVATIVE",
      scenario_name: "Conservative Strategy",
      description:
        "Preserves national brand staples, minor SKU rationalization, low execution risk.",
      is_default: false,
      sales_delta_percentage: 2.1,
      margin_delta_percentage: 1.4,
      private_brand_mix_delta: 1.2,
      shelf_capacity_projected_percentage: 84.5,
    },
    {
      scenario_type: "BALANCED",
      scenario_name: "Balanced Strategy",
      description:
        "Optimizes high-margin private brand Snacks while protecting key customer drivers.",
      is_default: true,
      sales_delta_percentage: 5.4,
      margin_delta_percentage: 3.8,
      private_brand_mix_delta: 3.5,
      shelf_capacity_projected_percentage: 87.2,
    },
    {
      scenario_type: "AGGRESSIVE",
      scenario_name: "Aggressive Strategy",
      description:
        "Maximizes Clover Valley & DG Crave shelf share, swaps bottom 25% national SKUs.",
      is_default: false,
      sales_delta_percentage: 8.5,
      margin_delta_percentage: 6.2,
      private_brand_mix_delta: 5.8,
      shelf_capacity_projected_percentage: 91.0,
    },
  ];

  const list = scenarios.length > 0 ? scenarios : defaultScenarios;

  const getScenarioIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "CONSERVATIVE":
        return ShieldCheck;
      case "BALANCED":
        return TrendingUp;
      case "AGGRESSIVE":
        return Zap;
      default:
        return Sparkles;
    }
  };

  return (
    <section aria-label="Assortment Scenario Selector" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Assortment Strategy Scenarios (Select to Simulate Impact)
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Pre-selected:{" "}
          <strong className="text-amber-400 font-mono">Balanced</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list.map((scenario) => {
          const isSelected =
            selectedScenario?.toUpperCase() ===
            scenario.scenario_type?.toUpperCase();
          const Icon = getScenarioIcon(scenario.scenario_type);

          return (
            <button
              key={scenario.scenario_type}
              type="button"
              onClick={() => onSelectScenario(scenario.scenario_type)}
              aria-pressed={isSelected}
              data-testid={`scenario-card-${scenario.scenario_type.toLowerCase()}`}
              className={`text-left p-5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-amber-400 shadow-lg shadow-amber-400/10 ring-2 ring-amber-400/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Top Row: Title & Badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-amber-400 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {scenario.scenario_name}
                      </h4>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {scenario.scenario_type}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-mono font-semibold">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                  {!isSelected && scenario.is_default && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {scenario.description}
                </p>
              </div>

              {/* Metrics Breakdown */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/60 rounded p-2 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">
                    Sales Delta
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +{scenario.sales_delta_percentage?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded p-2 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">
                    Margin Delta
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +{scenario.margin_delta_percentage?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded p-2 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">
                    PB Mix Delta
                  </span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    +{scenario.private_brand_mix_delta?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
                <div className="bg-slate-950/60 rounded p-2 border border-slate-800/40">
                  <span className="text-[10px] text-slate-400 block">
                    Shelf Space
                  </span>
                  <span className="font-mono font-bold text-purple-300 text-sm">
                    {scenario.shelf_capacity_projected_percentage?.toFixed(1) ??
                      "0.0"}
                    % util
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/20 via-transparent to-transparent pointer-events-none"></div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ScenarioSelectorCards;
