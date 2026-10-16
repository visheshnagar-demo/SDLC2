import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ArrowUpDown,
  Lock,
  Unlock,
  AlertTriangle,
  ShieldAlert,
  Building,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Flame,
  Zap,
} from "lucide-react";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { api } from "../../services/api";

export const UnderwriterReviewQueueTable = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [riskTypeFilter, setRiskTypeFilter] = useState("ALL");
  const [riskTierFilter, setRiskTierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("risk_score");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnderwritingQueue();
      setQueue(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError("Failed to fetch underwriter review queue from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Filter & Sort Logic
  const filteredQueue = queue
    .filter((item) => {
      const matchesRisk =
        riskTypeFilter === "ALL" || item.risk_type === riskTypeFilter;
      const matchesTier =
        riskTierFilter === "ALL" || item.risk_tier === riskTierFilter;
      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        item.insured_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.carrier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.submission_reference
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRisk && matchesTier && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      let valA = a[sortBy] ?? "";
      let valB = b[sortBy] ?? "";

      if (sortBy === "risk_score") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortBy === "sum_insured") {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // KPI metrics
  const totalSubmissions = queue.length;
  const highRiskCount = queue.filter((i) => i.risk_tier === "HIGH").length;
  const pendingCount = queue.filter(
    (i) => i.status === "SUBMITTED" || i.status === "UNDER_REVIEW",
  ).length;
  const lockedCount = queue.filter((i) =>
    Boolean(i.active_lock_user_id),
  ).length;

  const handleOpenReview = (submissionId) => {
    navigate(`/underwriter/submissions/${submissionId}`);
  };

  return (
    <div className="space-y-6">
      {/* Queue Executive KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              Pending Queue
            </span>
            <span className="text-2xl font-bold text-textPrimary mt-1 block">
              {pendingCount}
            </span>
            <span className="text-[11px] text-textSecondary">
              Out of {totalSubmissions} total requests
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              High Risk Priority
            </span>
            <span className="text-2xl font-bold text-error mt-1 block">
              {highRiskCount}
            </span>
            <span className="text-[11px] text-red-600 font-medium">
              Requires Senior UW Review
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 text-error flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              Active Locks
            </span>
            <span className="text-2xl font-bold text-textPrimary mt-1 block">
              {lockedCount}
            </span>
            <span className="text-[11px] text-textSecondary">
              In-flight underwriting review
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              Decisions Quoted
            </span>
            <span className="text-2xl font-bold text-success mt-1 block">
              {queue.filter((i) => i.status === "QUOTED").length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              Bound or Terms Issued
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-success flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Review Workbench */}
      <Card
        title="Underwriter Review Queue &amp; Risk Workbench"
        subtitle="Automated risk scores, missing information flags, and concurrency-managed review queue"
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchQueue}
            loading={loading}
          >
            Refresh Queue
          </Button>
        }
      >
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by Insured, Carrier, or Ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={riskTypeFilter}
              onChange={(e) => setRiskTypeFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Risk Types</option>
              <option value="CYBER">Cyber Risks</option>
              <option value="D_AND_O">D&amp;O Risks</option>
            </select>

            <select
              value={riskTierFilter}
              onChange={(e) => setRiskTierFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
            </select>

            <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 bg-surface">
              <span className="text-[11px] text-textSecondary">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs py-1.5 bg-transparent focus:outline-none"
              >
                <option value="risk_score">Risk Score</option>
                <option value="sum_insured">Limit (Sum Insured)</option>
                <option value="created_at">Timestamp</option>
              </select>
              <button
                type="button"
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="p-1 hover:text-primary text-textSecondary"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-error mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="py-12 text-center text-textSecondary text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
            Evaluating and scoring risk queue submissions...
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="py-12 text-center text-textSecondary text-xs">
            <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-textPrimary text-sm">
              No submissions in queue
            </p>
            <p className="mt-1">
              There are no pending facultative requests matching current filter
              criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-textSecondary uppercase tracking-wider bg-gray-50/70">
                  <th className="py-3 px-4 font-semibold">Ref &amp; Insured</th>
                  <th className="py-3 px-4 font-semibold">Risk Line</th>
                  <th className="py-3 px-4 font-semibold">
                    Limit &amp; Attachment
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    Risk Score &amp; Tier
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    Missing Info Flags
                  </th>
                  <th className="py-3 px-4 font-semibold">Review Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredQueue.map((item) => {
                  const score = item.risk_score ?? 50;
                  const flags = item.missing_flags || [];
                  const isLocked = Boolean(item.active_lock_user_id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/30 transition-colors ${
                        item.risk_tier === "HIGH" ? "bg-red-50/10" : ""
                      }`}
                    >
                      {/* Ref & Insured */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-textPrimary text-sm">
                          {item.insured_name}
                        </div>
                        <div className="text-[11px] text-textSecondary flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">
                            {item.submission_reference || item.id?.slice(0, 8)}
                          </span>
                          <span>&bull;</span>
                          <span>{item.carrier_name || "Carrier Partner"}</span>
                        </div>
                      </td>

                      {/* Risk Line */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            item.risk_type === "CYBER" ? "cyber" : "d_and_o"
                          }
                        >
                          {item.risk_type === "CYBER" ? "Cyber" : "D&O"}
                        </Badge>
                      </td>

                      {/* Limit & Attachment */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-textPrimary">
                          ${Number(item.sum_insured || 0).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-textSecondary">
                          Att: $
                          {Number(item.attachment_point || 0).toLocaleString()}
                        </div>
                      </td>

                      {/* Risk Score & Tier */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center font-bold text-xs ${
                              score >= 70
                                ? "bg-red-100 text-error"
                                : score >= 40
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-emerald-100 text-success"
                            }`}
                          >
                            <span>{score}</span>
                          </div>
                          <div>
                            <Badge
                              variant={item.risk_tier || "medium"}
                              size="sm"
                            >
                              {item.risk_tier || "Medium"}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      {/* Missing Info Flags */}
                      <td className="py-3.5 px-4">
                        {flags.length > 0 ? (
                          <div className="space-y-1 max-w-[200px]">
                            {flags.slice(0, 2).map((flag, idx) => (
                              <div
                                key={flag.id || idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span className="truncate">
                                  {flag.flag_name || flag.description || flag}
                                </span>
                              </div>
                            ))}
                            {flags.length > 2 && (
                              <div className="text-[10px] text-textSecondary">
                                +{flags.length - 2} more flag(s)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Complete (0 Flags)
                          </span>
                        )}
                      </td>

                      {/* Concurrency / Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <Badge variant={item.status}>{item.status}</Badge>
                          {isLocked && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                              <Lock className="w-3 h-3" />
                              <span>Locked by UW</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={
                            item.risk_tier === "HIGH" ? "danger" : "primary"
                          }
                          size="sm"
                          icon={ExternalLink}
                          onClick={() => handleOpenReview(item.id)}
                        >
                          Review &amp; Decide
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UnderwriterReviewQueueTable;
