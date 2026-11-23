import React from 'react';
import { FileCheck, ShieldAlert, AlertCircle, Eye, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export default function EvidenceInspector({ caseData }) {
  const currentCase = caseData || {
    id: 'KYC-2026-8941',
    applicantName: 'Marcus Vance',
    documentType: 'PASSPORT (GBR)',
    docNumber: '928410294',
    dob: '1984-06-22',
    address: '42 Belgrave Square, London SW1X 8PZ',
    riskScore: 78,
    discrepancies: [
      {
        field: 'PEP / Sanction Screening',
        severity: 'HIGH',
        detail: 'Name matches Politically Exposed Person registry (Tier 3 relative).'
      },
      {
        field: 'Issuing Country vs IP Geo',
        severity: 'MEDIUM',
        detail: 'Document issued in GBR, application submitted via VPN egress in DEU.'
      }
    ]
  };

  return (
    <div className="bg-[#171F33] p-6 rounded-lg border border-slate-700/80 shadow-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/60">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-[#DAE2FD]">
              Forensic Evidence Dossier: {currentCase.applicantName}
            </h2>
            <Badge variant="warning">CASE #{currentCase.id}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side optical analysis and sanction risk decomposition.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-mono">
            Composite Risk
          </span>
          <span className="text-xl font-bold font-mono text-amber-400">
            {currentCase.riskScore}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document OCR & Metadata */}
        <div className="space-y-4">
          <div className="bg-[#0B1326] p-4 rounded-lg border border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <FileCheck size={14} className="text-blue-400" />
              <span>Extracted Identity Manifest</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Legal Name</span>
                <span className="text-slate-200 font-semibold">{currentCase.applicantName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Document Type</span>
                <span className="text-slate-200 font-semibold">{currentCase.documentType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Document Number</span>
                <span className="text-slate-200 font-mono font-semibold">{currentCase.docNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Date of Birth</span>
                <span className="text-slate-200">{currentCase.dob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Physical Address</span>
                <span className="text-slate-200 text-right max-w-[200px]">{currentCase.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1326] p-4 rounded-lg border border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Eye size={14} className="text-cyan-400" />
              <span>Optical Document Heuristics</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-slate-300">Microprint: Valid</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-slate-300">Hologram: Authentic</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-slate-300">Font Alignment: 99%</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-slate-300">UV Reflection: Pass</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flagged Discrepancies & Risk Decomposition */}
        <div className="space-y-4">
          <div className="bg-[#0B1326] p-4 rounded-lg border border-amber-500/40">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <ShieldAlert size={14} className="text-amber-400" />
              <span>Automated Risk Triggers</span>
            </h3>
            <div className="space-y-2.5">
              {currentCase.discrepancies.map((disc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-amber-200">{disc.field}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      disc.severity === 'HIGH' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {disc.severity} RISK
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{disc.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0B1326] p-4 rounded-lg border border-slate-700 text-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              AML & OFAC Database Telemetry
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Database checked against UN Sanctions, OFAC SDN List, EU Consolidated List, and Interpol Red Notices.
            </p>
            <div className="mt-2 text-right">
              <span className="text-slate-500 font-mono text-[10px]">Checked at: 2026-08-04 14:15:22 UTC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
