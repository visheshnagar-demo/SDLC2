import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { SLAIndicatorBadge } from "./SLAIndicatorBadge";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Clock,
  FileText,
} from "lucide-react";

const STATUS_VARIANTS = {
  RECEIVED: "info",
  IN_REVIEW: "primary",
  INFO_REQUESTED: "warning",
  QUOTED: "purple",
  BOUND: "success",
  DECLINED: "danger",
  REFERRED: "warning",
};

export const UnderwriterReviewQueue = ({
  submissions = [],
  onRefresh,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [lobFilter, setLobFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Sort Logic
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch =
        !searchTerm ||
        sub.insured_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.ceding_company_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || sub.status === statusFilter;
      const matchesLob =
        lobFilter === "ALL" || sub.line_of_business === lobFilter;

      return matchesSearch && matchesStatus && matchesLob;
    });
  }, [submissions, searchTerm, statusFilter, lobFilter]);

  const sortedSubmissions = useMemo(() => {
    return [...filteredSubmissions].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sortBy === "score_high") {
        return (
          (b.risk_score?.total_score || b.risk_score || 0) -
          (a.risk_score?.total_score || a.risk_score || 0)
        );
      }
      if (sortBy === "limit_high") {
        return (b.policy_limit || 0) - (a.policy_limit || 0);
      }
      return 0;
    });
  }, [filteredSubmissions, sortBy]);

  // Pagination slice
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSubmissions.slice(start, start + pageSize);
  }, [sortedSubmissions, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedSubmissions.length / pageSize) || 1;

  // KPI Metrics
  const stats = useMemo(() => {
    const total = submissions.length;
    const inReview = submissions.filter(
      (s) => s.status === "IN_REVIEW" || s.status === "RECEIVED",
    ).length;
    const highLimitReferrals = submissions.filter(
      (s) => (s.policy_limit || 0) > 5000000,
    ).length;
    const preferredRisks = submissions.filter((s) => {
      const score =
        typeof s.risk_score === "object"
          ? s.risk_score?.total_score
          : s.risk_score;
      return score >= 80;
    }).length;

    return { total, inReview, highLimitReferrals, preferredRisks };
  }, [submissions]);

  const formatCurrency = (val) => {
    if (!val) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Queue
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {stats.total}
            </h3>
            <span className="text-xs text-slate-500">Active Submissions</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Triage / In Review
            </span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {stats.inReview}
            </h3>
            <span className="text-xs text-amber-700">Awaiting UW Decision</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              High Limit Referrals
            </span>
            <h3 className="text-2xl font-bold text-purple-600 mt-1">
              {stats.highLimitReferrals}
            </h3>
            <span className="text-xs text-purple-700">
              &gt;$5M Authority Check
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Preferred Risks (80+)
            </span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.preferredRisks}
            </h3>
            <span className="text-xs text-emerald-700">High Risk Quality</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Insured, SUB ID, or Cedant..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-sm pl-9 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white"
                aria-label="Filter by Status"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECEIVED">Received</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="INFO_REQUESTED">Info Requested</option>
                <option value="QUOTED">Quoted</option>
                <option value="BOUND">Bound</option>
                <option value="DECLINED">Declined</option>
                <option value="REFERRED">Referred</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span>LOB:</span>
              <select
                value={lobFilter}
                onChange={(e) => {
                  setLobFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white"
                aria-label="Filter by Line of Business"
              >
                <option value="ALL">All LOBs</option>
                <option value="CYBER">Cyber Risk</option>
                <option value="DO">D&O Liability</option>
                <option value="EO">E&O Tech</option>
                <option value="EPLI">EPLI</option>
                <option value="MED_MAL">Medical Malpractice</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-slate-300 rounded-md py-1.5 px-2 bg-white"
                aria-label="Sort submissions"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="score_high">Risk Score (High to Low)</option>
                <option value="limit_high">
                  Requested Limit (High to Low)
                </option>
              </select>
            </div>

            {onRefresh && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Submissions Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Sub ID</th>
                <th className="py-3 px-4">Cedant</th>
                <th className="py-3 px-4">Insured Name</th>
                <th className="py-3 px-4">LOB</th>
                <th className="py-3 px-4">Limit / Attach</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">SLA Clock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">
                      No submissions match the selected criteria.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try adjusting filters or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub) => {
                  const scoreVal =
                    typeof sub.risk_score === "object"
                      ? sub.risk_score?.total_score
                      : sub.risk_score;
                  const isReferralNeeded = (sub.policy_limit || 0) > 5000000;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/submissions/${sub.id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {sub.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {sub.ceding_company_name ||
                          sub.ceding_company_id ||
                          "Hartford General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block group-hover:text-blue-600">
                          {sub.insured_name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {sub.industry || "Specialty Risk"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                          {sub.line_of_business}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {formatCurrency(sub.policy_limit)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          xs {formatCurrency(sub.attachment_point)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {scoreVal !== undefined && scoreVal !== null ? (
                          <span
                            className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full text-xs ${
                              scoreVal >= 80
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : scoreVal >= 60
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {scoreVal} / 100
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            Uncalculated
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <SLAIndicatorBadge createdAt={sub.created_at} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={STATUS_VARIANTS[sub.status] || "default"}
                          >
                            {sub.status || "RECEIVED"}
                          </Badge>
                          {isReferralNeeded && sub.status !== "BOUND" && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block w-max">
                              Referral Req
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/submissions/${sub.id}`);
                          }}
                          className="group-hover:shadow-md"
                        >
                          Review & Score
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedSubmissions.length)} of{" "}
              {sortedSubmissions.length} results
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnderwriterReviewQueue;
