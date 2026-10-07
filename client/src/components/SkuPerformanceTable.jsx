import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, Tag, AlertCircle } from "lucide-react";

export default function SkuPerformanceTable({
  skus = [],
  loading = false,
  error = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBadge, setFilterBadge] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [sortField, setSortField] = useState("sales_per_linear_ft");
  const [sortAsc, setSortAsc] = useState(false);

  const categories = useMemo(() => {
    const set = new Set(skus.map((s) => s.sub_category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [skus]);

  const badgeCounts = useMemo(() => {
    const counts = { GROW: 0, MAINTAIN: 0, SWAP: 0, REDUCE: 0 };
    skus.forEach((sku) => {
      const badge = (sku.status_badge || "").toUpperCase();
      if (counts[badge] !== undefined) {
        counts[badge]++;
      }
    });
    return counts;
  }, [skus]);

  const filteredSkus = useMemo(() => {
    return skus
      .filter((sku) => {
        const matchesSearch =
          !searchTerm ||
          (sku.product_name &&
            sku.product_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (sku.sku_code &&
            sku.sku_code.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesBadge =
          filterBadge === "ALL" ||
          (sku.status_badge || "").toUpperCase() === filterBadge;

        const matchesCat =
          filterCategory === "ALL" || sku.sub_category === filterCategory;

        return matchesSearch && matchesBadge && matchesCat;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [skus, searchTerm, filterBadge, filterCategory, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getBadgeStyle = (badge) => {
    switch ((badge || "").toUpperCase()) {
      case "GROW":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "MAINTAIN":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "SWAP":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "REDUCE":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6"
      data-testid="sku-performance-section"
    >
      {/* Header & Badges Counter Bar */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Snacks SKU Performance Analysis</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {skus.length} SKUs Monitored
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Store cluster assortment status, revenue productivity, and
              category recommendations.
            </p>
          </div>

          {/* Action Badge Quick Summary Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setFilterBadge(filterBadge === "GROW" ? "ALL" : "GROW")
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterBadge === "GROW"
                  ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              GROW: {badgeCounts.GROW}
            </button>
            <button
              type="button"
              onClick={() =>
                setFilterBadge(filterBadge === "MAINTAIN" ? "ALL" : "MAINTAIN")
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterBadge === "MAINTAIN"
                  ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              }`}
            >
              MAINTAIN: {badgeCounts.MAINTAIN}
            </button>
            <button
              type="button"
              onClick={() =>
                setFilterBadge(filterBadge === "SWAP" ? "ALL" : "SWAP")
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterBadge === "SWAP"
                  ? "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              SWAP: {badgeCounts.SWAP}
            </button>
            <button
              type="button"
              onClick={() =>
                setFilterBadge(filterBadge === "REDUCE" ? "ALL" : "REDUCE")
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterBadge === "REDUCE"
                  ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              }`}
            >
              REDUCE: {badgeCounts.REDUUCE || badgeCounts.REDUCE}
            </button>
            {filterBadge !== "ALL" && (
              <button
                type="button"
                onClick={() => setFilterBadge("ALL")}
                className="text-xs text-slate-500 hover:text-slate-800 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter / Search Controls */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU Code or Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              aria-label="Filter by Sub-Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "ALL" ? "All Sub-Categories" : cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by Status Badge"
              value={filterBadge}
              onChange={(e) => setFilterBadge(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ALL">All Status Badges</option>
              <option value="GROW">GROW Only</option>
              <option value="MAINTAIN">MAINTAIN Only</option>
              <option value="SWAP">SWAP Only</option>
              <option value="REDUCE">REDUCE Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 animate-pulse">
          <div className="h-6 bg-slate-100 rounded w-1/3 mx-auto mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-10 bg-slate-50 rounded"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50 flex flex-col items-center justify-center">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filteredSkus.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-50/50">
          <p className="text-sm font-medium">
            No Snacks SKUs match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-semibold sticky top-0 z-10 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort("sku_code")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>SKU Code</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("product_name")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sub_category")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Sub-Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sales_per_linear_ft")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Sales / Linear Ft</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("linear_ft_required")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Shelf Space</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("instock_rate")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>In-Stock %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-center">Brand Type</th>
                <th className="px-4 py-3 text-center">Action Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSkus.map((sku) => {
                const isPB = sku.is_private_brand;
                const badge = (sku.status_badge || "MAINTAIN").toUpperCase();
                return (
                  <tr
                    key={sku.id || sku.sku_code}
                    className="hover:bg-yellow-50/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {sku.sku_code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{sku.product_name}</span>
                        {isPB && (
                          <span
                            title="Dollar General Private Brand (Clover Valley / DG)"
                            className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-yellow-300 flex items-center gap-0.5"
                          >
                            <Tag className="w-2.5 h-2.5" /> PB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {sku.sub_category}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      ${Number(sku.sales_per_linear_ft || 0).toFixed(2)}/ft
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {Number(sku.linear_ft_required || 0).toFixed(1)} ft
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          (sku.instock_rate || 0) >= 95
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {Number(sku.instock_rate || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isPB ? (
                        <span className="font-semibold text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded text-[11px] border border-yellow-200">
                          Private Brand
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          National
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${getBadgeStyle(
                          badge,
                        )}`}
                      >
                        {badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Count */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
        <span>
          Showing {filteredSkus.length} of {skus.length} SKUs
        </span>
        <span>Small Town Value Cluster Stores</span>
      </div>
    </div>
  );
}
