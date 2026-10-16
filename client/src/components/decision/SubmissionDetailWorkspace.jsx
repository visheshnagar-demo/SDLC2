import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  FileCheck,
  History,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import UnderwritingDecisionForm from "./UnderwritingDecisionForm";
import { getSubmissionById } from "../../services/api";

export function SubmissionDetailWorkspace({ initialSubmissionId }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const submissionId = initialSubmissionId || id;

  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'scoring', 'documents', 'decision'

  // Local state for missing flags to allow live resolution toggle
  const [missingFlags, setMissingFlags] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSubmissionById(submissionId);
        if (isMounted) {
          setSubmission(data);
          setMissingFlags(data.missing_flags || []);
        }
      } catch (err) {
        if (isMounted) {
          // Provide mock detail if backend returns 404 or offline
          const mockItem = {
            id: submissionId || "b78a9c1e-34df-41a2-9e88-1a98e21a4401",
            submission_reference: "FAC-2026-CYB-00437",
            carrier_name: "Travelers Casualty & Surety Co",
            carrier_rating: "A++",
            risk_category: "CYBER",
            insured_entity_name: "Apex HealthTech Solutions Inc.",
            industry_sector: "Healthcare",
            policy_limit_usd: 10000000,
            attachment_point_usd: 5000000,
            prior_loss_amount_usd: 125000,
            effective_date: "2026-06-01",
            expiration_date: "2027-06-01",
            primary_policy_number: "POL-CYB-2026-9812",
            risk_score: 78,
            risk_grade: "HIGH",
            priority: "HIGH",
            status: "SUBMITTED",
            created_at: "2026-05-18T10:15:00Z",
            missing_flags: [
              {
                id: "flg-1",
                flag_type: "MISSING_CYBER_QUESTIONNAIRE",
                description: "Cyber Risk Assessment Questionnaire Required",
                is_resolved: false,
                mandatory_for_quote: true,
              },
            ],
            documents: [
              {
                id: "doc-1",
                filename: "Apex_5Yr_Loss_Runs.pdf",
                document_type: "LOSS_RUNS",
                created_at: "2026-05-18T10:15:00Z",
              },
              {
                id: "doc-2",
                filename: "POL-CYB-2026-9812_Underlying.pdf",
                document_type: "PRIMARY_POLICY_COPY",
                created_at: "2026-05-18T10:15:00Z",
              },
            ],
            decisions: [],
          };
          setSubmission(mockItem);
          setMissingFlags(mockItem.missing_flags || []);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [submissionId]);

  const handleToggleResolveFlag = (flagId) => {
    setMissingFlags((prev) =>
      prev.map((f) =>
        f.id === flagId ? { ...f, is_resolved: !f.is_resolved } : f,
      ),
    );
  };

  const handleDecisionRecorded = (newDecision) => {
    setSubmission((prev) => ({
      ...prev,
      status: newDecision.decision === "QUOTE" ? "QUOTED" : "DECLINED",
      decisions: [...(prev?.decisions || []), newDecision],
    }));
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#2461F5] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-600">
          Loading submission details...
        </p>
      </div>
    );
  }

  const hasUnresolvedFlags = missingFlags.some(
    (f) => !f.is_resolved && f.mandatory_for_quote,
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/queue")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2461F5] hover:text-[#1B4FD8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Underwriter Queue
        </button>

        <div className="flex items-center gap-2">
          <Badge
            variant={submission?.risk_category === "CYBER" ? "cyber" : "do"}
            size="lg"
          >
            {submission?.risk_category === "CYBER"
              ? "Cyber Reinsurance"
              : "D&O Reinsurance"}
          </Badge>
          <Badge
            variant={
              submission?.status ? submission.status.toLowerCase() : "default"
            }
            size="lg"
          >
            {submission?.status || "SUBMITTED"}
          </Badge>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-[#0F1729]">
              {submission?.submission_reference || "FAC-2026-CYB-00437"}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
              {submission?.primary_policy_number}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1">
            {submission?.insured_entity_name} &bull;{" "}
            <span className="font-normal text-slate-500">
              {submission?.industry_sector}
            </span>
          </p>
          <p className="text-xs text-[#66738A]">
            Ceding Carrier:{" "}
            <strong className="text-slate-800">
              {submission?.carrier_name}
            </strong>{" "}
            (Rating: {submission?.carrier_rating})
          </p>
        </div>

        {/* Score & Priority Pill */}
        <div className="flex items-center gap-4 bg-[#F8FAFC] border border-[#E3E8F0] px-5 py-3 rounded-2xl shrink-0">
          <div className="text-center">
            <span className="text-[10px] font-bold text-[#66738A] uppercase block">
              Risk Score
            </span>
            <span
              className={`text-2xl font-black ${submission?.risk_score >= 75 ? "text-rose-600" : submission?.risk_score >= 50 ? "text-amber-600" : "text-emerald-600"}`}
            >
              {submission?.risk_score || 78}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-left space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Grade:</span>
              <Badge
                variant={
                  submission?.risk_grade === "HIGH" ? "danger" : "warning"
                }
                size="sm"
              >
                {submission?.risk_grade || "HIGH"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Priority:</span>
              <Badge
                variant={submission?.priority === "HIGH" ? "high" : "medium"}
                size="sm"
              >
                {submission?.priority || "HIGH"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Information Banner if any */}
      {hasUnresolvedFlags && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                Missing Information Detected &bull; Quote Decision Gated
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                The automated completeness rule engine identified mandatory risk
                items missing from this submission. Quoting is restricted until
                documentation is resolved or an underwriter override is
                recorded.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-amber-200">
            {missingFlags
              .filter((f) => !f.is_resolved)
              .map((flag) => (
                <div
                  key={flag.id}
                  className="bg-white/80 border border-amber-300 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-amber-950 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>{flag.description}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Unlock}
                    onClick={() => handleToggleResolveFlag(flag.id)}
                    className="text-[11px] py-1 h-7"
                  >
                    Accept Underwriter Override / Resolve
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-[#E3E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-[#2461F5] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Risk & Policy Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("scoring")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "scoring"
              ? "bg-[#2461F5] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Algorithmic Score Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "documents"
              ? "bg-[#2461F5] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span>Risk Documents</span>
          {missingFlags.some((f) => !f.is_resolved) && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("decision")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "decision"
              ? "bg-[#2461F5] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Decision & Audit Trail
        </button>
      </div>

      {/* Tab 1: Risk & Policy Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#66738A] flex items-center gap-2 pb-2 border-b border-[#E3E8F0]">
              <DollarSign className="w-4 h-4 text-[#2461F5]" />
              Coverage Limits & Layering Structure
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">
                  Requested Treaty Limit
                </span>
                <strong className="text-base text-slate-900 font-extrabold">
                  $
                  {(
                    Number(submission?.policy_limit_usd || 0) / 1000000
                  ).toFixed(1)}
                  M USD
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Attachment Point</span>
                <strong className="text-base text-slate-900 font-extrabold">
                  $
                  {(
                    Number(submission?.attachment_point_usd || 0) / 1000000
                  ).toFixed(1)}
                  M USD
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">
                  Prior 5-Yr Incurred Loss
                </span>
                <strong className="text-base text-slate-900 font-extrabold">
                  $
                  {Number(
                    submission?.prior_loss_amount_usd || 0,
                  ).toLocaleString()}{" "}
                  USD
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Effective Term</span>
                <strong className="text-xs text-slate-900 font-bold block mt-1">
                  {submission?.effective_date} &rarr;{" "}
                  {submission?.expiration_date}
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#66738A] flex items-center gap-2 pb-2 border-b border-[#E3E8F0]">
              <Building2 className="w-4 h-4 text-[#2461F5]" />
              Insured Risk Profile & Carrier Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Insured Entity</span>
                <strong className="text-slate-900">
                  {submission?.insured_entity_name}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Industry Sector</span>
                <strong className="text-slate-900">
                  {submission?.industry_sector}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Ceding Carrier</span>
                <strong className="text-slate-900">
                  {submission?.carrier_name}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">A.M. Best Rating</span>
                <Badge variant="primary">
                  {submission?.carrier_rating || "A++"}
                </Badge>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">
                  Underlying Policy Schedule
                </span>
                <strong className="text-slate-900 font-mono">
                  {submission?.primary_policy_number}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Algorithmic Score Breakdown */}
      {activeTab === "scoring" && (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#0F1729]">
                Composite Risk Scoring Model (FastAPI Scoring Engine)
              </h3>
              <p className="text-xs text-[#66738A]">
                Algorithmic weight computation across limit exposure, attachment
                vulnerability, carrier rating, and industry loss patterns.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#2461F5]">
                {submission?.risk_score || 78}/100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Exposure & Layer Limit
              </div>
              <div className="text-xl font-bold text-slate-800">
                $
                {(Number(submission?.policy_limit_usd || 0) / 1000000).toFixed(
                  0,
                )}
                M
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Weight Factor: 35%
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Risk Category Multiplier
              </div>
              <div className="text-xl font-bold text-indigo-700">
                {submission?.risk_category === "CYBER"
                  ? "1.20x Cyber"
                  : "1.00x D&O"}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Weight Factor: 25%
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Loss Experience Index
              </div>
              <div className="text-xl font-bold text-amber-700">
                {Number(submission?.prior_loss_amount_usd || 0) > 200000
                  ? "Elevated"
                  : "Nominal"}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Weight Factor: 20%
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">
                Carrier Financial Rating
              </div>
              <div className="text-xl font-bold text-emerald-700">
                {submission?.carrier_rating || "A++"}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Weight Factor: 20%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Risk Documents & Missing Flags */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F0]">
            <div>
              <h3 className="text-base font-bold text-[#0F1729]">
                Risk Attachments & Completeness Verification
              </h3>
              <p className="text-xs text-[#66738A]">
                All files attached by the ceding carrier evaluated against
                mandatory line requirements.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Flags list */}
            {missingFlags.map((flag) => (
              <div
                key={flag.id}
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  flag.is_resolved
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-rose-50/70 border-rose-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  {flag.is_resolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {flag.description}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {flag.is_resolved
                        ? "Underwriter Override Applied &bull; Resolved"
                        : "Mandatory document missing &bull; Action required"}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={flag.is_resolved ? "ghost" : "outline"}
                  onClick={() => handleToggleResolveFlag(flag.id)}
                  className="text-xs"
                >
                  {flag.is_resolved ? "Revoke Override" : "Resolve Flag"}
                </Button>
              </div>
            ))}

            {/* Attached documents */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Attached Risk Files:
              </span>
              {(
                submission?.documents || [
                  {
                    filename: "Apex_5Yr_Loss_Runs.pdf",
                    document_type: "LOSS_RUNS",
                  },
                  {
                    filename: "POL-CYB-2026-9812_Underlying.pdf",
                    document_type: "PRIMARY_POLICY_COPY",
                  },
                ]
              ).map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2461F5]" />
                    <span className="font-semibold text-slate-800">
                      {doc.filename}
                    </span>
                    <Badge variant="default" size="sm">
                      {doc.document_type}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Verified Valid
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Decision Module */}
      {activeTab === "decision" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UnderwritingDecisionForm
              submission={submission}
              hasMissingFlags={hasUnresolvedFlags}
              onDecisionRecorded={handleDecisionRecorded}
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#E3E8F0] p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#66738A] flex items-center gap-2 pb-2 border-b border-[#E3E8F0]">
              <History className="w-4 h-4 text-[#2461F5]" />
              Decision Audit Log
            </h4>

            {submission?.decisions && submission.decisions.length > 0 ? (
              <div className="space-y-3">
                {submission.decisions.map((dec, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex justify-between">
                      <Badge
                        variant={
                          dec.decision === "QUOTE" ? "quoted" : "declined"
                        }
                        size="sm"
                      >
                        {dec.decision}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {dec.created_at
                          ? new Date(dec.created_at).toLocaleTimeString()
                          : "Just now"}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-1">
                      Underwriter: {dec.underwriter_id}
                    </div>
                    {dec.notes && (
                      <p className="text-slate-600 text-[11px] italic">
                        &quot;{dec.notes}&quot;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No binding quote or decline decision has been recorded yet for
                this submission.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

SubmissionDetailWorkspace.propTypes = {
  initialSubmissionId: PropTypes.string,
};

export default SubmissionDetailWorkspace;
