import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import HeaderBar from "../components/layout/HeaderBar";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import RiskScoringBreakdown from "../components/underwriting/RiskScoringBreakdown";
import ChecklistValidationPanel from "../components/underwriting/ChecklistValidationPanel";
import DecisionWorkbenchModal from "../components/underwriting/DecisionWorkbenchModal";
import api from "../services/api";

export function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [decisionRecord, setDecisionRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch submission
      let sub = null;
      try {
        sub = await api.getSubmissionById(id);
      } catch (err) {
        // Fallback: try getting from submissions list
        const all = await api.getSubmissions();
        const list = all?.items || all?.submissions || all || [];
        sub = list.find(
          (item) =>
            String(item.id) === String(id) ||
            String(item.submission_id) === String(id),
        );
      }

      if (!sub) {
        // Mock fallback if newly created or direct nav
        sub = {
          id: id,
          carrier_name: "Aegis Specialty Mutual",
          insured_name: "Apex Horizon Technologies Inc.",
          risk_type: "Cyber",
          industry_sector: "Technology & Cloud SaaS",
          limit_requested: 10000000,
          attachment_point: 5000000,
          retention: 250000,
          status: "In Review",
          effective_date: "2026-05-01",
          expiry_date: "2027-05-01",
          risk_score: 78,
          risk_tier: "Low Risk",
          attachments: [
            {
              id: "att-101",
              document_type: "security_audit",
              file_name: "SOC2_TypeII_ApexHorizon_2025.pdf",
              file_size: "3.4 MB",
            },
          ],
        };
      }

      setSubmission(sub);

      // Fetch scoring breakdown
      try {
        const scoreRes = await api.getScoreBreakdown(id);
        setScoreData(scoreRes);
      } catch (e) {
        // fallback score structure from submission
        setScoreData({
          submission_id: id,
          risk_score: sub.risk_score || 78,
          risk_tier: sub.risk_tier || "Low Risk",
        });
      }

      // Fetch checklist
      try {
        const checkRes = await api.getChecklist(id);
        setChecklist(checkRes?.items || checkRes?.checklist || checkRes || []);
      } catch (e) {
        setChecklist([]);
      }

      // Fetch existing decision if any
      try {
        const decRes = await api.getDecisionBySubmissionId(id);
        setDecisionRecord(decRes);
      } catch (e) {
        setDecisionRecord(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load submission details",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionDetails();
  }, [id]);

  const handleDecisionRecorded = (newStatus, result) => {
    if (submission) {
      setSubmission({ ...submission, status: newStatus });
    }
    setDecisionRecord(result);
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "$0";
    return `$${Number(val).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div>
        <HeaderBar title="Submission Details" />
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-sm font-semibold text-slate-700">
            Loading Submission Details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div>
        <HeaderBar title="Submission Details" />
        <div className="p-8 max-w-xl mx-auto text-center bg-rose-50 border border-rose-200 rounded-xl my-8">
          <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-900">
            Submission Not Found
          </h3>
          <p className="text-xs text-rose-700 mt-1">
            {error || "Unable to locate submission ID in database."}
          </p>
          <div className="mt-4">
            <Button size="sm" onClick={() => navigate("/")}>
              Return to Review Queue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isCyber = (submission.risk_type || "").toLowerCase().includes("cyber");

  return (
    <div>
      <HeaderBar title={`Review: ${submission.insured_name || "Submission"}`} />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Back Link & Meta Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {submission.insured_name}
                </h2>
                <Badge variant={isCyber ? "cyber" : "do"} size="md">
                  {isCyber ? "Cyber Facultative" : "D&O Liability"}
                </Badge>
                <Badge
                  variant={
                    submission.status?.toLowerCase() === "quoted"
                      ? "success"
                      : submission.status?.toLowerCase() === "declined"
                        ? "danger"
                        : "warning"
                  }
                  size="md"
                >
                  {submission.status || "In Review"}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Submission Ref:{" "}
                <span className="font-mono text-slate-700">
                  {submission.id}
                </span>{" "}
                • Ceding Carrier:{" "}
                <span className="font-semibold text-slate-700">
                  {submission.carrier_name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={fetchSubmissionDetails}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Summary + Score Breakdown + Checklist */}
          <div className="lg:col-span-7 space-y-6">
            {/* Submission Parameters Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                Facultative Placement Structure
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">
                    Requested Fac Limit
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(submission.limit_requested)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">
                    Attachment Point
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(submission.attachment_point)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">
                    Self-Insured Retention
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(submission.retention)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">
                    Industry Sector
                  </span>
                  <span className="font-semibold text-slate-900">
                    {submission.industry_sector || "Enterprise"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">
                    Effective Period
                  </span>
                  <span className="font-semibold text-slate-900">
                    {submission.effective_date} to {submission.expiry_date}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block mb-1">
                    Contact Email
                  </span>
                  <span className="font-semibold text-slate-900 truncate block">
                    {submission.contact_email || "carrier@underwriting.com"}
                  </span>
                </div>
              </div>

              {/* Attachments Section */}
              {submission.attachments && submission.attachments.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Ingested Document Attachments (
                    {submission.attachments.length})
                  </span>
                  <div className="space-y-2">
                    {submission.attachments.map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium text-slate-800">
                            {att.file_name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {att.file_size || "Attached"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Risk Scoring Engine Breakdown */}
            <RiskScoringBreakdown
              scoreData={scoreData}
              riskType={submission.risk_type}
            />

            {/* Missing Info & Checklist Validation */}
            <ChecklistValidationPanel
              checklist={checklist}
              riskType={submission.risk_type}
            />
          </div>

          {/* Right Column (5 cols): Decision Workbench */}
          <div className="lg:col-span-5 space-y-6">
            {decisionRecord ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Recorded Decision Audit Trail
                  </h3>
                </div>

                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-semibold">
                      Decision Outcome:
                    </span>
                    <Badge
                      variant={
                        decisionRecord.decision === "DECLINED"
                          ? "danger"
                          : "success"
                      }
                    >
                      {decisionRecord.decision || submission.status}
                    </Badge>
                  </div>

                  {decisionRecord.premium_amount && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Quoted Premium:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(decisionRecord.premium_amount)}
                      </span>
                    </div>
                  )}

                  {decisionRecord.capacity_offered && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Offered Capacity:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(decisionRecord.capacity_offered)}
                      </span>
                    </div>
                  )}

                  {decisionRecord.subjectivities && (
                    <div className="pt-2 border-t border-emerald-200/60">
                      <span className="text-slate-600 block mb-1 font-semibold">
                        Binding Subjectivities:
                      </span>
                      <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-mono bg-white p-2.5 rounded border border-emerald-100">
                        {decisionRecord.subjectivities}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <DecisionWorkbenchModal
                submission={submission}
                onDecisionSuccess={handleDecisionRecorded}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SubmissionDetailPage;
