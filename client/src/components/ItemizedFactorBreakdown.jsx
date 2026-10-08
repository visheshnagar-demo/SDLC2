import React from "react";
import { Layers, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

export default function ItemizedFactorBreakdown({ quote }) {
  if (!quote) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 text-center text-slate-400">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          Factor breakdown will appear here after calculation.
        </p>
      </div>
    );
  }

  // Handle various backend response shapes (quote.factors or quote.breakdown)
  let factors = quote.factors || quote.breakdown || [];

  // If factors array is empty or not formatted, synthesize from quote response fields if present
  if (!Array.isArray(factors) || factors.length === 0) {
    const base = Number(quote.base_premium || 500);
    const total = Number(quote.total_premium || quote.premium || 1200);
    factors = [
      {
        factor_name: "Base Tariff Premium",
        description: "Standard baseline motor liability tariff",
        amount: base,
        factor_type: "base",
      },
    ];
  }

  const basePremium = Number(quote.base_premium || 500);
  const totalPremium = Number(quote.total_premium || quote.premium || 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
            Itemized Factor Price Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed actuarial transparency of individual risk loadings,
            surcharges, and discounts.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {factors.length} Active {factors.length === 1 ? "Factor" : "Factors"}
        </span>
      </div>

      <div className="space-y-3">
        {factors.map((item, index) => {
          const name =
            item.factor_name ||
            item.name ||
            item.factor ||
            `Factor ${index + 1}`;
          const desc = item.description || item.details || item.notes || "";
          const amount = Number(
            item.amount !== undefined ? item.amount : item.impact || 0,
          );
          const type = (
            item.factor_type ||
            item.type ||
            (amount < 0 ? "discount" : amount > 0 ? "loading" : "base")
          ).toLowerCase();

          const isPositive = amount > 0;
          const isNegative = amount < 0;
          const isZero = amount === 0;

          let badgeColor = "bg-slate-100 text-slate-700";
          let amountColor = "text-slate-800";
          let IconComponent = Minus;

          if (type === "base" || name.toLowerCase().includes("base")) {
            badgeColor =
              "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
            amountColor = "text-indigo-950";
          } else if (isNegative || type === "discount") {
            badgeColor =
              "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
            amountColor = "text-emerald-600";
            IconComponent = TrendingDown;
          } else if (isPositive) {
            badgeColor =
              "bg-amber-50 text-amber-700 border border-amber-200/60";
            amountColor = "text-amber-600";
            IconComponent = TrendingUp;
          }

          const formattedAmount = `${amount < 0 ? "-" : amount > 0 && type !== "base" && !name.toLowerCase().includes("base") ? "+" : ""}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

          return (
            <div
              key={`factor-${index}`}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`p-1.5 rounded-lg mt-0.5 ${badgeColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-900">
                      {name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${badgeColor}`}
                    >
                      {type}
                    </span>
                  </div>
                  {desc && (
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {desc}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right pl-3 shrink-0">
                <span className={`font-mono font-bold text-sm ${amountColor}`}>
                  {formattedAmount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Total Summary Line */}
      <div className="mt-5 pt-4 border-t-2 border-slate-200 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-900 uppercase tracking-wider text-xs">
          Net Calculated Premium
        </span>
        <span className="font-mono font-black text-lg text-indigo-700">
          $
          {totalPremium.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          USD
        </span>
      </div>
    </div>
  );
}
