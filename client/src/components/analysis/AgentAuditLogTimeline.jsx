import React from "react";
import {
  Bot,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldAlert,
  Cpu,
} from "lucide-react";

export default function AgentAuditLogTimeline({ auditLogs = [] }) {
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
      case "COMPLETED":
      case "PASSED":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "RUNNING":
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-sky-600 animate-spin" />;
      case "FAILED":
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "FLAGGED":
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <Bot className="w-5 h-5 text-[#0F2744]" />
          <h3 className="text-base font-bold text-[#0F2744]">
            Multi-Agent Execution Audit Trail
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
          {auditLogs.length} Agent Steps Recorded
        </span>
      </div>

      {auditLogs.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No agent execution steps recorded for this job.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {auditLogs.map((log, index) => (
            <div key={log.id || index} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#1E3A8A] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
              </div>

              {/* Log Card */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#0F2744] text-xs">
                      {log.agent_name || "Agentic Orchestrator"}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-slate-700">
                      {log.step_name || "Processing Step"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.execution_time_ms && (
                      <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {log.execution_time_ms} ms
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(log.execution_status)}
                      <span className="font-semibold text-[11px] text-slate-700">
                        {log.execution_status || "COMPLETED"}
                      </span>
                    </div>
                  </div>
                </div>

                {log.details && (
                  <p className="mt-2 text-slate-600 bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {typeof log.details === "string"
                      ? log.details
                      : JSON.stringify(log.details, null, 2)}
                  </p>
                )}

                {log.created_at && (
                  <p className="mt-1.5 text-[10px] text-slate-400 text-right">
                    {new Date(log.created_at).toLocaleTimeString()}
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
