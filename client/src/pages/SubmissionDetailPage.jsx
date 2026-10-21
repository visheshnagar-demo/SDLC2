import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  Calculator,
  History,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  Lock,
} from "lucide-react";
import { submissionApi, quoteApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SLABadge from "../components/SLABadge";
import CompletenessCheckBadge from "../components/CompletenessCheckBadge";
import RiskScoringBreakdown from "../components/RiskScoringBreakdown";
import InteractiveQuoteBuilder from "../components/InteractiveQuoteBuilder";
import ManagerReferralModal from "../components/ManagerReferralModal";
import AuditTrailViewer from "../components/AuditTrailViewer";

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const {
    user,
    isCedingUnderwriter,
    isReinsuranceUnderwriter,
    isUnderwritingManager,
    authorityLimit,
  } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [quote, setQuote] = useState(null);
  const [activeTab, setActiveTab] = useState("scoring"); // 'scoring' | 'quote' | 'docs' | 'audit'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [defaultDecisionAction, setDefaultDecisionAction] =
    useState("in_review");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const subData = await submissionApi.getById(id);
      setSubmission(subData);

      try {
        const quoteData = await quoteApi.getCurrent(id);
        setQuote(quoteData);
      } catch (qErr) {
        // Quote may not exist yet
      }
    } catch (err) {
      console.warn(
        "Submission API getById failed, using realistic mock for id",
        id,
        err,
      );
      // Realistic fallback for demo/testing
      const fallbackSub = {
        id: id || "sub-9841",
        ceding_company_name: "Apex Mutual Insurance",
        insured_name: "CloudScale Technologies Inc.",
        line_of_business: "Cyber Risk",
        policy_limit: 10000000,
        attachment_point: 1000000,
        retention: 100000,
        gross_premium: 145000,
        effective_date: "2026-06-01",
        expiry_date: "2027-06-01",
        industry: "Technology & Cloud Infrastructure",
        revenue_band: "$100M - $500M (Upper Middle)",
        jurisdiction: "US - New York",
        am_best_rating: "A (Excellent)",
        status: "In Review",
        risk_score: 82,
        risk_tier: "Low Risk",
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        documents: [
          {
            id: "doc-1",
            name: "Cyber_Application_2026.pdf",
            size: "2.4 MB",
            doc_type: "application",
            uploaded_at: "2026-05-18T10:00:00Z",
          },
          {
            id: "doc-2",
            name: "3Yr_Loss_Runs_Certified.pdf",
            size: "1.8 MB",
            doc_type: "loss_runs",
            uploaded_at: "2026-05-18T10:00:00Z",
          },
          {
            id: "doc-3",
            name: "SOC2_Type_II_Controls.pdf",
            size: "5.1 MB",
            doc_type: "security_controls",
            uploaded_at: "2026-05-18T10:00:00Z",
          },
        ],
        audit_trail: [
          {
            id: "log-1",
            action: "Submission Created",
            actor_name: "Sarah Jenkins (Ceding Underwriter)",
            actor_role: "ceding_underwriter",
            timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
            details: "Initial submission of $10M primary cyber risk.",
            new_status: "Received",
          },
          {
            id: "log-2",
            action: "Status Transition",
            actor_name: "David Vance (Senior Underwriter)",
            actor_role: "reinsurance_underwriter",
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            details: "Underwriter initiated technical evaluation.",
            previous_status: "Received",
            new_status: "In Review",
          },
        ],
      };
      setSubmission(fallbackSub);
      setQuote({
        offered_share_pct: 50,
        ceding_commission_pct: 15,
        ceded_premium: 72500,
        net_premium: 61625,
        limit_exposed: 5000000,
        conditions: [
          "Subject to MFA on cloud console",
          "Follow the fortunes claims agreement",
        ],
        exclusions: ["Nation-state cyber warfare exclusion (LMA5431)"],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDecision = (action = "in_review") => {
    setDefaultDecisionAction(action);
    setIsDecisionModalOpen(true);
  };

  const handleDecisionComplete = (updated) => {
    setSubmission((prev) => ({ ...prev, ...updated }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
        <p className="text-sm font-semibold">
          Loading facultative risk record...
        </p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <p>Submission record not found.</p>
        <Link
          to="/queue"
          className="text-indigo-600 underline text-xs mt-2 inline-block"
        >
          Back to Review Queue
        </Link>
      </div>
    );
  }

  const policyLimit = Number(submission.policy_limit || 0);
  const isLimitExceeded = policyLimit > authorityLimit && authorityLimit > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/queue"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Submissions Queue</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">
            Ref ID: {submission.id}
          </span>
        </div>
      </div>

      {/* Main Submission Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {submission.line_of_business}
              </span>
              <SLABadge
                createdAt={submission.created_at}
                status={submission.status}
              />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                Status: {submission.status}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              {submission.insured_name}
            </h1>

            <p className="text-xs text-slate-400 flex items-center space-x-2">
              <span>
                Ceding Insurer:{" "}
                <strong className="text-slate-200">
                  {submission.ceding_company_name}
                </strong>
              </span>
              <span>•</span>
              <span>
                Industry: {submission.industry || "Commercial Sector"}
              </span>
              <span>•</span>
              <span>Jurisdiction: {submission.jurisdiction || "US - NY"}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isCedingUnderwriter && (
              <>
                {isLimitExceeded &&
                  submission.status !== "refer_to_manager" && (
                    <button
                      onClick={() => handleOpenDecision("refer_to_manager")}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Refer to Manager (&gt;$5M)</span>
                    </button>
                  )}

                {isUnderwritingManager &&
                  submission.status === "refer_to_manager" && (
                    <button
                      onClick={() => handleOpenDecision("approve_referral")}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Referral</span>
                    </button>
                  )}

                <button
                  onClick={() => handleOpenDecision("in_review")}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Workflow Decision</span>
                </button>

                <button
                  onClick={() => handleOpenDecision("declined")}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Decline Risk</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Financial Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Requested Policy Limit</span>
            <span className="text-base font-bold font-mono text-white">
              ${(policyLimit / 1_000_000).toFixed(2)}M
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Attachment Point</span>
            <span className="text-base font-bold font-mono text-slate-300">
              ${((submission.attachment_point || 0) / 1_000_000).toFixed(2)}M
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">Insured Retention</span>
            <span className="text-base font-bold font-mono text-slate-300">
              ${(submission.retention || 0).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">100% Gross Premium</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              ${(submission.gross_premium || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("scoring")}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === "scoring"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. Rules Risk Scoring ({submission.risk_score || 82} pts)</span>
        </button>

        <button
          onClick={() => setActiveTab("quote")}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === "quote"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>2. Interactive Quote Builder</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === "docs"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>
            3. Documents & Completeness ({submission.documents?.length || 0})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 flex items-center space-x-1.5 border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          <span>4. Immutable Audit Trail</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === "scoring" && (
          <RiskScoringBreakdown
            submission={submission}
            onScoreUpdated={(res) =>
              setSubmission((prev) => ({ ...prev, ...res }))
            }
          />
        )}

        {activeTab === "quote" && (
          <InteractiveQuoteBuilder
            submission={submission}
            existingQuote={quote}
            onQuoteSaved={(saved) => setQuote(saved)}
          />
        )}

        {activeTab === "docs" && (
          <div className="space-y-6">
            <CompletenessCheckBadge
              lineOfBusiness={submission.line_of_business}
              documents={submission.documents || []}
              detailed={true}
            />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                Attached Underwriting Files
              </h3>

              {!submission.documents || submission.documents.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">
                  No documentation attached yet.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {submission.documents.map((doc, i) => (
                    <div
                      key={doc.id || i}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">
                            {doc.name || doc.filename || "Document"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Type:{" "}
                            <span className="font-medium text-slate-600 uppercase">
                              {doc.doc_type || "General"}
                            </span>{" "}
                            {doc.size ? `• ${doc.size}` : ""}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Downloading ${doc.name}...`)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <AuditTrailViewer
            submissionId={submission.id}
            inlineEvents={submission.audit_trail || []}
          />
        )}
      </div>

      {/* Decision Workflow Modal */}
      <ManagerReferralModal
        submission={submission}
        isOpen={isDecisionModalOpen}
        defaultAction={defaultDecisionAction}
        onClose={() => setIsDecisionModalOpen(false)}
        onDecisionComplete={handleDecisionComplete}
      />
    </div>
  );
}
