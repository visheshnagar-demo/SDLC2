import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, Tag, Sparkles } from "lucide-react";

const STATUS_CONFIG = {
  GROW: {
    label: "GROW",
    className:
      "bg-emerald-500/15 text-[#10B981] border-emerald-500/30 hover:bg-emerald-500/25",
    desc: "Expand shelf space & inventory depth",
  },
  MAINTAIN: {
    label: "MAINTAIN",
    className:
      "bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25",
    desc: "Core steady velocity performer",
  },
  SWAP: {
    label: "SWAP",
    className:
      "bg-amber-500/15 text-[#F59E0B] border-amber-500/30 hover:bg-amber-500/25",
    desc: "Replace with margin-accretive alternative",
  },
  REDUCE: {
    label: "REDUCE",
    className:
      "bg-rose-500/15 text-[#F43F5E] border-rose-500/30 hover:bg-rose-500/25",
    desc: "De-list or truncate facings",
  },
};

export default function SkuPerformanceTable({
  skus = [],
  loading = false,
  error = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("ALL");
  const [selectedBadge, setSelectedBadge] = useState("ALL");
  const [selectedBrandTier, setSelectedBrandTier] = useState("ALL");
  const [sortField, setSortField] = useState("sales_per_lin_ft");
  const [sortDirection, setSortDirection] = useState("desc");

  const subcategories = useMemo(() => {
    const set = new Set();
    skus.forEach((sku) => {
      if (sku.subcategory) set.add(sku.subcategory);
    });
    return Array.from(set).sort();
  }, [skus]);

  const filteredSkus = useMemo(() => {
    return skus.filter((sku) => {
      const matchSearch =
        !searchTerm ||
        sku.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.sku_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.subcategory?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSubcategory =
        selectedSubcategory === "ALL" ||
        sku.subcategory === selectedSubcategory;

      const matchBadge =
        selectedBadge === "ALL" || sku.status_badge === selectedBadge;

      const matchBrandTier =
        selectedBrandTier === "ALL" || sku.brand_tier === selectedBrandTier;

      return matchSearch && matchSubcategory && matchBadge && matchBrandTier;
    });
  }, [skus, searchTerm, selectedSubcategory, selectedBadge, selectedBrandTier]);

  const sortedSkus = useMemo(() => {
    return [...filteredSkus].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSkus, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <section
      aria-label="SKU Performance Section"
      className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 mb-6 shadow-xl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-[#334155] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              Snacks Category SKU Assortment &amp; Performance
            </h2>
            <span className="text-xs bg-[#1E293B] text-[#FFDD00] px-2.5 py-0.5 rounded-full font-mono border border-yellow-500/20">
              {sortedSkus.length} of {skus.length} SKUs
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Evaluate individual item velocity, margins, linear footage
            allocation, and algorithmic placement directives.
          </p>
        </div>

        {/* Status Badge Legend / Quick Filter */}
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Status Badge Filter"
        >
          <button
            onClick={() => setSelectedBadge("ALL")}
            className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
              selectedBadge === "ALL"
                ? "bg-[#FFDD00] text-[#090D16] border-[#FFDD00]"
                : "bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]"
            }`}
          >
            All Directive ({skus.length})
          </button>
          {["GROW", "MAINTAIN", "SWAP", "REDUCE"].map((badge) => {
            const count = skus.filter((s) => s.status_badge === badge).length;
            const isSelected = selectedBadge === badge;
            return (
              <button
                key={badge}
                onClick={() => setSelectedBadge(isSelected ? "ALL" : badge)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition font-semibold flex items-center gap-1 ${
                  isSelected
                    ? `${STATUS_CONFIG[badge].className} border-current ring-1 ring-current`
                    : "bg-[#1E293B] text-[#94A3B8] border-[#334155] hover:text-[#F8FAFC]"
                }`}
              >
                <span>{badge}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU name, code, subcategory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#FFDD00]"
          />
        </div>

        <div className="relative">
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FFDD00]"
          >
            <option value="ALL">All Subcategories</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={selectedBrandTier}
            onChange={(e) => setSelectedBrandTier(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#FFDD00]"
          >
            <option value="ALL">All Brand Tiers</option>
            <option value="Private Brand">Private Brand (Clover Valley)</option>
            <option value="National Brand">National Brand</option>
          </select>
        </div>

        <div className="flex items-center justify-end">
          {(searchTerm ||
            selectedSubcategory !== "ALL" ||
            selectedBadge !== "ALL" ||
            selectedBrandTier !== "ALL") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedSubcategory("ALL");
                setSelectedBadge("ALL");
                setSelectedBrandTier("ALL");
              }}
              className="text-xs text-[#FFDD00] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* SKU Data Table */}
      <div className="overflow-x-auto border border-[#334155] rounded-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1E293B] text-[#94A3B8] border-b border-[#334155]">
              <th
                onClick={() => handleSort("sku_code")}
                className="py-3 px-3 cursor-pointer hover:text-[#F8FAFC] font-semibold"
              >
                <div className="flex items-center gap-1">
                  <span>SKU &amp; Product</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("subcategory")}
                className="py-3 px-3 cursor-pointer hover:text-[#F8FAFC] font-semibold"
              >
                <div className="flex items-center gap-1">
                  <span>Subcategory</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("sales_per_lin_ft")}
                className="py-3 px-3 cursor-pointer hover:text-[#F8FAFC] font-semibold text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Sales / Lin Ft</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("margin_pct")}
                className="py-3 px-3 cursor-pointer hover:text-[#F8FAFC] font-semibold text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Margin %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("weekly_unit_velocity")}
                className="py-3 px-3 cursor-pointer hover:text-[#F8FAFC] font-semibold text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Velocity (Wk)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("in_stock_pct")}
                className="py-3 px-3 cursor-pointer hover:text-[#F8FAFC] font-semibold text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>In-Stock %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("shelf_linear_ft")}
                className="py-3 px-3 cursor-pointer hover:text-[#F8FAFC] font-semibold text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Shelf Space</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 font-semibold text-center">
                Directive Badge
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155] text-[#F8FAFC]">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-[#94A3B8]">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#FFDD00] border-t-transparent rounded-full animate-spin"></span>
                    <span>Loading Snacks SKUs...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="py-6 text-center text-[#F43F5E]">
                  Failed to load SKU list: {error}
                </td>
              </tr>
            ) : sortedSkus.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-[#94A3B8]">
                  No SKUs match the selected criteria.
                </td>
              </tr>
            ) : (
              sortedSkus.map((sku) => {
                const badgeCfg = STATUS_CONFIG[sku.status_badge] || {
                  label: sku.status_badge,
                  className: "bg-slate-700 text-slate-300 border-slate-600",
                  desc: "Standard",
                };
                const isPB = sku.brand_tier === "Private Brand";

                return (
                  <tr
                    key={sku.id || sku.sku_code}
                    className="hover:bg-[#1E293B]/70 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                        <span>{sku.name}</span>
                        {isPB && (
                          <span className="text-[10px] font-bold text-[#FFDD00] bg-yellow-500/10 px-1.5 py-0.2 rounded border border-yellow-500/20">
                            PB
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] font-mono">
                        {sku.sku_code}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#94A3B8]">
                      {sku.subcategory}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      ${Number(sku.sales_per_lin_ft).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-medium ${
                          sku.margin_pct >= 35
                            ? "text-[#10B981]"
                            : sku.margin_pct >= 30
                              ? "text-[#F8FAFC]"
                              : "text-[#F59E0B]"
                        }`}
                      >
                        {Number(sku.margin_pct).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#94A3B8]">
                      {Number(sku.weekly_unit_velocity).toFixed(1)} u/wk
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={
                          sku.in_stock_pct >= 95
                            ? "text-[#10B981]"
                            : "text-[#F43F5E] font-semibold"
                        }
                      >
                        {Number(sku.in_stock_pct).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#94A3B8]">
                      {Number(sku.shelf_linear_ft).toFixed(1)} ft
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        title={badgeCfg.desc}
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeCfg.className}`}
                      >
                        {badgeCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
