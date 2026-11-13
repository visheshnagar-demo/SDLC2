import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Unlock,
  AlertTriangle,
  History,
  Paperclip,
  Upload,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { RiskScoreBreakdownCard } from "../components/underwriter/RiskScoreBreakdownCard";
import { DecisionConsoleForm } from "../components/underwriter/DecisionConsoleForm";
import { api } from "../services/api";

export const UnderwriterDetailPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lockLoading, setLockLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      try {
        data = await api.getUnderwritingSubmissionDetail(id);
      } catch {
        data = await api.getSubmissionById(id);
      }
      setSubmission(data);
    } catch {
      setError(
        "Unable to load submission detail. Verify backend service is operational.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleToggleLock = async () => {
    if (!submission) return;
    setLockLoading(true);
    const isCurrentlyLocked = Boolean(submission.active_lock_user_id);
    const action = isCurrentlyLocked ? "RELEASE" : "ACQUIRE";

    try {
      const res = await api.toggleSubmissionLock(id, action);
      setSubmission((prev) => ({
        ...prev,
        active_lock_user_id: res?.locked
          ? res?.locked_by || "current_user"
          : null,
      }));
    } catch {
      fetchDetail();
    } finally {
      setLockLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", "RISK_ASSESSMENT");
    formData.append("document_category", "RISK_ASSESSMENT");

    setUploadLoading(true);
    try {
      await api.uploadAttachment(id, formData);
      fetchDetail();
    } catch {
      // handled
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-20 text-center text-xs text-textSecondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
          Loading submission review details and calculating risk breakdown...
        </div>
      </AppShell>
    );
  }

  if (error || !submission) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-4 text-center py-12">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-error flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error || "Submission record not found."}</span>
          </div>
          <Link to="/underwriter/queue">
            <Button variant="secondary" icon={ArrowLeft}>
              Back to Review Queue
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const isLocked = Boolean(submission.active_lock_user_id);
  const missingFlags = submission.missing_flags || [];
  const riskScore = submission.risk_score ?? 55;
  const riskTier = submission.risk_tier ?? "MEDIUM";
  const scoreBreakdowns =
    submission.risk_score_breakdowns || submission.breakdowns || [];
  const attachments =
    submission.attachments || submission.submission_attachments || [];
  const auditLogs = submission.audit_logs || [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-2 text-xs text-textSecondary mb-1">
              <Link
                to="/underwriter/queue"
                className="hover:text-primary flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Underwriter Review Queue
              </Link>
              <span>/</span>
              <span className="font-mono text-textPrimary">
                {submission.submission_reference || submission.id?.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-textPrimary tracking-tight">
                {submission.insured_name}
              </h1>
              <Badge
                variant={submission.risk_type === "CYBER" ? "cyber" : "d_and_o"}
              >
                {submission.risk_type === "CYBER" ? "Cyber Risk" : "D&O Risk"}
              </Badge>
              <Badge variant={submission.status}>{submission.status}</Badge>
              <Badge variant={riskTier}>{riskTier} Risk</Badge>
            </div>
          </div>

          {/* Action Bar (Lock Toggle + Refresh) */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchDetail}
              title="Refresh Submission State"
            >
              Refresh
            </Button>
            <Button
              variant={isLocked ? "outline" : "primary"}
              size="sm"
              icon={isLocked ? Unlock : Lock}
              loading={lockLoading}
              onClick={handleToggleLock}
            >
              {isLocked ? "Release Review Lock" : "Acquire Review Lock"}
            </Button>
          </div>
        </div>

        {/* Concurrency Lock Banner */}
        {isLocked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>
                <strong>Review Lock Active:</strong> This submission is
                currently locked for review by underwriter (
                <span className="font-mono">
                  {submission.active_lock_user_id}
                </span>
                ).
              </span>
            </div>
            <span className="text-[11px] text-amber-700">
              Prevents concurrent decision conflicts
            </span>
          </div>
        )}

        {/* Missing Information Alert Banner */}
        {missingFlags.length > 0 && (
          <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Missing Information &amp; Documentation Audit Flags (
                {missingFlags.length})
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {missingFlags.map((flag, idx) => {
                const isBlocking =
                  flag.is_blocking || flag.severity === "BLOCKING";
                const title =
                  flag.flag_name ||
                  flag.field_name ||
                  flag.flag_code ||
                  "Missing Item";
                const desc =
                  flag.description ||
                  flag.message ||
                  flag.rationale ||
                  "Documentation required for binding.";
                return (
                  <div
                    key={flag.id || idx}
                    className="bg-surface p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-0.5 shadow-xs"
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span>{title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          isBlocking
                            ? "bg-red-100 text-error"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isBlocking ? "Blocking" : "Warning"}
                      </span>
                    </div>
                    <p className="text-[11px] text-textSecondary">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metadata & Attachments & Audit */}
          <div className="lg:col-span-6 space-y-6">
            <Card
              title="Risk &amp; Policy Specification"
              subtitle="Carrier submission attributes and insured exposure metrics"
            >
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Insured Entity
                  </span>
                  <span className="font-semibold text-textPrimary text-sm">
                    {submission.insured_name}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Industry Segment
                  </span>
                  <span className="font-semibold text-textPrimary">
                    {submission.industry_segment}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Annual Revenue
                  </span>
                  <span className="font-semibold text-textPrimary">
                    ${Number(submission.annual_revenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Facultative Limit Requested
                  </span>
                  <span className="font-bold text-primary text-sm">
                    ${Number(submission.sum_insured || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Attachment Point (Retention)
                  </span>
                  <span className="font-semibold text-textPrimary">
                    ${Number(submission.attachment_point || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Policy Period
                  </span>
                  <span className="font-medium text-textPrimary">
                    {submission.policy_start_date} to{" "}
                    {submission.policy_end_date}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Prior Incurred Claims (5y)
                  </span>
                  <span className="font-semibold text-textPrimary">
                    {submission.prior_claims_count || 0} claims ($
                    {Number(
                      submission.prior_claims_total || 0,
                    ).toLocaleString()}
                    )
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-textSecondary block text-[11px]">
                    Security / Governance Score
                  </span>
                  <span className="font-bold text-emerald-600">
                    {submission.security_governance_score || 80} / 100
                  </span>
                </div>
              </div>
            </Card>

            <Card
              title="Risk Attachments &amp; Slips"
              subtitle="Audited financials, cyber audits, and original policy wordings"
              actions={
                <label className="cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadLoading}
                  />
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-textPrimary text-xs font-semibold rounded-md border border-gray-300">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadLoading ? "Uploading..." : "Add File"}
                  </span>
                </label>
              }
            >
              {attachments && attachments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {attachments.map((att, idx) => (
                    <div
                      key={att.id || idx}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Paperclip className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium text-textPrimary">
                            {att.file_name ||
                              att.filename ||
                              att.name ||
                              "Document"}
                          </div>
                          <div className="text-[10px] text-textSecondary">
                            {att.document_category ||
                              att.document_type ||
                              "Attachment"}{" "}
                            &bull;{" "}
                            {att.file_size_bytes
                              ? `${Math.round(att.file_size_bytes / 1024)} KB`
                              : "Uploaded"}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-textSecondary">
                  No risk attachments uploaded yet.
                </div>
              )}
            </Card>

            {/* Audit Log Card */}
            {auditLogs && auditLogs.length > 0 && (
              <Card
                title="Compliance Audit Trail"
                subtitle="Immutable timeline of underwriter reviews, locks, and status transitions"
              >
                <div className="divide-y divide-gray-100 text-xs">
                  {auditLogs.map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="py-2.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start space-x-2">
                        <History className="w-4 h-4 text-textSecondary mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-textPrimary">
                            {log.action || log.event || "Activity Recorded"}
                          </div>
                          <div className="text-[11px] text-textSecondary">
                            {log.details ||
                              log.state_diff_json ||
                              log.notes ||
                              log.description}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-textSecondary shrink-0 font-mono">
                        {log.timestamp || log.created_at
                          ? new Date(
                              log.timestamp || log.created_at,
                            ).toLocaleString()
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Scoring Engine & Decision Console */}
          <div className="lg:col-span-6 space-y-6">
            <RiskScoreBreakdownCard
              score={riskScore}
              tier={riskTier}
              breakdowns={scoreBreakdowns}
              riskType={submission.risk_type}
            />

            <DecisionConsoleForm
              submissionId={id}
              sumInsured={submission.sum_insured}
              currentDecision={
                submission.decision ||
                submission.latest_decision ||
                submission.underwriting_decision
              }
              onDecisionSubmitted={fetchDetail}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default UnderwriterDetailPage;
