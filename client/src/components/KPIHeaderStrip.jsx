import React from "react";
import PropTypes from "prop-types";
import {
  DollarSign,
  Tag,
  CheckCircle2,
  LayoutGrid,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function KPIHeaderStrip({
  metrics,
  loading,
  activeScenarioName,
}) {
  if (loading) {
    return (
      <section
        aria-label="KPI Header Strip"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 animate-pulse flex flex-col justify-between h-28"
          >
            <div className="h-4 bg-[#1E293B] rounded w-1/2"></div>
            <div className="h-8 bg-[#1E293B] rounded w-3/4 mt-3"></div>
          </div>
        ))}
      </section>
    );
  }

  const kpis = [
    {
      id: "sales",
      title: "Sales per Linear Foot",
      value: metrics
        ? `$${Number(metrics.sales_per_linear_ft).toFixed(2)} / ft`
        : "$450.00 / ft",
      benchmark: "$420 Target Benchmark",
      icon: DollarSign,
      accentColor: "text-[#FFD200]",
      bgColor: "bg-[#FFD200]/10",
      borderColor: "border-[#FFD200]/30",
    },
    {
      id: "private_brand",
      title: "Private Brand Share",
      value: metrics
        ? `${Number(metrics.private_brand_pct).toFixed(1)}%`
        : "28.5%",
      benchmark: "Min. 25.0% Goal",
      icon: Tag,
      accentColor: "text-[#10B981]",
      bgColor: "bg-[#10B981]/10",
      borderColor: "border-[#10B981]/30",
    },
    {
      id: "in_stock",
      title: "In-Stock Rate",
      value: metrics
        ? `${Number(metrics.in_stock_rate_pct).toFixed(1)}%`
        : "96.2%",
      benchmark: "Target: >95.0%",
      icon: CheckCircle2,
      accentColor: "text-[#38BDF8]",
      bgColor: "bg-[#38BDF8]/10",
      borderColor: "border-[#38BDF8]/30",
    },
    {
      id: "shelf_capacity",
      title: "Shelf Capacity Utilization",
      value: metrics
        ? `${Number(metrics.shelf_capacity_pct).toFixed(1)}%`
        : "92.0%",
      benchmark: "Optimal: 90 - 95%",
      icon: LayoutGrid,
      accentColor: "text-[#F59E0B]",
      bgColor: "bg-[#F59E0B]/10",
      borderColor: "border-[#F59E0B]/30",
    },
  ];

  const isProjected = metrics?.is_projected;

  return (
    <section aria-label="KPI Header Strip" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] font-mono">
            Key Performance Indicators
          </h2>
          {isProjected && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FFD200]/15 text-[#FFD200] border border-[#FFD200]/30">
              <Sparkles className="w-3 h-3" />
              Projected ({activeScenarioName || "Active Scenario"})
            </span>
          )}
          {!isProjected && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
              Current Baseline
            </span>
          )}
        </div>
        <span className="text-xs text-[#94A3B8] hidden sm:inline">
          Cluster:{" "}
          <strong className="text-white font-medium">
            Small Town Value (Snacks)
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={kpi.id}
              className={`bg-[#0F172A] border ${kpi.borderColor} rounded-xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-[#FFD200]/50`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold font-heading text-white mt-2 tracking-tight">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-lg ${kpi.bgColor} ${kpi.accentColor}`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#94A3B8]">
                <span>{kpi.benchmark}</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-3 h-3" /> Active
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

KPIHeaderStrip.propTypes = {
  metrics: PropTypes.shape({
    sales_per_linear_ft: PropTypes.number,
    private_brand_pct: PropTypes.number,
    in_stock_rate_pct: PropTypes.number,
    shelf_capacity_pct: PropTypes.number,
    is_projected: PropTypes.bool,
  }),
  loading: PropTypes.bool,
  activeScenarioName: PropTypes.string,
};
