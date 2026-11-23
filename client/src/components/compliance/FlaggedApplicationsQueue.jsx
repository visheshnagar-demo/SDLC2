import React from 'react';
import { AlertTriangle, Clock, CheckCircle, ChevronRight, User } from 'lucide-react';
import Badge from '../common/Badge';

export default function FlaggedApplicationsQueue({ queueItems = [], selectedCaseId, onSelectCase }) {
  // Sample fallback queue items for compliance demo
  const items = queueItems.length > 0 ? queueItems : [
    {
      id: 'KYC-2026-8941',
      applicantName: 'Marcus Vance',
      submittedAt: '12 mins ago',
      riskScore: 78,
      flagReason: 'PEP / Sanction Database Fuzzy Match',
      status: 'UNDER_REVIEW'
    },
    {
      id: 'KYC-2026-8942',
      applicantName: 'Elena Rostova',
      submittedAt: '25 mins ago',
      riskScore: 64,
      flagReason: 'Document Expiration Date Near Boundary',
      status: 'UNDER_REVIEW'
    },
    {
      id: 'KYC-2026-8943',
      applicantName: 'David Chen',
      submittedAt: '42 mins ago',
      riskScore: 82,
      flagReason: 'Facial Cosine Similarity 84.1% (< 85% Auto Threshold)',
      status: 'FLAGGED'
    },
    {
      id: 'KYC-2026-8944',
      applicantName: 'Sarah Jenkins',
      submittedAt: '1 hour ago',
      riskScore: 55,
      flagReason: 'Address Discrepancy with Credit Bureau',
      status: 'UNDER_REVIEW'
    }
  ];

  return (
    <div className="bg-[#171F33] p-4 rounded-lg border border-slate-700/80 shadow-md">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/60">
        <div className="flex items-center space-x-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-[#DAE2FD]">Flagged Application Queue</h3>
        </div>
        <span className="bg-amber-500/20 text-amber-300 font-mono text-xs px-2 py-0.5 rounded border border-amber-500/30">
          {items.length} Pending
        </span>
      </div>

      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {items.map((app) => {
          const isSelected = selectedCaseId === app.id;
          return (
            <div
              key={app.id}
              onClick={() => onSelectCase && onSelectCase(app)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-[#0B1326] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-200">{app.applicantName}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                    Case #{app.id}
                  </span>
                </div>
                <Badge variant={app.riskScore > 75 ? 'error' : 'warning'}>
                  Risk: {app.riskScore}/100
                </Badge>
              </div>

              <div className="mt-2 text-xs text-amber-300/90 font-mono bg-amber-950/30 p-1.5 rounded border border-amber-500/20">
                {app.flagReason}
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{app.submittedAt}</span>
                </span>
                <span className="flex items-center space-x-1 text-blue-400 font-medium">
                  <span>Inspect</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
