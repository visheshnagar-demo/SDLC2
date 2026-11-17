import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  ShieldAlert,
  FileText,
} from 'lucide-react';

export const ComplianceQueueTable = ({
  applications = [],
  onSelectApplication,
  selectedAppId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.flag_reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.overall_status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || app.risk_level === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FLAGGED':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center gap-1 w-max">
            <AlertTriangle className="w-3 h-3" />
            FLAGGED
          </span>
        );
      case 'APPROVED':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1 w-max">
            <CheckCircle2 className="w-3 h-3" />
            APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#64748B]/20 text-[#94A3B8] border border-[#64748B]/30 flex items-center gap-1 w-max">
            <XCircle className="w-3 h-3" />
            REJECTED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1 w-max">
            <Clock className="w-3 h-3" />
            PENDING
          </span>
        );
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'HIGH':
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold">HIGH RISK</span>;
      case 'MEDIUM':
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-medium">MED RISK</span>;
      default:
        return <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 font-medium">LOW RISK</span>;
    }
  };

  return (
    <div className="bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden shadow-lg">
      {/* Top Controls Strip */}
      <div className="p-4 border-b border-[#334155] flex flex-wrap items-center justify-between gap-3 bg-[#131B2E]">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Customer Name, or Flag Reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B1326] border border-[#334155] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0B1326] px-2 py-1 rounded border border-[#334155]">
            <Filter className="w-3.5 h-3.5 text-[#94A3B8]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="FLAGGED">Flagged</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B1326] px-2 py-1 rounded border border-[#334155]">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B1326] text-[#94A3B8] font-mono uppercase text-[10px] border-b border-[#334155]">
            <tr>
              <th className="py-3 px-4">Application ID</th>
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4">Doc Type</th>
              <th className="py-3 px-4">Flag Trigger</th>
              <th className="py-3 px-4">Confidence Scores</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#94A3B8]">
                  No verification applications match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedAppId === app.application_id;
                return (
                  <tr
                    key={app.application_id}
                    onClick={() => onSelectApplication(app)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#1E293B] border-l-4 border-[#0284C7]' : 'hover:bg-[#1E293B]/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#38BDF8]">
                      {app.application_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#F8FAFC]">{app.customer_name}</div>
                      <div className="text-[10px] text-[#94A3B8] font-mono">{app.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171F33] text-[#93CCFF] border border-[#334155]">
                        {app.doc_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{app.flag_reason}</span>
                      </div>
                      <div className="mt-1">{getRiskBadge(app.risk_level)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>OCR: <span className="text-[#38BDF8]">{app.ocr_confidence}%</span></div>
                      <div>Bio: <span className={app.match_score < 80 ? 'text-[#EF4444]' : 'text-[#10B981]'}>{app.match_score}%</span></div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.overall_status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(app);
                        }}
                        className="px-2.5 py-1 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-[11px] inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
