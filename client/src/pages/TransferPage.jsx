import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ShieldCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import TransferForm from "../components/transfers/TransferForm";
import TransferSummary from "../components/transfers/TransferSummary";
import { accountsApi, transfersApi } from "../services/api";

export const TransferPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Live preview state for TransferSummary
  const [formState, setFormState] = useState({
    sourceAccountId: "",
    destinationAccountNumber: "",
    amount: 0,
    transferType: "INTERNAL",
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Confirmation

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const data = await accountsApi.getAccounts();
      const list = Array.isArray(data)
        ? data
        : data?.content || data?.data || [];
      setAccounts(list);
      if (list.length > 0) {
        setFormState((prev) => ({
          ...prev,
          sourceAccountId: String(list[0].id || list[0].accountId),
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch accounts for transfer",
      );
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleExecuteTransfer = async (transferPayload) => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await transfersApi.executeTransfer({
        sourceAccountId: transferPayload.sourceAccountId,
        destinationAccountNumber: transferPayload.destinationAccountNumber,
        amount: transferPayload.amount,
        currency: transferPayload.currency || "USD",
        description: transferPayload.description,
        idempotencyKey: transferPayload.idempotencyKey,
      });

      setSuccessData(response);
      setCurrentStep(3);
      // Re-fetch accounts to update balances
      fetchAccounts();
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Transfer failed. Check balance and account validity.";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAccount =
    accounts.find(
      (acc) =>
        String(acc.id || acc.accountId) === String(formState.sourceAccountId),
    ) || accounts[0];

  const steps = [
    { number: 1, title: "Transfer Details" },
    { number: 2, title: "Ledger Settlement" },
    { number: 3, title: "Confirmation" },
  ];

  return (
    <div className="space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Accounts</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#0EA5E9]">
          <ShieldCheck className="w-4 h-4" />
          <span>Real-Time Balance Verification Active</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-[#151B2B] p-4 rounded-xl border border-[#33394A]/60">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/30"
                          : "bg-[#191F2F] text-[#94A3B8] border border-[#33394A]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isCurrent ? "text-[#F8FAFC]" : "text-[#94A3B8]"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 transition-colors ${
                      currentStep > idx + 1
                        ? "bg-emerald-500"
                        : "bg-[#33394A]/60"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Split Form (60 / 40) Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7">
          <TransferForm
            accounts={accounts}
            onSubmit={handleExecuteTransfer}
            loading={submitting}
            error={error}
            successData={successData}
            onReset={() => {
              setSuccessData(null);
              setCurrentStep(1);
              setError(null);
            }}
          />
        </div>

        {/* Right Summary Breakdown: 5 cols */}
        <div className="lg:col-span-5 sticky top-6">
          <TransferSummary
            sourceAccount={selectedAccount}
            destinationAccountNumber={formState.destinationAccountNumber}
            amount={formState.amount}
            transferType={formState.transferType}
          />
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
