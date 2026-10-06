import React, { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Package,
} from "lucide-react";

const DEFAULT_SKUS = [
  {
    id: "1",
    sku_id: "SKU-10842",
    name: "DG Clover Valley Potato Chips 10oz",
    category: "Chips",
    sales: 14250,
    movement: 4200,
    margin_percentage: 38.5,
    velocity: 1.8,
    action: "GROW",
  },
  {
    id: "2",
    sku_id: "SKU-20911",
    name: "Brand X Crunchy Pretzels 12oz",
    category: "Pretzels",
    sales: 8100,
    movement: 1800,
    margin_percentage: 22.1,
    velocity: 0.9,
    action: "SWAP",
  },
  {
    id: "3",
    sku_id: "SKU-30124",
    name: "DG Value Tortilla Chips 14oz",
    category: "Tortilla",
    sales: 11800,
    movement: 3100,
    margin_percentage: 35.2,
    velocity: 1.4,
    action: "MAINTAIN",
  },
  {
    id: "4",
    sku_id: "SKU-40582",
    name: "Slow-Moving Corn Curls 8oz",
    category: "Corn Curls",
    sales: 2400,
    movement: 600,
    margin_percentage: 18.0,
    velocity: 0.4,
    action: "REDUCE",
  },
  {
    id: "5",
    sku_id: "SKU-50912",
    name: "DG Clover Valley Trail Mix 16oz",
    category: "Trail Mix",
    sales: 13100,
    movement: 3800,
    margin_percentage: 41.0,
    velocity: 1.6,
    action: "GROW",
  },
];

export const SKUPerformanceTable = ({ skus = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActionFilter, setSelectedActionFilter] = useState("ALL");
  const [sortField, setSortField] = useState("sales");
  const [sortDirection, setSortDirection] = useState("desc");

  const dataSource = skus && skus.length > 0 ? skus : DEFAULT_SKUS;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedSKUs = useMemo(() => {
    let result = [...dataSource];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.sku_id && item.sku_id.toLowerCase().includes(q)) ||
          (item.category && item.category.toLowerCase().includes(q)),
      );
    }

    // Action filter
    if (selectedActionFilter !== "ALL") {
      result = result.filter(
        (item) =>
          (item.action || item.recommended_action || "").toUpperCase() ===
          selectedActionFilter,
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "action") {
        aVal = a.action || a.recommended_action || "";
        bVal = b.action || b.recommended_action || "";
      }

      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === "asc"
        ? (aVal || 0) - (bVal || 0)
        : (bVal || 0) - (aVal || 0);
    });

    return result;
  }, [dataSource, searchTerm, selectedActionFilter, sortField, sortDirection]);

  const renderBadge = (actionStr) => {
    const act = (actionStr || "").toUpperCase();
    switch (act) {
      case "GROW":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full inline-block">
            GROW
          </span>
        );
      case "SWAP":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full inline-block">
            SWAP
          </span>
        );
      case "MAINTAIN":
        return (
          <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full inline-block">
            MAINTAIN
          </span>
        );
      case "REDUCE":
        return (
          <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full inline-block">
            REDUCE
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full inline-block">
            {actionStr || "UNKNOWN"}
          </span>
        );
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-400 opacity-60 inline" />
      );
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-slate-900 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-slate-900 inline" />
    );
  };

  return (
    <div
      className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6"
      data-testid="sku-table-section"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-yellow-500" />
            <span>Snacks SKU Performance & Action Recommendations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time performance ranking and assortment optimization
            recommendations
          </p>
        </div>

        {/* Action Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white w-full sm:w-48"
            />
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto">
            {["ALL", "GROW", "MAINTAIN", "SWAP", "REDUCE"].map((action) => (
              <button
                key={action}
                onClick={() => setSelectedActionFilter(action)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  selectedActionFilter === action
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Loading SKU performance data...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort("sku_id")}
                  className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center">
                    SKU ID {renderSortIndicator("sku_id")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center">
                    Product Name {renderSortIndicator("name")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sales")}
                  className="p-3 cursor-pointer hover:bg-slate-200 transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Sales ($) {renderSortIndicator("sales")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("movement")}
                  className="p-3 cursor-pointer hover:bg-slate-200 transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Movement {renderSortIndicator("movement")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("margin_percentage")}
                  className="p-3 cursor-pointer hover:bg-slate-200 transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Margin % {renderSortIndicator("margin_percentage")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("velocity")}
                  className="p-3 cursor-pointer hover:bg-slate-200 transition-colors text-right"
                >
                  <div className="flex items-center justify-end">
                    Velocity {renderSortIndicator("velocity")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("action")}
                  className="p-3 cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center">
                    Action Recommendation {renderSortIndicator("action")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSKUs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-slate-500 text-sm"
                  >
                    No SKUs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedSKUs.map((sku) => (
                  <tr
                    key={sku.sku_id || sku.id}
                    className="border-t border-slate-200 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs text-slate-600 font-semibold">
                      {sku.sku_id}
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {sku.name}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-800">
                      ${Number(sku.sales || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-slate-700">
                      {Number(sku.movement || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-slate-700">
                      {sku.margin_percentage}%
                    </td>
                    <td className="p-3 text-right text-slate-700 font-semibold">
                      {sku.velocity}x
                    </td>
                    <td className="p-3">
                      {renderBadge(sku.action || sku.recommended_action)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SKUPerformanceTable;
