import React from "react";
import {
  DollarSign,
  Percent,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

export const KpiHeaderStrip = ({ kpis, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-28"
          >
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 mb-6 flex items-center gap-3 text-rose-300">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">
          Failed to load cluster KPI metrics: {error}
        </p>
      </div>
    );
  }

  const salesPerLinearFt =
    kpis?.sales_per_linear_ft_formatted ||
    (kpis?.sales_per_linear_ft !== undefined
      ? `$${Number(kpis.sales_per_linear_ft).toFixed(2)}/ft`
      : "$125.00/ft");
  const privateBrandPct =
    kpis?.private_brand_percentage !== undefined
      ? `${Number(kpis.private_brand_percentage).toFixed(1)}%`
      : "32.0%";
  const inStockRatePct =
    kpis?.in_stock_rate_percentage !== undefined
      ? `${Number(kpis.in_stock_rate_percentage).toFixed(1)}%`
      : "96.5%";
  const shelfCapacityPct =
    kpis?.shelf_capacity_percentage !== undefined
      ? `${Number(kpis.shelf_capacity_percentage).toFixed(1)}% utilized`
      : "88.0% utilized";

  const cards = [
    {
      id: "sales-linear-ft",
      title: "Sales per Linear Foot",
      value: salesPerLinearFt,
      subtext: "Benchmark: $118/ft (+5.9%)",
      icon: DollarSign,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/30",
    },
    {
      id: "private-brand-pct",
      title: "Private Brand %",
      value: privateBrandPct,
      subtext: "Target Goal: >= 30.0%",
      icon: Percent,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      borderColor: "border-emerald-400/30",
    },
    {
      id: "in-stock-rate",
      title: "In-Stock Rate",
      value: inStockRatePct,
      subtext: "Target Threshold: >= 95.0%",
      icon: CheckCircle2,
      color: "text-sky-400",
      bgColor: "bg-sky-400/10",
      borderColor: "border-sky-400/30",
    },
    {
      id: "shelf-capacity",
      title: "Shelf Capacity",
      value: shelfCapacityPct,
      subtext: "Capacity Ceiling: 95.0%",
      icon: PackageCheck,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
    },
  ];

  return (
    <section aria-label="Cluster KPI Header Strip" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Real-Time Cluster Metrics &bull;{" "}
            {kpis?.cluster_name || "Small Town Value Cluster"} (
            {kpis?.cluster_id || "STV-CLUSTER-01"})
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Category:{" "}
          <span className="text-amber-400 font-semibold">
            {kpis?.category || "Snacks"}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              data-testid={`kpi-card-${card.id}`}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-5 shadow-lg relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-sans">
                    {card.subtext}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${card.bgColor} ${card.color} border ${card.borderColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default KpiHeaderStrip;
