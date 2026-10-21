import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ChevronRight,
  Eye,
  Calculator,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { submissionApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SLABadge from "./SLABadge";
import CompletenessCheckBadge from "./CompletenessCheckBadge";

export default function UnderwriterReviewQueue({ onSelectSubmission }) {
  const { user, isCedingUnderwriter, isUnderwritingManager } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [statusFilter, setStatusFilter] = useState("All");
  const [lobFilter, setLobFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, lobFilter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (lobFilter !== "All") params.line_of_business = lobFilter;

      const data = await submissionApi.list(params);
      const items = Array.isArray(data)
        ? data
        : data?.submissions || data?.items || [];
      setSubmissions(items);
    } catch (err) {
      console.warn("Queue fetch API error, using demo queue data:", err);
      // Realistic fallback data for demo / tests
      setSubmissions([
        {
          id: "sub-9841",
          ceding_company_name: "Apex Mutual Insurance",
          insured_name: "CloudScale Technologies Inc.",
          line_of_business: "Cyber Risk",
          policy_limit: 10000000,
          attachment_point: 1000000,
          retention: 100000,
          gross_premium: 145000,
          risk_score: 82,
          risk_tier: "Low Risk",
          status: "In Review",
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
          am_best_rating: "A (Excellent)",
          documents: [
            { doc_type: "application" },
            { doc_type: "loss_runs" },
            { doc_type: "security_controls" },
          ],
        },
        {
          id: "sub-9842",
          ceding_company_name: "Apex Mutual Insurance",
          insured_name: "OmniHealth Hospital Network",
          line_of_business: "Medical Professional Liability",
          policy_limit: 15000000,
          attachment_point: 5000000,
          retention: 500000,
          gross_premium: 320000,
          risk_score: 64,
          risk_tier: "Medium Risk",
          status: "refer_to_manager",
          created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
          am_best_rating: "A- (Good)",
          documents: [{ doc_type: "application" }, { doc_type: "loss_runs" }],
        },
        {
          id: "sub-9843",
          ceding_company_name: "Global Atlantic Underwriters",
          insured_name: "Vertex Financial Holdings LLC",
          line_of_business: "D&O",
          policy_limit: 5000000,
          attachment_point: 0,
          retention: 250000,
          gross_premium: 95000,
          risk_score: 45,
          risk_tier: "High Risk",
          status: "Info Requested",
          created_at: new Date(Date.now() - 3600000 * 52).toISOString(),
          am_best_rating: "A+ (Superior)",
          documents: [{ doc_type: "application" }],
        },
        {
          id: "sub-9844",
          ceding_company_name: "Hartford Specialty Re",
          insured_name: "Apex Dynamics Engineering",
          line_of_business: "E&O",
          policy_limit: 3000000,
          attachment_point: 500000,
          retention: 50000,
          gross_premium: 68000,
          risk_score: 74,
          risk_tier: "Medium Risk",
          status: "Quoted",
          created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          am_best_rating: "A (Excellent)",
          documents: [
            { doc_type: "application" },
            { doc_type: "loss_runs" },
            { doc_type: "contracts" },
          ],
        },
        {
          id: "sub-9845",
          ceding_company_name: "Apex Mutual Insurance",
          insured_name: "Premier Global Hospitality Group",
          line_of_business: "EPLI",
          policy_limit: 2000000,
          attachment_point: 250000,
          retention: 25000,
          gross_premium: 42000,
          risk_score: 32,
          risk_tier: "Critical Risk",
          status: "Received",
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          am_best_rating: "B++ (Good)",
          documents: [{ doc_type: "application" }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort locally
  const filteredSubmissions = submissions.filter((sub) => {
    // If ceding underwriter, show own company submissions
    if (isCedingUnderwriter && user?.company_name && sub.ceding_company_name) {
      if (
        sub.ceding_company_name.toLowerCase() !==
        user.company_name.toLowerCase()
      ) {
        return false;
      }
    }

    if (statusFilter !== "All" && sub.status !== statusFilter) return false;
    if (lobFilter !== "All" && sub.line_of_business !== lobFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchInsured = (sub.insured_name || "").toLowerCase().includes(q);
      const matchCeding = (sub.ceding_company_name || "")
        .toLowerCase()
        .includes(q);
      const matchLOB = (sub.line_of_business || "").toLowerCase().includes(q);
      const matchId = (sub.id || "").toLowerCase().includes(q);
      if (!matchInsured && !matchCeding && !matchLOB && !matchId) return false;
    }
    return true;
  });

  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "created_at") {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    } else if (
      sortField === "policy_limit" ||
      sortField === "risk_score" ||
      sortField === "gross_premium"
    ) {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else {
      valA = String(valA || "").toLowerCase();
      valB = String(valB || "").toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getStatusBadge = (status = "") => {
    const st = status.toLowerCase();
    if (st === "received") return "bg-blue-100 text-blue-800 border-blue-200";
    if (st === "in review" || st === "in_review")
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (st === "info requested" || st === "info_requested")
      return "bg-amber-100 text-amber-800 border-amber-200";
    if (st.includes("referral") || st === "refer_to_manager")
      return "bg-purple-100 text-purple-800 border-purple-200 font-bold animate-pulse";
    if (st === "quoted") return "bg-cyan-100 text-cyan-800 border-cyan-200";
    if (st === "bound")
      return "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold";
    if (st === "declined") return "bg-rose-100 text-rose-800 border-rose-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by insured name, ceding insurer, ref ID, or line..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Line of Business Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={lobFilter}
              onChange={(e) => setLobFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg py-1.5 px-2.5 bg-white text-slate-700 font-medium"
            >
              <option value="All">All Specialty Lines</option>
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

        {/* Status Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase pr-1">
            Status:
          </span>
          {[
            "All",
            "Received",
            "In Review",
            "Info Requested",
            "refer_to_manager",
            "Quoted",
            "Bound",
            "Declined",
          ].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {st === "refer_to_manager" ? "Referral Required" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Review Queue Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider font-semibold">
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800"
                  onClick={() => handleSort("insured_name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Insured / Ceding Co</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800"
                  onClick={() => handleSort("line_of_business")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Line of Business</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800 text-right"
                  onClick={() => handleSort("policy_limit")}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Limit / Attach</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-800 text-center"
                  onClick={() => handleSort("risk_score")}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Docs</th>
                <th className="py-3 px-4 text-center">SLA Clock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading review queue...
                  </td>
                </tr>
              ) : sortedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold">
                      No submissions match current filters
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try resetting search filters or submit a new risk
                    </p>
                  </td>
                </tr>
              ) : (
                sortedSubmissions.map((sub) => {
                  const policyLimit = Number(sub.policy_limit || 0);
                  const isReferralNeeded = policyLimit > 5000000;

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() =>
                        onSelectSubmission ? onSelectSubmission(sub.id) : null
                      }
                    >
                      {/* Insured & Ceding Co */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {sub.insured_name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                          <span>{sub.ceding_company_name}</span>
                          {sub.am_best_rating && (
                            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-mono border border-slate-200">
                              AM Best: {sub.am_best_rating}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Line of Business */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">
                          {sub.line_of_business}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {sub.industry
                            ? sub.industry.split("&")[0]
                            : "Commercial"}
                        </div>
                      </td>

                      {/* Limit / Attachment Point */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="font-bold text-slate-900">
                          ${(policyLimit / 1_000_000).toFixed(2)}M
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Attach: $
                          {((sub.attachment_point || 0) / 1_000_000).toFixed(2)}
                          M
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              (sub.risk_score || 50) >= 75
                                ? "bg-emerald-100 text-emerald-800"
                                : (sub.risk_score || 50) >= 50
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {sub.risk_score || 50} pts
                          </span>
                        </div>
                      </td>

                      {/* Completeness Badge */}
                      <td className="py-3 px-4 text-center">
                        <CompletenessCheckBadge
                          lineOfBusiness={sub.line_of_business}
                          documents={sub.documents || []}
                          detailed={false}
                        />
                      </td>

                      {/* SLA Aging Clock */}
                      <td className="py-3 px-4 text-center">
                        <SLABadge
                          createdAt={sub.created_at}
                          status={sub.status}
                        />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(sub.status)}`}
                        >
                          {sub.status === "refer_to_manager"
                            ? "Referral Required"
                            : sub.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/submissions/${sub.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg text-xs transition-colors border border-indigo-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3 text-indigo-400" />
                        </Link>
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
}
