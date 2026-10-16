import React from "react";
import {
  History,
  UserCheck,
  Bot,
  FileText,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function AuditTrailTimeline({ auditLogs = [] }) {
  const getActionIcon = (action = "") => {
    const act = action.toUpperCase();
    if (act.includes("SCORE") || act.includes("EVALUAT")) {
      return <Bot className="w-4 h-4 text-blue-600" />;
    }
    if (act.includes("FLAG") || act.includes("MISSING")) {
      return <ShieldAlert className="w-4 h-4 text-amber-600" />;
    }
    if (act.includes("QUOTE")) {
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
    if (act.includes("DECLINE")) {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    if (act.includes("SUBMIT") || act.includes("CREATE")) {
      return <FileText className="w-4 h-4 text-slate-600" />;
    }
    return <UserCheck className="w-4 h-4 text-purple-600" />;
  };

  const getActorBadge = (role = "") => {
    const r = role.toUpperCase();
    if (r.includes("CARRIER")) {
      return "bg-blue-100 text-blue-800";
    }
    if (r.includes("UNDERWRITER")) {
      return "bg-purple-100 text-purple-800";
    }
    if (r.includes("ENGINE") || r.includes("SYSTEM")) {
      return "bg-slate-100 text-slate-800";
    }
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-700" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Compliance & Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Immutable chronological record of submission events and decisions
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {auditLogs.length} Events Logged
        </span>
      </div>

      {auditLogs.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {auditLogs.map((log, idx) => (
            <div key={log.id || idx} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-xs">
                {getActionIcon(log.action)}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 group-hover:border-slate-200 transition">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-xs text-slate-900">
                    {log.action?.replace(/_/g, " ") || "State Updated"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "Just now"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getActorBadge(log.actor_role)}`}
                  >
                    {log.actor_role || "System"}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    by{" "}
                    {log.actor_id ||
                      log.actor_name ||
                      "System Automated Process"}
                  </span>
                </div>

                {(log.state_before || log.state_after) && (
                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 flex items-center gap-2 mb-1.5">
                    <span className="text-slate-400">Transition:</span>
                    <span className="font-semibold text-slate-700">
                      {log.state_before || "INITIAL"}
                    </span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="font-semibold text-blue-700">
                      {log.state_after || "UPDATED"}
                    </span>
                  </div>
                )}

                {log.details && (
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
                    {typeof log.details === "object"
                      ? JSON.stringify(log.details)
                      : log.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
