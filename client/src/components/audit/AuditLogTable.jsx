import React, { useState } from "react";
import Card from "../common/Card";
import { History, ShieldCheck, User, Clock, Search } from "lucide-react";

const ACTION_COLORS = {
  SUBMISSION_CREATED: "bg-blue-100 text-blue-800 border-blue-200",
  STATUS_CHANGED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  RISK_SCORED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  QUOTE_ISSUED: "bg-purple-100 text-purple-800 border-purple-200",
  REFERRAL_DECIDED: "bg-amber-100 text-amber-800 border-amber-200",
  POLICY_BOUND: "bg-teal-100 text-teal-800 border-teal-200",
  INFO_REQUESTED: "bg-orange-100 text-orange-800 border-orange-200",
  default: "bg-slate-100 text-slate-800 border-slate-200",
};

export const AuditLogTable = ({ auditLogs = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (log.actor && log.actor.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  return (
    <Card
      title="Compliance Audit Trail & Event Ledger"
      subtitle="Immutable cryptographic log of all state transitions, underwriter evaluations, and binding decisions."
      headerAction={
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>WORM Compliant</span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit events, actors, or actions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filteredLogs.length} Event(s) Recorded
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider font-semibold text-[11px] text-slate-600">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Change Event Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    No matching audit records.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  const badgeStyle =
                    ACTION_COLORS[log.action] || ACTION_COLORS.default;
                  return (
                    <tr
                      key={log.id || index}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(log.timestamp || Date.now())
                              .toISOString()
                              .replace("T", " ")
                              .slice(0, 19)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 flex items-center space-x-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.actor}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {log.role || "System"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${badgeStyle}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default AuditLogTable;
