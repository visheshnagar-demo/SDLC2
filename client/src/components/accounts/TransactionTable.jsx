import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
import Badge from "../common/Badge";

export const TransactionTable = ({
  transactions = [],
  loading = false,
  page = 0,
  totalPages = 1,
  onPageChange,
  showPagination = true,
  title = "Recent Transactions",
}) => {
  if (loading) {
    return (
      <div className="bg-[#151B2B] rounded-2xl border border-[#33394A]/60 p-8 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-[#94A3B8]">Loading ledger entries...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#151B2B] rounded-2xl border border-[#33394A]/60 overflow-hidden shadow-sm">
      {/* Table Header / Title */}
      <div className="p-5 border-b border-[#33394A]/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#191F2F] text-[#0EA5E9] border border-[#33394A]/40">
            <Receipt className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-[#F8FAFC]">{title}</h2>
        </div>
        <span className="text-xs text-[#94A3B8]">
          {transactions.length} record{transactions.length !== 1 ? "s" : ""}{" "}
          displayed
        </span>
      </div>

      {/* Table Content */}
      {transactions.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#191F2F] text-[#94A3B8] flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-[#F8FAFC]">
            No transactions found
          </p>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            No activity has been posted to this account yet. Perform a fund
            transfer to see live transactions.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#33394A]/40 bg-[#121724] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
                <th className="py-3 px-5">Date & Time</th>
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5 text-right">Amount</th>
                <th className="py-3 px-5 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#33394A]/30 text-xs">
              {transactions.map((tx) => {
                const txId = tx.id || tx.transactionId || String(Math.random());
                const isCredit =
                  (tx.type || tx.transactionType || "").toUpperCase() ===
                  "CREDIT";
                const amount =
                  typeof tx.amount === "number"
                    ? tx.amount
                    : parseFloat(tx.amount) || 0;
                const balanceAfter =
                  tx.balanceAfter !== undefined && tx.balanceAfter !== null
                    ? typeof tx.balanceAfter === "number"
                      ? tx.balanceAfter
                      : parseFloat(tx.balanceAfter) || 0
                    : null;

                const formattedAmount = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(amount);

                const formattedBalance =
                  balanceAfter !== null
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(balanceAfter)
                    : "—";

                const formattedDate = tx.timestamp
                  ? new Date(tx.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Recent";

                return (
                  <tr
                    key={txId}
                    className="hover:bg-[#191F2F]/60 transition-colors"
                  >
                    <td className="py-3.5 px-5 text-[#94A3B8] font-mono whitespace-nowrap">
                      {formattedDate}
                    </td>
                    <td className="py-3.5 px-5 text-[#F8FAFC] font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-md ${
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-blue-500/10 text-[#0EA5E9]"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span>
                          {tx.description ||
                            (isCredit
                              ? "Deposit / Inward Transfer"
                              : "Payment / Outward Transfer")}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge
                        variant={isCredit ? "success" : "primary"}
                        size="sm"
                      >
                        {isCredit ? "CREDIT" : "DEBIT"}
                      </Badge>
                    </td>
                    <td
                      className={`py-3.5 px-5 text-right font-semibold font-mono ${
                        isCredit ? "text-emerald-400" : "text-[#F8FAFC]"
                      }`}
                    >
                      {isCredit ? `+${formattedAmount}` : `-${formattedAmount}`}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-[#94A3B8]">
                      {formattedBalance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {showPagination && totalPages > 1 && (
        <div className="p-4 border-t border-[#33394A]/40 bg-[#121724] flex items-center justify-between text-xs text-[#94A3B8]">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg bg-[#191F2F] border border-[#33394A] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#20273a] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg bg-[#191F2F] border border-[#33394A] text-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#20273a] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
