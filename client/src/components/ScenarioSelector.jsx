import React from "react";
import { Sliders, Sparkles, Check } from "lucide-react";

const SCENARIO_CONFIGS = [
  {
    type: "Conservative",
    title: "Conservative",
    subtitle: "Low Disruption",
    defaultMetrics: {
      projected_sales_increase_pct: 3.5,
      private_brand_change_pct: 0.8,
      shelf_utilization_pct: 92.0,
    },
    description:
      "Prioritizes sales stability and core SKU retention with minimal brand replacement risk.",
  },
  {
    type: "Balanced",
    title: "Balanced",
    subtitle: "Optimal GMROI & Target Alignment",
    defaultMetrics: {
      projected_sales_increase_pct: 7.8,
      private_brand_change_pct: 1.5,
      shelf_utilization_pct: 95.0,
    },
    description:
      "Calibrated mix of private brand expansion and core volume drivers to maximize margin and in-stock SLA.",
  },
  {
    type: "Aggressive",
    title: "Aggressive",
    subtitle: "Maximum Margin Expansion",
    defaultMetrics: {
      projected_sales_increase_pct: 14.2,
      private_brand_change_pct: 3.2,
      shelf_utilization_pct: 98.5,
    },
    description:
      "Pushes private brand share aggressively to achieve top-tier profitability and shelf density.",
  },
];

export const ScenarioSelector = ({
  selectedScenario = "Balanced",
  onSelectScenario,
  scenarioData = {},
}) => {
  return (
    <div
      className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6"
      data-testid="scenario-selector-section"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Sliders className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-bold text-slate-900">
          Select Assortment Scenario
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SCENARIO_CONFIGS.map((scenario) => {
          const isSelected = selectedScenario === scenario.type;
          const liveData = scenarioData[scenario.type] || {};
          const projectedSales =
            liveData.projected_sales_increase_pct ??
            scenario.defaultMetrics.projected_sales_increase_pct;
          const privateBrandChange =
            liveData.private_brand_change_pct ??
            scenario.defaultMetrics.private_brand_change_pct;
          const shelfUtilization =
            liveData.shelf_utilization_pct ??
            scenario.defaultMetrics.shelf_utilization_pct;

          return (
            <div
              key={scenario.type}
              onClick={() =>
                onSelectScenario && onSelectScenario(scenario.type)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectScenario && onSelectScenario(scenario.type);
                }
              }}
              className={`p-5 rounded-lg cursor-pointer transition-all relative flex flex-col justify-between ${
                isSelected
                  ? "border-2 border-yellow-400 bg-amber-50/40 shadow-sm ring-1 ring-yellow-400/50"
                  : "border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-1 shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>
                    {scenario.type === "Balanced" ? "Pre-Selected" : "Selected"}
                  </span>
                </span>
              )}

              <div>
                <h3
                  className={`font-bold text-base ${isSelected ? "text-slate-900" : "text-slate-800"}`}
                >
                  {scenario.title}
                </h3>
                <div className="text-xs text-slate-500 mb-3">
                  {scenario.subtitle}
                </div>

                <div className="space-y-1.5 text-sm mb-4 bg-white/70 p-3 rounded-md border border-slate-100">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Projected Sales:</span>
                    <span className="font-bold text-slate-900">
                      +{projectedSales}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Private Brand %:</span>
                    <span className="font-bold text-slate-900">
                      +{privateBrandChange}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Shelf Utilization:</span>
                    <span className="font-bold text-slate-900">
                      {shelfUtilization}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {scenario.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioSelector;
