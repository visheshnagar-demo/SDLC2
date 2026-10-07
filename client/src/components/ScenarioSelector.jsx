import React from "react";
import {
  ShieldCheck,
  Scale,
  TrendingUp,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function ScenarioSelector({
  selectedScenario = "balanced",
  onSelectScenario,
  loading = false,
}) {
  const scenarios = [
    {
      key: "conservative",
      name: "Conservative",
      badge: "Low Risk",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-300",
      description:
        "Protects existing volume with minimal swaps. Prioritizes supply stability.",
      icon: ShieldCheck,
      salesLift: "+1.5%",
      pbShare: "26.0%",
      instock: "97.8%",
      shelfSpace: "98% (Available Room)",
      recommended: false,
    },
    {
      key: "balanced",
      name: "Balanced",
      badge: "Recommended",
      badgeColor:
        "bg-yellow-400 text-black font-bold border-yellow-500 shadow-sm",
      description:
        "Optimal balance of sales velocity, private brand expansion, and linear shelf space.",
      icon: Scale,
      salesLift: "+3.2%",
      pbShare: "30.0%",
      instock: "96.5%",
      shelfSpace: "100% (Fully Utilized)",
      recommended: true,
    },
    {
      key: "aggressive",
      name: "Aggressive",
      badge: "High Growth",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      description:
        "Maximizes Clover Valley private brand penetration and high-margin snack swaps.",
      icon: TrendingUp,
      salesLift: "+6.8%",
      pbShare: "35.0%",
      instock: "95.1%",
      shelfSpace: "100% (Capacity Capped)",
      recommended: false,
    },
  ];

  return (
    <section className="mb-6" aria-label="Scenario Selector">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Assortment Scenario Modeling</span>
            <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded border border-yellow-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-700" /> 3 Strategy
              Presets
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a strategy preset to preview projected impact and validate
            operational guardrails inline.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const isSelected =
            selectedScenario.toLowerCase() === scenario.key.toLowerCase();
          const IconComp = scenario.icon;

          return (
            <div
              key={scenario.key}
              role="button"
              tabIndex={0}
              data-testid={`scenario-card-${scenario.key}`}
              onClick={() => !loading && onSelectScenario(scenario.key)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !loading) {
                  e.preventDefault();
                  onSelectScenario(scenario.key);
                }
              }}
              className={`relative rounded-xl p-5 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 text-white border-yellow-400 shadow-md ring-2 ring-yellow-400/50 scale-[1.01]"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-sm"
              }`}
            >
              {/* Top Banner / Selection Badge */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-slate-800 text-yellow-400"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-1.5">
                        {scenario.name}
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-yellow-400 inline-block" />
                        )}
                      </h3>
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${scenario.badgeColor}`}
                      >
                        {scenario.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-xs mb-4 min-h-[32px] ${
                    isSelected ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {scenario.description}
                </p>
              </div>

              {/* Impact Metrics Grid */}
              <div
                className={`pt-3 border-t grid grid-cols-2 gap-2 text-xs ${
                  isSelected
                    ? "border-slate-800 text-slate-200"
                    : "border-slate-100 text-slate-700"
                }`}
              >
                <div>
                  <span className="text-[11px] block text-slate-400 font-medium">
                    Projected Lift
                  </span>
                  <span
                    className={`font-bold text-sm ${
                      isSelected ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    {scenario.salesLift}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] block text-slate-400 font-medium">
                    PB Market Share
                  </span>
                  <span
                    className={`font-bold text-sm ${
                      isSelected ? "text-yellow-400" : "text-blue-600"
                    }`}
                  >
                    {scenario.pbShare}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] block text-slate-400 font-medium">
                    In-Stock Target
                  </span>
                  <span className="font-semibold">{scenario.instock}</span>
                </div>
                <div>
                  <span className="text-[11px] block text-slate-400 font-medium">
                    Shelf Capacity
                  </span>
                  <span className="font-semibold">{scenario.shelfSpace}</span>
                </div>
              </div>

              {/* Active Selection Indicator */}
              <div className="mt-4 pt-2 text-center">
                <span
                  className={`inline-block w-full text-center py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    isSelected
                      ? "bg-yellow-400 text-black shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {isSelected ? "Active Scenario" : "Select Scenario"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
