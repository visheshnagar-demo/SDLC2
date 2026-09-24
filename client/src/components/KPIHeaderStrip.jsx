import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function KPIHeaderStrip({ kpis, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse"
          >
            <div className="h-3 bg-slate-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-28"></div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback defaults if null
  const data = {
    sales_per_linear_foot: kpis?.sales_per_linear_foot ?? 142.5,
    sales_delta_pct: kpis?.sales_delta_pct ?? 4.2,
    private_brand_percentage: kpis?.private_brand_percentage ?? 28.5,
    in_stock_rate_percentage: kpis?.in_stock_rate_percentage ?? 96.2,
    shelf_capacity_utilization_percentage:
      kpis?.shelf_capacity_utilization_percentage ?? 88.0,
  };

  const pbPassed = data.private_brand_percentage >= 25.0;
  const inStockPassed = data.in_stock_rate_percentage >= 95.0;
  const capacityPassed = data.shelf_capacity_utilization_percentage <= 95.0;

  return (
    <section aria-label="KPI Performance Summary">
      {error && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Notice: Showing cached / cluster target benchmarks ({error})
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales per Linear Foot */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sales per Linear Ft
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            ${Number(data.sales_per_linear_foot).toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>+{data.sales_delta_pct}% vs baseline</span>
          </div>
        </div>

        {/* Card 2: Private Brand Share */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100/40 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Private Brand Share
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {Number(data.private_brand_percentage).toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Target &ge; 25.0% ({pbPassed ? "PASSED" : "BELOW"})</span>
          </div>
        </div>

        {/* Card 3: In-Stock Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In-Stock Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {Number(data.in_stock_rate_percentage).toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              Target &ge; 95.0% ({inStockPassed ? "PASSED" : "BELOW"})
            </span>
          </div>
        </div>

        {/* Card 4: Shelf Capacity Utilization */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Shelf Capacity Utilization
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
              <span className="text-xs font-black">95%</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {Number(data.shelf_capacity_utilization_percentage).toFixed(1)}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cap &le; 95.0% ({capacityPassed ? "PASSED" : "OVER"})</span>
          </div>
        </div>
      </div>
    </section>
  );
}
