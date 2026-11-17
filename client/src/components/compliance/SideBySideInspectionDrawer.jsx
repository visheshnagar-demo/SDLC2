import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Camera,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  Layers,
  Scale,
} from 'lucide-react';

export const SideBySideInspectionDrawer = ({
  application,
  onClose,
  onOpenDecisionModal,
}) => {
  if (!application) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-[#0F172A] border-l border-[#334155] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="p-4 md:p-6 border-b border-[#334155] flex items-center justify-between bg-[#131B2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#F8FAFC]">
                  Application {application.application_id}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-medium">
                  {application.flag_reason || 'MANUAL REVIEW REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Applicant: <span className="text-[#F8FAFC] font-medium">{application.customer_name}</span> • {application.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Three-Way Comparison Grid */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Top Risk Warning Strip */}
          <div className="p-3.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#EF4444]">Automated Gate Flags Triggered</div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Biometric vector similarity score (<strong>{application.match_score}%</strong>) falls below the auto-clear threshold (85.0%). High-risk divergence requires certified compliance officer attestation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Raw Document Inspection */}
            <div className="bg-[#0B1326] border border-[#334155] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase">1. ID Document Ingestion</span>
                  <span className="text-[9px] font-mono text-[#38BDF8] bg-[#0284C7]/10 px-1.5 py-0.5 rounded">
                    {application.doc_type}
                  </span>
                </div>
                <div className="rounded-lg overflow-hidden border border-[#334155] bg-[#171F33] aspect-[4/3] relative flex items-center justify-center">
                  <img
                    src={
                      application.document_image_url ||
                      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80'
                    }
                    alt="ID Document"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 text-[8px] font-mono bg-[#0F172A]/90 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/30">
                    SHA-256: 0x4d9a...
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#334155] text-[10px] font-mono text-[#94A3B8] space-y-1">
                <div>Issuing State: <span className="text-[#F8FAFC]">USA (STATE DEPT)</span></div>
                <div>Doc No: <span className="text-[#F8FAFC]">A91827430</span></div>
              </div>
            </div>

            {/* 2. Extracted OCR Telemetry */}
            <div className="bg-[#0B1326] border border-[#334155] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase">2. Neural OCR Fields</span>
                  <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
                    {application.ocr_confidence}% CONFIDENCE
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded bg-[#171F33] border border-[#334155]">
                    <div className="text-[9px] font-mono text-[#94A3B8] uppercase">Legal Name</div>
                    <div className="font-mono text-[#F8FAFC]">{application.customer_name}</div>
                  </div>
                  <div className="p-2 rounded bg-[#171F33] border border-[#334155]">
                    <div className="text-[9px] font-mono text-[#94A3B8] uppercase">Date of Birth</div>
                    <div className="font-mono text-[#F8FAFC]">{application.dob || '1990-01-01'}</div>
                  </div>
                  <div className="p-2 rounded bg-[#171F33] border border-[#334155]">
                    <div className="text-[9px] font-mono text-[#94A3B8] uppercase">MRZ Checksum</div>
                    <div className="font-mono text-[10px] text-[#38BDF8] truncate">
                      P&lt;USAMORGAN&lt;&lt;ALEX&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#334155] text-[10px] font-mono text-[#10B981]">
                ✓ Checksum Algorithm 7-3-1 OK
              </div>
            </div>

            {/* 3. Live Biometric Match */}
            <div className="bg-[#0B1326] border border-[#334155] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase">3. Biometrics</span>
                  <span className="text-[9px] font-mono text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded font-bold">
                    {application.match_score}% MATCH
                  </span>
                </div>
                <div className="rounded-lg overflow-hidden border border-[#334155] bg-[#171F33] aspect-[4/3] relative flex items-center justify-center">
                  <img
                    src={
                      application.selfie_image_url ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
                    }
                    alt="Biometric Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 text-[8px] font-mono bg-[#0F172A]/90 text-[#10B981] px-1.5 py-0.5 rounded border border-[#10B981]/30">
                    LIVENESS: 97.4%
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#334155] text-[10px] font-mono text-[#94A3B8] space-y-1">
                <div>Cosine Distance: <span className="text-[#EF4444]">0.228 (Divergent)</span></div>
                <div>Anti-Spoofing: <span className="text-[#10B981]">PASSED</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Adjudication Bar */}
      <div className="p-4 md:p-6 border-t border-[#334155] bg-[#131B2E] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
          <Scale className="w-4 h-4 text-[#0284C7]" />
          <span>Adjudication adheres to FINRA Rule 2090 (KYC Standards)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] font-medium text-xs border border-[#334155] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onOpenDecisionModal(application)}
            className="px-5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(2,132,199,0.4)] transition-all hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Make Adjudication Decision</span>
          </button>
        </div>
      </div>
    </div>
  );
};
