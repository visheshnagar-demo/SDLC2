import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const STATUS_BADGE_STYLES = {
  GROW: {
    bg: "bg-[#10B981]/15",
    text: "text-[#10B981]",
    border: "border-[#10B981]/40",
    dot: "bg-[#10B981]",
  },
  MAINTAIN: {
    bg: "bg-[#38BDF8]/15",
    text: "text-[#38BDF8]",
    border: "border-[#38BDF8]/40",
    dot: "bg-[#38BDF8]",
  },
  SWAP: {
    bg: "bg-[#F59E0B]/15",
    text: "text-[#F59E0B]",
    border: "border-[#F59E0B]/40",
    dot: "bg-[#F59E0B]",
  },
  REDUCE: {
    bg: "bg-[#F43F5E]/15",
    text: "text-[#F43F5E]",
    border: "border-[#F43F5E]/40",
    dot: "bg-[#F43F5E]",
  },
};

export default function SKUPerformanceTable({ skus, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortField, setSortField] = useState("weekly_sales");
  const [sortDirection, setSortDirection] = useState("desc");

  // Extract unique categories from data
  const categories = useMemo(() => {
    if (!skus) return [];
    const set = new Set(skus.map((s) => s.category).filter(Boolean));
    return Array.from(set).sort();
  }, [skus]);

  // Handle column sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filtered and sorted dataset
  const processedSKUs = useMemo(() => {
    if (!skus) return [];
    return skus
      .filter((sku) => {
        const matchesSearch =
          sku.sku_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sku.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sku.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesBadge =
          selectedBadge === "ALL" ||
          sku.status_badge.toUpperCase() === selectedBadge.toUpperCase();

        const matchesCategory =
          selectedCategory === "ALL" || sku.category === selectedCategory;

        return matchesSearch && matchesBadge && matchesCategory;
      })
      .sort((a, b) => {
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
  }, [
    skus,
    searchTerm,
    selectedBadge,
    selectedCategory,
    sortField,
    sortDirection,
  ]);

  return (
    <section
      aria-label="SKU Performance Section"
      className="bg-[#0F172A] border border-[#334155] rounded-xl p-5 shadow-lg mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <span>Snacks SKU Performance Matrix</span>
            <span className="text-xs font-normal text-[#94A3B8] font-mono">
              ({processedSKUs.length} items)
            </span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Performance metrics and action recommendations for Small Town Value
            Cluster
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SKU, product..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#FFD200]"
            />
          </div>

          {/* Badge Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              aria-label="Filter by Status Badge"
              className="bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white py-1.5 px-2.5 focus:outline-none focus:border-[#FFD200]"
            >
              <option value="ALL">All Actions</option>
              <option value="GROW">GROW</option>
              <option value="MAINTAIN">MAINTAIN</option>
              <option value="SWAP">SWAP</option>
              <option value="REDUCE">REDUCE</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="bg-[#1E293B] border border-[#334155] rounded-lg text-xs text-white py-1.5 px-2.5 focus:outline-none focus:border-[#FFD200]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-[#94A3B8] animate-pulse font-mono text-sm">
            Loading Snacks SKU performance data...
          </div>
        ) : processedSKUs.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8]">
            <p className="text-sm font-medium">
              No SKUs found matching the selected filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedBadge("ALL");
                setSelectedCategory("ALL");
              }}
              className="mt-3 text-xs text-[#FFD200] hover:underline font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#334155] text-[#94A3B8] font-mono uppercase text-[11px] bg-[#1E293B]/40">
                <th
                  onClick={() => handleSort("sku_code")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>SKU Code</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("product_name")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("category")}
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("weekly_sales")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Weekly Sales</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("margin_pct")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("shelf_space_ft")}
                  className="py-3 px-3 text-right cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Shelf Space</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <span>Action Status</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {processedSKUs.map((sku) => {
                const badgeStyle =
                  STATUS_BADGE_STYLES[sku.status_badge.toUpperCase()] ||
                  STATUS_BADGE_STYLES.MAINTAIN;

                return (
                  <tr
                    key={sku.id || sku.sku_code}
                    className="hover:bg-[#1E293B]/60 transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-[#FFD200]">
                      {sku.sku_code}
                    </td>
                    <td className="py-3 px-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span>{sku.product_name}</span>
                        {sku.is_private_brand && (
                          <span
                            title="Dollar General Private Brand (e.g. Clover Valley)"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFD200]/20 text-[#FFD200] border border-[#FFD200]/40"
                          >
                            <Tag className="w-2.5 h-2.5" /> PB
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#94A3B8]">{sku.category}</td>
                    <td className="py-3 px-3 text-right font-mono text-white font-medium">
                      $
                      {Number(sku.weekly_sales).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#38BDF8]">
                      {Number(sku.margin_pct).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#94A3B8]">
                      {Number(sku.shelf_space_ft).toFixed(1)} ft
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`}
                        />
                        {sku.status_badge}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

SKUPerformanceTable.propTypes = {
  skus: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      sku_code: PropTypes.string.isRequired,
      product_name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      weekly_sales: PropTypes.number.isRequired,
      margin_pct: PropTypes.number.isRequired,
      shelf_space_ft: PropTypes.number.isRequired,
      status_badge: PropTypes.string.isRequired,
      is_private_brand: PropTypes.bool,
    }),
  ),
  loading: PropTypes.bool,
};
