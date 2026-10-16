import React from "react";

export default function RichTable({
  columns = [],
  data = [],
  keyField = "id",
  loading = false,
  emptyMessage = "No records found",
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-500">
        <div className="w-8 h-8 border-4 border-[#2461F5] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium text-[#66738A]">Loading records...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 text-xl">
          📋
        </div>
        <p className="text-sm font-medium text-[#0F1729] mb-1">
          {emptyMessage}
        </p>
        <p className="text-xs text-[#66738A]">
          No entries currently match the criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-[#E3E8F0] text-left">
        <thead className="bg-[#F8FAFC]">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                className={`px-4 py-3.5 text-xs font-semibold text-[#66738A] uppercase tracking-wider ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#E3E8F0]">
          {data.map((row, rowIndex) => (
            <tr
              key={row[keyField] || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`transition-colors ${onRowClick ? "cursor-pointer hover:bg-blue-50/40" : "hover:bg-gray-50/50"}`}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={col.key || colIndex}
                  className={`px-4 py-3.5 text-sm text-[#0F1729] whitespace-nowrap ${col.cellClassName || ""}`}
                >
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
