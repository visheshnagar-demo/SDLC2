import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Plus,
  RefreshCw,
  Filter,
  Layers,
} from "lucide-react";
import HeaderBar from "../components/layout/HeaderBar";
import KpiCard from "../components/common/KpiCard";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import ReviewQueueTable from "../components/underwriting/ReviewQueueTable";
import api from "../services/api";

export function ReviewQueuePage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL"); // 'ALL' | 'Cyber' | 'D&O'
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'Submitted' | 'In Review' | 'Quoted' | 'Declined'

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      // Attempt queue endpoint or fallback to submissions list
      let data = [];
      try {
        const queueRes = await api.getUnderwritingQueue();
        data = queueRes?.items || queueRes?.submissions || queueRes || [];
      } catch (err) {
        const subRes = await api.getSubmissions();
        data = subRes?.items || subRes?.submissions || subRes || [];
      }

      // If backend returns array directly or inside object
      if (Array.isArray(data)) {
        setSubmissions(data);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to fetch review queue",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      searchTerm === "" ||
      (sub.insured_name &&
        sub.insured_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.carrier_name &&
        sub.carrier_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.id &&
        String(sub.id).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRisk =
      riskFilter === "ALL" ||
      (sub.risk_type &&
        sub.risk_type.toLowerCase().includes(riskFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ||
      (sub.status && sub.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Calculate dynamic KPIs from real submissions
  const totalCount = submissions.length;
  const activeCount = submissions.filter(
    (s) => s.status?.toLowerCase() !== "declined",
  ).length;
  const quotedCount = submissions.filter(
    (s) => s.status?.toLowerCase() === "quoted",
  ).length;
  const flaggedCount = submissions.reduce((acc, curr) => {
    const flags =
      curr.missing_flags_count ??
      (curr.missing_flags ? curr.missing_flags.length : 0);
    return acc + (flags > 0 ? 1 : 0);
  }, 0);

  const avgScore =
    totalCount > 0
      ? Math.round(
          submissions.reduce(
            (acc, curr) => acc + (curr.risk_score || curr.score || 70),
            0,
          ) / totalCount,
        )
      : 74;

  const totalQuotedCapacity = submissions
    .filter((s) => s.status?.toLowerCase() === "quoted")
    .reduce(
      (acc, curr) =>
        acc + Number(curr.limit_requested || curr.capacity_offered || 0),
      0,
    );

  const formatCapacity = (val) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div>
      <HeaderBar
        title="Underwriter Review Queue"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Active Requests"
            value={totalCount > 0 ? String(activeCount) : "0"}
            change={`${totalCount} Total`}
            trend="up"
            icon={Inbox}
            description="Pending & scored facultative submissions"
          />
          <KpiCard
            title="Avg Risk Score"
            value={`${avgScore}/100`}
            change="Composite"
            trend="up"
            icon={ShieldCheck}
            description="Automated underwriting algorithm average"
          />
          <KpiCard
            title="Deficiency Flags"
            value={String(flaggedCount)}
            change="Missing Info"
            trend={flaggedCount > 0 ? "down" : "up"}
            icon={AlertTriangle}
            description="Submissions with document/parameter gaps"
          />
          <KpiCard
            title="Quoted Capacity"
            value={
              totalQuotedCapacity > 0
                ? formatCapacity(totalQuotedCapacity)
                : "$0"
            }
            change={`${quotedCount} Bound`}
            trend="up"
            icon={DollarSign}
            description="Active facultative exposure bound"
          />
        </div>

        {/* Action & Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Filters:
            </span>

            {/* Risk Line Selector */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {["ALL", "Cyber", "D&O"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    riskFilter === r
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r === "ALL" ? "All Risks" : `${r} Line`}
                </button>
              ))}
            </div>

            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="quoted">Quoted</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchQueue}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate("/submit")}
            >
              New Submission
            </Button>
          </div>
        </div>

        {/* Submissions Table */}
        <ReviewQueueTable
          submissions={filteredSubmissions}
          loading={loading}
          error={error}
        />
      </main>
    </div>
  );
}

export default ReviewQueuePage;
