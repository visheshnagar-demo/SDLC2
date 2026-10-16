import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Scale,
  Search,
  Filter,
  ArrowUpDown,
  ShieldAlert,
  Eye,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";
import RichTable from "../common/RichTable";
import DecisionActionModal from "./DecisionActionModal";
import api from "../../services/api";

export default function UnderwriterReviewQueue() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [riskTypeFilter, setRiskTypeFilter] = useState(
    searchParams.get("risk_type") || "ALL",
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "ALL",
  );
  const [riskTierFilter, setRiskTierFilter] = useState(
    searchParams.get("risk_tier") || "ALL",
  );
  const [sortBy, setSortBy] = useState("score_desc");

  // Selected for Decision Modal
  const [decisionSubmission, setDecisionSubmission] = useState(null);

  const fetchQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUnderwritingQueue();
      // Handle array or wrapped response
      const list = Array.isArray(data)
        ? data
        : data.items || data.submissions || [];
      setSubmissions(list);
    } catch (err) {
      console.error("Failed to fetch underwriting queue:", err);
      // Fallback: try getSubmissions
      try {
        const subData = await api.getSubmissions();
        const list = Array.isArray(subData)
          ? subData
          : subData.items || subData.submissions || [];
        setSubmissions(list);
      } catch (fallbackErr) {
        setError(
          "Unable to load queue submissions. Please ensure backend is reachable.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // Filter & Sort Logic
  const filteredSubmissions = submissions
    .filter((sub) => {
      const matchesSearch =
        !searchQuery ||
        (sub.insured_name &&
          sub.insured_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.carrier_name &&
          sub.carrier_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sub.id && sub.id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRiskType =
        riskTypeFilter === "ALL" ||
        (sub.risk_type &&
          sub.risk_type.toUpperCase() === riskTypeFilter.toUpperCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (sub.status && sub.status.toUpperCase() === statusFilter.toUpperCase());

      const tier = (sub.risk_tier || sub.risk_score?.tier || "").toUpperCase();
      const matchesTier =
        riskTierFilter === "ALL" ||
        tier === riskTierFilter.toUpperCase() ||
        (riskTierFilter === "HIGH_CRITICAL" &&
          (tier === "HIGH" || tier === "CRITICAL"));

      return matchesSearch && matchesRiskType && matchesStatus && matchesTier;
    })
    .sort((a, b) => {
      const scoreA =
        a.composite_score !== undefined
          ? a.composite_score
          : (a.risk_score?.score ?? 0);
      const scoreB =
        b.composite_score !== undefined
          ? b.composite_score
          : (b.risk_score?.score ?? 0);
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      if (sortBy === "score_desc") return scoreB - scoreA;
      if (sortBy === "score_asc") return scoreA - scoreB;
      if (sortBy === "date_desc") return dateB - dateA;
      if (sortBy === "date_asc") return dateA - dateB;
      return 0;
    });

  // Calculate Metrics
  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(
    (s) => !s.status || s.status === "PENDING" || s.status === "UNDER_REVIEW",
  ).length;
  const quotedCount = submissions.filter((s) => s.status === "QUOTED").length;
  const criticalHighCount = submissions.filter((s) => {
    const tier = (s.risk_tier || s.risk_score?.tier || "").toUpperCase();
    return tier === "HIGH" || tier === "CRITICAL";
  }).length;

  const columns = [
    {
      header: "Insured & Carrier",
      key: "insured_name",
      render: (row) => (
        <div>
          <p
            className="font-bold text-[#0F1729] hover:text-[#2461F5] cursor-pointer"
            onClick={() => navigate(`/underwriting/submissions/${row.id}`)}
          >
            {row.insured_name}
          </p>
          <p className="text-xs text-[#66738A]">{row.carrier_name}</p>
        </div>
      ),
    },
    {
      header: "Line & Structure",
      key: "risk_type",
      render: (row) => (
        <div>
          <Badge
            variant={row.risk_type === "CYBER" ? "info" : "primary"}
            size="sm"
          >
            {row.risk_type === "CYBER" ? "Cyber Risk" : "D&O Liability"}
          </Badge>
          <p className="text-xs text-[#0F1729] font-medium mt-1">
            ${(Number(row.requested_limit || 0) / 1000000).toFixed(1)}M limit xs
            ${(Number(row.attachment_point || 0) / 1000000).toFixed(1)}M
          </p>
        </div>
      ),
    },
    {
      header: "Risk Score & Tier",
      key: "composite_score",
      render: (row) => {
        const score =
          row.composite_score !== undefined
            ? row.composite_score
            : (row.risk_score?.score ?? "N/A");
        const tier = (
          row.risk_tier ||
          row.risk_score?.tier ||
          "MEDIUM"
        ).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#0F1729] w-7">
              {score}
            </span>
            <Badge variant={tier.toLowerCase()} size="sm">
              {tier}
            </Badge>
          </div>
        );
      },
    },
    {
      header: "Missing Info Flags",
      key: "missing_flags_count",
      render: (row) => {
        const flagsCount =
          row.missing_flags_count !== undefined
            ? row.missing_flags_count
            : (row.missing_info_flags?.length ?? 0);
        return flagsCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            {flagsCount} Flags
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete
          </span>
        );
      },
    },
    {
      header: "Status",
      key: "status",
      render: (row) => {
        const status = (row.status || "PENDING").toUpperCase();
        return (
          <Badge
            variant={
              status === "QUOTED"
                ? "quoted"
                : status === "DECLINED"
                  ? "declined"
                  : "pending"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => navigate(`/underwriting/submissions/${row.id}`)}
          >
            Inspect
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setDecisionSubmission(row)}
          >
            Decision
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E3E8F0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#66738A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Queue Total
            </span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-[#0F1729]">
            {totalSubmissions}
          </p>
          <p className="text-xs text-[#66738A] mt-1">
            Facultative submissions logged
          </p>
        </div>

        <div className="bg-white border border-[#E3E8F0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#66738A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pending Review
            </span>
            <Scale className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-700">{pendingCount}</p>
          <p className="text-xs text-[#66738A] mt-1">
            Awaiting underwriter bind/quote
          </p>
        </div>

        <div className="bg-white border border-[#E3E8F0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#66738A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Quotes Issued
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{quotedCount}</p>
          <p className="text-xs text-[#66738A] mt-1">Binding terms delivered</p>
        </div>

        <div className="bg-white border border-[#E3E8F0] p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-[#66738A] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Elevated Risk Tiers
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-700">
            {criticalHighCount}
          </p>
          <p className="text-xs text-[#66738A] mt-1">
            High & Critical scored risks
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <Card bodyClassName="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by insured, carrier name, or submission ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#E3E8F0] rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Risk Type Filter */}
            <select
              value={riskTypeFilter}
              onChange={(e) => setRiskTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E3E8F0] rounded-xl text-xs font-semibold text-[#0F1729] focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
            >
              <option value="ALL">All Risk Lines</option>
              <option value="CYBER">Cyber Risk</option>
              <option value="D_AND_O">D&O Liability</option>
            </select>

            {/* Risk Tier Filter */}
            <select
              value={riskTierFilter}
              onChange={(e) => setRiskTierFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E3E8F0] rounded-xl text-xs font-semibold text-[#0F1729] focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW">Low Tier</option>
              <option value="MEDIUM">Medium Tier</option>
              <option value="HIGH">High Tier</option>
              <option value="CRITICAL">Critical Tier</option>
              <option value="HIGH_CRITICAL">High + Critical</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E3E8F0] rounded-xl text-xs font-semibold text-[#0F1729] focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E3E8F0] rounded-xl text-xs font-semibold text-[#0F1729] focus:outline-none focus:ring-2 focus:ring-[#2461F5]"
            >
              <option value="score_desc">Score: Highest First</option>
              <option value="score_asc">Score: Lowest First</option>
              <option value="date_desc">Newest Submissions</option>
              <option value="date_asc">Oldest Submissions</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchQueue}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Review Queue Table */}
      <Card
        title={`Underwriting Review Queue (${filteredSubmissions.length})`}
        subtitle="Prioritized queue ranked by risk evaluation parameters"
        action={
          <Button size="sm" onClick={() => navigate("/carrier/new")}>
            + New Carrier Submission
          </Button>
        }
        bodyClassName="p-0"
      >
        {error ? (
          <div className="p-6 text-center text-rose-600 text-sm">{error}</div>
        ) : (
          <RichTable
            columns={columns}
            data={filteredSubmissions}
            loading={loading}
            emptyMessage="No reinsurance requests match your filters"
            onRowClick={(row) =>
              navigate(`/underwriting/submissions/${row.id}`)
            }
          />
        )}
      </Card>

      {/* Decision Action Modal */}
      <DecisionActionModal
        isOpen={!!decisionSubmission}
        onClose={() => setDecisionSubmission(null)}
        submission={decisionSubmission}
        onDecisionRecorded={(res) => {
          fetchQueue();
        }}
      />
    </div>
  );
}
