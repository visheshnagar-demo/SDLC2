import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Download,
  ShieldCheck,
  CreditCard,
  Landmark,
  Copy,
  Check,
  Filter,
  Search,
  AlertCircle,
} from "lucide-react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import TransactionTable from "../components/accounts/TransactionTable";
import { accountsApi } from "../services/api";

export const AccountDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAccountDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accData = await accountsApi.getAccountById(id);
      setAccount(accData);

      const txData = await accountsApi.getAccountTransactions(id, {
        page,
        size: 10,
      });
      const txList = Array.isArray(txData)
        ? txData
        : txData?.content || txData?.transactions || [];
      setTransactions(txList);
      if (txData?.totalPages) {
        setTotalPages(txData.totalPages);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load account details",
      );
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      (tx.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.id || tx.transactionId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const txType = (tx.type || tx.transactionType || "").toUpperCase();
    const matchesType = typeFilter === "ALL" || txType === typeFilter;

    return matchesSearch && matchesType;
  });

  const accountNumber = account?.accountNumber || `ACC-${id}`;
  const routingNumber = "021000021";
  const swiftCode = "APEXUS33XXX";
  const balance = Number(account?.balance || 0);
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: account?.currency || "USD",
  }).format(balance);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Accounts Portfolio</span>
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-400 text-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAccountDetails}
            className="underline text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Account Header Banner */}
      <div className="bg-[#151B2B] rounded-2xl border border-[#33394A]/60 p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#33394A]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-[#0EA5E9] flex items-center justify-center border border-blue-500/30">
              {account?.type === "SAVINGS" ? (
                <Landmark className="w-6 h-6" />
              ) : (
                <CreditCard className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#F8FAFC]">
                  {account?.type || "CHECKING"} ACCOUNT
                </h1>
                <Badge variant="success" size="sm">
                  {account?.status || "ACTIVE"}
                </Badge>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                Primary Operating Account • {accountNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => alert("Statement download initiated")}
            >
              Export Statement
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => navigate("/transfers")}
            >
              Transfer Funds
            </Button>
          </div>
        </div>

        {/* Account Metadata & Balance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div>
            <span className="text-xs text-[#94A3B8]">Available Balance</span>
            <div className="text-2xl font-bold text-[#F8FAFC] font-mono mt-1">
              {formattedBalance}
            </div>
          </div>

          <div>
            <span className="text-xs text-[#94A3B8]">Account Number</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-semibold text-[#F8FAFC]">
                {accountNumber}
              </span>
              <button
                onClick={() => handleCopy(accountNumber, "acc")}
                className="text-[#94A3B8] hover:text-[#0EA5E9]"
                title="Copy account number"
              >
                {copiedField === "acc" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs text-[#94A3B8]">Routing Number (ABA)</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-semibold text-[#F8FAFC]">
                {routingNumber}
              </span>
              <button
                onClick={() => handleCopy(routingNumber, "routing")}
                className="text-[#94A3B8] hover:text-[#0EA5E9]"
                title="Copy routing number"
              >
                {copiedField === "routing" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs text-[#94A3B8]">SWIFT / BIC Code</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-semibold text-[#F8FAFC]">
                {swiftCode}
              </span>
              <button
                onClick={() => handleCopy(swiftCode, "swift")}
                className="text-[#94A3B8] hover:text-[#0EA5E9]"
                title="Copy SWIFT code"
              >
                {copiedField === "swift" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Transactions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151B2B] p-4 rounded-xl border border-[#33394A]/60">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search statement transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#191F2F] border border-[#33394A] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <div className="flex rounded-lg bg-[#191F2F] p-1 border border-[#33394A]/60 text-xs">
            {["ALL", "CREDIT", "DEBIT"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  typeFilter === type
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Statement Table */}
      <TransactionTable
        transactions={filteredTransactions}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        title="Complete Account Ledger Statement"
      />
    </div>
  );
};

export default AccountDetailsPage;
