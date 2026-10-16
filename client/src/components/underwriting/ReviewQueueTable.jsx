import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Filter,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";

export function ReviewQueueTable({
  submissions = [],
  loading = false,
  error = null,
  onSelectSubmission,
}) {
  const navigate = useNavigate();

  const getRiskScoreColor = (score) => {
    if (score === null || score === undefined)
      return "text-slate-400 bg-slate-100 border-slate-200";
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "quoted":
        return <Badge variant="success">Quoted</Badge>;
      case "declined":
        return <Badge variant="danger">Declined</Badge>;
      case "in_review":
      case "in review":
        return <Badge variant="warning">In Review</Badge>;
      case "submitted":
        return <Badge variant="primary">Submitted</Badge>;
      default:
        return <Badge variant="default">{status || "Pending"}</Badge>;
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "$0";
    const num = Number(val);
    if (isNaN(num)) return "$0";
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-sm font-semibold text-slate-700">
          Loading Underwriting Queue...
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Retrieving risk submissions and calculated scores
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center text-rose-800 bg-rose-50/50">
        <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <div className="text-sm font-semibold">Failed to load submissions</div>
        <p className="text-xs text-rose-600 mt-1">{error}</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-800">
          No Reinsurance Requests in Queue
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          All submissions have been triaged or no submissions match the current
          filter criteria.
        </p>
        <Button size="sm" onClick={() => navigate("/submit")}>
          Create New Submission
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Insured / Submission</th>
              <th className="py-3 px-4">Carrier</th>
              <th className="py-3 px-4">Risk Class</th>
              <th className="py-3 px-4 text-right">Limit / Attachment</th>
              <th className="py-3 px-4 text-center">Risk Score</th>
              <th className="py-3 px-4 text-center">Checklist & Flags</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((sub) => {
              const subId = sub.id || sub.submission_id;
              const riskType = sub.risk_type || "Cyber";
              const isCyber = riskType.toLowerCase().includes("cyber");
              const score =
                sub.risk_score !== undefined ? sub.risk_score : sub.score;
              const flagsCount =
                sub.missing_flags_count ??
                (sub.missing_flags ? sub.missing_flags.length : 0);

              return (
                <tr
                  key={subId}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => {
                    if (onSelectSubmission) onSelectSubmission(sub);
                    else navigate(`/submissions/${subId}`);
                  }}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sub.insured_name || sub.insured || "Unnamed Insured"}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      ID: {String(subId).substring(0, 8)}...
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {sub.carrier_name || sub.carrier || "Aegis Partner Carrier"}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={isCyber ? "cyber" : "do"} size="sm">
                      {isCyber ? "Cyber Risk" : "D&O Liability"}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="font-semibold text-slate-800">
                      {formatCurrency(sub.limit_requested || sub.limit)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Att:{" "}
                      {formatCurrency(
                        sub.attachment_point || sub.attachment || 0,
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs border ${getRiskScoreColor(
                        score,
                      )}`}
                    >
                      {score !== null && score !== undefined
                        ? `${score}/100`
                        : "Pending"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {flagsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {flagsCount} {flagsCount === 1 ? "Flag" : "Flags"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Complete
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {getStatusBadge(sub.status)}
                  </td>

                  <td
                    className="py-3.5 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/submissions/${subId}`)}
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReviewQueueTable;
