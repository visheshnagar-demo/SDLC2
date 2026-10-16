import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

export function RichTable({
  columns,
  data = [],
  isLoading = false,
  emptyMessage = "No records found",
  onRowClick,
  pageSize = 10,
  initialSortField = "",
  initialSortDirection = "asc",
  className = "",
}) {
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div
      className={`bg-white rounded-xl border border-[#E3E8F0] overflow-hidden shadow-sm flex flex-col ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E3E8F0] text-[12px] font-semibold uppercase tracking-wider text-[#66738A]">
              {columns.map((col) => (
                <th
                  key={col.key || col.header}
                  scope="col"
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`py-3.5 px-4 select-none ${
                    col.sortable
                      ? "cursor-pointer hover:bg-slate-100 transition-colors"
                      : ""
                  } ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}
                >
                  <div
                    className={`inline-flex items-center gap-1.5 ${col.align === "right" ? "justify-end" : ""}`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortField === col.key ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#2461F5]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#2461F5]" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E8F0] text-sm text-[#0F1729]">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#2461F5] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-medium">
                      Loading submissions queue...
                    </span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-slate-300" />
                    <span className="text-sm font-medium">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const rowKey =
                  row.id || row.submission_reference || `row-${index}`;
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick
                        ? "cursor-pointer hover:bg-blue-50/40"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={`${rowKey}-${col.key}`}
                        className={`py-3.5 px-4 text-sm ${
                          col.align === "right"
                            ? "text-right"
                            : col.align === "center"
                              ? "text-center"
                              : "text-left"
                        }`}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E3E8F0] bg-[#F8FAFC] text-xs text-[#66738A]">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-slate-300 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

RichTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      align: PropTypes.oneOf(["left", "center", "right"]),
      render: PropTypes.func,
    }),
  ).isRequired,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  onRowClick: PropTypes.func,
  pageSize: PropTypes.number,
  initialSortField: PropTypes.string,
  initialSortDirection: PropTypes.oneOf(["asc", "desc"]),
  className: PropTypes.string,
};

export default RichTable;
