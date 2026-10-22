import React, { useState, useEffect } from "react";
import api from "../../services/api";
import ReferralApprovalCenter from "./ReferralApprovalCenter";
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Clock,
  PieChart,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";

export default function ManagerDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Error fetching manager dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleReferralDecided = async (subId, decisionData) => {
    await api.submitReferralDecision(subId, decisionData);
    fetchMetrics();
  };

  if (loading || !metrics) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">
        Loading executive underwriting portfolio analytics...
      </div>
    );
  }

  const {
    totalSubmissions,
    quoteToBindRatioPercentage,
    averageTurnaroundHours,
    totalExposedLimitAggregate,
    totalExposedLimitByLine,
    submissionsByLine,
    submissionsByStatus,
    pendingReferrals,
  } = metrics;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-primary" />
          <span>Executive Underwriting Dashboard & Portfolio Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Portfolio exposure tracking, quote-to-bind conversion, SLA turnaround
          efficiency, and manager referral approvals.
        </p>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Submissions Volume
            </span>
            <span className="p-2 bg-blue-50 text-primary rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalSubmissions}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+18.2%</span>
            <span>vs previous quarter</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Quote-to-Bind Ratio
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">
            {quoteToBindRatioPercentage}%
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target: &gt; 65.0% (Exceeded)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Avg Turnaround Time
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {averageTurnaroundHours}h
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>SLA Target: &lt; 24h standard</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Limit Exposed
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-900">
            ${(totalExposedLimitAggregate / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span>Aggregated specialty lines capacity</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Exposure Charts & Referral Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Capacity and LOB Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Capacity Exposure by LOB */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-3">
              <span>Submissions & Capacity Volume by Line of Business</span>
              <span className="text-xs font-mono text-slate-500">
                PORTFOLIO WEIGHT
              </span>
            </h3>

            <div className="space-y-4 pt-1">
              {Object.entries(totalExposedLimitByLine).map(
                ([line, exposedLimit]) => {
                  const count = submissionsByLine[line] || 0;
                  const percentage = Math.round(
                    (exposedLimit / totalExposedLimitAggregate) * 100,
                  );

                  return (
                    <div key={line} className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>
                          {line} ({count} active)
                        </span>
                        <span className="font-mono text-slate-900">
                          ${(exposedLimit / 1000000).toFixed(1)}M ({percentage}
                          %)
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all"
                          style={{ width: `${Math.max(8, percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Submissions by Status breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Submissions by Lifecycle Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(submissionsByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center"
                >
                  <div className="text-slate-500 text-[11px] mb-1">
                    {status}
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Pending Manager Referrals (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ReferralApprovalCenter
            pendingReferrals={pendingReferrals}
            onReferralDecided={handleReferralDecided}
          />
        </div>
      </div>
    </div>
  );
}
