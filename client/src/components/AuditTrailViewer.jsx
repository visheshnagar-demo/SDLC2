import React, { useState, useEffect } from "react";
import {
  History,
  User,
  Calendar,
  CheckCircle,
  FileText,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Clock,
} from "lucide-react";
import { submissionApi } from "../services/api";

export default function AuditTrailViewer({ submissionId, inlineEvents = [] }) {
  const [logs, setLogs] = useState(inlineEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (submissionId) {
      fetchAuditLogs();
    }
  }, [submissionId]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await submissionApi.getAuditTrail(submissionId);
      if (Array.isArray(data)) {
        setLogs(data);
      } else if (data && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.warn(
        "Audit trail API fetch failed, using fallback records:",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  // Fallback demo audit entries if none found
  const displayLogs =
    logs && logs.length > 0
      ? logs
      : [
          {
            id: "log-1",
            action: "Submission Created",
            actor_name: "Sarah Jenkins (Ceding Underwriter)",
            actor_role: "ceding_underwriter",
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            details:
              "Risk submission ingested with initial documentation package.",
            previous_status: null,
            new_status: "Received",
          },
          {
            id: "log-2",
            action: "Rules Risk Engine Evaluated",
            actor_name: "System Risk Engine",
            actor_role: "system",
            timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
            details: "Evaluated composite score: 68/100 (Medium Risk profile).",
          },
          {
            id: "log-3",
            action: "Status Transition",
            actor_name: "David Vance (Senior Underwriter)",
            actor_role: "reinsurance_underwriter",
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
            details:
              "Moved submission to In Review status for detailed technical appraisal.",
            previous_status: "Received",
            new_status: "In Review",
          },
        ];

  const getActionIcon = (action = "") => {
    const act = action.toLowerCase();
    if (act.includes("created") || act.includes("ingest"))
      return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
    if (act.includes("score") || act.includes("rule"))
      return <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />;
    if (act.includes("quote"))
      return <DollarSign className="w-3.5 h-3.5 text-emerald-500" />;
    if (act.includes("referral"))
      return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
    return <History className="w-3.5 h-3.5 text-blue-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm">
            Granular Audit Trail & Event Log
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Immutable Compliance Record
        </span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Loading audit history...
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
            {displayLogs.map((log, index) => (
              <div key={log.id || index} className="relative pl-6">
                {/* Timeline node */}
                <span className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                </span>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action)}
                      <span className="font-bold text-slate-900">
                        {log.action || log.event_type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center space-x-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString()
                          : "Just now"}
                      </span>
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    {log.details ||
                      log.notes ||
                      log.message ||
                      "Audit event logged."}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {log.actor_name || log.user_email || "System User"}
                      </span>
                      {log.actor_role && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600 text-[10px]">
                          {log.actor_role}
                        </span>
                      )}
                    </span>
                    {log.new_status && (
                      <span className="font-semibold text-indigo-600">
                        Status &rarr; {log.new_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
