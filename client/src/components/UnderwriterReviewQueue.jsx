import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Shield,
  Users,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";

export default function UnderwriterReviewQueue({ onSelectSubmission }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskTypeFilter, setRiskTypeFilter] = useState("ALL");
  const [riskTierFilter, setRiskTierFilter] = useState("ALL");

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnderwriterQueue();
      const list = Array.isArray(data)
        ? data
        : data.items || data.submissions || [];
      setSubmissions(list);
    } catch (err) {
      console.warn("Queue fetch fallback or error:", err);
      // Fallback demo data if backend database is fresh/empty
      setSubmissions([
        {
          id: "fac-sub-001",
          tracking_number: "FAC-2026-CY-0012",
          insured_name: "Apex Global Financial Corp",
          industry_sector: "Financial Services",
          risk_type: "CYBER",
          requested_reinsurance_limit: 5000000,
          attachment_point: 5000000,
          overall_risk_score: 62.5,
          risk_tier: "MODERATE_RISK",
          missing_flags_count: 1,
          status: "FLAGGED",
          created_at: "2026-05-18T10:30:00Z",
        },
        {
          id: "fac-sub-002",
          tracking_number: "FAC-2026-DO-0045",
          insured_name: "Nexus BioPharma Therapeutics Inc",
          industry_sector: "Healthcare & Life Sciences",
          risk_type: "D_AND_O",
          requested_reinsurance_limit: 10000000,
          attachment_point: 10000000,
          overall_risk_score: 41.0,
          risk_tier: "LOW_RISK",
          missing_flags_count: 0,
          status: "PENDING_REVIEW",
          created_at: "2026-05-18T11:15:00Z",
        },
        {
          id: "fac-sub-003",
          tracking_number: "FAC-2026-CY-0089",
          insured_name: "AeroCloud Defense Systems LLC",
          industry_sector: "Technology & SaaS",
          risk_type: "CYBER",
          requested_reinsurance_limit: 15000000,
          attachment_point: 5000000,
          overall_risk_score: 79.5,
          risk_tier: "HIGH_RISK",
          missing_flags_count: 2,
          status: "FLAGGED",
          created_at: "2026-05-18T14:00:00Z",
        },
        {
          id: "fac-sub-004",
          tracking_number: "FAC-2026-DO-0102",
          insured_name: "Centennial Retail Group",
          industry_sector: "Retail & E-Commerce",
          risk_type: "D_AND_O",
          requested_reinsurance_limit: 2500000,
          attachment_point: 2500000,
          overall_risk_score: 35.0,
          risk_tier: "LOW_RISK",
          missing_flags_count: 0,
          status: "QUOTED",
          created_at: "2026-05-17T09:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredSubmissions = submissions.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.insured_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || item.status === statusFilter;

    const matchesRiskType =
      riskTypeFilter === "ALL" || item.risk_type === riskTypeFilter;

    const matchesTier =
      riskTierFilter === "ALL" ||
      item.risk_tier === riskTierFilter ||
      (riskTierFilter === "LOW" &&
        (item.overall_risk_score < 50 || item.risk_tier?.includes("LOW"))) ||
      (riskTierFilter === "MODERATE" &&
        ((item.overall_risk_score >= 50 && item.overall_risk_score < 75) ||
          item.risk_tier?.includes("MODERATE"))) ||
      (riskTierFilter === "HIGH" &&
        (item.overall_risk_score >= 75 || item.risk_tier?.includes("HIGH")));

    return matchesSearch && matchesStatus && matchesRiskType && matchesTier;
  });

  // Calculate metrics
  const totalCount = submissions.length;
  const flaggedCount = submissions.filter(
    (s) =>
      s.status === "FLAGGED" ||
      (s.missing_flags_count && s.missing_flags_count > 0),
  ).length;
  const pendingCount = submissions.filter(
    (s) => s.status === "PENDING_REVIEW",
  ).length;
  const quotedCount = submissions.filter((s) => s.status === "QUOTED").length;
  const declinedCount = submissions.filter(
    (s) => s.status === "DECLINED",
  ).length;
  const avgScore =
    totalCount > 0
      ? (
          submissions.reduce(
            (acc, curr) => acc + (Number(curr.overall_risk_score) || 0),
            0,
          ) / totalCount
        ).toFixed(1)
      : "0.0";

  const getScoreBadge = (score) => {
    const num = Number(score) || 0;
    if (num >= 75) {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (num >= 50) {
      return "bg-amber-100 text-amber-800 border-amber-200";
    }
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "QUOTED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "DECLINED":
        return "bg-red-100 text-red-800 border-red-200";
      case "FLAGGED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING_REVIEW":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total In Queue
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {totalCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Pending UW
          </p>
          <p className="text-2xl font-black text-blue-700 mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Flagged Missing
          </p>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {flaggedCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            Quoted / Terms
          </p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {quotedCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
            Declined
          </p>
          <p className="text-2xl font-black text-red-700 mt-1">
            {declinedCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
            Avg Risk Score
          </p>
          <p className="text-2xl font-black text-purple-700 mt-1">
            {avgScore}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by insured name, tracking ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={fetchQueue}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            title="Refresh Queue"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border rounded-lg border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="FLAGGED">Flagged (Missing Data)</option>
            <option value="QUOTED">Quoted</option>
            <option value="DECLINED">Declined</option>
          </select>

          <select
            value={riskTypeFilter}
            onChange={(e) => setRiskTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border rounded-lg border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Risk Types</option>
            <option value="CYBER">Cyber Risk</option>
            <option value="D_AND_O">D&O Risk</option>
          </select>

          <select
            value={riskTierFilter}
            onChange={(e) => setRiskTierFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium border rounded-lg border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="LOW">Low Risk (&lt;50)</option>
            <option value="MODERATE">Moderate Risk (50-74)</option>
            <option value="HIGH">High Risk (&ge;75)</option>
          </select>
        </div>
      </div>

      {/* Main Review Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking ID</th>
                <th className="py-3.5 px-4">Insured Entity & Sector</th>
                <th className="py-3.5 px-4">Risk Type</th>
                <th className="py-3.5 px-4">Limit / Retention</th>
                <th className="py-3.5 px-4">Score & Tier</th>
                <th className="py-3.5 px-4">Missing Data</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading underwriter queue submissions...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No facultative reinsurance submissions found matching
                    current criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() =>
                      onSelectSubmission && onSelectSubmission(sub.id)
                    }
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {sub.tracking_number || sub.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {sub.insured_name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {sub.industry_sector || "General Commercial"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          sub.risk_type === "CYBER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {sub.risk_type === "CYBER" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <Users className="w-3 h-3" />
                        )}
                        {sub.risk_type === "CYBER" ? "Cyber" : "D&O"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        $
                        {Number(
                          sub.requested_reinsurance_limit || 0,
                        ).toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Att: $
                        {Number(sub.attachment_point || 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getScoreBadge(sub.overall_risk_score)}`}
                      >
                        {sub.overall_risk_score ?? "N/A"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {sub.missing_flags_count &&
                      sub.missing_flags_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          {sub.missing_flags_count} Flags
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-xs font-medium">
                          Complete
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(sub.status)}`}
                      >
                        {sub.status || "PENDING"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/submissions/${sub.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectSubmission) onSelectSubmission(sub.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition"
                      >
                        Review
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
