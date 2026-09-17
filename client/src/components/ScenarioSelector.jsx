import React from "react";
import { ShieldCheck, Scale, Zap, Check } from "lucide-react";

const SCENARIO_THEMES = {
  conservative: {
    icon: ShieldCheck,
    tag: "Low Risk",
    accentColor: "text-sky-400",
    borderActive: "border-sky-400 ring-1 ring-sky-400",
  },
  balanced: {
    icon: Scale,
    tag: "Recommended (Default)",
    accentColor: "text-[#FFDD00]",
    borderActive: "border-[#FFDD00] ring-1 ring-[#FFDD00]",
  },
  aggressive: {
    icon: Zap,
    tag: "High Growth",
    accentColor: "text-amber-400",
    borderActive: "border-amber-400 ring-1 ring-amber-400",
  },
};

export default function ScenarioSelector({
  scenarios = [],
  selectedScenario = "balanced",
  onSelectScenario,
  loading = false,
  error = null,
}) {
  if (loading) {
    return (
      <section aria-label="Scenario Selector" className="mb-6">
        <h2 className="text-lg font-bold text-[#F8FAFC] mb-3">
          Assortment Optimization Scenario Models
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={`scenario-skeleton-${i}`}
              className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 animate-pulse"
            >
              <div className="h-5 bg-slate-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-slate-800 rounded w-full mb-4"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-slate-750 rounded"></div>
                <div className="h-10 bg-slate-750 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1E293B] border border-[#F43F5E] rounded-xl p-4 mb-6 text-[#F8FAFC]">
        <p className="text-sm font-semibold text-[#F43F5E]">
          Failed to load scenario models
        </p>
        <p className="text-xs text-[#94A3B8]">{error}</p>
      </div>
    );
  }

  return (
    <section aria-label="Scenario Selector" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">
            Assortment Optimization Scenario Models
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Compare side-by-side projected financial and operational impacts.
            Select a strategy to preview inline.
          </p>
        </div>
        <div className="hidden sm:block text-xs text-[#94A3B8]">
          Active Strategy:{" "}
          <span className="text-[#FFDD00] font-semibold uppercase">
            {selectedScenario}
          </span>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        role="radiogroup"
        aria-label="Select Assortment Scenario"
      >
        {scenarios.map((scenario) => {
          const isSelected = selectedScenario === scenario.code;
          const theme = SCENARIO_THEMES[scenario.code] || {
            icon: Scale,
            tag: "Alternative",
            accentColor: "text-[#FFDD00]",
            borderActive: "border-[#FFDD00] ring-1 ring-[#FFDD00]",
          };
          const IconComp = theme.icon;

          return (
            <div
              key={scenario.id || scenario.code}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectScenario(scenario.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectScenario(scenario.code);
                }
              }}
              className={`bg-[#0F172A] border rounded-xl p-5 cursor-pointer transition-all relative overflow-hidden shadow-lg ${
                isSelected
                  ? `bg-[#0F172A] ${theme.borderActive} shadow-yellow-500/5`
                  : "border-[#334155] hover:border-[#94A3B8]/60 hover:bg-[#1E293B]/40"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-[#FFDD00] text-[#090D16] text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1 shadow">
                  <Check className="w-3 h-3" />
                  <span>SELECTED</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-2 rounded-lg bg-[#1E293B] ${theme.accentColor}`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#F8FAFC]">
                    {scenario.name}
                  </h3>
                  <span className="text-[11px] font-medium text-[#94A3B8]">
                    {theme.tag}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] mb-4 min-h-[32px] line-clamp-2">
                {scenario.description}
              </p>

              {/* 4 Projected Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 bg-[#1E293B] p-3 rounded-lg border border-[#334155]">
                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    Sales Delta
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      scenario.projected_sales_delta_pct >= 0
                        ? "text-[#10B981]"
                        : "text-[#F43F5E]"
                    }`}
                  >
                    {scenario.projected_sales_delta_pct > 0 ? "+" : ""}
                    {Number(scenario.projected_sales_delta_pct).toFixed(1)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    PB Share Delta
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      scenario.projected_pb_share_pct >= 0
                        ? "text-[#10B981]"
                        : "text-[#F43F5E]"
                    }`}
                  >
                    {scenario.projected_pb_share_pct > 0 ? "+" : ""}
                    {Number(scenario.projected_pb_share_pct).toFixed(1)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    In-Stock Delta
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      scenario.projected_in_stock_pct >= 0
                        ? "text-[#10B981]"
                        : "text-[#F43F5E]"
                    }`}
                  >
                    {scenario.projected_in_stock_pct > 0 ? "+" : ""}
                    {Number(scenario.projected_in_stock_pct).toFixed(1)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#94A3B8] uppercase block">
                    Capacity Impact
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      scenario.projected_capacity_pct > 5
                        ? "text-[#F59E0B]"
                        : "text-[#F8FAFC]"
                    }`}
                  >
                    {scenario.projected_capacity_pct > 0 ? "+" : ""}
                    {Number(scenario.projected_capacity_pct).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#94A3B8]">
                  {scenario.is_default ? "System Default" : "Custom Model"}
                </span>
                <span
                  className={`text-xs font-semibold ${isSelected ? "text-[#FFDD00]" : "text-[#94A3B8]"}`}
                >
                  {isSelected ? "Active Model" : "Click to Select"} &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
