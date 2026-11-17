import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Lock,
} from 'lucide-react';

export const OfficerDecisionModal = ({
  application,
  isOpen,
  onClose,
  onSubmitDecision,
  isSubmitting,
}) => {
  if (!isOpen || !application) return null;

  const [decision, setDecision] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [reasonCode, setReasonCode] = useState('MANUAL_OVERRIDE_VERIFIED');
  const [notes, setNotes] = useState('');
  const [attestationAccepted, setAttestationAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const reasonCodes = {
    APPROVED: [
      { code: 'MANUAL_OVERRIDE_VERIFIED', label: 'Manual Visual Override — High Facial Similarity Confirmed' },
      { code: 'SECONDARY_DOCUMENT_VALIDATED', label: 'Secondary Supporting Identification Corroborated' },
      { code: 'ACCEPTABLE_AGE_VARIATION', label: 'Accepted Natural Age/Appearance Variance Between ID & Selfie' },
    ],
    REJECTED: [
      { code: 'SUSPECTED_FRAUD_SPOOF', label: 'Suspected Presentation Attack / 3D Mask Spoof' },
      { code: 'MRZ_DATA_DISCREPANCY', label: 'Critical Discrepancy in MRZ vs Ingested Text Fields' },
      { code: 'DOCUMENT_EXPIRED_OR_DAMAGED', label: 'Identity Document Expired, Tampered, or Illegible' },
      { code: 'FACE_MISMATCH_CONFIRMED', label: 'Confirmed Face Incongruence Beyond Tolerance Threshold' },
    ],
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMsg('Mandatory compliance notes are required for institutional audit trail.');
      return;
    }
    if (!attestationAccepted) {
      setErrorMsg('You must certify the regulatory compliance attestation.');
      return;
    }

    setErrorMsg('');
    onSubmitDecision({
      applicationId: application.application_id,
      decision,
      reason_code: reasonCode,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#334155] flex items-center justify-between bg-[#131B2E]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0284C7]" />
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">
                Adjudicate Application {application.application_id}
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Officer Adjudication Workflow &amp; Regulatory Filing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Decision Pill Toggle */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1.5">
              Adjudication Outcome
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDecision('APPROVED');
                  setReasonCode('MANUAL_OVERRIDE_VERIFIED');
                }}
                className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  decision === 'APPROVED'
                    ? 'bg-[#10B981] border-[#10B981] text-[#0F172A] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-[#0B1326] border-[#334155] text-[#94A3B8] hover:border-[#64748B]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve &amp; Verify Identity</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecision('REJECTED');
                  setReasonCode('FACE_MISMATCH_CONFIRMED');
                }}
                className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  decision === 'REJECTED'
                    ? 'bg-[#EF4444] border-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-[#0B1326] border-[#334155] text-[#94A3B8] hover:border-[#64748B]'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Application</span>
              </button>
            </div>
          </div>

          {/* Reason Code Dropdown */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1.5">
              Standardized Regulatory Reason Code
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="w-full bg-[#0B1326] border border-[#334155] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7]"
            >
              {reasonCodes[decision].map((rc) => (
                <option key={rc.code} value={rc.code}>
                  [{rc.code}] {rc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Narrative Notes */}
          <div>
            <label className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-1.5">
              Adjudication Narrative &amp; Investigation Notes <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail reasons for decision, physical inspection comments, or forensic observations..."
              className="w-full bg-[#0B1326] border border-[#334155] rounded-lg p-3 text-xs text-[#F8FAFC] font-sans focus:outline-none focus:border-[#0284C7] placeholder:text-[#64748B]"
            />
          </div>

          {/* Regulatory Attestation Checkbox */}
          <div className="p-3 rounded-lg bg-[#0B1326] border border-[#334155]">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={attestationAccepted}
                onChange={(e) => setAttestationAccepted(e.target.checked)}
                className="mt-0.5 rounded bg-[#171F33] border-[#334155] text-[#0284C7] focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px] text-[#94A3B8] leading-tight select-none">
                I hereby certify under FINRA / BSA Anti-Money Laundering regulations that I have inspected all primary identification documents, reviewed biometric forensic vectors, and recorded an impartial determination.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#334155]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] font-medium text-xs border border-[#334155] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition-all ${
                decision === 'APPROVED'
                  ? 'bg-[#10B981] hover:bg-[#059669] text-[#0F172A]'
                  : 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing Audit Record...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign &amp; Commit Decision</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
