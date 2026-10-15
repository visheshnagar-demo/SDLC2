import React, { useState, useEffect } from "react";
import {
  Building2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Globe,
  DollarSign,
  FileText,
  UserCheck,
} from "lucide-react";
import Button from "../common/Button";

export const TransferForm = ({
  accounts = [],
  onSubmit,
  loading = false,
  error = null,
  successData = null,
  onReset,
}) => {
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [destinationAccountNumber, setDestinationAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferType, setTransferType] = useState("INTERNAL"); // INTERNAL, ACH, WIRE

  // Auto-select first account if available
  useEffect(() => {
    if (accounts.length > 0 && !sourceAccountId) {
      const firstId = accounts[0].id || accounts[0].accountId;
      setSourceAccountId(String(firstId));
    }
  }, [accounts, sourceAccountId]);

  const selectedAccount = accounts.find(
    (acc) => String(acc.id || acc.accountId) === String(sourceAccountId),
  );

  const selectedBalance = selectedAccount ? Number(selectedAccount.balance) : 0;
  const numAmount = parseFloat(amount) || 0;
  const isInsufficientFunds = numAmount > selectedBalance;
  const isInvalidAmount = numAmount <= 0;

  const quickBeneficiaries = [
    { label: "Savings Reserve", accountNum: "ACC-2002" },
    { label: "Vendor Escrow", accountNum: "ACC-9812" },
    { label: "Payroll Clearing", accountNum: "ACC-5401" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      isInsufficientFunds ||
      isInvalidAmount ||
      !destinationAccountNumber.trim()
    )
      return;

    // Generate random UUID for idempotency
    const idempotencyKey = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );

    onSubmit({
      sourceAccountId,
      destinationAccountNumber: destinationAccountNumber.trim(),
      amount: numAmount,
      currency: selectedAccount?.currency || "USD",
      description: description.trim() || "Fund Transfer",
      idempotencyKey,
      transferType,
    });
  };

  if (successData) {
    return (
      <div className="bg-[#151B2B] rounded-2xl border border-emerald-500/30 p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#F8FAFC]">
            Transfer Executed Successfully
          </h2>
          <p className="text-xs text-[#94A3B8]">
            Reference Number:{" "}
            <span className="font-mono text-[#0EA5E9] font-semibold">
              {successData.referenceNumber ||
                successData.transferId ||
                "TRX-SUCCESS"}
            </span>
          </p>
        </div>

        <div className="bg-[#191F2F] rounded-xl p-5 border border-[#33394A]/60 max-w-md mx-auto text-left space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-[#33394A]/30">
            <span className="text-[#94A3B8]">Amount Transferred:</span>
            <span className="font-bold text-[#F8FAFC]">
              ${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#33394A]/30">
            <span className="text-[#94A3B8]">Recipient Account:</span>
            <span className="font-mono text-[#F8FAFC]">
              {destinationAccountNumber}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#94A3B8]">Updated Source Balance:</span>
            <span className="font-bold text-emerald-400">
              $
              {(
                successData.sourceBalanceAfter || selectedBalance - numAmount
              ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            onClick={() => {
              setAmount("");
              setDestinationAccountNumber("");
              setDescription("");
              if (onReset) onReset();
            }}
          >
            Initiate Another Transfer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#151B2B] rounded-2xl border border-[#33394A]/60 p-6 md:p-8 space-y-6"
    >
      <div>
        <h2 className="text-base font-bold text-[#F8FAFC]">
          Transfer Configuration
        </h2>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Execute instantaneous atomic account-to-account funds transfer.
        </p>
      </div>

      {/* Backend API Error Banner (surfaces real errors, no fake success!) */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300">Transaction Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 1. Source Account Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          Source Account
        </label>
        <div className="relative">
          <select
            value={sourceAccountId}
            onChange={(e) => setSourceAccountId(e.target.value)}
            className="w-full bg-[#191F2F] border border-[#33394A] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] appearance-none transition-colors"
          >
            {accounts.map((acc) => {
              const accId = acc.id || acc.accountId;
              const accNum = acc.accountNumber || `ACC-${accId}`;
              const bal = Number(acc.balance).toLocaleString("en-US", {
                style: "currency",
                currency: acc.currency || "USD",
              });
              return (
                <option key={accId} value={accId}>
                  {acc.type || "ACCOUNT"} ({accNum}) — Available: {bal}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 2. Destination Account & Quick Beneficiary Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
            Destination Account Number
          </label>
          <span className="text-[11px] text-[#0EA5E9]">
            Internal or External IBAN/Routing
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            required
            placeholder="e.g. ACC-2002 or 9823481023"
            value={destinationAccountNumber}
            onChange={(e) => setDestinationAccountNumber(e.target.value)}
            className="w-full bg-[#191F2F] border border-[#33394A] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-mono transition-colors"
          />
        </div>

        {/* Quick Beneficiary Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-[#94A3B8]">Quick picks:</span>
          {quickBeneficiaries.map((b) => (
            <button
              key={b.accountNum}
              type="button"
              onClick={() => setDestinationAccountNumber(b.accountNum)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#191F2F] text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#20273a] border border-[#33394A]/60 transition-colors"
            >
              {b.label} ({b.accountNum})
            </button>
          ))}
        </div>
      </div>

      {/* 3. Transfer Amount & Real-time Balance Validation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
            Transfer Amount (USD)
          </label>
          <span className="text-xs text-[#94A3B8]">
            Balance:{" "}
            <strong className="text-[#F8FAFC]">
              $
              {selectedBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </span>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl font-bold text-[#94A3B8]">
            $
          </div>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full bg-[#191F2F] border rounded-xl pl-9 pr-4 py-3 text-lg font-bold text-[#F8FAFC] placeholder-[#94A3B8]/30 focus:outline-none transition-colors ${
              isInsufficientFunds
                ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                : "border-[#33394A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            }`}
          />
        </div>

        {/* Real-time Validation Alerts */}
        {isInsufficientFunds && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Insufficient funds: Amount exceeds available balance of $
              {selectedBalance.toFixed(2)}.
            </span>
          </div>
        )}
      </div>

      {/* 4. Protocol / Transfer Speed */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          Settlement Rail
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              id: "INTERNAL",
              label: "Instant Internal",
              icon: Zap,
              sub: "Real-time (0s)",
            },
            {
              id: "ACH",
              label: "Standard ACH",
              icon: Building2,
              sub: "Same Day",
            },
            {
              id: "WIRE",
              label: "FedWire / SWIFT",
              icon: Globe,
              sub: "RTGS Network",
            },
          ].map((rail) => {
            const Icon = rail.icon;
            const isSelected = transferType === rail.id;
            return (
              <button
                key={rail.id}
                type="button"
                onClick={() => setTransferType(rail.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-blue-500/10 border-[#2563EB] text-[#F8FAFC] shadow-sm"
                    : "bg-[#191F2F] border-[#33394A]/60 text-[#94A3B8] hover:border-[#33394A]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`w-4 h-4 ${isSelected ? "text-[#0EA5E9]" : "text-[#94A3B8]"}`}
                  />
                  <span className="text-xs font-semibold">{rail.label}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] block">
                  {rail.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Transfer Memo / Description */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
          Payment Memo / Reference (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Invoice #9021 or Personal Relocation Transfer"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#191F2F] border border-[#33394A] rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none focus:border-[#2563EB] transition-colors"
        />
      </div>

      {/* Submit Action */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={
            isInsufficientFunds ||
            isInvalidAmount ||
            !destinationAccountNumber.trim()
          }
          className="w-full font-bold shadow-lg shadow-blue-600/20"
        >
          Proceed to Transfer Execution
        </Button>
      </div>
    </form>
  );
};

export default TransferForm;
