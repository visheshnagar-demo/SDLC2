import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReviewQueue } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import SLAAgingIndicator from "./SLAAgingIndicator";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Card from "../common/Card";
import {
  Search,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  AlertTriangle,
  Building,
  DollarSign,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  FileCheck2,
} from "lucide-react";

export const ReviewQueueTable = () => {
  const navigate = useNavigate();
  const { isCedingUser, currentUser } = useAuth();
  const [queueData, setQueueData] = useState({ items: [], total: 0, kpis: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [lobFilter, setLobFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getReviewQueue({
        status: statusFilter,
        line_of_business: lobFilter,
        search,
      });
      setQueueData(data);
    } catch (err) {
      console.error("Failed to load queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter, lobFilter]);

  // Handle client-side sorting & search filtering
  let filteredItems = (queueData.items || []).filter((item) => {
    // If external ceding company user, only show their own submissions (RBAC)
    if (isCedingUser && currentUser.organization) {
      if (item.ceding_company !== currentUser.organization) {
        return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      const matchInsured = item.insured_name.toLowerCase().includes(q);
      const matchCedent = item.ceding_company.toLowerCase().includes(q);
      const matchNumber = item.submission_number.toLowerCase().includes(q);
      return matchInsured || matchCedent || matchNumber;
    }
    return true;
  });

  filteredItems.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === "risk_score") {
      valA = a.risk_score?.composite_score || 0;
      valB = b.risk_score?.composite_score || 0;
    } else if (sortBy === "policy_limit") {
      valA = Number(a.policy_limit) || 0;
      valB = Number(b.policy_limit) || 0;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Underwriter Review & Triage Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sortable specialty lines risk portfolio with configurable SLA
            monitoring and authority escalations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQueue}
            icon={RefreshCw}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/submissions/new")}
            icon={PlusCircle}
          >
            New Risk Submission
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Review
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {queueData.kpis?.total_pending || 0}
            </h3>
            <p className="text-[11px] text-sky-600 font-medium mt-0.5">
              Active underwriter triage
            </p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Filter className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              SLA Breached / Aging
            </p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">
              {queueData.kpis?.sla_breached || 0}
            </h3>
            <p className="text-[11px] text-rose-500 font-medium mt-0.5">
              &gt; 48 hours without quote
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Prime Risk Score (&gt;80)
            </p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
              {queueData.kpis?.high_score_count || 0}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Low risk quality tier
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Exposure Cap
            </p>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">
              ${queueData.kpis?.total_exposure_m || 0}M
            </h3>
            <p className="text-[11px] text-indigo-500 font-medium mt-0.5">
              Combined layer limit
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm" bodyClassName="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by insured entity, ceding insurer, or submission ref #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span className="font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="RECEIVED">Received</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="INFO_REQUESTED">Info Requested</option>
                <option value="QUOTED">Quoted</option>
                <option value="BOUND">Bound</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-600">
              <span className="font-semibold">Line:</span>
              <select
                value={lobFilter}
                onChange={(e) => setLobFilter(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
              >
                <option value="ALL">All Specialty Lines</option>
                <option value="Cyber Risk">Cyber Risk</option>
                <option value="D&O">D&O</option>
                <option value="E&O">E&O</option>
                <option value="EPLI">EPLI</option>
                <option value="Medical Professional Liability">
                  Medical Professional Liability
                </option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Queue Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-200 border-b border-slate-800 uppercase tracking-wider font-semibold text-[11px]">
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                  onClick={() => toggleSort("submission_number")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Submission #</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Ceding Insurer & Insured</th>
                <th className="py-3.5 px-4">Line of Business</th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                  onClick={() => toggleSort("policy_limit")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Layer Limit</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                  onClick={() => toggleSort("risk_score")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-4">SLA Aging</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Underwriting Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">
                      No facultative risk submissions found matching filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((sub) => {
                  const score = sub.risk_score?.composite_score;
                  const isReferralRequired = sub.referral?.required;
                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/submissions/${sub.id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        {sub.submission_number}
                        {isReferralRequired && (
                          <span className="block text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded mt-0.5 font-sans font-semibold">
                            ⚠️ Mgr Referral
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                          {sub.insured_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {sub.ceding_company}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium border border-slate-200 text-[11px]">
                          {sub.line_of_business}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">
                          ${(sub.policy_limit / 1000000).toFixed(2)}M
                        </div>
                        <div className="text-[10px] text-slate-500">
                          xs ${(sub.attachment_point / 1000000).toFixed(2)}M
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {score !== undefined ? (
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                                score >= 80
                                  ? "bg-emerald-100 text-emerald-800"
                                  : score >= 60
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {score}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {sub.risk_score.risk_grade.replace("_", " ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Unscored
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <SLAAgingIndicator
                          createdAt={sub.created_at}
                          status={sub.status}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={sub.status}
                          label={sub.status.replace("_", " ")}
                        />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/submissions/${sub.id}`)}
                          >
                            Review & Score
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/submissions/${sub.id}/quote`)
                            }
                          >
                            Quote
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewQueueTable;
