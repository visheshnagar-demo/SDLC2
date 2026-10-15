import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, ArrowUpRight, ShieldCheck, Landmark } from "lucide-react";
import Badge from "../common/Badge";

export const AccountCard = ({ account, onSelect }) => {
  const navigate = useNavigate();

  if (!account) return null;

  const id = account.id || account.accountId || "1";
  const accountNumber = account.accountNumber || `ACC-${id}`;
  const type = (account.type || "CHECKING").toUpperCase();
  const balance =
    typeof account.balance === "number"
      ? account.balance
      : parseFloat(account.balance) || 0;
  const currency = account.currency || "USD";
  const status = account.status || "ACTIVE";

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(balance);

  const isChecking = type === "CHECKING";

  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        isChecking
          ? "bg-gradient-to-br from-[#151B2B] to-[#1a233a] border-blue-500/30 hover:border-blue-500/60 shadow-lg shadow-blue-900/10"
          : "bg-gradient-to-br from-[#151B2B] to-[#182030] border-[#33394A]/60 hover:border-[#33394A]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isChecking
                ? "bg-blue-500/20 text-[#0EA5E9]"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {isChecking ? (
              <CreditCard className="w-5 h-5" />
            ) : (
              <Landmark className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
              {type} ACCOUNT
            </span>
            <p className="text-sm font-mono font-medium text-[#F8FAFC]">
              {accountNumber}
            </p>
          </div>
        </div>

        <Badge variant={status === "ACTIVE" ? "success" : "default"} size="sm">
          {status}
        </Badge>
      </div>

      {/* Balance */}
      <div className="my-5">
        <span className="text-xs text-[#94A3B8]">Available Balance</span>
        <div className="text-3xl font-extrabold tracking-tight text-[#F8FAFC] mt-0.5">
          {formattedBalance}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-4 border-t border-[#33394A]/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0EA5E9]" />
          <span>FDIC Insured</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onSelect) onSelect(account);
            navigate(`/accounts/${id}`);
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0EA5E9] hover:text-white transition-colors"
        >
          <span>View Statement</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
