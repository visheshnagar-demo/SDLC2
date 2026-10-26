import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissionById } from "../services/api";
import RiskScoringBreakdown from "../components/scoring/RiskScoringBreakdown";
import DecisionStateMachine from "../components/workflow/DecisionStateMachine";
import DocumentCompletenessGate from "../components/submissions/DocumentCompletenessGate";
import QuoteBuilder from "../components/quote/QuoteBuilder";
import ManagerReferralPanel from "../components/referral/ManagerReferralPanel";
import AuditLogTable from "../components/audit/AuditLogTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import {
  ArrowLeft,
  Building,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  History,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export const SubmissionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("cockpit"); // 'cockpit', 'documents', 'quote', 'audit'

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubmissionById(id || "fac-sub-001");
      setSubmission(data);
    } catch (err) {
      console.error("Failed to load submission:", err);
      setError(err.message || "Submission not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Loading facultative submission #{id}...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <Card className="max-w-lg mx-auto text-center py-12">
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Unable to Load Submission
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          {error || "Record does not exist."}
        </p>
        <Button
          variant="primary"
          onClick={() => navigate("/underwriter/queue")}
          icon={ArrowLeft}
        >
          Return to Review Queue
        </Button>
      </Card>
    );
  }

  const handleScoreUpdated = (scoreObj) => {
    setSubmission((prev) => ({
      ...prev,
      risk_score: scoreObj,
    }));
  };

  const handleStatusUpdated = (updatedSub) => {
    setSubmission(updatedSub);
  };

  const handleQuoteCreated = (newQuote) => {
    setSubmission((prev) => ({
      ...prev,
      quotes: [...(prev.quotes || []), newQuote],
      status: "QUOTED",
    }));
  };

  const handleReferralUpdated = (referralObj) => {
    setSubmission((prev) => ({
      ...prev,
      referral: referralObj,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate("/underwriter/queue")}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Review Queue
        </button>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDetail}
            icon={RefreshCw}
          >
            Refresh Detail
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/submissions/${submission.id}/quote`)}
          >
            Open Quote Workspace
          </Button>
        </div>
      </div>

      {/* Main Submission Summary Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-3 mb-1.5">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                {submission.submission_number}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {submission.line_of_business}
              </span>
              <Badge
                variant={submission.status}
                label={submission.status.replace("_", " ")}
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {submission.insured_name}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>
                Ceding Insurer:{" "}
                <strong className="text-slate-800">
                  {submission.ceding_company}
                </strong>
              </span>
              <span>•</span>
              <span>
                Territory:{" "}
                <strong className="text-slate-800">
                  {submission.jurisdiction || "US"}
                </strong>
              </span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-semibold text-[10px]">
                Layer Limit
              </span>
              <span className="font-mono text-base font-bold text-slate-900">
                ${(submission.policy_limit / 1000000).toFixed(2)}M
              </span>
              <span className="text-[10px] text-slate-500 block">
                xs ${(submission.attachment_point / 1000000).toFixed(2)}M
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold text-[10px]">
                Gross Premium
              </span>
              <span className="font-mono text-base font-bold text-emerald-700">
                ${submission.gross_premium.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Retention: ${submission.retention.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-semibold text-[10px]">
                Risk Score
              </span>
              <span className="font-mono text-base font-bold text-indigo-700">
                {submission.risk_score?.composite_score || "--"}/100
              </span>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                {submission.risk_score?.risk_grade
                  ? submission.risk_score.risk_grade.replace("_", " ")
                  : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 pt-4 overflow-x-auto text-xs font-semibold">
          {[
            {
              id: "cockpit",
              label: "Underwriting Cockpit & Scoring",
              icon: Layers,
            },
            {
              id: "documents",
              label: "Document Manifest",
              icon: FileText,
              badge: `${submission.documents?.length || 0}`,
            },
            {
              id: "quote",
              label: "Quote & Authority Escalation",
              icon: DollarSign,
              badge: `${submission.quotes?.length || 0}`,
            },
            {
              id: "audit",
              label: "Compliance Audit Trail",
              icon: History,
              badge: `${submission.audit_trail?.length || 0}`,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-slate-800 text-sky-400"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Underwriting Cockpit */}
      {activeTab === "cockpit" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskScoringBreakdown
            submission={submission}
            onScoreUpdated={handleScoreUpdated}
          />
          <div className="space-y-6">
            <DecisionStateMachine
              submission={submission}
              onStatusUpdated={handleStatusUpdated}
            />
            {submission.referral?.required && (
              <ManagerReferralPanel
                submission={submission}
                onReferralUpdated={handleReferralUpdated}
              />
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Document Completeness */}
      {activeTab === "documents" && (
        <Card
          title="Submission Document Intake Manifest"
          subtitle="Certified loss runs, policy applications, and LOB questionnaires."
        >
          <DocumentCompletenessGate
            lineOfBusiness={submission.line_of_business}
            uploadedDocuments={submission.documents || []}
            readOnly={false}
            onUploadDocument={(newDoc) => {
              setSubmission((prev) => ({
                ...prev,
                documents: [...(prev.documents || []), newDoc],
              }));
            }}
            onRemoveDocument={(docId) => {
              setSubmission((prev) => ({
                ...prev,
                documents: (prev.documents || []).filter((d) => d.id !== docId),
              }));
            }}
          />
        </Card>
      )}

      {/* Tab 3: Quote & Authority */}
      {activeTab === "quote" && (
        <div className="space-y-6">
          <QuoteBuilder
            submission={submission}
            onQuoteCreated={handleQuoteCreated}
          />
          <ManagerReferralPanel
            submission={submission}
            onReferralUpdated={handleReferralUpdated}
          />
        </div>
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === "audit" && (
        <AuditLogTable auditLogs={submission.audit_trail || []} />
      )}
    </div>
  );
};

export default SubmissionDetailPage;
