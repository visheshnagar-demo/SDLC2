import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  Eye,
  ShieldCheck,
  Hash,
  Activity,
  Calendar,
  Lock,
} from 'lucide-react';

export const AuditLogTable = ({
  auditLogs = [],
  onInspectEvent,
  onExport,
  isExporting,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'ALL' || log.resource === resourceFilter;
    return matchesSearch && matchesAction && matchesResource;
  });

  const getActionTag = (action) => {
    if (action.includes('REGISTER') || action.includes('LOGIN')) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0284C7]/15 text-[#38BDF8] border border-[#0284C7]/30">
          {action}
        </span>
      );
    }
    if (action.includes('DECISION') || action.includes('OVERRIDE') || action.includes('COMPLIANCE')) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
          {action}
        </span>
      );
    }
    if (action.includes('BIOMETRIC') || action.includes('VERIFIED')) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
          {action}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#64748B]/20 text-[#94A3B8] border border-[#64748B]/30">
        {action}
      </span>
    );
  };

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden shadow-lg">
      {/* Top Filter and Export Bar */}
      <div className="p-4 border-b border-[#334155] flex flex-wrap items-center justify-between gap-3 bg-[#131B2E]">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Event ID, Actor, IP, Action, or Resource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B1326] border border-[#334155] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        {/* Action and Resource Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0B1326] px-2 py-1 rounded border border-[#334155]">
            <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="USER_REGISTERED">USER_REGISTERED</option>
              <option value="DOCUMENT_UPLOADED">DOCUMENT_UPLOADED</option>
              <option value="OCR_EXTRACTED">OCR_EXTRACTED</option>
              <option value="BIOMETRIC_VERIFIED">BIOMETRIC_VERIFIED</option>
              <option value="APPLICATION_FLAGGED">APPLICATION_FLAGGED</option>
              <option value="COMPLIANCE_DECISION_RECORDED">COMPLIANCE_DECISION_RECORDED</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B1326] px-2 py-1 rounded border border-[#334155]">
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Resources</option>
              <option value="users">users</option>
              <option value="documents">documents</option>
              <option value="biometrics">biometrics</option>
              <option value="verification_applications">verification_applications</option>
              <option value="compliance_reviews">compliance_reviews</option>
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#334155]">
            <button
              onClick={() => onExport && onExport('csv')}
              disabled={isExporting}
              className="px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#334155] text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => onExport && onExport('json')}
              disabled={isExporting}
              className="px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#10B981] border border-[#334155] text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B1326] text-[#94A3B8] font-mono uppercase text-[10px] border-b border-[#334155]">
            <tr>
              <th className="py-3 px-4">Event ID &amp; Merkle Index</th>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Actor / User ID</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Resource</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4 text-right">Inspect Diff</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#94A3B8]">
                  No audit log entries matching query filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => onInspectEvent(log)}
                  className="hover:bg-[#1E293B]/60 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="text-[#38BDF8] font-semibold">{log.id}</div>
                    <div className="text-[9px] text-[#64748B] flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-[#10B981]" />
                      SHA: {log.hash_checksum ? log.hash_checksum.substring(0, 10) + '...' : '0x8f2a...'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#F8FAFC]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#93CCFF]">
                    {log.user_id || 'system_service'}
                  </td>
                  <td className="py-3.5 px-4">{getActionTag(log.action)}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-[#F8FAFC]">{log.resource}</span>
                    <span className="text-[#64748B] block text-[9px]">{log.resource_id}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#94A3B8]">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectEvent(log);
                      }}
                      className="px-2.5 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#334155] font-medium text-[11px] inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Diff</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
