import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateSubmissionStatus, bindQuote } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Card from "../common/Card";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Modal from "../common/Modal";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
  XCircle,
  ShieldAlert,
  Send,
  Lock,
  FileCheck,
} from "lucide-react";

const STATUS_STEPS = [
  { key: "RECEIVED", label: "1. Received" },
  { key: "IN_REVIEW", label: "2. In Review" },
  { key: "INFO_REQUESTED", label: "3. Info Requested" },
  { key: "QUOTED", label: "4. Quoted" },
  { key: "BOUND", label: "5. Bound / Decisioned" },
];

const DECLINE_REASONS = [
  "Adverse Loss History / Elevated Prior Loss Ratio",
  "Insufficient Cyber Controls (Missing MFA / EDR / Backups)",
  "Out of Underwriting Appetite / Hazard Profile",
  "Exceeds Reinsurer Syndicate Capacity Limit",
  "Unacceptable Policy Wording or Contractual Indemnity Terms",
  "Inadequate Premium / Ceding Commission Margin",
  "Incomplete Submission Documentation after Notice",
];

export const DecisionStateMachine = ({ submission, onStatusUpdated }) => {
  const navigate = useNavigate();
  const { currentUser, isCedingUser, isUnderwriter, isManager } = useAuth();
  const [loading, setLoading] = useState(false);

  // Modals state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [selectedDeclineReason, setSelectedDeclineReason] = useState(
    DECLINE_REASONS[0],
  );
  const [declineNotes, setDeclineNotes] = useState("");

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoQuery, setInfoQuery] = useState("");

  const currentStatus = submission.status;

  const handleStatusChange = async (newStatus, declineReason = "") => {
    setLoading(true);
    try {
      const updated = await updateSubmissionStatus(
        submission.id,
        newStatus,
        declineReason,
        currentUser.email,
      );
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (err) {
      console.error("Status transition failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineSubmit = async (e) => {
    e.preventDefault();
    const fullReason = `${selectedDeclineReason}${declineNotes ? `: ${declineNotes}` : ""}`;
    await handleStatusChange("DECLINED", fullReason);
    setDeclineModalOpen(false);
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    await handleStatusChange(
      "INFO_REQUESTED",
      `Information Requested: ${infoQuery}`,
    );
    setInfoModalOpen(false);
  };

  const handleBind = async () => {
    setLoading(true);
    try {
      const quoteId = submission.quotes?.[0]?.id || "quote-01";
      await bindQuote(submission.id, quoteId, currentUser.email);
      await handleStatusChange("BOUND");
    } catch (err) {
      console.error("Bind failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    if (status === "DECLINED") return 4;
    return STATUS_STEPS.findIndex((s) => s.key === status);
  };

  const activeStepIdx = getStepIndex(currentStatus);
  const isDeclined = currentStatus === "DECLINED";
  const isBound = currentStatus === "BOUND";

  return (
    <Card
      title="Underwriting Decision Workflow & State Machine"
      subtitle="Controlled progression from risk intake to quote binding or formal decline."
      headerAction={
        <Badge
          variant={currentStatus}
          label={currentStatus.replace("_", " ")}
        />
      }
    >
      <div className="space-y-6">
        {/* Visual Stepper */}
        <div className="grid grid-cols-5 gap-2">
          {STATUS_STEPS.map((step, idx) => {
            const isCompleted = isBound ? true : idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;
            return (
              <div
                key={step.key}
                className={`p-2.5 rounded-xl text-center border transition-all ${
                  isCurrent
                    ? isDeclined
                      ? "bg-rose-50 border-rose-300 text-rose-900 font-bold"
                      : "bg-sky-50 border-sky-300 text-sky-900 font-bold"
                    : isCompleted
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent && isDeclined ? (
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-300 text-slate-700 text-[9px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold">
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decline Reason Banner if Declined */}
        {isDeclined && submission.decline_reason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
            <div className="flex items-center space-x-2 font-bold mb-1">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Mandatory Decline Reason Logged:</span>
            </div>
            <p className="text-rose-800 ml-6">{submission.decline_reason}</p>
          </div>
        )}

        {/* Bound Policy Banner if Bound */}
        {isBound && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
            <div className="flex items-center space-x-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Policy Layer Formally Bound</span>
            </div>
            <p className="text-emerald-800 ml-6">
              Facultative cover is in effect. All subjectivities and binder
              conditions have been committed to the compliance audit ledger.
            </p>
          </div>
        )}

        {/* State Transition Actions */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Available Underwriter Transitions
            </span>
            <span className="text-[11px] text-slate-500">
              Role:{" "}
              <strong className="text-slate-800">{currentUser.role}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {currentStatus === "RECEIVED" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange("IN_REVIEW")}
                loading={loading}
                icon={ArrowRight}
              >
                Initiate Underwriter Review
              </Button>
            )}

            {["RECEIVED", "IN_REVIEW"].includes(currentStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInfoModalOpen(true)}
                icon={HelpCircle}
              >
                Request Additional Info
              </Button>
            )}

            {currentStatus === "INFO_REQUESTED" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange("IN_REVIEW")}
                loading={loading}
              >
                Mark Info Received (Resume Review)
              </Button>
            )}

            {!["QUOTED", "BOUND", "DECLINED"].includes(currentStatus) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/submissions/${submission.id}/quote`)}
                icon={FileSpreadsheet}
              >
                Construct Reinsurance Quote
              </Button>
            )}

            {currentStatus === "QUOTED" && !isBound && (
              <Button
                variant="success"
                size="sm"
                onClick={handleBind}
                loading={loading}
                icon={FileCheck}
              >
                Accept & Bind Policy Layer
              </Button>
            )}

            {!["BOUND", "DECLINED"].includes(currentStatus) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeclineModalOpen(true)}
                icon={XCircle}
              >
                Decline Risk
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Decline Risk Modal with Mandatory Decline Reason */}
      <Modal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title="Decline Facultative Risk Submission"
      >
        <form onSubmit={handleDeclineSubmit} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
            <strong>Mandatory Underwriting Requirement:</strong> A specific
            decline reason is required by regulatory compliance and will be
            recorded in the immutable audit trail.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Decline Reason Category{" "}
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDeclineReason}
              onChange={(e) => setSelectedDeclineReason(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              {DECLINE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Underwriting Explanatory Notes
            </label>
            <textarea
              rows={3}
              value={declineNotes}
              onChange={(e) => setDeclineNotes(e.target.value)}
              placeholder="Provide specific underwriting loss ratio context, control deficiencies, or capacity reasons..."
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setDeclineModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              loading={loading}
              icon={XCircle}
            >
              Confirm Decline
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Info Modal */}
      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Request Additional Information from Cedent"
      >
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Specific Information / Document Requested{" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={infoQuery}
              onChange={(e) => setInfoQuery(e.target.value)}
              placeholder="e.g. Please provide updated audited 2025 financial statements and confirmation of 100% MFA deployment on privileged administrative accounts."
              className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setInfoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              icon={Send}
            >
              Dispatch Info Request
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default DecisionStateMachine;
