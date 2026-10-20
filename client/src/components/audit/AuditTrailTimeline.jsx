import React from "react";
import { Card } from "../common/Card";
import {
  ShieldCheck,
  History,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  FileText,
  Award,
  XCircle,
} from "lucide-react";

const ACTION_ICONS = {
  SUBMISSION_CREATED: FileText,
  RISK_SCORED: ShieldCheck,
  STATUS_CHANGED: History,
  REFERRAL_REQUESTED: ShieldCheck,
  REFERRAL_APPROVED: CheckCircle2,
  QUOTE_ISSUED: Award,
  DECISION_BOUND: CheckCircle2,
  DECISION_DECLINED: XCircle,
};

export const AuditTrailTimeline = ({ logs = [], isLoading = false }) => {
  const displayLogs =
    logs.length > 0
      ? logs
      : [
          {
            id: "log-1",
            action_type: "SUBMISSION_CREATED",
            actor_name: "Sarah Jenkins (Cedant Underwriter)",
            actor_email: "test@example.com",
            details:
              "Initial facultative submission created with 3 mandatory LOB documents.",
            timestamp: "2026-10-20T14:30:15Z",
            previous_state: null,
            new_state: "RECEIVED",
          },
          {
            id: "log-2",
            action_type: "RISK_SCORED",
            actor_name: "Automated Scoring Engine",
            actor_email: "system@apexre.com",
            details:
              "Calculated composite score of 82/100 (LOW RISK / PREFERRED).",
            timestamp: "2026-10-20T14:31:00Z",
            previous_state: null,
            new_state: null,
          },
          {
            id: "log-3",
            action_type: "STATUS_CHANGED",
            actor_name: "Marcus Vance (Reinsurance Underwriter)",
            actor_email: "marcus.vance@apexre.com",
            details: "Underwriter commenced formal risk assessment.",
            timestamp: "2026-10-20T14:35:22Z",
            previous_state: "RECEIVED",
            new_state: "IN_REVIEW",
          },
        ];

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    } catch {
      return ts;
    }
  };

  return (
    <Card
      title="Immutable Regulatory Audit Trail"
      subtitle="Chronological, tamper-evident record of all workflow events, edits, and underwriting decisions"
      action={
        <div className="flex items-center space-x-1 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SOC 2 Compliant Log</span>
        </div>
      }
    >
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {displayLogs.map((log, idx) => {
          const Icon = ACTION_ICONS[log.action_type] || History;

          return (
            <div key={log.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-0.5 p-1 rounded-full bg-white border-2 border-blue-600 text-blue-600 shadow-xs">
                <Icon className="w-3 h-3" />
              </div>

              {/* Event content */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-1.5 hover:bg-white hover:shadow-xs transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {log.action_type.replace(/_/g, " ")}
                    </span>
                    {log.new_state && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                        {log.previous_state ? `${log.previous_state} → ` : ""}
                        {log.new_state}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {formatTimestamp(log.timestamp || log.created_at)}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed">
                  {log.details || log.description}
                </p>

                <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500 border-t border-slate-200/50">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Actor:{" "}
                    <strong className="text-slate-700">
                      {log.actor_name || log.actor_email || "System"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AuditTrailTimeline;
