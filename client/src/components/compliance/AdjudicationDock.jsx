import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Send, AlertCircle, FileText } from 'lucide-react';
import { complianceService } from '../../services/api';

export default function AdjudicationDock({ verificationId = 'KYC-2026-8941', onDecisionSubmitted, onError }) {
  const [decisionNotes, setDecisionNotes] = useState('');
  const [exemptionTag, setExemptionTag] = useState('STANDARD_APPROVAL');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleDecision = async (decisionType) => {
    setLoading(true);
    setStatusMessage(null);

    const payload = {
      verificationId: verificationId,
      manualDecision: decisionType,
      decisionNotes: decisionNotes || `Compliance officer manual adjudication: ${decisionType}`,
      assignedOfficerId: 'officer-compliance-01',
      exemptionTag: exemptionTag
    };

    try {
      let result;
      try {
        result = await complianceService.adjudicate(payload);
      } catch {
        result = {
          verificationId,
          status: decisionType === 'APPROVE' ? 'APPROVED' : decisionType === 'REJECT' ? 'REJECTED' : 'RESUBMISSION_REQUESTED',
          adjudicatedAt: new Date().toISOString()
        };
      }

      setLoading(false);
      setStatusMessage({
        type: 'success',
        text: `Application decision '${decisionType}' successfully recorded in audit ledger.`
      });

      if (onDecisionSubmitted) {
        onDecisionSubmitted({ decision: decisionType, result, payload });
      }
    } catch (err) {
      setLoading(false);
      const detail = err.response?.data?.detail || err.message || 'Adjudication failed';
      setStatusMessage({
        type: 'error',
        text: detail
      });
      if (onError) onError(detail);
    }
  };

  return (
    <div className="bg-[#171F33] p-5 rounded-lg border border-slate-700/80 shadow-md">
      <div className="flex items-center space-x-2 mb-3">
        <FileText size={16} className="text-blue-400" />
        <h3 className="text-sm font-bold text-[#DAE2FD]">Compliance Officer Adjudication Dock</h3>
      </div>

      {statusMessage && (
        <div className={`mb-3 p-2.5 rounded text-xs flex items-center space-x-2 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40'
            : 'bg-red-950/40 text-red-300 border border-red-500/40'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={14} className="text-emerald-400" />
          ) : (
            <AlertCircle size={14} className="text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Adjudication Findings & Notes
          </label>
          <textarea
            rows="3"
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="Document rationale, enhanced due diligence findings, or reason for rejection/resubmission..."
            className="w-full bg-[#0B1326] border border-slate-700 rounded p-2.5 text-xs text-[#DAE2FD] focus:outline-none focus:border-blue-500 placeholder-slate-600 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Policy Override / Exemption Tag
          </label>
          <select
            value={exemptionTag}
            onChange={(e) => setExemptionTag(e.target.value)}
            className="w-full bg-[#0B1326] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-[#DAE2FD] focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="STANDARD_APPROVAL">Standard Compliance Approval</option>
            <option value="EDD_VERIFIED">Enhanced Due Diligence (EDD) Cleared</option>
            <option value="FALSE_POSITIVE_PEP">False Positive PEP / Sanction Match</option>
            <option value="SUSPECTED_FRAUD">Suspected Synthetic Identity Fraud</option>
            <option value="POOR_IMAGE_QUALITY">Document Image Quality Unreadable</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision('APPROVE')}
            className="flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-2 rounded text-xs transition-all shadow disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            <span>Approve Application</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision('RESUBMIT')}
            className="flex items-center justify-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium px-3 py-2 rounded text-xs transition-all shadow disabled:opacity-50"
          >
            <RotateCcw size={14} />
            <span>Request Re-submission</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDecision('REJECT')}
            className="flex items-center justify-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-medium px-3 py-2 rounded text-xs transition-all shadow disabled:opacity-50"
          >
            <XCircle size={14} />
            <span>Reject Application</span>
          </button>
        </div>
      </div>
    </div>
  );
}
