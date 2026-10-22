import React from "react";
import { History, ShieldCheck, User, Cpu, ArrowRight } from "lucide-react";

export default function AuditTrailTimeline({ auditTrail = [] }) {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500 text-xs">
        No audit log events recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-slate-900 text-sm">
            Immutable Audit Trail & Compliance Log
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SHA-256 Verified</span>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {auditTrail.map((event, idx) => {
          const isSystem = event.role === "System Engine";
          return (
            <div key={event.id || idx} className="relative group text-xs">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  isSystem ? "bg-blue-600" : "bg-slate-800"
                } shadow-xs`}
              >
                {isSystem ? (
                  <Cpu className="w-2.5 h-2.5 text-white" />
                ) : (
                  <User className="w-2.5 h-2.5 text-white" />
                )}
              </div>

              <div className="bg-slate-50/70 hover:bg-slate-50 rounded-lg p-3 border border-slate-200 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {event.action}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        isSystem
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {event.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-700 text-xs mb-2">{event.details}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                  <span className="truncate max-w-[200px] sm:max-w-xs">
                    Actor: {event.actor}
                  </span>
                  <span>Hash: {event.hash}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
