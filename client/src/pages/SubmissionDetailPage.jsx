import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth, ROLES } from "../context/AuthContext";
import { useSubmissions } from "../context/SubmissionContext";
import StatusBadge from "../components/common/StatusBadge";
import SlaAgingBadge from "../components/common/SlaAgingBadge";
import RiskScoringBreakdown from "../components/detail/RiskScoringBreakdown";
import AuditTrailTimeline from "../components/detail/AuditTrailTimeline";
import InfoRequestModal from "../components/detail/InfoRequestModal";
import DeclineModal from "../components/detail/DeclineModal";
import {
  Shield,
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Building,
  Calculator,
  Ban,
  CheckCircle,
  MessageSquare,
  Send,
  Upload,
  Lock,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  const { refreshSubmissions } = useSubmissions();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissionById(id);
      setSubmission(data);
    } catch (err) {
      console.error("Error loading submission detail:", err);
      setError("Failed to load submission details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusTransition = async (newStatus, payload = {}) => {
    setActionLoading(true);
    try {
      await api.updateSubmissionStatus(submission.id, newStatus, {
        actor: currentUser.email,
        role: currentUser.roleTitle,
        ...payload,
      });
      await refreshSubmissions();
      await loadData();
    } catch (err) {
      console.error(`Failed to update status to ${newStatus}:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInfoRequest = async (notes) => {
    await handleStatusTransition("Info Requested", {
      infoRequestNote: notes,
      details: `Information Request issued to cedent: "${notes}"`,
    });
  };

  const handleDecline = async (reason) => {
    await handleStatusTransition("Declined", {
      declineReason: reason,
      details: `Submission formally declined. Reason: "${reason}"`,
    });
  };

  const handleBind = async () => {
    if (
      window.confirm(
        "Confirm binding facultative reinsurance contract for this submission?",
      )
    ) {
      await handleStatusTransition("Bound", {
        details:
          "Signed closing slip received. Facultative reinsurance certificate bound and incepted.",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-500 text-sm">
        Loading submission {id}...
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="text-red-600 font-bold text-base">
          Submission not found
        </div>
        <Link
          to="/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Underwriting Review Queue</span>
        </Link>
      </div>
    );
  }

  const isOverAuthority = submission.policyLimit > 5000000;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back button & top navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/queue"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review Queue</span>
        </Link>

        <div className="text-xs text-slate-400 font-mono">
          Last updated:{" "}
          {new Date(
            submission.updatedAt || submission.createdAt,
          ).toLocaleTimeString()}
        </div>
      </div>

      {/* Main Submission Summary Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-extrabold text-lg text-primary bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {submission.submissionNumber}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {submission.insuredName}
              </h1>
              <StatusBadge status={submission.status} />
              {isOverAuthority && (
                <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3 text-purple-700" />
                  Manager Referral Risk (&gt;$5M)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-4">
              <span>
                Cedent:{" "}
                <strong className="text-slate-800">
                  {submission.cedingCompanyName}
                </strong>
              </span>
              <span>
                Line:{" "}
                <strong className="text-slate-800">
                  {submission.lineOfBusiness}
                </strong>
              </span>
              <span>
                Underwriter:{" "}
                <strong className="text-slate-800">
                  {submission.underwriter || "Unassigned"}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">
                SLA Status
              </div>
              <SlaAgingBadge
                hours={submission.slaElapsedHours}
                status={submission.status}
              />
            </div>
          </div>
        </div>

        {/* Workflow Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {submission.status === "Received" && (
              <button
                type="button"
                onClick={() => handleStatusTransition("In Review")}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Move to In Review</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
              <span>Request Info / Docs</span>
            </button>

            {submission.status !== "Declined" &&
              submission.status !== "Bound" && (
                <button
                  type="button"
                  onClick={() => setDeclineModalOpen(true)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5 text-red-600" />
                  <span>Decline Risk</span>
                </button>
              )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/submissions/${submission.id}/quote`}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>
                {submission.quotes && submission.quotes.length > 0
                  ? "Edit / Recalculate Quote"
                  : "Open Quote Builder"}
              </span>
            </Link>

            {submission.status === "Quoted" && (
              <button
                type="button"
                onClick={handleBind}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Bind Policy</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Request Notice Banner if status is Info Requested */}
      {submission.status === "Info Requested" && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <div className="font-bold">
              Awaiting Information from Ceding Insurer
            </div>
            <p>
              {submission.infoRequestNote ||
                "Additional documentation requested by underwriter."}
            </p>
          </div>
        </div>
      )}

      {/* Decline Banner if Declined */}
      {submission.status === "Declined" && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-900 space-y-1">
            <div className="font-bold">Submission Declined</div>
            <p>
              Reason:{" "}
              {submission.declineReason || "Risk exceeded appetite parameters."}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Left (7 cols), Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Metadata, Risk Scoring Engine, Documents */}
        <div className="lg:col-span-7 space-y-6">
          {/* Policy Parameters & Coverage Structure */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Financial & Coverage Terms</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 text-[11px]">
                  Requested Policy Limit
                </div>
                <div className="text-sm font-extrabold font-mono text-slate-900 mt-0.5">
                  ${Number(submission.policyLimit).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 text-[11px]">
                  Attachment Point
                </div>
                <div className="text-sm font-extrabold font-mono text-slate-900 mt-0.5">
                  ${Number(submission.attachmentPoint).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 text-[11px]">
                  Retention / Deductible
                </div>
                <div className="text-sm font-extrabold font-mono text-slate-900 mt-0.5">
                  ${Number(submission.retention).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 text-[11px]">
                  Gross Policy Premium
                </div>
                <div className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5">
                  ${Number(submission.grossPremium).toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 text-[11px]">
                  Policy Inception Date
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5 font-mono">
                  {submission.effectiveDate}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-slate-500 text-[11px]">
                  Policy Expiration Date
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5 font-mono">
                  {submission.expiryDate}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="text-slate-500">Industry: </span>
                <span className="font-semibold text-slate-800">
                  {submission.industry || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Revenue Band: </span>
                <span className="font-semibold text-slate-800">
                  {submission.revenueBand || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Jurisdiction: </span>
                <span className="font-semibold text-slate-800">
                  {submission.jurisdiction || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Rules-Based Risk Scoring Breakdown */}
          <RiskScoringBreakdown
            submission={submission}
            onScoreUpdated={(res) => {
              setSubmission((prev) => ({ ...prev, ...res }));
              loadData();
            }}
          />

          {/* Documents Vault Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>
                  Submitted Underwriting Documents (
                  {submission.documents?.length || 0})
                </span>
              </h3>
            </div>

            <div className="space-y-2">
              {submission.documents && submission.documents.length > 0 ? (
                submission.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">
                          {doc.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Type: {doc.type} • Size: {doc.size}
                        </div>
                      </div>
                    </div>

                    <a
                      href="#download"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`Downloading encrypted copy of ${doc.name}`);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">
                  No documents uploaded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Formal Quotes & Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Quotes Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span>Formal Reinsurance Quotes</span>
              </h3>
              <Link
                to={`/submissions/${submission.id}/quote`}
                className="text-xs text-primary font-bold hover:underline"
              >
                + New Quote
              </Link>
            </div>

            {submission.quotes && submission.quotes.length > 0 ? (
              <div className="space-y-3">
                {submission.quotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-200 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-900">
                        {q.shareOfferedPercentage}% Quota Share Offered
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {q.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                      <div>
                        <span className="text-slate-500 text-[11px]">
                          Ceded Limit:
                        </span>
                        <div className="font-mono font-bold text-slate-900">
                          $
                          {Number(
                            q.cededLimit ||
                              (submission.policyLimit *
                                q.shareOfferedPercentage) /
                                100,
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">
                          Net Premium:
                        </span>
                        <div className="font-mono font-bold text-emerald-700">
                          ${Number(q.netReinsurancePremium).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">
                          Ceding Commission:
                        </span>
                        <div className="font-mono text-slate-800">
                          {q.cedingCommissionPercentage}%
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px]">
                          Created:
                        </span>
                        <div className="text-[11px] text-slate-600">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {q.subjectivities && (
                      <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-slate-200">
                        <strong>Subjectivity:</strong> {q.subjectivities}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 space-y-2">
                <p>No formal quotes created yet for this submission.</p>
                <Link
                  to={`/submissions/${submission.id}/quote`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Launch Quote Builder</span>
                </Link>
              </div>
            )}
          </div>

          {/* Immutable Audit Trail Component */}
          <AuditTrailTimeline auditTrail={submission.auditTrail} />
        </div>
      </div>

      {/* Modals */}
      <InfoRequestModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onSubmit={handleSendInfoRequest}
      />

      <DeclineModal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        onSubmit={handleDecline}
      />
    </div>
  );
}
