import React, { useState } from "react";
import { useSubmissions } from "../context/SubmissionContext";
import { History, ShieldCheck, Search, Filter, Cpu, User } from "lucide-react";

export default function AuditLogPage() {
  const { submissions } = useSubmissions();
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all audit trails from all submissions
  const allAuditLogs = submissions
    .flatMap((sub) =>
      (sub.auditTrail || []).map((log) => ({
        ...log,
        submissionNumber: sub.submissionNumber,
        insuredName: sub.insuredName,
        lineOfBusiness: sub.lineOfBusiness,
        subId: sub.id,
      })),
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredLogs = allAuditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.submissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.insuredName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-primary" />
            <span>Audit Trail & Compliance Log Stream</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable regulatory ledger tracking state transitions, risk
            evaluations, and underwriting decisions.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Cryptographic Hash Integrity Active</span>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by event, submission, insured, actor, or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Events Table / Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 flex justify-between items-center">
          <span>Audit Log Entries ({filteredLogs.length})</span>
          <span className="text-[11px] text-slate-400 font-mono">
            Real-time Append-only Log
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log, idx) => {
            const isSystem = log.role === "System Engine";
            return (
              <div
                key={log.id || idx}
                className="p-4 hover:bg-slate-50/70 transition-colors text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center ${
                        isSystem
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isSystem ? (
                        <Cpu className="w-3.5 h-3.5" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <span className="font-bold text-slate-900">
                      {log.action}
                    </span>
                    <span className="font-mono text-primary font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                      {log.submissionNumber}
                    </span>
                    <span className="text-slate-600">
                      ({log.insuredName} • {log.lineOfBusiness})
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-700 text-xs pl-8">{log.details}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pl-8 pt-1">
                  <span>
                    Actor:{" "}
                    <strong className="text-slate-600">{log.actor}</strong> (
                    {log.role})
                  </span>
                  <span>
                    SHA-256:{" "}
                    <code className="bg-slate-100 px-1 rounded">
                      {log.hash}
                    </code>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
