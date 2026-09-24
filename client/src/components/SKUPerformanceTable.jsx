import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
} from "lucide-react";

const STATUS_BADGE_CONFIG = {
  GROW: {
    label: "GROW",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    description: "High velocity — expand linear feet",
  },
  MAINTAIN: {
    label: "MAINTAIN",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    description: "Core staple — hold current allocation",
  },
  SWAP: {
    label: "SWAP",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    description: "Sub-optimal margin — swap for Private Brand equivalent",
  },
  REDUCE: {
    label: "REDUCE",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    description: "Low velocity / duplicate — delist or reduce facing",
  },
};

export default function SKUPerformanceTable({ skus = [], isLoading, error }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [privateBrandOnly, setPrivateBrandOnly] = useState(false);
  const [sortField, setSortField] = useState("sales_per_linear_ft");
  const [sortDirection, setSortDirection] = useState("desc");

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    skus.forEach((s) => {
      if (s.sub_category) set.add(s.sub_category);
    });
    return ["ALL", ...Array.from(set)];
  }, [skus]);

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filtered & Sorted list
  const filteredSKUs = useMemo(() => {
    return skus
      .filter((sku) => {
        // Search
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchCode = sku.sku_code?.toLowerCase().includes(q);
          const matchName = sku.product_name?.toLowerCase().includes(q);
          const matchBrand = sku.brand_name?.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchBrand) return false;
        }
        // Status Badge
        if (selectedStatus !== "ALL") {
          if (sku.status_badge !== selectedStatus) return false;
        }
        // Category
        if (selectedCategory !== "ALL") {
          if (sku.sub_category !== selectedCategory) return false;
        }
        // Private Brand Only
        if (privateBrandOnly) {
          if (!sku.is_private_brand) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") {
          return sortDirection === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        valA = Number(valA || 0);
        valB = Number(valB || 0);
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
  }, [
    skus,
    searchTerm,
    selectedStatus,
    selectedCategory,
    privateBrandOnly,
    sortField,
    sortDirection,
  ]);

  return (
    <section
      aria-label="SKU Performance Section"
      className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Snacks SKU Performance</span>
              <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {filteredSKUs.length} items
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assortment velocity, linear foot productivity, and action
              classifications for Small Town Value Cluster.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search SKU code, name, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB813] focus:border-transparent text-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Status Badge Filter Buttons */}
          {["ALL", "GROW", "MAINTAIN", "SWAP", "REDUCE"].map((st) => {
            const isActive = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-full font-semibold border transition-all ${
                  isActive
                    ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {st === "ALL" ? "All Badges" : st}
              </button>
            );
          })}

          <span className="text-slate-300 mx-1">|</span>

          {/* Subcategory Select Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FDB813]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All Sub-Categories" : c}
              </option>
            ))}
          </select>

          {/* Private Brand Toggle */}
          <label className="flex items-center gap-1.5 ml-auto cursor-pointer select-none bg-white px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={privateBrandOnly}
              onChange={(e) => setPrivateBrandOnly(e.target.checked)}
              className="rounded text-[#FDB813] focus:ring-[#FDB813] w-3.5 h-3.5 accent-[#FDB813]"
            />
            <span>Private Brand Only</span>
          </label>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <th
                onClick={() => handleSort("sku_code")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>SKU & Product</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("brand_name")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Brand</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("sub_category")}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors hidden md:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Sub-Category</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("sales_per_linear_ft")}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Sales / Lin Ft</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("linear_feet_allocated")}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors hidden sm:table-cell"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Space (Ft)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort("in_stock_rate")}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>In-Stock</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">
                <span>Status Badge</span>
              </th>
              <th className="py-3 px-4 hidden lg:table-cell">
                <span>Strategy / Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4">
                    <div className="h-4 bg-slate-200 rounded w-40"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                  </td>
                  <td className="p-4 text-right hidden sm:table-cell">
                    <div className="h-4 bg-slate-200 rounded w-10 ml-auto"></div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="h-6 bg-slate-200 rounded-full w-20 mx-auto"></div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                  </td>
                </tr>
              ))
            ) : filteredSKUs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-12 text-slate-500">
                  <p className="text-sm font-semibold">
                    No Snacks SKUs found matching the current filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedStatus("ALL");
                      setSelectedCategory("ALL");
                      setPrivateBrandOnly(false);
                    }}
                    className="mt-3 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700"
                  >
                    Reset Filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredSKUs.map((sku) => {
                const badge =
                  STATUS_BADGE_CONFIG[sku.status_badge] ||
                  STATUS_BADGE_CONFIG.MAINTAIN;
                return (
                  <tr
                    key={sku.id || sku.sku_code}
                    className="hover:bg-amber-50/40 transition-colors"
                  >
                    {/* SKU Code & Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {sku.product_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {sku.sku_code}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {sku.brand_name}
                        </span>
                        {sku.is_private_brand && (
                          <span
                            title="DG Private Brand"
                            className="bg-[#FDB813]/20 text-amber-950 border border-[#FDB813]/50 text-[10px] font-extrabold px-1.5 py-0.2 rounded"
                          >
                            PB
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sub-Category */}
                    <td className="py-3 px-4 text-slate-600 hidden md:table-cell font-medium">
                      {sku.sub_category}
                    </td>

                    {/* Sales / Linear Ft */}
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      ${Number(sku.sales_per_linear_ft || 0).toFixed(2)}
                    </td>

                    {/* Space */}
                    <td className="py-3 px-4 text-right text-slate-600 hidden sm:table-cell font-mono">
                      {Number(sku.linear_feet_allocated || 0).toFixed(1)} ft
                    </td>

                    {/* In-Stock Rate */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          (sku.in_stock_rate || 0) >= 95
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {Number(sku.in_stock_rate || 0).toFixed(1)}%
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                        ></span>
                        {badge.label}
                      </span>
                    </td>

                    {/* Strategy / Action */}
                    <td className="py-3 px-4 text-slate-500 text-[11px] hidden lg:table-cell">
                      {sku.action_recommendation || badge.description}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-slate-500 text-xs flex justify-between items-center">
        <span>
          Showing{" "}
          <strong className="text-slate-800">{filteredSKUs.length}</strong> of{" "}
          <strong className="text-slate-800">{skus.length}</strong> Snacks SKUs
        </span>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> GROW
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> MAINTAIN
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> SWAP
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> REDUCE
          </span>
        </div>
      </div>
    </section>
  );
}
