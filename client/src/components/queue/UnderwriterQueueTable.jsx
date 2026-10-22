import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSubmissions } from "../../context/SubmissionContext";
import { useAuth, ROLES } from "../../context/AuthContext";
import SlaAgingBadge from "../common/SlaAgingBadge";
import StatusBadge from "../common/StatusBadge";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Layers,
  AlertCircle,
  Shield,
  Clock,
  FileText,
  CheckCircle2,
} from "lucide-react";

const STATUS_TABS = [
  "All",
  "Received",
  "In Review",
  "Info Requested",
  "Referred",
  "Quoted",
  "Bound",
  "Declined",
];
const LOB_OPTIONS = [
  "All",
  "Cyber Risk",
  "D&O",
  "E&O",
  "EPLI",
  "Medical Professional Liability",
];

export default function UnderwriterQueueTable() {
  const { submissions, loading, error, filters, setFilters } = useSubmissions();
  const { currentRole, roles } = useAuth();
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleTabChange = (tab) => {
    setFilters((prev) => ({ ...prev, status: tab }));
  };

  const handleLobChange = (lob) => {
    setFilters((prev) => ({ ...prev, lineOfBusiness: lob }));
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Sort submissions
  const sortedSubmissions = [...submissions].sort((a, b) => {
    let factor = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "date") {
      return (new Date(a.createdAt) - new Date(b.createdAt)) * factor;
    }
    if (sortBy === "limit") {
      return (a.policyLimit - b.policyLimit) * factor;
    }
    if (sortBy === "score") {
      return (a.riskScore - b.riskScore) * factor;
    }
    if (sortBy === "sla") {
      return (a.slaElapsedHours - b.slaElapsedHours) * factor;
    }
    return 0;
  });

  // KPI calculations
  const totalQueue = submissions.length;
  const redAlertCount = submissions.filter(
    (s) =>
      s.slaElapsedHours > 48 && s.status !== "Bound" && s.status !== "Declined",
  ).length;
  const totalLimitExposed = submissions.reduce(
    (sum, s) => sum + (s.policyLimit || 0),
    0,
  );
  const referredCount = submissions.filter(
    (s) => s.status === "Referred" || s.isReferred,
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Queue KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Queue
            </span>
            <span className="p-2 bg-blue-50 text-primary rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {totalQueue}
            </span>
            <span className="text-xs text-slate-500">Submissions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              SLA Red Alerts (&gt;48h)
            </span>
            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-red-600">
              {redAlertCount}
            </span>
            <span className="text-xs text-slate-500">Aging Submissions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Requested Limit
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Shield className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              ${(totalLimitExposed / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs text-slate-500">Aggregate Capacity</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Manager Referrals
            </span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700">
              {referredCount}
            </span>
            <span className="text-xs text-slate-500">Over-Authority Risks</span>
          </div>
        </div>
      </div>

      {/* Main Review Queue Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 pt-3 flex flex-wrap gap-1 sm:gap-2">
          {STATUS_TABS.map((tab) => {
            const active = (filters.status || "All") === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  active
                    ? "border-primary text-primary bg-white shadow-xs"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by insured, ID, cedent..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <label
                htmlFor="queue-lob-select"
                className="text-xs font-medium text-slate-600"
              >
                Line:
              </label>
              <select
                id="queue-lob-select"
                aria-label="Line of Business Filter"
                value={filters.lineOfBusiness || "All"}
                onChange={(e) => handleLobChange(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary"
              >
                {LOB_OPTIONS.map((lob) => (
                  <option key={lob} value={lob}>
                    {lob}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <label
                htmlFor="queue-sort-select"
                className="text-xs font-medium text-slate-600"
              >
                Sort:
              </label>
              <select
                id="queue-sort-select"
                aria-label="Queue Sort Order"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary"
              >
                <option value="date">Date Created</option>
                <option value="limit">Requested Limit</option>
                <option value="score">Risk Score</option>
                <option value="sla">SLA Aging</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Loading underwriting queue...
            </div>
          ) : sortedSubmissions.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">
                No submissions found
              </div>
              <p className="text-xs text-slate-500">
                Adjust your filters or submit a new facultative risk.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Submission ID</th>
                  <th className="py-3 px-4">Cedent Insurer</th>
                  <th className="py-3 px-4">Insured Entity</th>
                  <th className="py-3 px-4">Line of Business</th>
                  <th className="py-3 px-4 text-right">Requested Limit</th>
                  <th className="py-3 px-4 text-right">Attachment Point</th>
                  <th className="py-3 px-4 text-center">Composite Score</th>
                  <th className="py-3 px-4 text-center">SLA Aging</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedSubmissions.map((sub) => {
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-primary">
                        <Link
                          to={`/submissions/${sub.id}`}
                          className="hover:underline"
                        >
                          {sub.submissionNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {sub.cedingCompanyName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-semibold">
                        {sub.insuredName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                          {sub.lineOfBusiness}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        ${Number(sub.policyLimit).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        ${Number(sub.attachmentPoint).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            sub.riskScore >= 80
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.riskScore >= 50
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sub.riskScore}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <SlaAgingBadge
                          hours={sub.slaElapsedHours}
                          status={sub.status}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/submissions/${sub.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-xs"
                        >
                          <span>Review Risk</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
