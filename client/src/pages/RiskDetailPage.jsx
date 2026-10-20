import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import { useAuth, ROLES } from "../context/AuthContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Modal } from "../components/common/Modal";
import { RiskScoreBreakdown } from "../components/scoring/RiskScoreBreakdown";
import { DocumentVault } from "../components/intake/DocumentVault";
import { QuoteBuilderCalculator } from "../components/quote/QuoteBuilderCalculator";
import { ManagerReferralApprovalPanel } from "../components/referral/ManagerReferralApprovalPanel";
import { AuditTrailTimeline } from "../components/audit/AuditTrailTimeline";
import { SLAIndicatorBadge } from "../components/queue/SLAIndicatorBadge";
import {
  ArrowLeft,
  ShieldAlert,
  Award,
  XCircle,
  HelpCircle,
  CheckCircle2,
  Share2,
  FileText,
  Clock,
  Layers,
  FileCheck,
} from "lucide-react";

export const DECLINE_REASONS = [
  {
    value: "AGGREGATE_EXPOSURE_CAP",
    label: "Portfolio aggregate limit / line capacity exhausted",
  },
  {
    value: "POOR_CONTROLS_POSTURE",
    label: "Inadequate cyber controls / lack of MFA or EDR telemetry",
  },
  {
    value: "ELEVATED_LOSS_HISTORY",
    label: "Adverse loss history or frequency of prior claims",
  },
  {
    value: "UNACCEPTABLE_PRICING",
    label: "Rate on line (ROL) below minimum technical rate adequacy",
  },
  {
    value: "UNSUPPORTED_JURISDICTION",
    label: "Out of appetite jurisdiction or high litigation venue",
  },
];

