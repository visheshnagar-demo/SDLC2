import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAnalyticsDashboard } from "../services/api";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import {
  TrendingUp,
  PieChart,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  DollarSign,
  CheckCircle2,
  RefreshCw,
  Building,
  UserCheck,
} from "lucide-react";

export const ManagerDashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsDashboard();
      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Aggregating executive portfolio analytics...</p>
      </div>
    );
  }

  const {
    kpis,
    submissions_by_line,
    status_breakdown,
    turnaround_trends,
    pending_referrals,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Underwriting Manager Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Portfolio performance, quote-to-bind conversion rates, SLA
            compliance, and limit exposure across specialty lines.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboard}
            icon={RefreshCw}
          >
            Refresh Metrics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/underwriter/queue")}
          >
            Open Triage Queue
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Submissions
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {kpis.total_submissions}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Across 5 specialty lines
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Bound Policies
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {kpis.bound_policies}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
            Inception active
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Quote-to-Bind %
          </span>
          <div className="text-2xl font-extrabold text-sky-600 mt-1 font-mono">
            {kpis.quote_to_bind_ratio_pct}%
          </div>
          <span className="text-[10px] text-sky-700 font-semibold mt-0.5 block">
            Conversion efficiency
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Avg Turnaround
          </span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1 font-mono">
            {kpis.avg_turnaround_hours}h
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
            Target: 24.0h (Pass)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Limit Exposed
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            ${kpis.total_exposed_limit_m}M
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Combined layer limits
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Gross Ceded Premium
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
            ${kpis.total_ceded_premium_m}M
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Total pipeline book
          </span>
        </div>
      </div>

      {/* Specialty Line Portfolio Breakdown Table */}
      <Card
        title="Portfolio Analytics by Specialty Line of Business"
        subtitle="Volume, bound conversion, layer limit exposure, and average premium per submission."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider font-semibold text-[11px] text-slate-600">
                <th className="py-3 px-4">Line of Business</th>
                <th className="py-3 px-4">Total Submissions</th>
                <th className="py-3 px-4">Bound Contracts</th>
                <th className="py-3 px-4">Limit Exposure ($M)</th>
                <th className="py-3 px-4">Avg Gross Premium</th>
                <th className="py-3 px-4">Line Exposure Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {submissions_by_line.map((lob, idx) => {
                const totalExposure = Number(kpis.total_exposed_limit_m) || 1;
                const sharePct = (
                  (Number(lob.total_limit_m) / totalExposure) *
                  100
                ).toFixed(0);
                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {lob.line}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {lob.count}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">
                      {lob.bound}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${lob.total_limit_m}M
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      ${lob.avg_premium_k}k
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px] overflow-hidden">
                        <div
                          className="bg-sky-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(5, sharePct))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {sharePct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two-Column Graphs / Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card
          title="Submission Pipeline Status Distribution"
          subtitle="Active volume across underwriting state machine."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Received",
                count: status_breakdown.RECEIVED,
                color: "border-blue-300 bg-blue-50 text-blue-900",
              },
              {
                label: "In Review",
                count: status_breakdown.IN_REVIEW,
                color: "border-indigo-300 bg-indigo-50 text-indigo-900",
              },
              {
                label: "Info Requested",
                count: status_breakdown.INFO_REQUESTED,
                color: "border-amber-300 bg-amber-50 text-amber-900",
              },
              {
                label: "Quoted",
                count: status_breakdown.QUOTED,
                color: "border-purple-300 bg-purple-50 text-purple-900",
              },
              {
                label: "Bound",
                count: status_breakdown.BOUND,
                color: "border-emerald-300 bg-emerald-50 text-emerald-900",
              },
              {
                label: "Declined",
                count: status_breakdown.DECLINED,
                color: "border-rose-300 bg-rose-50 text-rose-900",
              },
            ].map((st) => (
              <div
                key={st.label}
                className={`p-3 rounded-xl border ${st.color} text-center`}
              >
                <span className="text-[11px] font-semibold uppercase block opacity-80">
                  {st.label}
                </span>
                <span className="text-2xl font-bold font-mono mt-1 block">
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Turnaround Time Trends */}
        <Card
          title="Turnaround Time & SLA Compliance"
          subtitle="Average hours from intake to quote delivery vs 24h SLA target."
        >
          <div className="space-y-3">
            {turnaround_trends.map((t) => (
              <div key={t.month} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">{t.month} 2026</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {t.avg_hours}h{" "}
                    <span className="text-slate-500 font-normal">
                      / {t.sla_target}h target
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${t.avg_hours <= t.sla_target ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${(t.avg_hours / 30) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Escalated Referrals Awaiting Manager Decision */}
      <Card
        title="Pending Manager Referrals"
        subtitle="High-limit submissions exceeding standard underwriter authority limits."
        headerAction={
          <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
            {pending_referrals.length} Pending Approval
          </span>
        }
      >
        {pending_referrals.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
            No pending manager escalations. All risks within individual
            authority limits.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pending_referrals.map((sub) => (
              <div
                key={sub.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sky-700">
                      {sub.submission_number}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {sub.insured_name}
                    </span>
                    <span className="text-slate-500">
                      ({sub.line_of_business})
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Requested:{" "}
                    <strong className="text-slate-800 font-mono">
                      ${(sub.policy_limit / 1000000).toFixed(2)}M
                    </strong>{" "}
                    (Authority Cap: $
                    {(sub.underwriter_limit / 1000000).toFixed(2)}M)
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  icon={UserCheck}
                >
                  Review & Sign-Off
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManagerDashboardPage;
