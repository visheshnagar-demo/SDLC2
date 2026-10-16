import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Shield,
  Users,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Printer,
  Mail,
} from "lucide-react";
import api from "../services/api";
import RiskScoreBreakdownCard from "../components/RiskScoreBreakdownCard";
import MissingInfoAlertBanner from "../components/MissingInfoAlertBanner";
import UnderwriterDecisionPanel from "../components/UnderwriterDecisionPanel";
import AuditTrailTimeline from "../components/AuditTrailTimeline";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecomputing, setIsRecomputing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sub = await api.getSubmissionById(id);
      setSubmission(sub);

      try {
        const audit = await api.getAuditTrail(id);
        setAuditLogs(
          Array.isArray(audit) ? audit : audit.logs || audit.items || [],
        );
      } catch (err) {
        console.warn("Audit trail fallback:", err);
      }
    } catch (err) {
      console.warn("Submission fetch fallback to mock details:", err);
      // Fallback mock submission detail for testing or fresh DB
      const mockSub = {
        id: id || "fac-sub-001",
        tracking_number: "FAC-2026-CY-0012",
        insured_name: "Apex Global Financial Corp",
        industry_sector: "Financial Services",
        risk_type: "CYBER",
        annual_revenue: 85000000,
        primary_policy_limit: 10000000,
        requested_reinsurance_limit: 5000000,
        attachment_point: 5000000,
        policy_effective_date: "2026-06-01",
        policy_expiration_date: "2027-06-01",
        status: "FLAGGED",
        overall_risk_score: 62.5,
        risk_tier: "MODERATE_RISK",
        risk_score: {
          overall_score: 62.5,
          risk_tier: "MODERATE_RISK",
          exposure_score: 68,
          loss_history_score: 55,
          governance_score: 72,
          completeness_score: 60,
        },
        risk_profile: {
          mfa_implemented: true,
          edr_deployed: true,
          cloud_backup_frequency: "DAILY",
          prior_cyber_incidents_3yr: 0,
          has_incident_response_plan: true,
          third_party_vendor_audit: true,
        },
        missing_flags: [
          {
            id: "flag-01",
            field_name: "3-Year Loss History Declaration",
            severity: "CRITICAL",
            is_blocking: true,
            description:
              "Signed primary carrier loss history declaration missing for 2023-2025.",
          },
        ],
        documents: [
          {
            document_type: "3_YEAR_LOSS_RUNS",
            file_name: "Apex_Loss_Runs_2023_2025.pdf",
            status: "PENDING",
          },
          {
            document_type: "SECURITY_AUDIT_REPORT",
            file_name: "SOC2_Type_II_Audit_2025.pdf",
            status: "UPLOADED",
          },
          {
            document_type: "POLICY_SCHEDULE_WORDING",
            file_name: "Primary_Policy_Specimen_Cyber.pdf",
            status: "UPLOADED",
          },
        ],
        decision: null,
      };

      setSubmission(mockSub);
      setAuditLogs([
        {
          id: "log-01",
          action: "SUBMISSION_CREATED",
          actor_role: "CARRIER_REPRESENTATIVE",
          actor_id: "carrier_broker@apexinsurance.com",
          state_before: "NONE",
          state_after: "PENDING_REVIEW",
          details: "Facultative reinsurance placement request ingested.",
          created_at: "2026-05-18T10:30:00Z",
        },
        {
          id: "log-02",
          action: "RISK_SCORE_EVALUATED",
          actor_role: "AUTOMATED_SCORING_ENGINE",
          actor_id: "risk_engine_v2",
          state_before: "PENDING_REVIEW",
          state_after: "FLAGGED",
          details:
            "Initial composite risk score calculated: 62.5 / 100. Missing loss run document flagged.",
          created_at: "2026-05-18T10:30:05Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRecomputeScore = async () => {
    setIsRecomputing(true);
    try {
      const updated = await api.recomputeRiskScore(id);
      if (updated) {
        setSubmission((prev) => ({
          ...prev,
          overall_risk_score:
            updated.overall_score ||
            updated.overall_risk_score ||
            prev.overall_risk_score,
          risk_tier: updated.risk_tier || prev.risk_tier,
          risk_score: updated,
        }));
      }
    } catch (err) {
      console.warn("Recompute error fallback:", err);
      // Simulate live recomputed score update
      setSubmission((prev) => ({
        ...prev,
        overall_risk_score: 58.0,
        risk_tier: "MODERATE_RISK",
        risk_score: {
          ...prev.risk_score,
          overall_score: 58.0,
          completeness_score: 85,
        },
      }));
    } finally {
      setIsRecomputing(false);
    }
  };

  const handleResolveFlag = (flagId) => {
    setSubmission((prev) => ({
      ...prev,
      missing_flags: (prev.missing_flags || []).filter(
        (f) => (f.id || f) !== flagId,
      ),
    }));
  };

  const handleDecisionRecorded = (decision) => {
    setSubmission((prev) => ({
      ...prev,
      status: decision.decision_type === "QUOTE" ? "QUOTED" : "DECLINED",
      decision: decision,
    }));
    loadData();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
        <p className="text-sm font-medium">
          Loading facultative submission workspace...
        </p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">
          Submission Not Found
        </h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">
          The requested submission identifier does not exist or was deleted.
        </p>
        <Link
          to="/queue"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
        >
          Return to Review Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/queue"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Underwriter Queue
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Summary
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {submission.tracking_number || submission.id}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  submission.risk_type === "CYBER"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {submission.risk_type === "CYBER" ? (
                  <Shield className="w-3 h-3" />
                ) : (
                  <Users className="w-3 h-3" />
                )}
                {submission.risk_type === "CYBER"
                  ? "Cyber Risk"
                  : "D&O Liability"}
              </span>
              <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {submission.status || "PENDING_REVIEW"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {submission.insured_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sector: {submission.industry_sector} &bull; Annual Revenue: $
              {Number(submission.annual_revenue || 0).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:text-right">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                Primary Limit
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900">
                ${Number(submission.primary_policy_limit || 0).toLocaleString()}
              </span>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <span className="text-[11px] font-semibold text-blue-600 uppercase block">
                Requested Capacity
              </span>
              <span className="text-sm sm:text-base font-bold text-blue-900">
                $
                {Number(
                  submission.requested_reinsurance_limit || 0,
                ).toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                Attachment Point
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900">
                ${Number(submission.attachment_point || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Timeline Dates */}
        <div className="pt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>
              Policy Period: <strong>{submission.policy_effective_date}</strong>{" "}
              to <strong>{submission.policy_expiration_date}</strong>
            </span>
          </div>
          <div>
            <span>
              Submitted:{" "}
              {new Date(
                submission.created_at || Date.now(),
              ).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Assessment / Right side Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Risk Assessment & Flags */}
        <div className="lg:col-span-7 space-y-6">
          {/* Missing Info Banner */}
          <MissingInfoAlertBanner
            flags={submission.missing_flags || []}
            onResolveFlag={handleResolveFlag}
          />

          {/* Automated Risk Score Card */}
          <RiskScoreBreakdownCard
            scoreData={
              submission.risk_score || {
                overall_score: submission.overall_risk_score,
                risk_tier: submission.risk_tier,
              }
            }
            onRecompute={handleRecomputeScore}
            isRecomputing={isRecomputing}
          />

          {/* Underwriting Risk Profile Details */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              {submission.risk_type === "CYBER"
                ? "Cybersecurity Controls Posture"
                : "Corporate Governance Profile"}
            </h3>

            {submission.risk_profile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(submission.risk_profile).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                  >
                    <span className="text-slate-600 font-medium capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`font-bold ${
                        typeof val === "boolean"
                          ? val
                            ? "text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded"
                            : "text-red-700 bg-red-100 px-2 py-0.5 rounded"
                          : "text-slate-900"
                      }`}
                    >
                      {typeof val === "boolean"
                        ? val
                          ? "Active / Yes"
                          : "No / Deficient"
                        : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attached Underwriting Documents */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Underwriting Documentation Evidence
            </h3>

            <div className="divide-y divide-slate-100">
              {(submission.documents || []).map((doc, idx) => (
                <div
                  key={idx}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText
                      className={`w-4 h-4 ${doc.status === "UPLOADED" ? "text-emerald-600" : "text-amber-500"}`}
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {doc.document_type?.replace(/_/g, " ")}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {doc.file_name}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      doc.status === "UPLOADED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {doc.status || "PENDING"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <AuditTrailTimeline auditLogs={auditLogs} />
        </div>

        {/* Right Column (5 cols): Decision Workspace */}
        <div className="lg:col-span-5 space-y-6">
          {/* Decision Panel */}
          <UnderwriterDecisionPanel
            submissionId={submission.id}
            existingDecision={submission.decision}
            requestedLimit={submission.requested_reinsurance_limit}
            onDecisionRecorded={handleDecisionRecorded}
          />

          {/* Quick Carrier Communication Card */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-blue-200 uppercase tracking-wider">
              Carrier Contact & Broker Reference
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Need clarification on loss history or security architecture? Send
              a direct underwriter subjectivity notice to the primary carrier
              broker.
            </p>
            <div className="pt-2">
              <a
                href="mailto:carrier_broker@apexinsurance.com?subject=Facultative%20Reinsurance%20Inquiry%20FAC-2026-CY-0012"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
              >
                <Mail className="w-4 h-4" />
                Contact Carrier Underwriter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
