import React, { useState, useEffect } from 'react';
import { History, UserCheck, ShieldCheck, Clock, FileText } from 'lucide-react';
import api from '../services/api';

export default function AuditTrailTimeline({ submissionId, logs = [] }) {
  const [auditLogs, setAuditLogs] = useState(logs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submissionId && (!logs || logs.length === 0)) {
      setLoading(true);
      api.getAuditTrail(submissionId)
        .then((res) => {
          setAuditLogs(Array.isArray(res) ? res : res.items || []);
        })
        .catch((err) => {
          console.warn('Could not load audit trail directly:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setAuditLogs(logs);
    }
  }, [submissionId, logs]);

  if (loading) {
    return <div className="text-xs text-slate-500 py-4 text-center">Loading audit log...</div>;
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-center text-xs text-slate-500">
        <p>No audit events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
        <History className="w-5 h-5 text-blue-600" /> Compliance Audit Trail
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {auditLogs.map((log, idx) => (
          <div key={log.id || idx} className="relative">
            <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow" />
            <div className="text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{log.action || 'STATE_TRANSITION'}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                </span>
              </div>

              <div className="text-slate-600 flex items-center gap-1.5">
                <UserCheck className="w-3 h-3 text-slate-400" />
                <span>{log.actor_role || 'SYSTEM'}: {log.actor_id || 'automated-engine'}</span>
              </div>

              {(log.state_before || log.state_after) && (
                <div className="text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block font-mono">
                  {log.state_before || 'INITIAL'} &rarr; <span className="font-semibold text-slate-800">{log.state_after}</span>
                </div>
              )}

              {log.notes && (
                <p className="text-[11px] text-slate-600 mt-1 italic">
                  "{log.notes}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
