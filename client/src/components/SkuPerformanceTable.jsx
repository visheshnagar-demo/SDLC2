import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, Tag, Sparkles } from "lucide-react";

export const SkuPerformanceTable = ({
  skus = [],
  loading = false,
  error = null,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [sortField, setSortField] = useState("sales_volume_usd");
  const [sortDirection, setSortDirection] = useState("desc");

  const filteredSkus = useMemo(() => {
    return skus
      .filter((sku) => {
        const matchesSearch =
          searchTerm === "" ||
          sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sku.sku_code.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBrand =
          brandFilter === "ALL" || sku.brand_type === brandFilter;

        const matchesAction =
          actionFilter === "ALL" || sku.recommended_action === actionFilter;

        return matchesSearch && matchesBrand && matchesAction;
      })
      .sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (typeof aVal === "string") {
          return sortDirection === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
  }, [skus, searchTerm, brandFilter, actionFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getBadgeStyle = (action) => {
    switch (action?.toUpperCase()) {
      case "GROW":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/20";
      case "MAINTAIN":
        return "bg-sky-500/20 text-sky-300 border-sky-500/40 ring-1 ring-sky-500/20";
      case "SWAP":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/20";
      case "REDUCE":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/20";
      default:
        return "bg-slate-700/40 text-slate-300 border-slate-600";
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Snacks SKU Assortment Performance
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredSkus.length} of {skus.length} SKUs
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Actions:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono text-[11px] font-semibold">
              GROW
            </span>
            <span className="px-2 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/40 font-mono text-[11px] font-semibold">
              MAINTAIN
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40 font-mono text-[11px] font-semibold">
              SWAP
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40 font-mono text-[11px] font-semibold">
              REDUCE
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              role="searchbox"
              placeholder="Search Snacks by SKU code or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by Brand Type"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Brands (Private & National)</option>
              <option value="PRIVATE_BRAND">
                Private Brand (Clover Valley / DG Crave)
              </option>
              <option value="NATIONAL_BRAND">
                National Brand (Lay's, Doritos, etc.)
              </option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by Action"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">All Recommended Actions</option>
              <option value="GROW">GROW (High Margin / Velocity)</option>
              <option value="MAINTAIN">MAINTAIN (Core Performer)</option>
              <option value="SWAP">SWAP (Substitute with Private Brand)</option>
              <option value="REDUCE">REDUCE (Underperforming Space)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto flex-1 max-h-[480px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-950/95 backdrop-blur z-10 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
            <tr>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("sku_code")}
              >
                <div className="flex items-center gap-1">
                  SKU Code
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Product Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Brand Type</th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("weekly_sales_units")}
              >
                <div className="flex items-center justify-end gap-1">
                  Weekly Units
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("sales_volume_usd")}
              >
                <div className="flex items-center justify-end gap-1">
                  Sales Vol ($)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("margin_percentage")}
              >
                <div className="flex items-center justify-end gap-1">
                  Margin %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-200"
                onClick={() => handleSort("linear_space_inches")}
              >
                <div className="flex items-center justify-end gap-1">
                  Space (in)
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading SKU catalog metrics...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-rose-400">
                  Error loading SKUs: {error}
                </td>
              </tr>
            ) : filteredSkus.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500">
                  No Snacks SKUs match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredSkus.map((sku) => (
                <tr
                  key={sku.id || sku.sku_code}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-medium text-amber-400/90 whitespace-nowrap">
                    {sku.sku_code}
                  </td>
                  <td
                    className="py-3 px-4 font-medium text-slate-100 max-w-xs truncate"
                    title={sku.name}
                  >
                    {sku.name}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        sku.brand_type === "PRIVATE_BRAND"
                          ? "bg-amber-400/10 text-amber-300 border border-amber-400/30"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {sku.brand_type === "PRIVATE_BRAND"
                        ? "Private Brand"
                        : "National Brand"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-200">
                    {sku.weekly_sales_units?.toLocaleString() ?? 0}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-100">
                    $
                    {sku.sales_volume_usd?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) ?? "0.00"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        sku.margin_percentage >= 40
                          ? "text-emerald-400"
                          : sku.margin_percentage >= 30
                            ? "text-slate-200"
                            : "text-amber-400"
                      }`}
                    >
                      {sku.margin_percentage?.toFixed(1) ?? "0.0"}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {sku.linear_space_inches?.toFixed(1) ?? "0.0"}"
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border tracking-wider ${getBadgeStyle(
                        sku.recommended_action,
                      )}`}
                    >
                      {sku.recommended_action}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkuPerformanceTable;
