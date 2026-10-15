import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Landmark,
} from "lucide-react";
import KpiCard from "../components/common/KpiCard";
import AccountCard from "../components/accounts/AccountCard";
import TransactionTable from "../components/accounts/TransactionTable";
import Button from "../components/common/Button";
import { accountsApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accData = await accountsApi.getAccounts();
      const accountsList = Array.isArray(accData)
        ? accData
        : accData?.content || accData?.data || [];
      setAccounts(accountsList);

      // If accounts exist, fetch recent transactions for the first account
      if (accountsList.length > 0) {
        const firstAccountId = accountsList[0].id || accountsList[0].accountId;
        try {
          const txData = await accountsApi.getAccountTransactions(
            firstAccountId,
            { size: 10 },
          );
          const txList = Array.isArray(txData)
            ? txData
            : txData?.content || txData?.transactions || [];
          setTransactions(txList);
        } catch {
          // If transaction fetch fails, set empty transactions
          setTransactions([]);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load banking accounts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Financial calculations
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (Number(acc.balance) || 0),
    0,
  );
  const checkingAccount = accounts.find(
    (a) => (a.type || "").toUpperCase() === "CHECKING",
  );
  const savingsAccount = accounts.find(
    (a) => (a.type || "").toUpperCase() === "SAVINGS",
  );

  const checkingBalance = checkingAccount ? Number(checkingAccount.balance) : 0;
  const savingsBalance = savingsAccount ? Number(savingsAccount.balance) : 0;

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalBalance);
  const formattedChecking = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(checkingBalance);
  const formattedSavings = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(savingsBalance);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#151B2B] to-[#1a233a] p-6 rounded-2xl border border-[#33394A]/60">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0EA5E9] font-semibold uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            <span>Commercial & Retail Portfolio</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">
            Welcome back, {user?.fullName || user?.username || "Client"}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Real-time multi-account balance summary & high-throughput ledger
            status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchDashboardData}
          >
            Refresh Data
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ArrowUpRight}
            onClick={() => navigate("/transfers")}
          >
            Transfer Funds
          </Button>
        </div>
      </div>

      {/* Error state */}
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
            onClick={fetchDashboardData}
            className="underline text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Net Liquidity"
          value={formattedTotal}
          trend="+4.2% MoM"
          trendType="up"
          subtitle="Combined accounts"
          icon={Wallet}
        />
        <KpiCard
          title="Checking Portfolio"
          value={formattedChecking}
          subtitle={checkingAccount?.accountNumber || "Primary checking"}
          icon={CreditCard}
        />
        <KpiCard
          title="High-Yield Savings"
          value={formattedSavings}
          trend="4.50% APY"
          trendType="up"
          subtitle={savingsAccount?.accountNumber || "Interest bearing"}
          icon={TrendingUp}
        />
        <KpiCard
          title="Active Accounts"
          value={String(accounts.length)}
          subtitle="Direct deposit ready"
          icon={Landmark}
        />
      </div>

      {/* Accounts Breakdown Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F8FAFC]">
              Linked Accounts
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Select an account to view full ledger statement & routing data
            </p>
          </div>
          <span className="text-xs text-[#94A3B8]">
            {accounts.length} active products
          </span>
        </div>

        {loading && accounts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 bg-[#151B2B] rounded-2xl animate-pulse border border-[#33394A]/30"
              ></div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-8 bg-[#151B2B] rounded-2xl border border-[#33394A]/60 text-center space-y-2">
            <p className="text-sm font-medium text-[#F8FAFC]">
              No accounts available
            </p>
            <p className="text-xs text-[#94A3B8]">
              Contact your banking administrator or initialize default
              portfolio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((acc) => (
              <AccountCard
                key={acc.id || acc.accountId}
                account={acc}
                onSelect={(selected) =>
                  navigate(`/accounts/${selected.id || selected.accountId}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Ledger Activity */}
      <div className="space-y-4">
        <TransactionTable
          transactions={transactions}
          loading={loading && transactions.length === 0}
          title="Recent Ledger Transactions"
          showPagination={false}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