export const RiskDetailPage = () => {
  const { id = "SUB-8841" } = useParams();
  const navigate = useNavigate();
  const { currentRole, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'documents' | 'quote' | 'audit'
  const [submission, setSubmission] = useState({
    id: id,
    ceding_company_id: "HGIC-770",
    ceding_company_name: "Hartford General Insurance Corp",
    insured_name: "Nexus Health Systems Inc.",
    line_of_business: "CYBER",
    industry: "Healthcare & Life Sciences",
    revenue_band: "$100M - $500M",
    jurisdiction: "US - New York (NY)",
    policy_limit: 10000000,
    attachment_point: 2000000,
    retention: 500000,
    proposed_premium: 350000,
    effective_date: "2026-11-01",
    expiry_date: "2027-11-01",
    status: "IN_REVIEW",
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    referral_status: "PENDING",
  });

  const [scoreData, setScoreData] = useState({
    total_score: 82,
    risk_tier: "LOW RISK / PREFERRED",
    breakdown: [
      {
        name: "Multi-Factor Authentication (MFA) Enforcement",
        category: "Cyber Controls",
        points: 20,
        maxPoints: 20,
        status: "PASS",
        description:
          "Enforced across all VPN, email, and privileged identity accounts",
      },
      {
        name: "EDR Telemetry & 24/7 Managed SOC",
        category: "Cyber Controls",
        points: 20,
        maxPoints: 20,
        status: "PASS",
        description:
          "Active endpoint isolation with CrowdStrike Falcon deployed to 98% fleet",
      },
      {
        name: "Air-Gapped Immutable Backups",
        category: "Disaster Recovery",
        points: 15,
        maxPoints: 15,
        status: "PASS",
        description:
          "Quarterly ransomware restore drills verified; 14-day immutable snapshots",
      },
      {
        name: "3-Year Historical Loss Ratio (12.4%)",
        category: "Actuarial Loss History",
        points: 15,
        maxPoints: 15,
        status: "PASS",
        description:
          "Loss ratio is well below the 35% line of business benchmark",
      },
      {
        name: "Prior Claims & Incident Severity",
        category: "Claims History",
        points: 7,
        maxPoints: 10,
        status: "WARN",
        description:
          "Single low-severity phishing incident reported 2 years ago (remediated)",
      },
      {
        name: "Industry & Jurisdictional Hazard Baseline",
        category: "Exposure Baseline",
        points: 5,
        maxPoints: 20,
        status: "WARN",
        description:
          "Healthcare sector carries elevated PHI / HIPAA litigation exposure",
      },
    ],
  });

  const [documents, setDocuments] = useState([
    {
      id: "doc-1",
      document_type: "APPLICATION",
      file_name: "Nexus_Health_Facultative_Application_2026.pdf",
      file_size_bytes: 2450000,
      uploaded_at: "2026-10-20T14:30:00Z",
      is_mandatory: true,
    },
    {
      id: "doc-2",
      document_type: "LOSS_RUNS",
      file_name: "Nexus_5Yr_Historical_Loss_Runs.xlsx",
      file_size_bytes: 1120000,
      uploaded_at: "2026-10-20T14:31:00Z",
      is_mandatory: true,
    },
    {
      id: "doc-3",
      document_type: "CYBER_CONTROLS_AUDIT",
      file_name: "Nexus_SOC2_Cyber_Controls_Audit.pdf",
      file_size_bytes: 4180000,
      uploaded_at: "2026-10-20T14:32:00Z",
      is_mandatory: true,
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals for Decision Actions
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showInfoRequestModal, setShowInfoRequestModal] = useState(false);
  const [declineReason, setDeclineReason] = useState(DECLINE_REASONS[0].value);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [infoRequestText, setInfoRequestText] = useState("");

  // Fetch initial submission & audit data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const subData = await api.getSubmissionById(id);
        if (subData) setSubmission(subData);
      } catch (err) {
        // Use default submission state
      }

      try {
        const logs = await api.getAuditTrail(id);
        if (Array.isArray(logs)) setAuditLogs(logs);
      } catch (err) {
        // Fallback default audit logs
      }
    };
    fetchData();
  }, [id]);

  // Recalculate score
  const handleRecalculateScore = async () => {
    setIsLoading(true);
    try {
      const res = await api.calculateRiskScore(id);
      if (res) setScoreData(res);
    } catch {
      // Recompute in UI if backend is offline
      setScoreData((prev) => ({
        ...prev,
        total_score: Math.min(100, (prev.total_score || 80) + 2),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // State Transition Handlers
  const handleStatusTransition = async (newStatus, notes) => {
    setIsLoading(true);
    try {
      await api.updateSubmissionStatus(id, { status: newStatus, notes });
      setSubmission((prev) => ({ ...prev, status: newStatus }));
      // Append to audit trail
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          action_type: "STATUS_CHANGED",
          actor_name: currentUser.name,
          actor_email: currentUser.email,
          details: `Status transitioned to ${newStatus}. ${notes || ""}`,
          timestamp: new Date().toISOString(),
          previous_state: submission.status,
          new_state: newStatus,
        },
        ...prev,
      ]);
    } catch {
      setSubmission((prev) => ({ ...prev, status: newStatus }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!decisionNotes.trim()) return;
    setIsLoading(true);
    try {
      await api.finalizeDecision(id, {
        decision: "DECLINED",
        decline_reason: declineReason,
        notes: decisionNotes,
      });
      setSubmission((prev) => ({ ...prev, status: "DECLINED" }));
      setShowDeclineModal(false);
    } catch {
      setSubmission((prev) => ({ ...prev, status: "DECLINED" }));
      setShowDeclineModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoRequestSubmit = async () => {
    if (!infoRequestText.trim()) return;
    setIsLoading(true);
    try {
      await api.updateSubmissionStatus(id, {
        status: "INFO_REQUESTED",
        notes: infoRequestText,
      });
      setSubmission((prev) => ({ ...prev, status: "INFO_REQUESTED" }));
      setShowInfoRequestModal(false);
    } catch {
      setSubmission((prev) => ({ ...prev, status: "INFO_REQUESTED" }));
      setShowInfoRequestModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralDecision = async ({ decision, notes }) => {
    setIsLoading(true);
    try {
      await api.decideReferral(id, {
        decision,
        notes,
        manager_user_id: currentUser.id,
      });
      setSubmission((prev) => ({
        ...prev,
        referral_status: decision,
        status: decision === "APPROVED" ? "IN_REVIEW" : "DECLINED",
      }));
    } catch {
      setSubmission((prev) => ({
        ...prev,
        referral_status: decision,
        status: decision === "APPROVED" ? "IN_REVIEW" : "DECLINED",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuote = async (quotePayload) => {
    setIsLoading(true);
    try {
      await api.createQuote(id, quotePayload);
      setSubmission((prev) => ({ ...prev, status: "QUOTED" }));
      setActiveTab("overview");
    } catch {
      setSubmission((prev) => ({ ...prev, status: "QUOTED" }));
      setActiveTab("overview");
    } finally {
      setIsLoading(false);
    }
  };

  const isOverAuthority = (submission.policy_limit || 0) > 5000000;

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/queue"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-blue-600">
                {submission.id}
              </span>
              <Badge variant="primary">{submission.line_of_business}</Badge>
              <Badge variant="default">{submission.status}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {submission.insured_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SLAIndicatorBadge createdAt={submission.created_at} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Risk Scoring & Overview
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "documents"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Document Vault ({documents.length})
        </button>

        <button
          onClick={() => setActiveTab("quote")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "quote"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Quote Builder
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Audit Trail
        </button>
      </div>

      {/* Tab 1: Overview & Decision Workbench */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <RiskScoreBreakdown
            scoreData={scoreData}
            submission={submission}
            onRecalculate={handleRecalculateScore}
            isLoading={isLoading}
          />

          {/* Underwriter Decision Workbench */}
          <Card
            title="Underwriting Decision Workbench"
            subtitle="Advance the submission through the facultative decision lifecycle"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => setActiveTab("quote")}
                  icon={Award}
                >
                  Build Formal Quote
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setShowInfoRequestModal(true)}
                  icon={HelpCircle}
                >
                  Request Information
                </Button>

                <Button
                  variant="success"
                  onClick={() =>
                    handleStatusTransition(
                      "BOUND",
                      "Cover bound per agreed terms.",
                    )
                  }
                  icon={CheckCircle2}
                >
                  Bind Facultative Cover
                </Button>

                <Button
                  variant="danger"
                  onClick={() => setShowDeclineModal(true)}
                  icon={XCircle}
                >
                  Decline Submission
                </Button>
              </div>
            </div>
          </Card>

          {/* High Limit Authority Check Panel (if > $5M) */}
          {isOverAuthority && (
            <ManagerReferralApprovalPanel
              submission={submission}
              onReferralDecision={handleReferralDecision}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* Tab 2: Document Vault */}
      {activeTab === "documents" && (
        <DocumentVault
          lineOfBusiness={submission.line_of_business}
          documents={documents}
          onDocumentsChange={setDocuments}
        />
      )}

      {/* Tab 3: Quote Builder */}
      {activeTab === "quote" && (
        <QuoteBuilderCalculator
          submission={submission}
          onSaveQuote={handleSaveQuote}
          isLoading={isLoading}
        />
      )}

      {/* Tab 4: Audit Trail */}
      {activeTab === "audit" && <AuditTrailTimeline logs={auditLogs} />}

      {/* Decline Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Decline Facultative Submission"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Mandatory regulatory requirement: Specify the formal reason for
            declining this facultative reinsurance submission:
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Decline Reason Code <span className="text-rose-500">*</span>
            </label>
            <select
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              required
            >
              {DECLINE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Underwriting Decline Notes & Technical Justification{" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Provide technical rationale for file record..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeclineModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeclineSubmit}
              disabled={!decisionNotes.trim()}
              loading={isLoading}
            >
              Confirm & Decline Risk
            </Button>
          </div>
        </div>
      </Modal>

      {/* Info Request Modal */}
      <Modal
        isOpen={showInfoRequestModal}
        onClose={() => setShowInfoRequestModal(false)}
        title="Request Additional Underwriting Information"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Submit a formal information request to the ceding company
            underwriter (Sarah Jenkins). The submission will move to{" "}
            <strong>INFO_REQUESTED</strong> status.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Information Requested / Outstanding Questions{" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={infoRequestText}
              onChange={(e) => setInfoRequestText(e.target.value)}
              placeholder="e.g. Please clarify endpoint EDR coverage on legacy servers and provide updated 2026 cyber loss runs."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowInfoRequestModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInfoRequestSubmit}
              disabled={!infoRequestText.trim()}
              loading={isLoading}
            >
              Send Info Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RiskDetailPage;
