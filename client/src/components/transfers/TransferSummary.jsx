import React from "react";
import { ShieldCheck, ArrowRightLeft, Clock, Zap, Check } from "lucide-react";

export const TransferSummary = ({
  sourceAccount,
  destinationAccountNumber,
  amount = 0,
  transferType = "INTERNAL",
}) => {
  const numAmount = parseFloat(amount) || 0;
  const currentBalance = sourceAccount ? Number(sourceAccount.balance) : 0;
  const sourceNumber =
    sourceAccount?.accountNumber || `ACC-${sourceAccount?.id || "1001"}`;
  const netBalanceAfter = Math.max(0, currentBalance - numAmount);

  return (
    <div className="bg-[#191F2F] rounded-2xl border border-[#33394A]/60 p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#33394A]/40">
        <h2 className="text-sm font-bold text-[#F8FAFC]">
          Live Transfer Breakdown
        </h2>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-[#0EA5E9] border border-blue-500/30">
          PRE-EXECUTION
        </span>
      </div>

      {/* Account Route Flow */}
      <div className="p-4 bg-[#151B2B] rounded-xl border border-[#33394A]/40 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Debiting From:</span>
          <span className="font-mono text-[#F8FAFC] font-semibold">
            {sourceAccount?.type || "CHECKING"} ({sourceNumber})
          </span>
        </div>
        <div className="flex justify-center text-[#0EA5E9]">
          <ArrowRightLeft className="w-4 h-4" />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Crediting To:</span>
          <span className="font-mono text-[#F8FAFC] font-semibold">
            {destinationAccountNumber || "— (Specify account)"}
          </span>
        </div>
      </div>

      {/* Financial Calculations */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between py-1 text-[#94A3B8]">
          <span>Transfer Volume</span>
          <span className="font-mono font-bold text-[#F8FAFC]">
            $
            {numAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex justify-between py-1 text-[#94A3B8]">
          <span>Network Processing Fee</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> $0.00 (Waived)
          </span>
        </div>

        <div className="flex justify-between py-1 text-[#94A3B8]">
          <span>Settlement Rail</span>
          <span className="text-[#0EA5E9] font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" /> {transferType}
          </span>
        </div>

        <div className="pt-3 border-t border-[#33394A]/40 flex justify-between items-baseline">
          <span className="text-xs font-semibold text-[#F8FAFC]">
            Estimated Balance After:
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            $
            {netBalanceAfter.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Security Assurance */}
      <div className="p-3.5 bg-blue-500/5 rounded-xl border border-blue-500/20 flex items-start gap-2.5 text-[11px] text-[#94A3B8]">
        <ShieldCheck className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" />
        <span>
          Atomic double-entry transaction protected by PostgreSQL pessimistic
          lock & 256-bit TLS.
        </span>
      </div>
    </div>
  );
};

export default TransferSummary;
