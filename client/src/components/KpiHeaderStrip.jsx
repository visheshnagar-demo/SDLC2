import React from "react";
import {
  DollarSign,
  Tag,
  CheckCircle2,
  Layers,
  AlertCircle,
} from "lucide-react";

export default function KpiHeaderStrip({ kpis, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={`kpi-skeleton-${i}`}
            className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 animate-pulse"
          >
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-750 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1E293B] border border-[#F43F5E] rounded-xl p-4 mb-6 flex items-center gap-3 text-[#F8FAFC]">
        <AlertCircle className="w-5 h-5 text-[#F43F5E] flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">
            Failed to load cluster KPI metrics
          </p>
          <p className="text-xs text-[#94A3B8]">{error}</p>
        </div>
      </div>
    );
  }

  if (!kpis) {
    return null;
  }

  const {
    sales_per_linear_foot = 0,
    private_brand_percentage = 0,
    in_stock_rate = 0,
    shelf_capacity = 0,
    cluster_name = "Small Town Value Cluster",
    used_linear_feet = 0,
    total_linear_feet = 120,
    total_skus_count = 0,
  } = kpis;

  const cards = [
    {
      id: "kpi-sales",
      label: "Sales per Linear Foot",
      value: `$${Number(sales_per_linear_foot).toFixed(2)}`,
      subtext: `Target: > $150.00 / ft`,
      icon: DollarSign,
      iconBg: "bg-yellow-500/10 text-[#FFDD00]",
      badge: "+4.2% YoY",
      badgeColor: "text-[#10B981] bg-[#10B981]/10",
    },
    {
      id: "kpi-pb",
      label: "Private Brand Share",
      value: `${Number(private_brand_percentage).toFixed(1)}%`,
      subtext: `Goal: >= 30.0% PB mix`,
      icon: Tag,
      iconBg: "bg-emerald-500/10 text-[#10B981]",
      badge: private_brand_percentage >= 30 ? "Compliant" : "Below Goal",
      badgeColor:
        private_brand_percentage >= 30
          ? "text-[#10B981] bg-[#10B981]/10"
          : "text-[#F59E0B] bg-[#F59E0B]/10",
    },
    {
      id: "kpi-instock",
      label: "In-Stock Rate",
      value: `${Number(in_stock_rate).toFixed(1)}%`,
      subtext: `Target: >= 95.0%`,
      icon: CheckCircle2,
      iconBg: "bg-blue-500/10 text-blue-400",
      badge: in_stock_rate >= 95 ? "Optimal" : "Attention",
      badgeColor:
        in_stock_rate >= 95
          ? "text-[#10B981] bg-[#10B981]/10"
          : "text-[#F43F5E] bg-[#F43F5E]/10",
    },
    {
      id: "kpi-capacity",
      label: "Shelf Capacity Utilization",
      value: `${Number(shelf_capacity).toFixed(1)}%`,
      subtext: `${used_linear_feet} / ${total_linear_feet} Linear Ft (${total_skus_count} SKUs)`,
      icon: Layers,
      iconBg: "bg-purple-500/10 text-purple-400",
      progress: shelf_capacity,
    },
  ];

  return (
    <section aria-label="KPI Header Strip" className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
            Cluster Baseline Performance &bull;{" "}
            <span className="text-[#F8FAFC]">{cluster_name}</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 hover:border-[#FFDD00]/50 transition shadow-lg relative overflow-hidden group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-[#94A3B8]">
                  {card.label}
                </span>
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
                  {card.value}
                </span>
                {card.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>

              {card.progress !== undefined ? (
                <div className="mt-2">
                  <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        card.progress > 100
                          ? "bg-[#F43F5E]"
                          : card.progress >= 90
                            ? "bg-[#F59E0B]"
                            : "bg-[#10B981]"
                      }`}
                      style={{ width: `${Math.min(card.progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">{card.subtext}</p>
                </div>
              ) : (
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  {card.subtext}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
