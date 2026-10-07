import React from "react";
import {
  DollarSign,
  Tag,
  CheckCircle2,
  Layers,
  AlertCircle,
} from "lucide-react";

export default function KpiHeaderStrip({ kpiData, loading, error }) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        data-testid="kpi-skeleton"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`skeleton-${i}`}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse"
          >
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div className="h-7 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between text-amber-800"
        role="alert"
      >
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span className="text-sm font-medium">
            Failed to load cluster KPI metrics: {error}
          </span>
        </div>
      </div>
    );
  }

  const salesLinearFtFormatted =
    kpiData?.sales_per_linear_ft_formatted ||
    (kpiData?.sales_per_linear_ft != null
      ? `$${Number(kpiData.sales_per_linear_ft).toFixed(2)} / ft`
      : "N/A");

  const pbFormatted =
    kpiData?.private_brand_percentage_formatted ||
    (kpiData?.private_brand_percentage != null
      ? `${Number(kpiData.private_brand_percentage).toFixed(1)}%`
      : "N/A");

  const instockFormatted =
    kpiData?.instock_rate_formatted ||
    (kpiData?.instock_rate != null
      ? `${Number(kpiData.instock_rate).toFixed(1)}%`
      : "N/A");

  const shelfCapacityFormatted =
    kpiData?.shelf_capacity_formatted ||
    (kpiData?.shelf_capacity_percentage != null
      ? `${kpiData.shelf_capacity_used_ft != null ? `${kpiData.shelf_capacity_used_ft} ft / ${kpiData.shelf_capacity_total_ft} ft ` : ""}(${Number(kpiData.shelf_capacity_percentage).toFixed(0)}% Capacity)`
      : "N/A");

  const cards = [
    {
      id: "sales-per-linear-ft",
      title: "Sales per Linear Ft",
      value: salesLinearFtFormatted,
      subtext: "Cluster average dollar velocity",
      icon: DollarSign,
      accent: "border-l-4 border-yellow-400",
      badge: "Target: >$175/ft",
    },
    {
      id: "private-brand-pct",
      title: "Private Brand %",
      value: pbFormatted,
      subtext: "Clover Valley / DG brands share",
      icon: Tag,
      accent: "border-l-4 border-blue-600",
      badge: "Goal: ≥ 25%",
    },
    {
      id: "instock-rate",
      title: "In-Stock Rate",
      value: instockFormatted,
      subtext: "On-shelf availability across stores",
      icon: CheckCircle2,
      accent: "border-l-4 border-emerald-500",
      badge: "Min: ≥ 95%",
    },
    {
      id: "shelf-capacity",
      title: "Shelf Capacity",
      value: shelfCapacityFormatted,
      subtext: "Linear footage utilization",
      icon: Layers,
      accent: "border-l-4 border-indigo-500",
      badge: "Ceiling: ≤ 100%",
    },
  ];

  return (
    <section className="mb-6" aria-label="KPI Metrics Header">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              data-testid={`kpi-card-${card.id}`}
              className={`bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow ${card.accent}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className="p-2 bg-slate-50 rounded-lg text-slate-700">
                  <IconComponent className="w-4 h-4 text-slate-700" />
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {card.value}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>{card.subtext}</span>
                <span className="font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                  {card.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
