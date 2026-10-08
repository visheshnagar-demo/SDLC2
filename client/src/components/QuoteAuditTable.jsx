import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  RefreshCw,
  Car,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function QuoteAuditTable({
  quotes = [],
  onSelectQuote,
  onRefresh,
  isLoading,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoverage, setSelectedCoverage] = useState("ALL");

  const filteredQuotes = quotes.filter((q) => {
    const make = (q.vehicle_make || "").toLowerCase();
    const id = (q.id || q.quote_id || "").toLowerCase();
    const coverage = q.coverage_type || "";
    const query = searchTerm.toLowerCase();

    const matchesSearch = make.includes(query) || id.includes(query);
    const matchesCoverage =
      selectedCoverage === "ALL" ||
      coverage.toLowerCase().includes(selectedCoverage.toLowerCase());

    return matchesSearch && matchesCoverage;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Shield className="w-5 h-5" />
            </span>
            Quote Calculation History &amp; Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full compliance ledger of generated motor quotes and factor
            adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or Make..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          {/* Coverage Filter */}
          <select
            value={selectedCoverage}
            onChange={(e) => setSelectedCoverage(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium text-slate-700"
          >
            <option value="ALL">All Coverages</option>
            <option value="Comprehensive">Comprehensive</option>
            <option value="Third Party">Third Party</option>
            <option value="Fire and Theft">Fire &amp; Theft</option>
          </select>

          {/* Refresh button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh Quotes"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Car className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            No quotes recorded in this session yet.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Calculate a quote from the Calculator tab to see its audit history
            here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 rounded-l-xl">Quote ID</th>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Vehicle Details</th>
                <th className="p-3">Vehicle Value</th>
                <th className="p-3">Driver Profile</th>
                <th className="p-3">Coverage</th>
                <th className="p-3">Total Premium</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q, idx) => {
                const quoteId = q.id || q.quote_id || `Q-${idx + 1}`;
                const ts =
                  q.created_at || q.calculated_at || new Date().toISOString();
                const total = Number(q.total_premium || q.premium || 0);

                return (
                  <tr
                    key={`quote-row-${quoteId}-${idx}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-3 font-mono text-[11px] font-semibold text-indigo-700">
                      {quoteId.substring(0, 12)}...
                    </td>
                    <td className="p-3 text-slate-600">
                      {new Date(ts).toLocaleDateString()}{" "}
                      {new Date(ts).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {q.vehicle_year} {q.vehicle_make}
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-700">
                      ${Number(q.vehicle_value || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-600">
                      {q.driver_age} yrs / {q.driving_experience} yrs exp
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold text-[10px] border border-indigo-200/50">
                        {q.coverage_type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      $
                      {total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectQuote(q)}
                        className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-600 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Audit Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
