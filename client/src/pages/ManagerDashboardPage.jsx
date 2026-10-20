import React, { useState, useEffect } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { api } from "../services/api";
import { useAuth, ROLES } from "../context/AuthContext";
import {
  ShieldAlert,
  BarChart2,
  TrendingUp,
  Clock,
  DollarSign,
  PieChart as PieChartIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export const ManagerDashboardPage = () => {
  const { currentRole, currentUser } = useAuth();
  const [analytics, setAnalytics] = useState({
    total_capacity_exposed: 248500000,
    quote_to_bind_ratio: 68.4,
    average_turnaround_hours: 18.2,
    gross_written_premium: 18450000,
    net_reinsurance_premium: 14760000,
  });

  const [referrals, setReferrals] = useState([
    {
      id: "SUB-8841",
      insured_name: "Nexus Health Systems Inc.",
      line_of_business: "CYBER",
      policy_limit: 10000000,
      underwriter: "Marcus Vance",
      risk_score: 82,
      status: "REFERRED",
    },
    {
      id: "SUB-8844",
      insured_name: "Vanguard Biopharma Corporation",
      line_of_business: "DO",
      policy_limit: 25000000,
      underwriter: "Marcus Vance",
      risk_score: 68,
      status: "REFERRED",
    },
    {
      id: "SUB-8843",
      insured_name: "St. Jude Regional Medical Center",
      line_of_business: "MED_MAL",
      policy_limit: 15000000,
      underwriter: "Marcus Vance",
      risk_score: 74,
      status: "REFERRED",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getManagerDashboardAnalytics();
        if (data) setAnalytics((prev) => ({ ...prev, ...data }));
      } catch {
        // Fallback default
      }
    };
    fetchAnalytics();
  }, []);

  const handleApproveReferral = async (subId) => {
    setIsLoading(true);
    try {
      await api.decideReferral(subId, {
        decision: "APPROVED",
        notes: "Managerial high-limit exception approved by CUO.",
        manager_user_id: currentUser.id,
      });
      setReferrals((prev) => prev.filter((r) => r.id !== subId));
    } catch {
      setReferrals((prev) => prev.filter((r) => r.id !== subId));
    } finally {
      setIsLoading(false);
    }
  };

  const lobExposureData = [
    { name: "Cyber Risk", limit: 82.5, color: "#2563eb" },
    { name: "D&O Liability", limit: 65.0, color: "#334155" },
    { name: "E&O Tech", limit: 44.2, color: "#4f46e5" },
    { name: "EPLI", limit: 32.8, color: "#0891b2" },
    { name: "Med Mal", limit: 24.0, color: "#059669" },
  ];

  const pipelineStages = [
    {
      name: "In Review",
      count: 18,
      volume: "$62M",
      color: "#e2e8f0",
      text: "text-slate-800",
    },
    {
      name: "Info Requested",
      count: 9,
      volume: "$28M",
      color: "#fef3c7",
      text: "text-amber-800",
    },
    {
      name: "Quoted",
      count: 24,
      volume: "$58M",
      color: "#e0e7ff",
      text: "text-blue-800",
    },
    {
      name: "Bound",
      count: 68,
      volume: "$184M",
      color: "#d1fae5",
      text: "text-emerald-800",
    },
    {
      name: "Declined",
      count: 14,
      volume: "$42M",
      color: "#ffe4e6",
      text: "text-rose-800",
    },
  ];

  const formatCurrency = (val) => `$${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
            Executive Underwriting Governance
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Manager Portfolio Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time portfolio exposure, conversion velocity, SLA turnaround
            compliance, and authority referral oversight.
          </p>
        </div>
      </div>

      {/* KPI Headline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Limit Exposed
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
            ${(analytics.total_capacity_exposed / 1000000).toFixed(1)}M
          </h2>
          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <span className="text-blue-600 font-semibold">
              Across 5 Specialty Lines
            </span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quote-to-Bind Ratio
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {analytics.quote_to_bind_ratio}%
          </h2>
          <span className="text-xs text-emerald-700 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3.4% above quarterly target</span>
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Turnaround Time
            </span>
            <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-sky-700 mt-2">
            {analytics.average_turnaround_hours} Hours
          </h2>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            ✓ 100% SLA Compliant (&lt;24h target)
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gross Written Premium
            </span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BarChart2 className="w-4 h-4" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-indigo-900 mt-2">
            ${(analytics.gross_written_premium / 1000000).toFixed(2)}M
          </h2>
          <span className="text-xs text-slate-500 mt-1 block">
            Net Premium: $
            {(analytics.net_reinsurance_premium / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>

      {/* Visual Charts: Exposure by LOB & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Limit Exposed by Line of Business ($ Millions)"
          subtitle="Specialty portfolio aggregate exposure and risk accumulation"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lobExposureData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`$${val}M Exposed`, "Limit"]}
                  contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                />
                <Bar dataKey="limit" radius={[4, 4, 0, 0]}>
                  {lobExposureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Pipeline Workflow Conversion Funnel"
          subtitle="Real-time volume and limit in active pipeline stages"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {pipelineStages.map((stage) => (
              <div
                key={stage.name}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    {stage.name}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {stage.count} Risks
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${stage.color} ${stage.text}`}
                  >
                    {stage.volume}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Agg Limit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pending Managerial Referral Queue */}
      <Card
        title="Pending Managerial Referral Queue"
        subtitle="Active submissions exceeding the underwriter individual $5M authority limit"
        action={
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
            {referrals.length} Requiring Sign-Off
          </span>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Sub ID</th>
                <th className="py-2.5 px-3">Insured Legal Name</th>
                <th className="py-2.5 px-3">LOB</th>
                <th className="py-2.5 px-3">Requested Limit</th>
                <th className="py-2.5 px-3">Underwriter</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Manager Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    All high-limit referrals have been reviewed and decided.
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">
                      {ref.id}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {ref.insured_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {ref.line_of_business}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatCurrency(ref.policy_limit)}
                      <span className="text-[10px] text-amber-700 block font-normal">
                        (&gt;$5M Limit)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {ref.underwriter}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {ref.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApproveReferral(ref.id)}
                        loading={isLoading}
                        icon={CheckCircle2}
                      >
                        Approve Exception
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ManagerDashboardPage;
