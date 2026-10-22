import React, { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

export const AuditLogDrawer = ({ projectId, isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAuditLogs(projectId);
      setLogs(Array.isArray(data) ? data : data.logs || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load audit logs from server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Immutable Audit Trail
              </h2>
              <p className="text-xs text-slate-400">
                Chronological record of SDLC lifecycle transitions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Logs"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <p className="text-sm">Fetching audit entries...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">
                  Error Loading Audit Trail
                </h4>
                <p className="text-xs mt-1">{error}</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No audit logs recorded yet.</p>
              <p className="text-xs mt-1">
                Actions taken in each stage will appear here.
              </p>
            </div>
          ) : (
            <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-6">
              {logs.map((log, index) => (
                <div key={log.id || index} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 group-hover:scale-125 transition" />

                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 transition hover:border-slate-600">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                        {log.action || log.event_type || "SYSTEM_EVENT"}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {log.timestamp || log.created_at
                          ? new Date(
                              log.timestamp || log.created_at,
                            ).toLocaleString()
                          : "Recent"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-200 mt-2 font-medium">
                      {log.description ||
                        log.message ||
                        "Stage transition recorded"}
                    </p>

                    <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {log.actor || log.performed_by || "System Agent"}
                        </span>
                      </div>
                      {log.stage && (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 text-[10px] font-mono">
                          Stage: {log.stage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-center">
          <p className="text-xs text-slate-500">
            Immutable Audit Trail governed by SDLC Security Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDrawer;
