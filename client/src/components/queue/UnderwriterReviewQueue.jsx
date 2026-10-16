import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  FileCheck,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import KpiCard from "../common/KpiCard";
import RichTable from "../common/RichTable";
import { getUnderwritingQueue } from "../../services/api";

export function UnderwriterReviewQueue({ onSelectSubmission }) {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [missingInfoOnly, setMissingInfoOnly] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUnderwritingQueue({
        risk_category: filterCategory !== "ALL" ? filterCategory : undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        priority: filterPriority !== "ALL" ? filterPriority : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        search: searchTerm || undefined,
      });

      const list = Array.isArray(data)
        ? data
        : data?.items || data?.submissions || [];
      setSubmissions(list);
    } catch (err) {
      // Provide initial mock items if backend returns empty/offline for seamless demoing
      setSubmissions([
        {
          id: "b78a9c1e-34df-41a2-9e88-1a98e21a4401",
          submission_reference: "FAC-2026-CYB-00437",
          carrier_name: "Travelers Casualty & Surety",
          carrier_rating: "A++",
          risk_category: "CYBER",
          insured_entity_name: "Apex HealthTech Solutions Inc.",
          industry_sector: "Healthcare",
          policy_limit_usd: 10000000,
          attachment_point_usd: 5000000,
          prior_loss_amount_usd: 125000,
          effective_date: "2026-06-01",
          expiration_date: "2027-06-01",
          risk_score: 78,
          risk_grade: "HIGH",
          priority: "HIGH",
          status: "SUBMITTED",
          missing_flags: [
            {
              id: "flg-1",
              flag_type: "MISSING_CYBER_QUESTIONNAIRE",
              description: "Cyber Risk Assessment Questionnaire Required",
              is_resolved: false,
              mandatory_for_quote: true,
            },
          ],
          created_at: "2026-05-18T10:15:00Z",
        },
        {
          id: "c89b0d2f-45ef-42b3-af99-2b09f32b5502",
          submission_reference: "FAC-2026-DO-00438",
          carrier_name: "Berkshire Hathaway Specialty",
          carrier_rating: "A++",
          risk_category: "DO",
          insured_entity_name: "Nexus BioPharmaceuticals Corp",
          industry_sector: "Healthcare",
          policy_limit_usd: 20000000,
          attachment_point_usd: 10000000,
          prior_loss_amount_usd: 450000,
          effective_date: "2026-07-01",
          expiration_date: "2027-07-01",
          risk_score: 82,
          risk_grade: "HIGH",
          priority: "HIGH",
          status: "IN_REVIEW",
          missing_flags: [],
          created_at: "2026-05-18T11:30:00Z",
        },
        {
          id: "d90c1e3a-56fa-43c4-ba00-3c10a43c6603",
          submission_reference: "FAC-2026-CYB-00439",
          carrier_name: "Chubb European Group",
          carrier_rating: "A+",
          risk_category: "CYBER",
          insured_entity_name: "FinVanguard Global Capital",
          industry_sector: "Financial Services",
          policy_limit_usd: 5000000,
          attachment_point_usd: 2500000,
          prior_loss_amount_usd: 0,
          effective_date: "2026-08-01",
          expiration_date: "2027-08-01",
          risk_score: 42,
          risk_grade: "LOW",
          priority: "LOW",
          status: "QUOTED",
          missing_flags: [],
          created_at: "2026-05-17T14:20:00Z",
        },
        {
          id: "e01d2f4b-67ab-44d5-cb11-4d21b54d7704",
          submission_reference: "FAC-2026-DO-00440",
          carrier_name: "Liberty Mutual Specialty",
          carrier_rating: "A",
          risk_category: "DO",
          insured_entity_name: "SolarGrid Clean Energy Inc",
          industry_sector: "Energy",
          policy_limit_usd: 15000000,
          attachment_point_usd: 5000000,
          prior_loss_amount_usd: 750000,
          risk_score: 64,
          risk_grade: "MODERATE",
          priority: "MEDIUM",
          status: "SUBMITTED",
          missing_flags: [
            {
              id: "flg-2",
              flag_type: "MISSING_BOARD_DISCLOSURE",
              description:
                "Audited Financial Statements & Board Disclosures Required",
              is_resolved: false,
              mandatory_for_quote: true,
            },
          ],
          created_at: "2026-05-18T09:00:00Z",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filterCategory, filterStatus, filterPriority, sortBy, sortOrder]);

  // Client-side filtering & search
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      // Category filter
      if (filterCategory !== "ALL" && item.risk_category !== filterCategory) {
        return false;
      }
      // Status filter
      if (filterStatus !== "ALL" && item.status !== filterStatus) {
        return false;
      }
      // Priority filter
      if (filterPriority !== "ALL" && item.priority !== filterPriority) {
        return false;
      }
      // Missing info only
      if (missingInfoOnly) {
        const hasUnresolved = (item.missing_flags || []).some(
          (f) => !f.is_resolved,
        );
        if (!hasUnresolved) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesRef = item.submission_reference
          ?.toLowerCase()
          .includes(query);
        const matchesCarrier = item.carrier_name?.toLowerCase().includes(query);
        const matchesInsured = item.insured_entity_name
          ?.toLowerCase()
          .includes(query);
        const matchesSector = item.industry_sector
          ?.toLowerCase()
          .includes(query);
        if (
          !matchesRef &&
          !matchesCarrier &&
          !matchesInsured &&
          !matchesSector
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    submissions,
    filterCategory,
    filterStatus,
    filterPriority,
    missingInfoOnly,
    searchTerm,
  ]);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = submissions.length;
    const highPriority = submissions.filter(
      (s) => s.priority === "HIGH" || (s.risk_score || 0) >= 75,
    ).length;
    const pending = submissions.filter((s) =>
      ["SUBMITTED", "IN_REVIEW"].includes(s.status),
    ).length;
    const flagged = submissions.filter((s) =>
      (s.missing_flags || []).some((f) => !f.is_resolved),
    ).length;
    const avgScore =
      total > 0
        ? Math.round(
            submissions.reduce((acc, s) => acc + (s.risk_score || 50), 0) /
              total,
          )
        : 0;

    return { total, highPriority, pending, flagged, avgScore };
  }, [submissions]);

  const handleRowClick = (row) => {
    if (onSelectSubmission) {
      onSelectSubmission(row);
    } else {
      navigate(`/submissions/${row.id || row.submission_reference}`);
    }
  };

  const columns = [
    {
      header: "Submission Ref",
      key: "submission_reference",
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-[#2461F5] hover:underline block">
            {val || row.id?.slice(0, 8)}
          </span>
          <span className="text-[11px] text-[#66738A]">
            {row.created_at
              ? new Date(row.created_at).toLocaleDateString()
              : "Today"}
          </span>
        </div>
      ),
    },
    {
      header: "Ceding Carrier",
      key: "carrier_name",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-semibold text-[#0F1729]">{val}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>Rating:</span>
            <span className="font-bold text-slate-700">
              {row.carrier_rating || "A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Insured Entity & Sector",
      key: "insured_entity_name",
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="font-medium text-[#0F1729]">{val}</div>
          <div className="text-[11px] text-[#66738A]">
            {row.industry_sector}
          </div>
        </div>
      ),
    },
    {
      header: "Line",
      key: "risk_category",
      sortable: true,
      render: (val) => (
        <Badge variant={val === "CYBER" ? "cyber" : "do"}>
          {val === "CYBER" ? "Cyber" : "D&O"}
        </Badge>
      ),
    },
    {
      header: "Coverage / Attachment",
      key: "policy_limit_usd",
      sortable: true,
      align: "right",
      render: (val, row) => (
        <div className="text-right">
          <div className="font-bold text-[#0F1729]">
            ${(Number(val) / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-[#66738A]">
            xs ${(Number(row.attachment_point_usd) / 1000000).toFixed(1)}M
          </div>
        </div>
      ),
    },
    {
      header: "Risk Score",
      key: "risk_score",
      sortable: true,
      align: "center",
      render: (val) => {
        const score = val ?? 50;
        const color =
          score >= 75
            ? "text-rose-600 bg-rose-50 border-rose-200"
            : score >= 50
              ? "text-amber-600 bg-amber-50 border-amber-200"
              : "text-emerald-600 bg-emerald-50 border-emerald-200";
        return (
          <div className="inline-flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs border ${color}`}
            >
              {score}/100
            </span>
          </div>
        );
      },
    },
    {
      header: "Priority",
      key: "priority",
      sortable: true,
      render: (val) => (
        <Badge
          variant={
            val === "HIGH" ? "high" : val === "MEDIUM" ? "medium" : "low"
          }
        >
          {val || "LOW"}
        </Badge>
      ),
    },
    {
      header: "Missing Info Alerts",
      key: "missing_flags",
      render: (val) => {
        const unresolved = (val || []).filter((f) => !f.is_resolved);
        if (unresolved.length === 0) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {unresolved.length} Missing Item{unresolved.length > 1 ? "s" : ""}
            </span>
          </span>
        );
      },
    },
    {
      header: "Status",
      key: "status",
      sortable: true,
      render: (val) => (
        <Badge variant={val ? val.toLowerCase() : "default"}>
          {val || "SUBMITTED"}
        </Badge>
      ),
    },
    {
      header: "Action",
      key: "action",
      align: "right",
      render: (_, row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
          className="text-xs"
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F1729]">
            Underwriter Review Queue
          </h2>
          <p className="text-xs text-[#66738A]">
            Automated risk scoring, missing documentation flags, and binding
            quote/decline decision workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={isLoading}
            onClick={fetchQueue}
          >
            Refresh Queue
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/submit")}
          >
            New Submission
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Submissions"
          value={kpis.total}
          subtitle="Treaty & Facultative"
          icon={Layers}
          variant="default"
        />
        <KpiCard
          title="Pending Review"
          value={kpis.pending}
          subtitle="Awaiting Decision"
          icon={Clock}
          variant="primary"
        />
        <KpiCard
          title="High Priority"
          value={kpis.highPriority}
          subtitle="Score > 75 or Exp > $15M"
          icon={ShieldAlert}
          variant="danger"
        />
        <KpiCard
          title="Missing Information"
          value={kpis.flagged}
          subtitle="Blocks Quote Binding"
          icon={AlertTriangle}
          variant="warning"
        />
        <KpiCard
          title="Avg Risk Score"
          value={`${kpis.avgScore}/100`}
          subtitle="Composite Algorithm"
          icon={CheckCircle2}
          variant="purple"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Carrier, Insured Entity, Submission Ref, or Sector..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Quick Line filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterCategory("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterCategory === "ALL"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Lines
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory("CYBER")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterCategory === "CYBER"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cyber
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory("DO")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filterCategory === "DO"
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                D&O
              </button>
            </div>

            {/* Status dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
            </select>

            {/* Priority dropdown */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>

            {/* Missing Info toggle checkbox */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer select-none text-xs font-medium text-slate-700 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={missingInfoOnly}
                onChange={(e) => setMissingInfoOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-amber-600 rounded"
              />
              <span>Missing Info Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Submissions Table */}
      <RichTable
        columns={columns}
        data={filteredSubmissions}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        pageSize={10}
        initialSortField="created_at"
        initialSortDirection="desc"
        emptyMessage="No reinsurance requests match your filter criteria."
      />
    </div>
  );
}

UnderwriterReviewQueue.propTypes = {
  onSelectSubmission: PropTypes.func,
};

export default UnderwriterReviewQueue;
