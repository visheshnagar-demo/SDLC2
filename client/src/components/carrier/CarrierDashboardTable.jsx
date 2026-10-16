import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  FilePlus,
  RefreshCw,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { api } from "../../services/api";

export const CarrierDashboardTable = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRiskType, setFilterRiskType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSubmissions();
      setSubmissions(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(
        "Unable to load submissions. Please ensure the backend service is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter((item) => {
    const matchesRisk =
      filterRiskType === "ALL" || item.risk_type === filterRiskType;
    const matchesStatus =
      filterStatus === "ALL" || item.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      item.insured_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submission_reference
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesStatus && matchesSearch;
  });

  // Calculate summary metrics
  const totalLimit = filteredSubmissions.reduce(
    (acc, curr) => acc + (Number(curr.sum_insured) || 0),
    0,
  );
  const quotedCount = filteredSubmissions.filter(
    (s) => s.status === "QUOTED",
  ).length;
  const pendingCount = filteredSubmissions.filter(
    (s) => s.status === "SUBMITTED" || s.status === "UNDER_REVIEW",
  ).length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              Active Submissions
            </span>
            <span className="text-2xl font-bold text-textPrimary mt-1 block">
              {filteredSubmissions.length}
            </span>
            <span className="text-xs text-textSecondary mt-0.5 block">
              {pendingCount} awaiting underwriter quote
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              Total Limit Placed
            </span>
            <span className="text-2xl font-bold text-textPrimary mt-1 block">
              ${(totalLimit / 1_000_000).toFixed(1)}M
            </span>
            <span className="text-xs text-textSecondary mt-0.5 block">
              Across Cyber &amp; D&amp;O requests
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-success flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider block">
              Quoted &amp; Bound
            </span>
            <span className="text-2xl font-bold text-textPrimary mt-1 block">
              {quotedCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium mt-0.5 block">
              Decision binding rate
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Carrier Facultative Placements"
        subtitle="Manage and track submitted reinsurance requests and active binding quotes"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchSubmissions}
              loading={loading}
            >
              Refresh
            </Button>
            <Link to="/carrier/submit">
              <Button variant="primary" size="sm" icon={FilePlus}>
                New Submission
              </Button>
            </Link>
          </div>
        }
      >
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by insured, ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-textSecondary">
              <Filter className="w-3.5 h-3.5" />
              <span>Risk:</span>
            </div>
            <select
              value={filterRiskType}
              onChange={(e) => setFilterRiskType(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Risk Types</option>
              <option value="CYBER">Cyber Risk</option>
              <option value="D_AND_O">D&amp;O Risk</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs text-textSecondary ml-2">
              <span>Status:</span>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="QUOTED">Quoted</option>
              <option value="DECLINED">Declined</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-error mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="py-12 text-center text-textSecondary text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
            Loading submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-12 text-center text-textSecondary text-xs">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-medium text-textPrimary text-sm">
              No submissions found
            </p>
            <p className="mt-1">
              {searchQuery || filterRiskType !== "ALL" || filterStatus !== "ALL"
                ? "Try adjusting your search or filters."
                : "Create your first facultative reinsurance submission to begin."}
            </p>
            <Link to="/carrier/submit" className="mt-4 inline-block">
              <Button size="sm" variant="primary" icon={FilePlus}>
                Create Submission
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-textSecondary uppercase tracking-wider bg-gray-50/70">
                  <th className="py-3 px-4 font-semibold">Reference</th>
                  <th className="py-3 px-4 font-semibold">
                    Insured Legal Name
                  </th>
                  <th className="py-3 px-4 font-semibold">Risk Type</th>
                  <th className="py-3 px-4 font-semibold">
                    Limit / Attachment
                  </th>
                  <th className="py-3 px-4 font-semibold">Risk Tier</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-textPrimary">
                      {sub.submission_reference || sub.id?.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-textPrimary">
                        {sub.insured_name}
                      </div>
                      <div className="text-[11px] text-textSecondary">
                        {sub.industry_segment}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          sub.risk_type === "CYBER" ? "cyber" : "d_and_o"
                        }
                      >
                        {sub.risk_type === "CYBER" ? "Cyber" : "D&O"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-textPrimary">
                        ${Number(sub.sum_insured || 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-textSecondary">
                        Att: $
                        {Number(sub.attachment_point || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.risk_tier ? (
                        <Badge variant={sub.risk_tier}>{sub.risk_tier}</Badge>
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={sub.status}>{sub.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to={`/underwriter/submissions/${sub.id}`}>
                        <Button variant="outline" size="sm" icon={Eye}>
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CarrierDashboardTable;
